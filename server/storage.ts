import { users, stores, regions, productsCategories, type User, type InsertUser, type Store, type InsertStore, type Region, type InsertRegion, type ProductsCategory, type InsertProductsCategory } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
