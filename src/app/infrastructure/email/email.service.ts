import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.EMAIL_SENDER_SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_SENDER_SMTP_PORT || process.env.SMTP_PORT || '465', 10);
    const user = process.env.EMAIL_SENDER_SMTP_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_SENDER_SMTP_PASS || process.env.SMTP_PASS;
    const isSecure = port === 465 || process.env.SMTP_SECURE === 'true';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
    });
  }

  async onModuleInit() {
    try {
      const user = process.env.EMAIL_SENDER_SMTP_USER || process.env.SMTP_USER;
      const pass = process.env.EMAIL_SENDER_SMTP_PASS || process.env.SMTP_PASS;

      if (user && pass && user !== 'test@example.com') {
        await this.transporter.verify();
        this.logger.log('📧 SMTP transporter verified successfully');
      } else {
        this.logger.warn('📧 SMTP transporter initialized in test/mock mode');
      }
    } catch (error) {
      this.logger.warn(`⚠️ SMTP connection verification failed: ${(error as any)?.message}`);
    }
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    const fromName = process.env.SMTP_FROM_NAME || 'NestJS Backend';
    const fromEmail =
      process.env.EMAIL_SENDER_SMTP_FROM ||
      process.env.SMTP_FROM_EMAIL ||
      process.env.EMAIL_SENDER_SMTP_USER ||
      'no-reply@example.com';

    try {
      if (process.env.NODE_ENV === 'test') {
        this.logger.debug(`[Mock Email] To: ${options.to}, Subject: ${options.subject}`);
        return true;
      }

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent successfully to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'app', 'templates', `${templateName}.ejs`),
      path.join(process.cwd(), 'dist', 'app', 'templates', `${templateName}.ejs`),
      path.join(__dirname, '..', '..', 'templates', `${templateName}.ejs`),
      path.join(__dirname, '..', 'templates', `${templateName}.ejs`),
    ];

    const templatePath = candidatePaths.find((p) => fs.existsSync(p));

    if (!templatePath) {
      this.logger.warn(`Template ${templateName}.ejs not found on disk, using fallback inline renderer.`);
      return `<p>Message from ${data.appName || 'NestJS Backend Server'}</p>`;
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    return ejs.render(templateContent, {
      ...data,
      appName: data.appName || process.env.APP_NAME || 'NestJS Backend',
    });
  }

  async sendOtpEmail(to: string, otp: string, userName?: string): Promise<boolean> {
    const html = await this.renderTemplate('otp', {
      otp,
      userName,
      expiresInMinutes: 10,
    });

    return this.sendMail({
      to,
      subject: `Your Verification Code: ${otp}`,
      html,
      text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    });
  }

  async sendVerificationEmail(to: string, verificationUrl: string, userName?: string): Promise<boolean> {
    const html = await this.renderTemplate('verify-email', {
      verificationUrl,
      userName,
    });

    return this.sendMail({
      to,
      subject: 'Verify your email address',
      html,
      text: `Please verify your email address by opening this link: ${verificationUrl}`,
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, userName?: string): Promise<boolean> {
    const html = await this.renderTemplate('reset-password', {
      resetUrl,
      userName,
    });

    return this.sendMail({
      to,
      subject: 'Password Reset Request',
      html,
      text: `Reset your password by following this link: ${resetUrl}`,
    });
  }
}
