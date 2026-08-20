import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  APP_NAME: z.string().default('NestJS-Backend-Server'),
  APP_URL: z.string().default('http://localhost:5000'),
  CLIENT_URL: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  API_PREFIX: z.string().default('api/v1'),

  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/primary_backend_db?schema=public'),

  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 characters'),
  BETTER_AUTH_URL: z.string().default('http://localhost:5000'),
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: z.string().optional(),
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: z.string().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  COOKIE_SECRET: z.string().default('default-cookie-secret-min-32-chars-long-12345'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),

  JWT_SECRET: z.string().optional(),
  ACCESS_TOKEN_SECRET: z.string().optional(),
  REFRESH_TOKEN_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().optional(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().optional(),

  // Email (supports both SMTP_* and EMAIL_SENDER_SMTP_*)
  SMTP_HOST: z.string().optional(),
  EMAIL_SENDER_SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  EMAIL_SENDER_SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  SMTP_USER: z.string().optional(),
  EMAIL_SENDER_SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_SENDER_SMTP_PASS: z.string().optional(),
  SMTP_FROM_NAME: z.string().default('NestJS Backend'),
  SMTP_FROM_EMAIL: z.string().optional(),
  EMAIL_SENDER_SMTP_FROM: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default('demo'),
  CLOUDINARY_API_KEY: z.string().default('demo_key'),
  CLOUDINARY_API_SECRET: z.string().default('demo_secret'),
  CLOUDINARY_FOLDER: z.string().default('backend_uploads'),

  // Super Admin
  SUPER_ADMIN_EMAIL: z.string().optional(),
  SUPER_ADMIN_PASSWORD: z.string().optional(),

  GRAPHQL_PLAYGROUND: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
  GRAPHQL_INTROSPECTION: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
  GRAPHQL_DEBUG: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),

  RATE_LIMIT_TTL: z.coerce.number().default(60),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Config validation error');
  }
  return parsed.data;
}
