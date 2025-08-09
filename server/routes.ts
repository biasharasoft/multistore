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
  insertRegionSchema,
  insertProductsCategorySchema,
  insertExpensesCategorySchema,
  insertProductSchema
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

  // Products Categories Routes
  
  // Get all products categories
  app.get('/api/products-categories', async (req, res) => {
    try {
      const categories = await storage.getAllProductsCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching products categories:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch products categories' 
      });
    }
  });

  // Get active products categories only
  app.get('/api/products-categories/active', async (req, res) => {
    try {
      const activeCategories = await storage.getActiveProductsCategories();
      res.json(activeCategories);
    } catch (error) {
      console.error('Error fetching active products categories:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch active products categories' 
      });
    }
  });

  // Get a specific products category by ID
  app.get('/api/products-categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getProductsCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Products category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error fetching products category:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch products category' 
      });
    }
  });

  // Create a new products category
  app.post('/api/products-categories', async (req, res) => {
    try {
      const categoryData = insertProductsCategorySchema.parse(req.body);
      const newCategory = await storage.createProductsCategory(categoryData);
      
      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating products category:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create products category' 
      });
    }
  });

  // Update a products category
  app.put('/api/products-categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertProductsCategorySchema.partial().parse(req.body);
      
      const updatedCategory = await storage.updateProductsCategory(id, updates);
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating products category:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update products category' 
      });
    }
  });

  // Delete a products category
  app.delete('/api/products-categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProductsCategory(id);
      res.json({ message: 'Products category deleted successfully' });
    } catch (error) {
      console.error('Error deleting products category:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete products category' 
      });
    }
  });

  // Expenses Categories Routes
  
  // Get all expenses categories
  app.get('/api/expenses-categories', async (req, res) => {
    try {
      const categories = await storage.getAllExpensesCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching expenses categories:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch expenses categories' 
      });
    }
  });

  // Get active expenses categories only
  app.get('/api/expenses-categories/active', async (req, res) => {
    try {
      const activeCategories = await storage.getActiveExpensesCategories();
      res.json(activeCategories);
    } catch (error) {
      console.error('Error fetching active expenses categories:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch active expenses categories' 
      });
    }
  });

  // Get a specific expenses category by ID
  app.get('/api/expenses-categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getExpensesCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Expenses category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error fetching expenses category:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch expenses category' 
      });
    }
  });

  // Create a new expenses category
  app.post('/api/expenses-categories', async (req, res) => {
    try {
      const categoryData = insertExpensesCategorySchema.parse(req.body);
      const newCategory = await storage.createExpensesCategory(categoryData);
      
      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating expenses category:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create expenses category' 
      });
    }
  });

  // Update an expenses category
  app.put('/api/expenses-categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertExpensesCategorySchema.partial().parse(req.body);
      
      const updatedCategory = await storage.updateExpensesCategory(id, updates);
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating expenses category:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update expenses category' 
      });
    }
  });

  // Delete an expenses category
  app.delete('/api/expenses-categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpensesCategory(id);
      res.json({ message: 'Expenses category deleted successfully' });
    } catch (error) {
      console.error('Error deleting expenses category:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete expenses category' 
      });
    }
  });

  // Products Routes
  
  // Get all products
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch products' 
      });
    }
  });

  // Get active products only
  app.get('/api/products/active', async (req, res) => {
    try {
      const activeProducts = await storage.getActiveProducts();
      res.json(activeProducts);
    } catch (error) {
      console.error('Error fetching active products:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch active products' 
      });
    }
  });

  // Get low stock products
  app.get('/api/products/low-stock', async (req, res) => {
    try {
      const lowStockProducts = await storage.getLowStockProducts();
      res.json(lowStockProducts);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch low stock products' 
      });
    }
  });

  // Get out of stock products
  app.get('/api/products/out-of-stock', async (req, res) => {
    try {
      const outOfStockProducts = await storage.getOutOfStockProducts();
      res.json(outOfStockProducts);
    } catch (error) {
      console.error('Error fetching out of stock products:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch out of stock products' 
      });
    }
  });

  // Get products by category
  app.get('/api/products/category/:categoryId', async (req, res) => {
    try {
      const { categoryId } = req.params;
      const categoryProducts = await storage.getProductsByCategory(categoryId);
      res.json(categoryProducts);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch products by category' 
      });
    }
  });

  // Get a specific product by ID
  app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch product' 
      });
    }
  });

  // Create a new product
  app.post('/api/products', async (req, res) => {
    try {
      console.log('Raw request body:', req.body);
      
      // All conversions are already handled on frontend (dollars to cents, percentages to storage format)
      const productData = {
        ...req.body,
        price: parseInt(req.body.price) || 0,
        cost: parseInt(req.body.cost) || 0,
        wholesalerPrice: parseInt(req.body.wholesalerPrice) || 0,
        wholesalerDiscount: parseInt(req.body.wholesalerDiscount) || 0,
        retailPrice: parseInt(req.body.retailPrice) || 0,
        retailDiscount: parseInt(req.body.retailDiscount) || 0,
      };
      
      console.log('Processed product data:', productData);
      
      const validatedData = insertProductSchema.parse(productData);
      console.log('Validated data:', validatedData);
      
      const newProduct = await storage.createProduct(validatedData);
      
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create product' 
      });
    }
  });

  // Update a product
  app.put('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // All conversions are already handled on frontend, just ensure proper integer types
      const updates = { ...req.body };
      if (updates.price !== undefined) updates.price = parseInt(updates.price) || 0;
      if (updates.cost !== undefined) updates.cost = parseInt(updates.cost) || 0;
      if (updates.wholesalerPrice !== undefined) updates.wholesalerPrice = parseInt(updates.wholesalerPrice) || 0;
      if (updates.retailPrice !== undefined) updates.retailPrice = parseInt(updates.retailPrice) || 0;
      if (updates.wholesalerDiscount !== undefined) updates.wholesalerDiscount = parseInt(updates.wholesalerDiscount) || 0;
      if (updates.retailDiscount !== undefined) updates.retailDiscount = parseInt(updates.retailDiscount) || 0;
      
      const validatedUpdates = insertProductSchema.partial().parse(updates);
      const updatedProduct = await storage.updateProduct(id, validatedUpdates);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update product' 
      });
    }
  });

  // Delete a product
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete product' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
