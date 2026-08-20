import { registerAs } from '@nestjs/config';

export const emailConfig = registerAs('email', () => {
  const port = parseInt(
    process.env.EMAIL_SENDER_SMTP_PORT || process.env.SMTP_PORT || '587',
    10,
  );
  return {
    host: process.env.EMAIL_SENDER_SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465 || process.env.SMTP_SECURE === 'true',
    user: process.env.EMAIL_SENDER_SMTP_USER || process.env.SMTP_USER || '',
    pass: process.env.EMAIL_SENDER_SMTP_PASS || process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'NestJS Backend',
    fromEmail:
      process.env.EMAIL_SENDER_SMTP_FROM ||
      process.env.SMTP_FROM_EMAIL ||
      process.env.EMAIL_SENDER_SMTP_USER ||
      'no-reply@example.com',
  };
});
