import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const smtpTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export class EmailService {
  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      if (resend) {
        await resend.emails.send({ from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`, to, subject, html });
      } else if (env.SMTP_HOST) {
        await smtpTransporter.sendMail({ from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`, to, subject, html });
      }
    } catch (err) {
      logger.error({ err, to, subject }, 'Email send failed');
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const url = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    await this.send(email, 'Verify your ELUNORA account', `
      <h2>Welcome to ELUNORA, ${name}!</h2>
      <p>Please verify your email address to get started.</p>
      <a href="${url}" style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `);
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const url = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.send(email, 'Reset your ELUNORA password', `
      <h2>Password Reset — ELUNORA</h2>
      <p>Hi ${name}, you requested a password reset.</p>
      <a href="${url}" style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `);
  }

  async sendPasswordChangedEmail(email: string, name: string): Promise<void> {
    await this.send(email, 'Your ELVA password has been changed', `
      <h2>Password Changed</h2>
      <p>Hi ${name}, your ELUNORA password was changed successfully.</p>
      <p>If you didn't make this change, contact support immediately at support@elva.in</p>
    `);
  }

  async sendOrderConfirmationEmail(email: string, name: string, orderNumber: string, total: number): Promise<void> {
    await this.send(email, `Order Confirmed — ${orderNumber}`, `
      <h2>Thank you for your order, ${name}! 🎁</h2>
      <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
      <p><strong>Total: ₹${total}</strong></p>
      <p>We'll notify you when it's shipped.</p>
      <a href="${env.FRONTEND_URL}/order-confirmation/${orderNumber}" style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Track Order</a>
    `);
  }
}
