import { users, stores, type User, type InsertUser, type Store, type InsertStore } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
