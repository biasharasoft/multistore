import { users, companies, stores, regions, productsCategories, expensesCategories, expenses, products, suppliers, customers, purchases, inventory, inventoryBatch, sales, saleItems, appearanceThemesSettings, industriesCategories, teamMembers, teamInvitations, type User, type InsertUser, type Company, type InsertCompany, type Store, type InsertStore, type Region, type InsertRegion, type ProductsCategory, type InsertProductsCategory, type ExpensesCategory, type InsertExpensesCategory, type Expense, type InsertExpense, type Product, type InsertProduct, type Supplier, type InsertSupplier, type Customer, type InsertCustomer, type Purchase, type InsertPurchase, type Inventory, type InsertInventory, type InventoryBatch, type InsertInventoryBatch, type Sale, type InsertSale, type SaleItem, type InsertSaleItem, type AppearanceThemesSettings, type InsertAppearanceThemesSettings, type IndustryCategory, type InsertIndustryCategory, type TeamMember, type InsertTeamMember, type TeamInvitation, type InsertTeamInvitation } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  
  // Company operations
  getCompanyByUserId(userId: string): Promise<Company | undefined>;
  getCompanyById(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany & { userId: string }): Promise<Company>;
  updateCompany(id: string, userId: string, updates: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: string, userId: string): Promise<void>;
  
  // Store operations
  getStoresByUserId(userId: string): Promise<Store[]>;
  getStoreById(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore & { userId: string }): Promise<Store>;
  updateStore(id: string, userId: string, updates: Partial<InsertStore>): Promise<Store>;
  deleteStore(id: string, userId: string): Promise<void>;
  
  // Region operations
  getAllRegions(): Promise<Region[]>;
  getActiveRegions(): Promise<Region[]>;
  
  // Products Categories operations
  getAllProductsCategories(): Promise<ProductsCategory[]>;
  getActiveProductsCategories(): Promise<ProductsCategory[]>;
  getProductsCategoryById(id: string): Promise<ProductsCategory | undefined>;
  createProductsCategory(category: InsertProductsCategory): Promise<ProductsCategory>;
  updateProductsCategory(id: string, updates: Partial<InsertProductsCategory>): Promise<ProductsCategory>;
  deleteProductsCategory(id: string): Promise<void>;
  
  // Expenses Categories operations
  getAllExpensesCategories(): Promise<ExpensesCategory[]>;
  getActiveExpensesCategories(): Promise<ExpensesCategory[]>;
  getExpensesCategoryById(id: string): Promise<ExpensesCategory | undefined>;
  createExpensesCategory(category: InsertExpensesCategory): Promise<ExpensesCategory>;
  updateExpensesCategory(id: string, updates: Partial<InsertExpensesCategory>): Promise<ExpensesCategory>;
  deleteExpensesCategory(id: string): Promise<void>;

  // Expenses operations
  getAllExpenses(): Promise<Expense[]>;
  getExpensesByUserId(userId: string): Promise<Expense[]>;
  getExpenseById(id: string): Promise<Expense | undefined>;
  getExpensesByStoreId(storeId: string): Promise<Expense[]>;
  getExpensesByCategory(categoryId: string): Promise<Expense[]>;
  getExpensesByStatus(status: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense & { userId: string }): Promise<Expense>;
  updateExpense(id: string, userId: string, updates: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string, userId: string): Promise<void>;
  
  // Products operations
  getAllProducts(): Promise<Product[]>;
  getActiveProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getLowStockProducts(): Promise<Product[]>;
  getOutOfStockProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Suppliers operations
  getAllSuppliers(): Promise<Supplier[]>;
  getActiveSuppliers(): Promise<Supplier[]>;
  getSupplierById(id: string): Promise<Supplier | undefined>;
  getSuppliersByCategory(category: string): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  
  // Customers operations
  getAllCustomers(): Promise<Customer[]>;
  getActiveCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  getCustomersByStatus(status: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;
  
  // Purchases operations
  getPurchasesByUserId(userId: string): Promise<Purchase[]>;
  getPurchaseById(id: string): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase & { userId: string }): Promise<Purchase>;
  updatePurchase(id: string, userId: string, updates: Partial<InsertPurchase>): Promise<Purchase>;
  deletePurchase(id: string, userId: string): Promise<void>;
  
  // Inventory operations
  getInventoryByProductId(productId: string): Promise<Inventory | undefined>;
  getInventoryById(id: string): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: string, updates: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventory(id: string): Promise<void>;
  upsertInventory(productId: string, storeId: string, quantity: number): Promise<Inventory>;
  
  // Inventory Batch operations
  getInventoryBatchesByProductId(productId: string): Promise<InventoryBatch[]>;
  getInventoryBatchById(id: string): Promise<InventoryBatch | undefined>;
  createInventoryBatch(batch: InsertInventoryBatch): Promise<InventoryBatch>;
  updateInventoryBatch(id: string, updates: Partial<InsertInventoryBatch>): Promise<InventoryBatch>;
  deleteInventoryBatch(id: string): Promise<void>;
  
  // Appearance theme settings operations
  getAppearanceSettings(userId: string): Promise<AppearanceThemesSettings | undefined>;
  createAppearanceSettings(settings: InsertAppearanceThemesSettings & { userId: string }): Promise<AppearanceThemesSettings>;
  updateAppearanceSettings(userId: string, updates: Partial<InsertAppearanceThemesSettings>): Promise<AppearanceThemesSettings>;
  
  // Industries categories operations
  getAllIndustriesCategories(): Promise<IndustryCategory[]>;
  getActiveIndustriesCategories(): Promise<IndustryCategory[]>;
  getIndustryCategoryById(id: string): Promise<IndustryCategory | undefined>;
  createIndustryCategory(category: InsertIndustryCategory): Promise<IndustryCategory>;
  updateIndustryCategory(id: string, updates: Partial<InsertIndustryCategory>): Promise<IndustryCategory>;
  deleteIndustryCategory(id: string): Promise<void>;
  
  // Team member operations
  getTeamMembersByUserId(userId: string): Promise<TeamMember[]>;
  getTeamMemberById(id: string): Promise<TeamMember | undefined>;
  getTeamMemberByEmail(email: string, userId: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember & { userId: string }): Promise<TeamMember>;
  updateTeamMember(id: string, userId: string, updates: Partial<InsertTeamMember>): Promise<TeamMember>;
  deleteTeamMember(id: string, userId: string): Promise<void>;
  
  // Team invitation operations
  getTeamInvitationsByUserId(userId: string): Promise<TeamInvitation[]>;
  getTeamInvitationById(id: string): Promise<TeamInvitation | undefined>;
  getTeamInvitationByToken(token: string): Promise<TeamInvitation | undefined>;
  createTeamInvitation(invitation: InsertTeamInvitation & { organizationOwnerId: string; token: string; expiresAt: Date }): Promise<TeamInvitation>;
  updateTeamInvitation(id: string, updates: Partial<InsertTeamInvitation>): Promise<TeamInvitation>;
  deleteTeamInvitation(id: string): Promise<void>;
  
  // Sales operations
  getAllSales(): Promise<Sale[]>;
  getSalesByUserId(userId: string): Promise<Sale[]>;
  getSalesByStoreId(storeId: string): Promise<Sale[]>;
  getSaleById(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale & { userId: string }): Promise<Sale>;
  updateSale(id: string, userId: string, updates: Partial<InsertSale>): Promise<Sale>;
  deleteSale(id: string, userId: string): Promise<void>;
  
  // Sale Items operations
  getSaleItemsBySaleId(saleId: string): Promise<SaleItem[]>;
  getSaleItemById(id: string): Promise<SaleItem | undefined>;
  createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem>;
  updateSaleItem(id: string, updates: Partial<InsertSaleItem>): Promise<SaleItem>;
  deleteSaleItem(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  // Company operations
  async getCompanyByUserId(userId: string): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId));
    return company || undefined;
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(companyData: InsertCompany & { userId: string }): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(companyData)
      .returning();
    return company;
  }

  async updateCompany(id: string, userId: string, updates: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(companies.id, id), eq(companies.userId, userId)))
      .returning();
    
    if (!company) {
      throw new Error('Company not found or access denied');
    }
    
    return company;
  }

  async deleteCompany(id: string, userId: string): Promise<void> {
    await db
      .delete(companies)
      .where(and(eq(companies.id, id), eq(companies.userId, userId)));
  }

  // Store operations
  async getStoresByUserId(userId: string): Promise<Store[]> {
    const userStores = await db
      .select()
      .from(stores)
      .where(eq(stores.userId, userId))
      .orderBy(stores.createdAt);
    return userStores;
  }

  async getStoreById(id: string): Promise<Store | undefined> {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, id));
    return store || undefined;
  }

  async createStore(storeData: InsertStore & { userId: string }): Promise<Store> {
    const [store] = await db
      .insert(stores)
      .values({
        ...storeData,
        status: "open",
        employees: 0,
        monthlyGoal: 0,
      })
      .returning();
    return store;
  }

  async updateStore(id: string, userId: string, updates: Partial<InsertStore>): Promise<Store> {
    const [store] = await db
      .update(stores)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(stores.id, id), eq(stores.userId, userId)))
      .returning();
    
    if (!store) {
      throw new Error("Store not found or you don't have permission to update it");
    }
    
    return store;
  }

  async deleteStore(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(stores)
      .where(and(eq(stores.id, id), eq(stores.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Store not found or you don't have permission to delete it");
    }
  }

  // Region operations
  async getAllRegions(): Promise<Region[]> {
    const allRegions = await db
      .select()
      .from(regions)
      .orderBy(regions.name);
    return allRegions;
  }

  async getActiveRegions(): Promise<Region[]> {
    const activeRegions = await db
      .select()
      .from(regions)
      .where(eq(regions.isActive, true))
      .orderBy(regions.name);
    return activeRegions;
  }

  // Products Categories operations
  async getAllProductsCategories(): Promise<ProductsCategory[]> {
    const allCategories = await db
      .select()
      .from(productsCategories)
      .orderBy(productsCategories.name);
    return allCategories;
  }

  async getActiveProductsCategories(): Promise<ProductsCategory[]> {
    const activeCategories = await db
      .select()
      .from(productsCategories)
      .where(eq(productsCategories.isActive, true))
      .orderBy(productsCategories.name);
    return activeCategories;
  }

  async getProductsCategoryById(id: string): Promise<ProductsCategory | undefined> {
    const [category] = await db
      .select()
      .from(productsCategories)
      .where(eq(productsCategories.id, id));
    return category || undefined;
  }

  async createProductsCategory(categoryData: InsertProductsCategory): Promise<ProductsCategory> {
    const [category] = await db
      .insert(productsCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateProductsCategory(id: string, updates: Partial<InsertProductsCategory>): Promise<ProductsCategory> {
    const [category] = await db
      .update(productsCategories)
      .set(updates)
      .where(eq(productsCategories.id, id))
      .returning();
    
    if (!category) {
      throw new Error("Category not found");
    }
    
    return category;
  }

  async deleteProductsCategory(id: string): Promise<void> {
    const result = await db
      .delete(productsCategories)
      .where(eq(productsCategories.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Category not found");
    }
  }

  // Expenses Categories operations
  async getAllExpensesCategories(): Promise<ExpensesCategory[]> {
    const allCategories = await db
      .select()
      .from(expensesCategories)
      .orderBy(expensesCategories.name);
    return allCategories;
  }

  async getActiveExpensesCategories(): Promise<ExpensesCategory[]> {
    const activeCategories = await db
      .select()
      .from(expensesCategories)
      .where(eq(expensesCategories.isActive, true))
      .orderBy(expensesCategories.name);
    return activeCategories;
  }

  async getExpensesCategoryById(id: string): Promise<ExpensesCategory | undefined> {
    const [category] = await db
      .select()
      .from(expensesCategories)
      .where(eq(expensesCategories.id, id));
    return category || undefined;
  }

  async createExpensesCategory(categoryData: InsertExpensesCategory): Promise<ExpensesCategory> {
    const [category] = await db
      .insert(expensesCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateExpensesCategory(id: string, updates: Partial<InsertExpensesCategory>): Promise<ExpensesCategory> {
    const [category] = await db
      .update(expensesCategories)
      .set(updates)
      .where(eq(expensesCategories.id, id))
      .returning();
    
    if (!category) {
      throw new Error("Category not found");
    }
    
    return category;
  }

  async deleteExpensesCategory(id: string): Promise<void> {
    const result = await db
      .delete(expensesCategories)
      .where(eq(expensesCategories.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Category not found");
    }
  }

  // Products operations
  async getAllProducts(): Promise<Product[]> {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(products.name);
    return allProducts;
  }

  async getActiveProducts(): Promise<Product[]> {
    const activeProducts = await db
      .select()
      .from(products)
      .where(eq(products.status, "active"))
      .orderBy(products.name);
    return activeProducts;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.barcode, sku));
    return product || undefined;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const categoryProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(products.name);
    return categoryProducts;
  }

  async getLowStockProducts(): Promise<Product[]> {
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(and(
        eq(products.status, "active"),
        sql`${products.stock} <= ${products.lowStockThreshold}`,
        sql`${products.stock} > 0`
      ))
      .orderBy(products.stock);
    return lowStockProducts;
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    const outOfStockProducts = await db
      .select()
      .from(products)
      .where(and(
        eq(products.status, "active"),
        eq(products.stock, 0)
      ))
      .orderBy(products.name);
    return outOfStockProducts;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Product not found");
    }
  }

  // Suppliers operations
  async getAllSuppliers(): Promise<Supplier[]> {
    const allSuppliers = await db
      .select()
      .from(suppliers)
      .orderBy(suppliers.name);
    return allSuppliers;
  }

  async getActiveSuppliers(): Promise<Supplier[]> {
    const activeSuppliers = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.status, "active"))
      .orderBy(suppliers.name);
    return activeSuppliers;
  }

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async getSuppliersByCategory(category: string): Promise<Supplier[]> {
    const categorySuppliers = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.category, category))
      .orderBy(suppliers.name);
    return categorySuppliers;
  }

  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db
      .insert(suppliers)
      .values(supplierData)
      .returning();
    return supplier;
  }

  async updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier> {
    const [supplier] = await db
      .update(suppliers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, id))
      .returning();
    
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    
    return supplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    const result = await db
      .delete(suppliers)
      .where(eq(suppliers.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Supplier not found");
    }
  }

  // Customers operations
  async getAllCustomers(): Promise<Customer[]> {
    const allCustomers = await db
      .select()
      .from(customers)
      .orderBy(customers.name);
    return allCustomers;
  }

  async getActiveCustomers(): Promise<Customer[]> {
    const activeCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.status, "active"))
      .orderBy(customers.name);
    return activeCustomers;
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));
    return customer || undefined;
  }



  async getCustomersByStatus(status: string): Promise<Customer[]> {
    const statusCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.status, status))
      .orderBy(customers.name);
    return statusCustomers;
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    // Convert dateOfBirth string to Date if present
    const insertData: any = { ...customerData };
    if (insertData.dateOfBirth && typeof insertData.dateOfBirth === 'string') {
      insertData.dateOfBirth = new Date(insertData.dateOfBirth);
    }
    
    const [customer] = await db
      .insert(customers)
      .values([insertData])
      .returning();
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer> {
    // Convert dateOfBirth string to Date if present
    const updateData: any = { ...updates };
    if (updateData.dateOfBirth && typeof updateData.dateOfBirth === 'string') {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    
    const [customer] = await db
      .update(customers)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning();
    
    if (!customer) {
      throw new Error("Customer not found");
    }
    
    return customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    const result = await db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Customer not found");
    }
  }

  // Purchases operations
  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    const userPurchases = await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(sql`${purchases.createdAt} DESC`);
    return userPurchases;
  }

  async getPurchaseById(id: string): Promise<Purchase | undefined> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async createPurchase(purchaseData: InsertPurchase & { userId: string }): Promise<Purchase> {
    // Convert purchaseDate string to Date if present
    const insertData: any = { ...purchaseData };
    if (insertData.purchaseDate && typeof insertData.purchaseDate === 'string') {
      insertData.purchaseDate = new Date(insertData.purchaseDate);
    }
    
    // Convert decimal values to cents (integers) for database storage
    if (typeof insertData.totalCost === 'number') {
      insertData.totalCost = Math.round(insertData.totalCost * 100);
    }
    if (typeof insertData.sellingPrice === 'number') {
      insertData.sellingPrice = Math.round(insertData.sellingPrice * 100);
    }
    
    // Create the purchase record
    const [purchase] = await db
      .insert(purchases)
      .values([insertData])
      .returning();

    // Get product details to copy wholesaler and retail pricing
    const product = await this.getProductById(purchaseData.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Create inventory batch record
    const batchData: InsertInventoryBatch = {
      productId: purchaseData.productId,
      storeId: (purchaseData as any).storeId, // Add store ID to batch
      batchNumber: this.generateBatchNumber(),
      quantity: purchaseData.quantity,
      totalCost: Math.round(purchaseData.totalCost * 100), // convert to cents
      buyingPrice: Math.round((purchaseData.totalCost / purchaseData.quantity) * 100), // convert to cents
      retailPrice: Math.round(purchaseData.sellingPrice * 100), // convert to cents
      retailDiscount: typeof product.retailDiscount === 'number' ? Math.round(product.retailDiscount * 100) : (typeof product.retailDiscount === 'string' ? Math.round(parseFloat(product.retailDiscount) * 100) : 0),
      wholesalerPrice: typeof product.wholesalerPrice === 'number' ? Math.round(product.wholesalerPrice * 100) : (typeof product.wholesalerPrice === 'string' ? Math.round(parseFloat(product.wholesalerPrice) * 100) : 0),
      wholesalerDiscount: typeof product.wholesalerDiscount === 'number' ? Math.round(product.wholesalerDiscount * 100) : (typeof product.wholesalerDiscount === 'string' ? Math.round(parseFloat(product.wholesalerDiscount) * 100) : 0),
    };

    await this.createInventoryBatch(batchData);

    // Update inventory to increment product quantity for the specific store
    await this.upsertInventory(purchaseData.productId, (purchaseData as any).storeId, purchaseData.quantity);
    
    return purchase;
  }

  async updatePurchase(id: string, userId: string, updates: Partial<InsertPurchase>): Promise<Purchase> {
    // Convert purchaseDate string to Date if present
    const updateData: any = { ...updates };
    if (updateData.purchaseDate && typeof updateData.purchaseDate === 'string') {
      updateData.purchaseDate = new Date(updateData.purchaseDate);
    }
    
    const [purchase] = await db
      .update(purchases)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(purchases.id, id), eq(purchases.userId, userId)))
      .returning();
    
    if (!purchase) {
      throw new Error("Purchase not found");
    }
    
    return purchase;
  }

  async deletePurchase(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(purchases)
      .where(and(eq(purchases.id, id), eq(purchases.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Purchase not found");
    }
  }

  // Inventory Batch operations
  async getInventoryBatchesByProductId(productId: string): Promise<InventoryBatch[]> {
    const batches = await db
      .select()
      .from(inventoryBatch)
      .where(eq(inventoryBatch.productId, productId))
      .orderBy(sql`${inventoryBatch.createdAt} DESC`);
    return batches;
  }

  async getInventoryBatchById(id: string): Promise<InventoryBatch | undefined> {
    const [batch] = await db
      .select()
      .from(inventoryBatch)
      .where(eq(inventoryBatch.id, id));
    return batch || undefined;
  }

  async createInventoryBatch(batchData: InsertInventoryBatch): Promise<InventoryBatch> {
    const [batch] = await db
      .insert(inventoryBatch)
      .values([batchData])
      .returning();
    return batch;
  }

  async updateInventoryBatch(id: string, updates: Partial<InsertInventoryBatch>): Promise<InventoryBatch> {
    const [batch] = await db
      .update(inventoryBatch)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(inventoryBatch.id, id))
      .returning();
    
    if (!batch) {
      throw new Error("Inventory batch not found");
    }
    
    return batch;
  }

  async deleteInventoryBatch(id: string): Promise<void> {
    const result = await db
      .delete(inventoryBatch)
      .where(eq(inventoryBatch.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Inventory batch not found");
    }
  }

  // Inventory operations
  async getInventoryByProductId(productId: string, storeId?: string): Promise<Inventory | undefined> {
    const conditions = [eq(inventory.productId, productId)];
    
    if (storeId) {
      conditions.push(eq(inventory.storeId, storeId));
    }
    
    const [inventoryRecord] = await db
      .select()
      .from(inventory)
      .where(and(...conditions));
    return inventoryRecord || undefined;
  }

  async getInventoryByProductAndStore(productId: string, storeId: string): Promise<Inventory | undefined> {
    const [inventoryRecord] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.productId, productId), eq(inventory.storeId, storeId)));
    return inventoryRecord || undefined;
  }

  async getInventoryById(id: string): Promise<Inventory | undefined> {
    const [inventoryRecord] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, id));
    return inventoryRecord || undefined;
  }

  async createInventory(inventoryData: InsertInventory): Promise<Inventory> {
    const [inventoryRecord] = await db
      .insert(inventory)
      .values([inventoryData])
      .returning();
    return inventoryRecord;
  }

  async updateInventory(id: string, updates: Partial<InsertInventory>): Promise<Inventory> {
    const [inventoryRecord] = await db
      .update(inventory)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, id))
      .returning();
    
    if (!inventoryRecord) {
      throw new Error("Inventory record not found");
    }
    
    return inventoryRecord;
  }

  async deleteInventory(id: string): Promise<void> {
    const result = await db
      .delete(inventory)
      .where(eq(inventory.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Inventory record not found");
    }
  }

  async upsertInventory(productId: string, storeId: string, quantityToAdd: number): Promise<Inventory> {
    const existingInventory = await this.getInventoryByProductAndStore(productId, storeId);
    
    if (existingInventory) {
      // Update existing inventory by adding the new quantity
      return await this.updateInventory(existingInventory.id, {
        quantity: existingInventory.quantity + quantityToAdd
      });
    } else {
      // Create new inventory record for this store
      return await this.createInventory({
        productId,
        storeId,
        quantity: quantityToAdd
      });
    }
  }

  // Utility function to generate 20-character alphanumeric batch number
  private generateBatchNumber(): string {
    return crypto.randomBytes(10).toString('hex').toUpperCase();
  }



  // Appearance themes settings operations
  async getAppearanceSettingsByUserId(userId: string): Promise<AppearanceThemesSettings | undefined> {
    const [settings] = await db
      .select()
      .from(appearanceThemesSettings)
      .where(eq(appearanceThemesSettings.userId, userId));
    return settings || undefined;
  }

  async createAppearanceSettings(settingsData: InsertAppearanceThemesSettings & { userId: string }): Promise<AppearanceThemesSettings> {
    const [settings] = await db
      .insert(appearanceThemesSettings)
      .values([settingsData])
      .returning();
    return settings;
  }

  async updateAppearanceSettings(userId: string, updates: Partial<InsertAppearanceThemesSettings>): Promise<AppearanceThemesSettings> {
    const [settings] = await db
      .update(appearanceThemesSettings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(appearanceThemesSettings.userId, userId))
      .returning();
    
    if (!settings) {
      throw new Error("Appearance settings not found");
    }
    
    return settings;
  }

  async upsertAppearanceSettings(userId: string, settingsData: InsertAppearanceThemesSettings): Promise<AppearanceThemesSettings> {
    const existing = await this.getAppearanceSettingsByUserId(userId);
    
    if (existing) {
      return await this.updateAppearanceSettings(userId, settingsData);
    } else {
      return await this.createAppearanceSettings({ ...settingsData, userId });
    }
  }

  // Add missing interface methods
  async getAppearanceSettings(userId: string): Promise<AppearanceThemesSettings | undefined> {
    return this.getAppearanceSettingsByUserId(userId);
  }

  // Industries categories operations
  async getAllIndustriesCategories(): Promise<IndustryCategory[]> {
    return await db.select().from(industriesCategories);
  }

  async getActiveIndustriesCategories(): Promise<IndustryCategory[]> {
    return await db.select().from(industriesCategories).where(eq(industriesCategories.isActive, true));
  }

  async getIndustryCategoryById(id: string): Promise<IndustryCategory | undefined> {
    const [category] = await db
      .select()
      .from(industriesCategories)
      .where(eq(industriesCategories.id, id));
    return category || undefined;
  }

  async createIndustryCategory(categoryData: InsertIndustryCategory): Promise<IndustryCategory> {
    const [category] = await db
      .insert(industriesCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateIndustryCategory(id: string, updates: Partial<InsertIndustryCategory>): Promise<IndustryCategory> {
    const [category] = await db
      .update(industriesCategories)
      .set(updates)
      .where(eq(industriesCategories.id, id))
      .returning();
    
    if (!category) {
      throw new Error("Industry category not found");
    }
    
    return category;
  }

  async deleteIndustryCategory(id: string): Promise<void> {
    const result = await db
      .delete(industriesCategories)
      .where(eq(industriesCategories.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Industry category not found");
    }
  }

  // Team member operations
  async getTeamMembersByUserId(userId: string): Promise<TeamMember[]> {
    const members = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId))
      .orderBy(teamMembers.createdAt);
    return members;
  }

  async getTeamMemberById(id: string): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id));
    return member || undefined;
  }

  async getTeamMemberByEmail(email: string, userId: string): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.email, email),
        eq(teamMembers.userId, userId)
      ));
    return member || undefined;
  }

  async createTeamMember(memberData: InsertTeamMember & { userId: string }): Promise<TeamMember> {
    const [member] = await db
      .insert(teamMembers)
      .values([memberData])
      .returning();
    return member;
  }

  async updateTeamMember(id: string, userId: string, updates: Partial<InsertTeamMember>): Promise<TeamMember> {
    const [member] = await db
      .update(teamMembers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(teamMembers.id, id),
        eq(teamMembers.userId, userId)
      ))
      .returning();
    
    if (!member) {
      throw new Error("Team member not found");
    }
    
    return member;
  }

  async deleteTeamMember(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(teamMembers)
      .where(and(
        eq(teamMembers.id, id),
        eq(teamMembers.userId, userId)
      ))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Team member not found");
    }
  }

  // Team invitation operations
  async getTeamInvitationsByUserId(userId: string): Promise<TeamInvitation[]> {
    const invitations = await db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.organizationOwnerId, userId))
      .orderBy(teamInvitations.createdAt);
    return invitations;
  }

  async getTeamInvitationById(id: string): Promise<TeamInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.id, id));
    return invitation || undefined;
  }

  async getTeamInvitationByToken(token: string): Promise<TeamInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.token, token));
    return invitation || undefined;
  }

  async createTeamInvitation(invitationData: InsertTeamInvitation & { organizationOwnerId: string; token: string; expiresAt: Date }): Promise<TeamInvitation> {
    const [invitation] = await db
      .insert(teamInvitations)
      .values(invitationData)
      .returning();
    return invitation;
  }

  async updateTeamInvitation(id: string, updates: Partial<InsertTeamInvitation>): Promise<TeamInvitation> {
    const [invitation] = await db
      .update(teamInvitations)
      .set(updates)
      .where(eq(teamInvitations.id, id))
      .returning();
    
    if (!invitation) {
      throw new Error("Team invitation not found");
    }
    
    return invitation;
  }

  async deleteTeamInvitation(id: string): Promise<void> {
    const result = await db
      .delete(teamInvitations)
      .where(eq(teamInvitations.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Team invitation not found");
    }
  }

  // Expenses operations
  async getAllExpenses(): Promise<Expense[]> {
    const allExpenses = await db
      .select()
      .from(expenses)
      .orderBy(sql`${expenses.createdAt} DESC`);
    return allExpenses;
  }

  async getExpensesByUserId(userId: string): Promise<Expense[]> {
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(sql`${expenses.createdAt} DESC`);
    return userExpenses;
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id));
    return expense || undefined;
  }

  async getExpensesByStoreId(storeId: string): Promise<Expense[]> {
    const storeExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.storeId, storeId))
      .orderBy(sql`${expenses.createdAt} DESC`);
    return storeExpenses;
  }

  async getExpensesByCategory(categoryId: string): Promise<Expense[]> {
    const categoryExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.categoryId, categoryId))
      .orderBy(sql`${expenses.createdAt} DESC`);
    return categoryExpenses;
  }

  async getExpensesByStatus(status: string): Promise<Expense[]> {
    const statusExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.status, status))
      .orderBy(sql`${expenses.createdAt} DESC`);
    return statusExpenses;
  }

  async createExpense(expenseData: InsertExpense & { userId: string }): Promise<Expense> {
    // Convert expenseDate string to Date if present
    const insertData: any = { ...expenseData };
    if (insertData.expenseDate && typeof insertData.expenseDate === 'string') {
      insertData.expenseDate = new Date(insertData.expenseDate);
    }
    
    const [expense] = await db
      .insert(expenses)
      .values(insertData)
      .returning();
    return expense;
  }

  async updateExpense(id: string, userId: string, updates: Partial<InsertExpense>): Promise<Expense> {
    // Convert expenseDate string to Date if present
    const updateData: any = { ...updates };
    if (updateData.expenseDate && typeof updateData.expenseDate === 'string') {
      updateData.expenseDate = new Date(updateData.expenseDate);
    }
    
    const [expense] = await db
      .update(expenses)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    
    if (!expense) {
      throw new Error("Expense not found");
    }
    
    return expense;
  }

  async deleteExpense(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Expense not found");
    }
  }

  // Sales operations
  async getAllSales(): Promise<Sale[]> {
    const allSales = await db
      .select()
      .from(sales)
      .orderBy(sql`${sales.createdAt} DESC`);
    return allSales;
  }

  async getSalesByUserId(userId: string): Promise<Sale[]> {
    const userSales = await db
      .select()
      .from(sales)
      .where(eq(sales.userId, userId))
      .orderBy(sql`${sales.createdAt} DESC`);
    return userSales;
  }

  async getSalesByStoreId(storeId: string): Promise<Sale[]> {
    const storeSales = await db
      .select()
      .from(sales)
      .where(eq(sales.storeId, storeId))
      .orderBy(sql`${sales.createdAt} DESC`);
    return storeSales;
  }

  async getSaleById(id: string): Promise<Sale | undefined> {
    const [sale] = await db
      .select()
      .from(sales)
      .where(eq(sales.id, id));
    return sale || undefined;
  }

  async createSale(saleData: InsertSale & { userId: string }): Promise<Sale> {
    const [sale] = await db
      .insert(sales)
      .values([saleData])
      .returning();
    return sale;
  }

  async updateSale(id: string, userId: string, updates: Partial<InsertSale>): Promise<Sale> {
    const [sale] = await db
      .update(sales)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(sales.id, id), eq(sales.userId, userId)))
      .returning();
    
    if (!sale) {
      throw new Error("Sale not found");
    }
    
    return sale;
  }

  async deleteSale(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(sales)
      .where(and(eq(sales.id, id), eq(sales.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Sale not found");
    }
  }

  // Sale Items operations
  async getSaleItemsBySaleId(saleId: string): Promise<SaleItem[]> {
    const items = await db
      .select()
      .from(saleItems)
      .where(eq(saleItems.saleId, saleId))
      .orderBy(sql`${saleItems.createdAt} DESC`);
    return items;
  }

  async getSaleItemById(id: string): Promise<SaleItem | undefined> {
    const [item] = await db
      .select()
      .from(saleItems)
      .where(eq(saleItems.id, id));
    return item || undefined;
  }

  async createSaleItem(saleItemData: InsertSaleItem): Promise<SaleItem> {
    const [item] = await db
      .insert(saleItems)
      .values([saleItemData])
      .returning();
    return item;
  }

  async updateSaleItem(id: string, updates: Partial<InsertSaleItem>): Promise<SaleItem> {
    const [item] = await db
      .update(saleItems)
      .set(updates)
      .where(eq(saleItems.id, id))
      .returning();
    
    if (!item) {
      throw new Error("Sale item not found");
    }
    
    return item;
  }

  async deleteSaleItem(id: string): Promise<void> {
    const result = await db
      .delete(saleItems)
      .where(eq(saleItems.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Sale item not found");
    }
  }
}

export const storage = new DatabaseStorage();
