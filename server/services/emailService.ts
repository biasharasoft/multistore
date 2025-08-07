import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, we'll use a simple email service
    // In production, you should use a proper email service like SendGrid, Mailgun, etc.
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'demo@example.com',
        pass: process.env.EMAIL_PASSWORD || 'demo-password',
      },
    });
  }

  async sendOTPEmail(email: string, otp: string, type: 'registration' | 'password-reset') {
    const subject = type === 'registration' 
      ? 'Verify Your Email - Retail Management System'
      : 'Password Reset OTP - Retail Management System';

    const html = type === 'registration' 
      ? this.getRegistrationEmailTemplate(otp)
      : this.getPasswordResetEmailTemplate(otp);

    try {
      // In development, just log the OTP instead of actually sending email
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n📧 Email Service - ${type.toUpperCase()}`);
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`OTP: ${otp}`);
        console.log(`Expires in: 10 minutes\n`);
        return;
      }

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@retailmanagement.com',
        to: email,
        subject,
        html,
      });

      console.log(`Email sent successfully to ${email}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      // In development, don't throw error - just log it
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Failed to send email');
      }
    }
  }

  private getRegistrationEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .otp-box { background: #f8fafc; border: 2px dashed #e2e8f0; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Retail Management System</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for signing up! To complete your registration, please use the verification code below:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p><strong>Important:</strong> This code will expire in 10 minutes for security reasons.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Retail Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .otp-box { background: #fef2f2; border: 2px dashed #fecaca; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 5px; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Use the verification code below to proceed:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p><strong>Important:</strong> This code will expire in 10 minutes for security reasons.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Retail Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();