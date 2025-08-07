import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(), // JSON session data
  expire: timestamp("expire").notNull(),
});

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  password: text("password").notNull(),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTP verification table
export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  type: varchar("type").notNull(), // 'register', 'reset-password'
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  type: z.enum(["register", "reset-password"]),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const newPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type NewPasswordData = z.infer<typeof newPasswordSchema>;

// Stores table
export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  regionId: varchar("region_id").references(() => regions.id, { onDelete: "set null" }),
  name: varchar("name").notNull(),
  manager: varchar("manager"),
  address: text("address").notNull(),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  phone: varchar("phone"),
  email: varchar("email"),
  openTime: varchar("open_time"),
  closeTime: varchar("close_time"),
  status: varchar("status").default("open"), // open, closed, maintenance
  employees: integer("employees").default(0),
  monthlyGoal: integer("monthly_goal").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Store validation schemas
export const insertStoreSchema = createInsertSchema(stores).pick({
  name: true,
  manager: true,
  address: true,
  regionId: true,
  city: true,
  state: true,
  zipCode: true,
  phone: true,
  email: true,
  openTime: true,
  closeTime: true,
}).extend({
  name: z.string().min(1, "Store name is required"),
  address: z.string().min(1, "Address is required"),
  regionId: z.string().optional(),
});

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

// Regions table
export const regions = pgTable("regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(false),
});

// Region validation schemas
export const insertRegionSchema = createInsertSchema(regions).pick({
  name: true,
  isActive: true,
}).extend({
  name: z.string().min(1, "Region name is required"),
});

export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regions.$inferSelect;

// Products Categories table
export const productsCategories = pgTable("products_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(true),
});

// Products Categories validation schemas
export const insertProductsCategorySchema = createInsertSchema(productsCategories).pick({
  name: true,
  isActive: true,
}).extend({
  name: z.string().min(1, "Category name is required"),
});

export type InsertProductsCategory = z.infer<typeof insertProductsCategorySchema>;
export type ProductsCategory = typeof productsCategories.$inferSelect;
