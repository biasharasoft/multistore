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
  newPasswordSchema,
  insertStoreSchema,
  insertRegionSchema
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

  // Store Routes
  
  // Get all stores for the authenticated user
  app.get('/api/stores', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userStores = await storage.getStoresByUserId(userId);
      res.json(userStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch stores' 
      });
    }
  });

  // Get a specific store by ID (only if it belongs to the user)
  app.get('/api/stores/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      const store = await storage.getStoreById(id);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
      
      // Check if the store belongs to the user
      if (store.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(store);
    } catch (error) {
      console.error('Error fetching store:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch store' 
      });
    }
  });

  // Create a new store
  app.post('/api/stores', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const storeData = insertStoreSchema.parse(req.body);
      
      const newStore = await storage.createStore({
        ...storeData,
        userId,
      });
      
      res.status(201).json(newStore);
    } catch (error) {
      console.error('Error creating store:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create store' 
      });
    }
  });

  // Update a store
  app.put('/api/stores/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updates = insertStoreSchema.partial().parse(req.body);
      
      const updatedStore = await storage.updateStore(id, userId, updates);
      res.json(updatedStore);
    } catch (error) {
      console.error('Error updating store:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update store' 
      });
    }
  });

  // Delete a store
  app.delete('/api/stores/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      await storage.deleteStore(id, userId);
      res.json({ message: 'Store deleted successfully' });
    } catch (error) {
      console.error('Error deleting store:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete store' 
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Region Routes
  
  // Get all regions
  app.get('/api/regions', async (req, res) => {
    try {
      const regions = await storage.getAllRegions();
      res.json(regions);
    } catch (error) {
      console.error('Error fetching regions:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch regions' 
      });
    }
  });

  // Get active regions only
  app.get('/api/regions/active', async (req, res) => {
    try {
      const activeRegions = await storage.getActiveRegions();
      res.json(activeRegions);
    } catch (error) {
      console.error('Error fetching active regions:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch active regions' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
