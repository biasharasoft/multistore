import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';
import { users, otpVerifications, passwordResetTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { emailService } from './emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 12;

export class AuthService {
  // Generate OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate secure token
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  private generateJWT(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  // Register user (step 1: send OTP)
  async initiateRegistration(email: string, firstName: string, lastName: string, password: string) {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Generate OTP
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await db.delete(otpVerifications).where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.type, 'register')
      )
    );

    // Store OTP
    await db.insert(otpVerifications).values({
      email,
      otp,
      type: 'register',
      expiresAt,
    });

    // Send OTP email
    await emailService.sendOTPEmail(email, otp, 'registration');

    // Store user data temporarily (we'll create the user after OTP verification)
    // For now, we'll return success. In a real app, you might store this in Redis or similar
    return { message: 'OTP sent to your email. Please verify to complete registration.' };
  }

  // Verify OTP and complete registration
  async completeRegistration(email: string, otp: string, firstName: string, lastName: string, password: string) {
    // Verify OTP
    const otpRecord = await db.select().from(otpVerifications).where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.otp, otp),
        eq(otpVerifications.type, 'register'),
        eq(otpVerifications.isUsed, false),
        gt(otpVerifications.expiresAt, new Date())
      )
    ).limit(1);

    if (otpRecord.length === 0) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as used
    await db.update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, otpRecord[0].id));

    // Hash password and create user
    const hashedPassword = await this.hashPassword(password);
    
    const [newUser] = await db.insert(users).values({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      isEmailVerified: true,
    }).returning();

    // Generate JWT token
    const token = this.generateJWT(newUser.id);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isEmailVerified: newUser.isEmailVerified,
      },
      token,
    };
  }

  // Login user
  async login(email: string, password: string) {
    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Generate JWT token
    const token = this.generateJWT(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    };
  }

  // Initiate password reset
  async initiatePasswordReset(email: string) {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'If an account with this email exists, you will receive a password reset link.' };
    }

    // Generate OTP
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await db.delete(otpVerifications).where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.type, 'reset-password')
      )
    );

    // Store OTP
    await db.insert(otpVerifications).values({
      email,
      otp,
      type: 'reset-password',
      expiresAt,
    });

    // Send OTP email
    await emailService.sendOTPEmail(email, otp, 'password-reset');

    return { message: 'If an account with this email exists, you will receive a password reset OTP.' };
  }

  // Verify reset password OTP and generate reset token
  async verifyPasswordResetOTP(email: string, otp: string) {
    // Verify OTP
    const otpRecord = await db.select().from(otpVerifications).where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.otp, otp),
        eq(otpVerifications.type, 'reset-password'),
        eq(otpVerifications.isUsed, false),
        gt(otpVerifications.expiresAt, new Date())
      )
    ).limit(1);

    if (otpRecord.length === 0) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as used
    await db.update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, otpRecord[0].id));

    // Generate reset token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Delete any existing reset tokens for this email
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, email));

    // Store reset token
    await db.insert(passwordResetTokens).values({
      email,
      token,
      expiresAt,
    });

    return { token, message: 'OTP verified. You can now reset your password.' };
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string) {
    // Verify token
    const resetRecord = await db.select().from(passwordResetTokens).where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.isUsed, false),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    ).limit(1);

    if (resetRecord.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    // Mark token as used
    await db.update(passwordResetTokens)
      .set({ isUsed: true })
      .where(eq(passwordResetTokens.id, resetRecord[0].id));

    // Hash new password and update user
    const hashedPassword = await this.hashPassword(newPassword);
    
    await db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.email, resetRecord[0].email));

    return { message: 'Password reset successfully' };
  }

  // Verify JWT token
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Get user from database
      const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Resend OTP
  async resendOTP(email: string, type: 'register' | 'reset-password') {
    // Check if there's an existing unused OTP
    const existingOTP = await db.select().from(otpVerifications).where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.type, type),
        eq(otpVerifications.isUsed, false),
        gt(otpVerifications.expiresAt, new Date())
      )
    ).limit(1);

    if (existingOTP.length > 0) {
      throw new Error('An OTP is already active. Please wait before requesting a new one.');
    }

    // Generate new OTP
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email and type
    await db.delete(otpVerifications).where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.type, type)
      )
    );

    // Store new OTP
    await db.insert(otpVerifications).values({
      email,
      otp,
      type,
      expiresAt,
    });

    // Send OTP email
    const emailType = type === 'register' ? 'registration' : 'password-reset';
    await emailService.sendOTPEmail(email, otp, emailType);

    return { message: 'New OTP sent to your email' };
  }

  // Create user account directly (for team member creation)
  async createUserAccount(userData: { email: string; firstName: string; lastName: string; phone?: string | null; password: string }) {
    const { email, firstName, lastName, phone, password } = userData;
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Hash password and create user
    const hashedPassword = await this.hashPassword(password);
    
    const [newUser] = await db.insert(users).values({
      email,
      firstName,
      lastName,
      phone,
      password: hashedPassword,
      isEmailVerified: true, // Auto-verify team member accounts
    }).returning();

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      isEmailVerified: newUser.isEmailVerified,
    };
  }
}

export const authService = new AuthService();