import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UsePipes,
  All,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { AuthService } from './auth.service';
import { auth } from './better-auth.instance';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { SkipTransform } from '../common/decorators/skip-transform.decorator';
import {
  RegisterDto,
  registerSchema,
  LoginDto,
  loginSchema,
  ForgotPasswordDto,
  forgotPasswordSchema,
  ResetPasswordDto,
  resetPasswordSchema,
  VerifyEmailDto,
  verifyEmailSchema,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly betterAuthHandler = toNodeHandler(auth);

  constructor(private readonly authService: AuthService) {}

  // Native Better Auth router mount for /api/v1/auth/*
  @Public()
  @SkipTransform()
  @All('*path')
  async handleBetterAuth(@Req() req: Request, @Res() res: Response) {
    return this.betterAuthHandler(req, res);
  }

  @Public()
  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const headers = new Headers(req.headers as any);
    const result = await this.authService.register(dto, headers);
    return {
      message: 'User registered successfully. Verification email sent.',
      data: result,
    };
  }

  @Public()
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const headers = new Headers(req.headers as any);
    const result = await this.authService.login(dto, headers);
    return {
      message: 'Login successful',
      data: result,
    };
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    const headers = new Headers(req.headers as any);
    await this.authService.logout(headers);
    return {
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  async getMe(@CurrentUser() user: AuthUser) {
    const data = await this.authService.getMe(user.id);
    return {
      message: 'Current user profile retrieved',
      data,
    };
  }

  @Public()
  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return {
      message: 'If an account with this email exists, a password reset link has been sent.',
    };
  }

  @Public()
  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return {
      message: 'Password has been reset successfully.',
    };
  }

  @Public()
  @Post('verify-email')
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto);
    return {
      message: 'Email verified successfully.',
    };
  }
}
