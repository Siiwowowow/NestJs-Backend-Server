import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../infrastructure/email/email.service';
import { OtpService } from '../shared/otp/otp.service';
import { auth } from './better-auth.instance';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '../common/exceptions/domain.exceptions';
import { UserStatus } from '../common/enums/user-status.enum';
import { TokenType } from '../../generated/prisma';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
  ) {}

  async register(dto: RegisterDto, headers?: Headers) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    try {
      const response = await auth.api.signUpEmail({
        body: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          password: dto.password,
          phoneNumber: dto.phoneNumber,
        },
        headers: headers || new Headers(),
      });

      // Send background verification email / OTP
      const otp = await this.otpService.createOtp(
        dto.email.toLowerCase(),
        TokenType.EMAIL_VERIFICATION,
        60, // 1 hour
      );
      const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${otp}&email=${encodeURIComponent(dto.email)}`;
      await this.emailService.sendVerificationEmail(dto.email, verifyUrl, dto.name);

      return {
        user: response.user,
        session: (response as any).session || null,
        token: (response as any).token || (response as any).session?.token,
      };
    } catch (error: any) {
      this.logger.error(`Registration error for ${dto.email}`, error);
      throw new BadRequestException(error.message || 'Failed to register account');
    }
  }

  async login(dto: LoginDto, headers?: Headers) {
    try {
      const response = await auth.api.signInEmail({
        body: {
          email: dto.email.toLowerCase(),
          password: dto.password,
        },
        headers: headers || new Headers(),
      });

      if (!response || !response.user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const user = response.user as any;
      if (user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException('Account has been suspended. Please contact support.');
      }

      return {
        user: response.user,
        session: (response as any).session || null,
        token: (response as any).token || (response as any).session?.token,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn(`Login failed for ${dto.email}: ${error.message}`);
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async logout(headers?: Headers): Promise<boolean> {
    try {
      await auth.api.signOut({
        headers: headers || new Headers(),
      });
      return true;
    } catch (error: any) {
      this.logger.warn(`Sign out error: ${error.message}`);
      return true;
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User', userId);
    }

    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      // Do not leak whether user exists to prevent email enumeration
      return true;
    }

    const resetOtp = await this.otpService.createOtp(
      user.email,
      TokenType.PASSWORD_RESET,
      15, // 15 mins
    );

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetOtp}&email=${encodeURIComponent(user.email)}`;
    await this.emailService.sendPasswordResetEmail(user.email, resetUrl, user.name);

    return true;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<boolean> {
    // Look for valid OTP token
    const tokenRecord = await this.prisma.otpToken.findFirst({
      where: {
        token: dto.token,
        type: TokenType.PASSWORD_RESET,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: tokenRecord.identifier },
    });

    if (!user) {
      throw new NotFoundException('User');
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    // Update password in account table
    await this.prisma.account.updateMany({
      where: {
        userId: user.id,
        providerId: 'credential',
      },
      data: {
        password: hashedPassword,
      },
    });

    // Mark token as used
    await this.prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { isUsed: true },
    });

    // Terminate existing sessions for security
    await this.prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return true;
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<boolean> {
    const tokenRecord = await this.prisma.otpToken.findFirst({
      where: {
        token: dto.token,
        type: TokenType.EMAIL_VERIFICATION,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { email: tokenRecord.identifier },
      data: { emailVerified: true },
    });

    await this.prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { isUsed: true },
    });

    return true;
  }
}
