import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TokenType } from '../../../generated/prisma';
import { DateUtil } from '../../common/utils/date/date.util';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly prisma: PrismaService) {}

  generateNumericOtp(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max).toString();
  }

  async createOtp(
    identifier: string,
    type: TokenType = TokenType.OTP,
    expiresInMinutes: number = 10,
    length: number = 6,
  ): Promise<string> {
    const token = this.generateNumericOtp(length);
    const expiresAt = DateUtil.addMinutes(new Date(), expiresInMinutes);

    // Invalidate prior unused tokens of the same type for this identifier
    await this.prisma.otpToken.updateMany({
      where: {
        identifier,
        type,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    await this.prisma.otpToken.create({
      data: {
        identifier,
        token,
        type,
        expiresAt,
      },
    });

    this.logger.log(`Created OTP for identifier: ${identifier}, type: ${type}`);
    return token;
  }

  async verifyOtp(
    identifier: string,
    token: string,
    type: TokenType = TokenType.OTP,
  ): Promise<boolean> {
    const record = await this.prisma.otpToken.findFirst({
      where: {
        identifier,
        token,
        type,
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!record) {
      return false;
    }

    // Mark as used
    await this.prisma.otpToken.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    this.logger.log(`Verified OTP for identifier: ${identifier}`);
    return true;
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.prisma.otpToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }
}
