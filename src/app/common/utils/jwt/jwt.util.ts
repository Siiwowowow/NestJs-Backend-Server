import * as jwt from 'jsonwebtoken';

export class JwtUtil {
  private static getSecret(): string {
    return process.env.JWT_SECRET || 'default-jwt-secret-key-32-chars-min-123456';
  }

  static sign(payload: string | object | Buffer, options?: jwt.SignOptions): string {
    const defaultOptions: jwt.SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
    };
    return jwt.sign(payload, this.getSecret(), { ...defaultOptions, ...options });
  }

  static verify<T = any>(token: string, options?: jwt.VerifyOptions): T {
    return jwt.verify(token, this.getSecret(), options) as T;
  }

  static decode<T = any>(token: string): T | null {
    return jwt.decode(token) as T;
  }
}
