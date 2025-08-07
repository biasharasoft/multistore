import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authService } from "./services/authService";
import { authenticateToken, optionalAuth } from "./middleware/auth";
import { 
  loginSchema, 
  registerSchema, 
  verifyOtpSchema, 
  resetPasswordSchema,
  newPasswordSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  
  // Register - Step 1: Send OTP
  app.post('/api/auth/register/initiate', async (req, res) => {
    try {
      const { email, firstName, lastName, password, confirmPassword } = registerSchema.parse(req.body);
      
      const result = await authService.initiateRegistration(email, firstName, lastName, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  });

  // Register - Step 2: Verify OTP and complete registration
  app.post('/api/auth/register/complete', async (req, res) => {
    try {
      const { email, otp, firstName, lastName, password } = req.body;
      
      // Validate OTP format
      verifyOtpSchema.parse({ email, otp, type: 'register' });
      
      const result = await authService.completeRegistration(email, otp, firstName, lastName, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Registration completion failed' 
      });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  });

  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    res.json({ user: req.user });
  });

  // Password Reset - Step 1: Send OTP
  app.post('/api/auth/password-reset/initiate', async (req, res) => {
    try {
      const { email } = resetPasswordSchema.parse(req.body);
      
      const result = await authService.initiatePasswordReset(email);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Password reset initiation failed' 
      });
    }
  });

  // Password Reset - Step 2: Verify OTP and get reset token
  app.post('/api/auth/password-reset/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      // Validate OTP format
      verifyOtpSchema.parse({ email, otp, type: 'reset-password' });
      
      const result = await authService.verifyPasswordResetOTP(email, otp);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'OTP verification failed' 
      });
    }
  });

  // Password Reset - Step 3: Reset password with token
  app.post('/api/auth/password-reset/complete', async (req, res) => {
    try {
      const { token, password, confirmPassword } = newPasswordSchema.parse(req.body);
      
      const result = await authService.resetPassword(token, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Password reset failed' 
      });
    }
  });

  // Resend OTP
  app.post('/api/auth/resend-otp', async (req, res) => {
    try {
      const { email, type } = req.body;
      
      if (!email || !type || !['register', 'reset-password'].includes(type)) {
        return res.status(400).json({ message: 'Email and valid type are required' });
      }
      
      const result = await authService.resendOTP(email, type);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to resend OTP' 
      });
    }
  });

  // Logout (client-side token removal, but we can log it)
  app.post('/api/auth/logout', optionalAuth, async (req, res) => {
    // In a JWT-based auth, logout is mainly client-side
    // But we can log the logout action or implement token blacklisting here
    res.json({ message: 'Logged out successfully' });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
