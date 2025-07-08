import { pgTable, text, serial, integer, boolean, timestamp, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === Users ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3),
  password: z.string().min(4),
  name: z.string().min(3).optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional(),
  isAdmin: z.boolean().optional(),
}).omit({ id: true, createdAt: true });

// === Categories ===
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories, {
  name: z.string().min(3),
  icon: z.string().min(1),
}).omit({ id: true });

// === Services ===
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  minPrice: real("min_price").notNull(),
  maxPrice: real("max_price").notNull(),
  categoryId: integer("category_id").notNull(),
  icon: text("icon").notNull(),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
});

export const insertServiceSchema = createInsertSchema(services, {
  name: z.string().min(3),
  description: z.string().min(10),
  minPrice: z.number().min(0),
  maxPrice: z.number().min(0),
  categoryId: z.number().int(),
  icon: z.string().min(1),
  imageUrl: z.string().url().optional(),
  featured: z.boolean().optional(),
}).omit({ id: true });

// === Price Items ===
export const priceItems = pgTable("price_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  minPrice: real("min_price").notNull(),
  maxPrice: real("max_price").notNull(),
  categoryId: integer("category_id").notNull(),
});

export const insertPriceItemSchema = createInsertSchema(priceItems, {
  name: z.string().min(3),
  minPrice: z.number().min(0),
  maxPrice: z.number().min(0),
  categoryId: z.number().int(),
}).omit({ id: true });

// === Appointments ===
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceId: integer("service_id").notNull(),
  categoryId: integer("category_id").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  notes: text("notes"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments, {
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  serviceId: z.union([z.string(), z.number()]).transform(val => Number(val)),
  categoryId: z.union([z.string(), z.number()]).transform(val => Number(val)),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
}).omit({ id: true, status: true, createdAt: true });

// === Reviews ===
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  rating: real("rating").notNull(),
  comment: text("comment").notNull(),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews, {
  clientName: z.string().min(3),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10),
  likes: z.number().default(0),
}).omit({ id: true, createdAt: true });

// === Sales ===
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  serviceId: integer("service_id").notNull(),
  serviceName: text("service_name").notNull(),
  amount: real("amount").notNull(),
  date: date("date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSaleSchema = createInsertSchema(sales, {
  clientName: z.string().min(3),
  serviceId: z.string(),
  serviceName: z.string().min(3),
  amount: z.number().min(0),
  date: z.string(),
  paymentMethod: z.string().min(1),
}).omit({ id: true, createdAt: true, serviceName: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type PriceItem = typeof priceItems.$inferSelect;
export type InsertPriceItem = z.infer<typeof insertPriceItemSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

// Additional types for frontend select options
export interface ServiceOption {
  id: string;
  name: string;
  minPrice: number;
}
