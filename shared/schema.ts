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
  phone: varchar("phone"), // Optional phone number field
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
  phone: true,
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

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  industry: varchar("industry"),
  website: varchar("website"),
  address: text("address"),
  currency: varchar("currency").default("tzs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company validation schemas
export const insertCompanySchema = createInsertSchema(companies).pick({
  name: true,
  industry: true,
  website: true,
  address: true,
  currency: true,
}).extend({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  address: z.string().optional(),
  currency: z.string().optional(),
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

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

// Expenses Categories table
export const expensesCategories = pgTable("expenses_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(true),
});

// Expenses Categories validation schemas
export const insertExpensesCategorySchema = createInsertSchema(expensesCategories).pick({
  name: true,
  isActive: true,
}).extend({
  name: z.string().min(1, "Category name is required"),
});

export type InsertExpensesCategory = z.infer<typeof insertExpensesCategorySchema>;
export type ExpensesCategory = typeof expensesCategories.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  categoryId: varchar("category_id").references(() => productsCategories.id, { onDelete: "set null" }),
  price: integer("price").notNull().default(0), // Store as cents
  cost: integer("cost").notNull().default(0), // Store as cents
  wholesalerPrice: integer("wholesaler_price").notNull().default(0), // Store as cents
  wholesalerDiscount: integer("wholesaler_discount").default(0), // Store as percentage * 100
  retailPrice: integer("retail_price").notNull().default(0), // Store as cents
  retailDiscount: integer("retail_discount").default(0), // Store as percentage * 100
  stock: integer("stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  description: text("description"),
  barcode: varchar("barcode"),
  image: varchar("image"),
  status: varchar("status").notNull().default("active"), // active, inactive, discontinued
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products validation schemas
export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  categoryId: true,
  price: true,
  cost: true,
  wholesalerPrice: true,
  wholesalerDiscount: true,
  retailPrice: true,
  retailDiscount: true,
  stock: true,
  lowStockThreshold: true,
  description: true,
  barcode: true,
  image: true,
  status: true,
}).extend({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be non-negative"),
  cost: z.number().min(0, "Cost must be non-negative"),
  wholesalerPrice: z.number().min(0, "Wholesaler price must be non-negative"),
  wholesalerDiscount: z.number().min(0).max(10000, "Discount must be valid").optional(),
  retailPrice: z.number().min(0, "Retail price must be non-negative"),
  retailDiscount: z.number().min(0).max(10000, "Discount must be valid").optional(),
  stock: z.number().min(0, "Stock must be non-negative"),
  lowStockThreshold: z.number().min(0, "Low stock threshold must be non-negative"),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  contactPerson: varchar("contact_person"),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country"),
  category: varchar("category"),
  status: varchar("status").notNull().default("active"), // active, inactive, pending
  rating: integer("rating").default(0), // Store as rating * 10 (e.g., 48 for 4.8)
  totalOrders: integer("total_orders").default(0),
  totalSpent: integer("total_spent").default(0), // Store as cents
  lastOrderDate: timestamp("last_order_date"),
  paymentTerms: varchar("payment_terms"),
  leadTime: integer("lead_time").default(0), // in days
  description: text("description"),
  website: varchar("website"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Suppliers validation schemas
export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  contactPerson: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  category: true,
  status: true,
  rating: true,
  totalOrders: true,
  totalSpent: true,
  lastOrderDate: true,
  paymentTerms: true,
  leadTime: true,
  description: true,
  website: true,
}).extend({
  name: z.string().min(1, "Supplier name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  rating: z.number().min(0).max(50).optional(), // 0-50 for 0.0-5.0 rating
  totalOrders: z.number().min(0).optional(),
  totalSpent: z.number().min(0).optional(),
  leadTime: z.number().min(0).optional(),
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Customers table
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  city: varchar("city"),
  status: varchar("status").notNull().default("active"), // active, inactive, vip
  gender: varchar("gender"), // male, female
  dateOfBirth: timestamp("date_of_birth"),
  idType: varchar("id_type"), // nida, driverLicense, passport, voterID
  idNumber: varchar("id_number"),
  totalOrders: integer("total_orders").default(0),
  totalSpent: integer("total_spent").default(0), // Store as cents
  loyaltyPoints: integer("loyalty_points").default(0),
  lastOrderDate: timestamp("last_order_date"),
  dateJoined: timestamp("date_joined").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers validation schemas
export const insertCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  status: z.enum(["active", "inactive", "vip"]).optional(),
  gender: z.enum(["male", "female"]).optional(),
  dateOfBirth: z.string().optional(),
  idType: z.enum(["nida", "driverLicense", "passport", "voterID"]).optional(),
  idNumber: z.string().optional(),
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Purchases table
export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  supplierId: varchar("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(),
  totalCost: integer("total_cost").notNull(), // Store as cents
  sellingPrice: integer("selling_price").notNull(), // Store as cents
  purchaseDate: timestamp("purchase_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchases validation schemas
export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  productId: true,
  supplierId: true,
  quantity: true,
  totalCost: true,
  sellingPrice: true,
  purchaseDate: true,
  notes: true,
}).extend({
  productId: z.string().min(1, "Product is required"),
  supplierId: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  totalCost: z.number().min(0, "Total cost must be non-negative"),
  sellingPrice: z.number().min(0, "Selling price must be non-negative"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  notes: z.string().optional(),
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;
