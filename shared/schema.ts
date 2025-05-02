import { pgTable, text, serial, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  STORE_OWNER = "owner"
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  address: text("address").notNull(),
  role: text("role", { enum: Object.values(UserRole) }).default(UserRole.USER).notNull(),
  storeId: integer("store_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stores table
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  storeId: integer("store_id").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userStoreUnique: unique().on(table.userId, table.storeId)
  }
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users, {
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.STORE_OWNER]),
  name: z.string().min(20).max(60),
  address: z.string().max(400),
  password: z.string().min(8).max(16).regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least 1 special character"),
  email: z.string().email("Invalid email format"),
}).omit({ id: true, createdAt: true });

export const insertStoreSchema = createInsertSchema(stores, {
  name: z.string().min(20).max(60),
  address: z.string().max(400),
  email: z.string().email("Invalid email format"),
}).omit({ id: true, createdAt: true });

export const insertRatingSchema = createInsertSchema(ratings, {
  rating: z.number().int().min(1).max(5),
}).omit({ id: true, createdAt: true });

// Create login schema
export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Define extended schemas for forms with reusable validation
export const passwordValidationSchema = z.object({
  password: insertUserSchema.shape.password,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  ...passwordValidationSchema.shape
});
