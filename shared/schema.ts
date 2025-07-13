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
  profileImageBase64: text("profile_image_base64"),
  profileImageMimeType: text("profile_image_mime_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3),
  password: z.string().min(4),
  name: z.string().min(3).optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional(),
  isAdmin: z.boolean().optional(),
  profileImageBase64: z.string().optional(),
  profileImageMimeType: z.string().optional(),
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
  imageDataBase64: text("image_data_base64"),
  imageMimeType: text("image_mime_type"),
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
  userId: integer("user_id"), // Opcional para permitir reviews de usuários não cadastrados
  clientName: text("client_name").notNull(),
  rating: real("rating").notNull(),
  comment: text("comment").notNull(),
  likes: integer("likes").notNull().default(0),
  thumbsLikes: integer("thumbs_likes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews, {
  clientName: z.string().min(3),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10),
  likes: z.number().default(0),
}).omit({ id: true, createdAt: true });

// === Review Comments (Threads) ===
export const reviewComments = pgTable("review_comments", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull(),
  userId: integer("user_id").notNull(),
  userName: text("user_name").notNull(),
  comment: text("comment").notNull(),
  heartLikes: integer("heart_likes").notNull().default(0),
  thumbsLikes: integer("thumbs_likes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewCommentSchema = createInsertSchema(reviewComments, {
  reviewId: z.number().int(),
  comment: z.string().min(1),
}).omit({ id: true, userId: true, userName: true, heartLikes: true, thumbsLikes: true, createdAt: true });

// === Comment Likes ===
export const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  userId: integer("user_id").notNull(),
  likeType: text("like_type").notNull(), // 'heart' ou 'thumbs'
  createdAt: timestamp("created_at").defaultNow(),
});

// === Review Likes ===
export const reviewLikes = pgTable("review_likes", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull(),
  userId: integer("user_id").notNull(),
  likeType: text("like_type").notNull(), // 'heart' ou 'thumbs'
  createdAt: timestamp("created_at").defaultNow(),
});

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

// === Banner ===
export const banner = pgTable("banner", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  ctaText: text("cta_text").notNull(),
  ctaLink: text("cta_link").notNull(),
  backgroundImage: text("background_image"),
  backgroundImageDataBase64: text("background_image_data_base64"),
  backgroundImageMimeType: text("background_image_mime_type"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBannerSchema = createInsertSchema(banner, {
  title: z.string().min(1, "Título é obrigatório"),
  subtitle: z.string().min(1, "Subtítulo é obrigatório"),
  ctaText: z.string().min(1, "Texto do botão é obrigatório"),
  ctaLink: z.string().min(1, "Link do botão é obrigatório"),
}).omit({ id: true, createdAt: true, updatedAt: true });

// === Footer Configuration ===
export const footer = pgTable("footer", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  workingHours: text("working_hours").notNull(),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  tiktokUrl: text("tiktok_url"),
  youtubeUrl: text("youtube_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFooterSchema = createInsertSchema(footer, {
  businessName: z.string().min(1, "Nome do negócio é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  workingHours: z.string().min(1, "Horário de funcionamento é obrigatório"),
  facebookUrl: z.string().url("URL do Facebook inválida").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL do Instagram inválida").optional().or(z.literal("")),
  tiktokUrl: z.string().url("URL do TikTok inválida").optional().or(z.literal("")),
  youtubeUrl: z.string().url("URL do YouTube inválida").optional().or(z.literal("")),
}).omit({ id: true, createdAt: true, updatedAt: true });

// === Site Configuration ===
export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull(),
  siteSlogan: text("site_slogan"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#3b82f6"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteConfigSchema = createInsertSchema(siteConfig, {
  siteName: z.string().min(1, "Nome do site é obrigatório"),
  siteSlogan: z.string().optional(),
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato #RRGGBB").optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

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

export type Review = typeof reviews.$inferSelect & {
  userProfileImageBase64?: string | null;
};
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ReviewComment = typeof reviewComments.$inferSelect & {
  userProfileImageBase64?: string | null;
};
export type InsertReviewComment = z.infer<typeof insertReviewCommentSchema>;

export type CommentLike = typeof commentLikes.$inferSelect;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type Banner = typeof banner.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;

export type Footer = typeof footer.$inferSelect;
export type InsertFooter = z.infer<typeof insertFooterSchema>;

export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;

// Additional types for frontend select options
export interface ServiceOption {
  id: string;
  name: string;
  minPrice: number;
}
