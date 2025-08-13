import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { authService } from "./services/authService";
import { authenticateToken, optionalAuth } from "./middleware/auth";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
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
  insertExpenseSchema,
  insertProductSchema,
  insertSupplierSchema,
  insertCustomerSchema,
  insertPurchaseSchema,
  insertCompanySchema,
  insertTeamMemberSchema,
  insertTeamInvitationSchema,
  products,
  productsCategories,
  inventory,
  inventoryBatch,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

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
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if this user is a team member (to get their role and assigned store)
      let userRole = 'Owner'; // Default role for account owners
      let assignedStoreId = null;
      
      // Look for team member record where invitedUserId matches current user
      const teamMemberRecord = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.invitedUserId, userId))
        .limit(1);
      
      if (teamMemberRecord.length > 0) {
        const member = teamMemberRecord[0];
        userRole = member.role;
        assignedStoreId = member.storeId;
      }
      
      // Return user with role and store information
      res.json({ 
        user: {
          ...req.user,
          role: userRole,
          assignedStoreId
        }
      });
    } catch (error) {
      console.error('Error fetching user with role:', error);
      res.json({ user: req.user }); // Fallback to original behavior
    }
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

  // Get user's company information (for currency and other settings)
  app.get('/api/company', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      res.json(company);
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Store Routes
  
  // Get accessible stores for the authenticated user (role-based)
  app.get('/api/stores', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      let stores = [];
      
      // Check if this user is a team member
      const teamMemberRecord = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.invitedUserId, userId))
        .limit(1);
      
      if (teamMemberRecord.length > 0) {
        const member = teamMemberRecord[0];
        
        // For Admin role, get all stores from the organization owner
        if (member.role === 'Admin') {
          stores = await storage.getStoresByUserId(member.userId);
        } else {
          // For other roles (Manager, Cashier, Staff), only get their assigned store
          if (member.storeId) {
            const assignedStore = await storage.getStoreById(member.storeId);
            if (assignedStore) {
              stores = [assignedStore];
            }
          }
        }
      } else {
        // This is an account owner, get all their stores
        stores = await storage.getStoresByUserId(userId);
      }
      
      res.json(stores);
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

  // Companies Routes
  
  // Get company for the authenticated user
  app.get('/api/companies', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userCompany = await storage.getCompanyByUserId(userId);
      res.json(userCompany);
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch company' 
      });
    }
  });

  // Create or update company information
  app.post('/api/companies', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const companyData = insertCompanySchema.parse(req.body);
      
      // Check if company already exists for this user
      const existingCompany = await storage.getCompanyByUserId(userId);
      
      if (existingCompany) {
        // Update existing company
        const updatedCompany = await storage.updateCompany(existingCompany.id, userId, companyData);
        res.json(updatedCompany);
      } else {
        // Create new company
        const newCompany = await storage.createCompany({
          ...companyData,
          userId,
        });
        res.status(201).json(newCompany);
      }
    } catch (error) {
      console.error('Error saving company:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to save company' 
      });
    }
  });

  // Update company information
  app.put('/api/companies/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updates = insertCompanySchema.partial().parse(req.body);
      
      const updatedCompany = await storage.updateCompany(id, userId, updates);
      res.json(updatedCompany);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update company' 
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

  // Suppliers Routes
  
  // Get all suppliers
  app.get('/api/suppliers', async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch suppliers' 
      });
    }
  });

  // Get active suppliers only
  app.get('/api/suppliers/active', async (req, res) => {
    try {
      const activeSuppliers = await storage.getActiveSuppliers();
      res.json(activeSuppliers);
    } catch (error) {
      console.error('Error fetching active suppliers:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch active suppliers' 
      });
    }
  });

  // Get a specific supplier by ID
  app.get('/api/suppliers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const supplier = await storage.getSupplierById(id);
      
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      
      res.json(supplier);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch supplier' 
      });
    }
  });

  // Create a new supplier
  app.post('/api/suppliers', async (req, res) => {
    try {
      const { insertSupplierSchema } = await import('@shared/schema');
      
      // Convert rating from percentage to decimal and money values to cents where needed
      const supplierData = { ...req.body };
      if (supplierData.rating !== undefined) {
        supplierData.rating = Math.round(parseFloat(supplierData.rating) * 10); // Store rating * 10
      }
      if (supplierData.totalSpent !== undefined) {
        supplierData.totalSpent = Math.round(parseFloat(supplierData.totalSpent) * 100); // Store as cents
      }
      
      console.log('Raw supplier data:', req.body);
      console.log('Processed supplier data:', supplierData);
      
      const validatedData = insertSupplierSchema.parse(supplierData);
      console.log('Validated supplier data:', validatedData);
      
      const newSupplier = await storage.createSupplier(validatedData);
      
      res.status(201).json(newSupplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create supplier' 
      });
    }
  });

  // Update a supplier
  app.put('/api/suppliers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { insertSupplierSchema } = await import('@shared/schema');
      
      // Convert values as needed
      const updates = { ...req.body };
      if (updates.rating !== undefined) {
        updates.rating = Math.round(parseFloat(updates.rating) * 10);
      }
      if (updates.totalSpent !== undefined) {
        updates.totalSpent = Math.round(parseFloat(updates.totalSpent) * 100);
      }
      
      const validatedUpdates = insertSupplierSchema.partial().parse(updates);
      const updatedSupplier = await storage.updateSupplier(id, validatedUpdates);
      res.json(updatedSupplier);
    } catch (error) {
      console.error('Error updating supplier:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update supplier' 
      });
    }
  });

  // Delete a supplier
  app.delete('/api/suppliers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSupplier(id);
      res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete supplier' 
      });
    }
  });

  // Customers Routes
  
  // Get all customers
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch customers' 
      });
    }
  });

  // Get active customers only
  app.get('/api/customers/active', async (req, res) => {
    try {
      const activeCustomers = await storage.getActiveCustomers();
      res.json(activeCustomers);
    } catch (error) {
      console.error('Error fetching active customers:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch active customers' 
      });
    }
  });

  // Get customers by status
  app.get('/api/customers/status/:status', async (req, res) => {
    try {
      const { status } = req.params;
      const statusCustomers = await storage.getCustomersByStatus(status);
      res.json(statusCustomers);
    } catch (error) {
      console.error('Error fetching customers by status:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch customers by status' 
      });
    }
  });

  // Get a specific customer by ID
  app.get('/api/customers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomerById(id);
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      res.json(customer);
    } catch (error) {
      console.error('Error fetching customer:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch customer' 
      });
    }
  });

  // Create a new customer
  app.post('/api/customers', async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Convert dateOfBirth string to Date if provided
      if (customerData.dateOfBirth) {
        (customerData as any).dateOfBirth = new Date(customerData.dateOfBirth);
      }
      
      const newCustomer = await storage.createCustomer(customerData);
      
      res.status(201).json(newCustomer);
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create customer' 
      });
    }
  });

  // Update a customer
  app.put('/api/customers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertCustomerSchema.partial().parse(req.body);
      
      // Convert dateOfBirth string to Date if provided
      if (updates.dateOfBirth) {
        (updates as any).dateOfBirth = new Date(updates.dateOfBirth);
      }
      
      const updatedCustomer = await storage.updateCustomer(id, updates);
      res.json(updatedCustomer);
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update customer' 
      });
    }
  });

  // Delete a customer
  app.delete('/api/customers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomer(id);
      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete customer' 
      });
    }
  });

  // Purchase Routes
  
  // Get all purchases for authenticated user
  app.get('/api/purchases', authenticateToken, async (req, res) => {
    try {
      const purchases = await storage.getPurchasesByUserId(req.user!.id);
      res.json(purchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch purchases' 
      });
    }
  });

  // Get a specific purchase by ID
  app.get('/api/purchases/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const purchase = await storage.getPurchaseById(id);
      
      if (!purchase) {
        return res.status(404).json({ message: 'Purchase not found' });
      }
      
      res.json(purchase);
    } catch (error) {
      console.error('Error fetching purchase:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch purchase' 
      });
    }
  });

  // Create a new purchase
  app.post('/api/purchases', authenticateToken, async (req, res) => {
    try {
      const purchaseData = insertPurchaseSchema.parse(req.body);
      
      // Require store ID for purchase creation
      const { storeId } = req.body;
      if (!storeId) {
        return res.status(400).json({ 
          message: 'Store ID is required for purchase creation' 
        });
      }
      
      // Keep purchaseDate as string for the createPurchase method
      const purchaseWithUserId = {
        ...purchaseData,
        userId: req.user!.id,
        storeId: storeId
      };
      
      const newPurchase = await storage.createPurchase(purchaseWithUserId);
      
      res.status(201).json(newPurchase);
    } catch (error) {
      console.error('Error creating purchase:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create purchase' 
      });
    }
  });

  // Update an existing purchase
  app.put('/api/purchases/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertPurchaseSchema.partial().parse(req.body);
      
      // Convert purchaseDate string to Date if provided
      if (updates.purchaseDate) {
        (updates as any).purchaseDate = new Date(updates.purchaseDate);
      }
      
      const updatedPurchase = await storage.updatePurchase(id, req.user!.id, updates);
      res.json(updatedPurchase);
    } catch (error) {
      console.error('Error updating purchase:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update purchase' 
      });
    }
  });

  // Delete a purchase
  app.delete('/api/purchases/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePurchase(id, req.user!.id);
      res.json({ message: 'Purchase deleted successfully' });
    } catch (error) {
      console.error('Error deleting purchase:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete purchase' 
      });
    }
  });

  // Inventory Routes
  
  // Get inventory with product details filtered by store
  app.get('/api/inventory', async (req, res) => {
    try {
      const { storeId } = req.query;
      
      if (!storeId) {
        return res.status(400).json({ 
          message: 'Store ID is required' 
        });
      }
      
      const inventoryData = await db.select({
        inventoryId: inventory.id,
        productId: products.id,
        productName: products.name,
        productCategory: productsCategories.name,
        productBarcode: products.barcode,
        productImage: products.image,
        productRetailPrice: products.retailPrice,
        productRetailDiscount: products.retailDiscount,
        productWholesalerPrice: products.wholesalerPrice,
        productWholesalerDiscount: products.wholesalerDiscount,
        productCost: products.cost,
        productLowStockThreshold: products.lowStockThreshold,
        productStatus: products.status,
        currentQuantity: inventory.quantity,
        inventoryUpdatedAt: inventory.updatedAt,
        storeId: inventory.storeId
      })
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .leftJoin(productsCategories, eq(products.categoryId, productsCategories.id))
      .where(eq(inventory.storeId, storeId as string))
      .orderBy(products.name);
      
      res.json(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch inventory' 
      });
    }
  });

  // Get inventory batches for a specific product
  app.get('/api/inventory/batches/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const batches = await storage.getInventoryBatchesByProductId(productId);
      res.json(batches);
    } catch (error) {
      console.error('Error fetching inventory batches:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch inventory batches' 
      });
    }
  });

  // Get all inventory batches with product details filtered by store
  app.get('/api/inventory/batches', async (req, res) => {
    try {
      const { storeId } = req.query;
      
      if (!storeId) {
        return res.status(400).json({ 
          message: 'Store ID is required' 
        });
      }
      
      const batchesData = await db.select({
        batchId: inventoryBatch.id,
        productId: products.id,
        productName: products.name,
        productCategory: productsCategories.name,
        batchNumber: inventoryBatch.batchNumber,
        quantity: inventoryBatch.quantity,
        totalCost: inventoryBatch.totalCost,
        buyingPrice: inventoryBatch.buyingPrice,
        retailPrice: inventoryBatch.retailPrice,
        retailDiscount: inventoryBatch.retailDiscount,
        wholesalerPrice: inventoryBatch.wholesalerPrice,
        wholesalerDiscount: inventoryBatch.wholesalerDiscount,
        createdAt: inventoryBatch.createdAt,
        storeId: inventoryBatch.storeId
      })
      .from(inventoryBatch)
      .leftJoin(products, eq(inventoryBatch.productId, products.id))
      .leftJoin(productsCategories, eq(products.categoryId, productsCategories.id))
      .where(eq(inventoryBatch.storeId, storeId as string))
      .orderBy(sql`${inventoryBatch.createdAt} DESC`);
      
      res.json(batchesData);
    } catch (error) {
      console.error('Error fetching inventory batches:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch inventory batches' 
      });
    }
  });

  // Update inventory quantity
  app.put('/api/inventory/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: 'Invalid quantity provided' });
      }
      
      const updatedInventory = await storage.updateInventory(id, { quantity });
      res.json(updatedInventory);
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update inventory' 
      });
    }
  });

  // Expenses Routes

  // Get all expenses for authenticated user
  app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
      const expenses = await storage.getExpensesByUserId(req.user!.id);
      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch expenses' 
      });
    }
  });

  // Get a specific expense by ID
  app.get('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const expense = await storage.getExpenseById(id);
      
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      res.json(expense);
    } catch (error) {
      console.error('Error fetching expense:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch expense' 
      });
    }
  });

  // Get expenses by store
  app.get('/api/expenses/store/:storeId', authenticateToken, async (req, res) => {
    try {
      const { storeId } = req.params;
      const expenses = await storage.getExpensesByStoreId(storeId);
      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses by store:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch expenses by store' 
      });
    }
  });

  // Get expenses by category
  app.get('/api/expenses/category/:categoryId', authenticateToken, async (req, res) => {
    try {
      const { categoryId } = req.params;
      const expenses = await storage.getExpensesByCategory(categoryId);
      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch expenses by category' 
      });
    }
  });

  // Get expenses by status
  app.get('/api/expenses/status/:status', authenticateToken, async (req, res) => {
    try {
      const { status } = req.params;
      const expenses = await storage.getExpensesByStatus(status);
      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses by status:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch expenses by status' 
      });
    }
  });

  // Create a new expense
  app.post('/api/expenses', authenticateToken, async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      
      // Keep expenseDate as string for the createExpense method
      const expenseWithUserId = {
        ...expenseData,
        userId: req.user!.id
      };
      
      const newExpense = await storage.createExpense(expenseWithUserId);
      
      res.status(201).json(newExpense);
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create expense' 
      });
    }
  });

  // Update an existing expense
  app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertExpenseSchema.partial().parse(req.body);
      
      // Convert expenseDate string to Date if provided
      if (updates.expenseDate) {
        (updates as any).expenseDate = new Date(updates.expenseDate);
      }
      
      const updatedExpense = await storage.updateExpense(id, req.user!.id, updates);
      res.json(updatedExpense);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update expense' 
      });
    }
  });

  // Delete an expense
  app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpense(id, req.user!.id);
      res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete expense' 
      });
    }
  });

  // Industries categories routes
  app.get('/api/industries-categories', async (req, res) => {
    try {
      const industries = await storage.getActiveIndustriesCategories();
      res.json(industries);
    } catch (error) {
      console.error('Error fetching industries categories:', error);
      res.status(500).json({ error: 'Failed to fetch industries categories' });
    }
  });

  // User profile update routes
  app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
      const { firstName, lastName, email, phone } = req.body;
      const updates: Partial<{ firstName: string; lastName: string; email: string; phone: string }> = {};
      
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (email !== undefined) updates.email = email;
      if (phone !== undefined) updates.phone = phone;
      
      const updatedUser = await storage.updateUser(req.user!.id, updates);
      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    }
  });

  // Appearance settings routes
  app.get('/api/appearance-settings', authenticateToken, async (req, res) => {
    try {
      const settings = await storage.getAppearanceSettingsByUserId(req.user!.id);
      res.json(settings || { darkMode: false, compactView: false, language: 'en' });
    } catch (error) {
      console.error('Error fetching appearance settings:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch appearance settings' 
      });
    }
  });

  app.post('/api/appearance-settings', authenticateToken, async (req, res) => {
    try {
      const { darkMode, compactView, language } = req.body;
      const settingsData = {
        darkMode: Boolean(darkMode),
        compactView: Boolean(compactView),
        language: String(language || 'en')
      };
      
      const settings = await storage.upsertAppearanceSettings(req.user!.id, settingsData);
      res.json(settings);
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to save appearance settings' 
      });
    }
  });

  // Object Storage Routes
  
  // Get upload URL for profile image
  app.post('/api/objects/upload', authenticateToken, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to get upload URL' 
      });
    }
  });

  // Serve private objects (profile images)
  app.get('/objects/:objectPath(*)', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: "read" as any,
      });
      
      if (!canAccess) {
        return res.sendStatus(401);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Error accessing object:', error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Update user profile (including profile image)
  app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, phone, profileImageURL } = req.body;
      
      let profileImagePath = null;
      
      // If a profile image URL is provided, process it through object storage
      if (profileImageURL) {
        try {
          const objectStorageService = new ObjectStorageService();
          profileImagePath = await objectStorageService.trySetObjectEntityAclPolicy(
            profileImageURL,
            {
              owner: userId,
              visibility: "public", // Profile images are public
            }
          );
        } catch (error) {
          console.error('Error processing profile image:', error);
          return res.status(400).json({ 
            message: 'Failed to process profile image' 
          });
        }
      }

      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (profileImagePath) updateData.profileImage = profileImagePath;

      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    }
  });

  // Team Member Management Routes
  
  // Get team members for authenticated user
  app.get('/api/team-members', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const teamMembers = await storage.getTeamMembersByUserId(userId);
      res.json(teamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch team members' 
      });
    }
  });

  // Create team member with account
  app.post('/api/team-members/invite', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { email, name, phone, password, role, storeName } = insertTeamMemberSchema.parse(req.body);
      
      // Check if user already exists (check directly in database)
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ 
          message: 'A user with this email already exists' 
        });
      }

      // Check if team member already exists
      const existingMember = await storage.getTeamMemberByEmail(email, userId);
      if (existingMember) {
        return res.status(400).json({ 
          message: 'A team member with this email already exists' 
        });
      }

      // Use provided password or generate temporary password
      const userPassword = password || Math.random().toString(36).slice(-8);
      
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create user account
      const newUser = await authService.createUserAccount({
        email,
        firstName,
        lastName,
        phone: phone || undefined,
        password: userPassword
      });

      // Find the store ID if storeName is provided
      let storeId = null;
      if (storeName && storeName !== 'none') {
        const userStores = await storage.getStoresByUserId(userId);
        const store = userStores.find(s => s.name === storeName);
        storeId = store?.id || null;
      }

      // Create team member record with active status
      const teamMember = await storage.createTeamMember({
        userId,
        email,
        name,
        role,
        storeId,
        storeName: (storeName === 'none') ? undefined : storeName,
        status: 'active',
        invitedUserId: newUser.id // Link to the actual user account
      });

      console.log(`Team member account created for ${email} with temporary password: ${userPassword}`);

      res.json({ 
        message: 'Team member account created successfully',
        teamMember,
        loginCredentials: {
          email,
          tempPassword: userPassword
        }
      });
    } catch (error) {
      console.error('Error creating team member account:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create team member account' 
      });
    }
  });

  // Update team member
  app.put('/api/team-members/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { id } = req.params;
      const updates = req.body;
      
      const updatedMember = await storage.updateTeamMember(id, userId, updates);
      res.json(updatedMember);
    } catch (error) {
      console.error('Error updating team member:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update team member' 
      });
    }
  });

  // Delete team member
  app.delete('/api/team-members/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      await storage.deleteTeamMember(id, userId);
      res.json({ message: 'Team member removed successfully' });
    } catch (error) {
      console.error('Error deleting team member:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to remove team member' 
      });
    }
  });

  // Get team invitations for authenticated user
  app.get('/api/team-invitations', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const invitations = await storage.getTeamInvitationsByUserId(userId);
      res.json(invitations);
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch invitations' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
