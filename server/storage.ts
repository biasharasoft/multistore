import { users, stores, regions, productsCategories, expensesCategories, products, suppliers, type User, type InsertUser, type Store, type InsertStore, type Region, type InsertRegion, type ProductsCategory, type InsertProductsCategory, type ExpensesCategory, type InsertExpensesCategory, type Product, type InsertProduct, type Supplier, type InsertSupplier } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export const storage = new DatabaseStorage();
