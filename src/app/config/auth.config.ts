import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  secret: process.env.BETTER_AUTH_SECRET || '',
  url: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-key-32-chars-min-123456',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookie: {
    secret: process.env.COOKIE_SECRET || 'default-cookie-secret-min-32-chars-long-12345',
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
  },
}));
