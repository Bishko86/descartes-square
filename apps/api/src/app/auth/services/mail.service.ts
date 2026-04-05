import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: this.config.get<string>('BREVO_SMTP_LOGIN'),
        pass: this.config.get<string>('BREVO_SMTP_KEY'),
      },
    });
  }

  private buildLink(path: string, locale: string): string {
    const frontendUrl = this.config.get<string>('FRONTEND_URL');
    const isDev = this.config.get<string>('DEV_MODE') === 'true';
    const localePrefix = isDev ? '' : (locale === 'uk' ? '/uk' : '/en');
    return `${frontendUrl}${localePrefix}${path}`;
  }

  async sendVerificationEmail(
    to: string,
    rawToken: string,
    locale = 'en',
  ): Promise<void> {
    const link = this.buildLink(`/auth/verify-email?token=${rawToken}`, locale);

    const isUk = locale === 'uk';

    const subject = isUk
      ? 'Підтвердіть вашу електронну пошту'
      : 'Confirm your email';

    const html = isUk
      ? `
        <p>Дякуємо за реєстрацію. Натисніть посилання нижче, щоб підтвердити вашу електронну пошту.</p>
        <p><a href="${link}">${link}</a></p>
        <p>Це посилання дійсне протягом 24 годин.</p>
      `
      : `
        <p>Thanks for signing up. Click the link below to confirm your email.</p>
        <p><a href="${link}">${link}</a></p>
        <p>This link expires in 24 hours.</p>
      `;

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM') ?? '"Descartes Square" <no-reply@bishko.site>',
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${to}`, err);
      throw new InternalServerErrorException(
        'Could not send verification email',
      );
    }
  }

  async sendPasswordResetEmail(
    to: string,
    rawToken: string,
    locale = 'en',
  ): Promise<void> {
    const link = this.buildLink(`/auth/reset-password?token=${rawToken}`, locale);
    const isUk = locale === 'uk';

    const subject = isUk
      ? 'Скидання пароля'
      : 'Reset your password';

    const html = isUk
      ? `
        <p>Ми отримали запит на скидання пароля для вашого облікового запису.</p>
        <p>Натисніть посилання нижче, щоб встановити новий пароль:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Це посилання дійсне протягом 1 години.</p>
        <p>Якщо ви не надсилали цей запит — просто проігноруйте цей лист.</p>
      `
      : `
        <p>We received a request to reset the password for your account.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${link}">${link}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `;

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM') ?? '"Descartes Square" <no-reply@bishko.site>',
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}`, err);
      throw new InternalServerErrorException(
        'Could not send password reset email',
      );
    }
  }
}
