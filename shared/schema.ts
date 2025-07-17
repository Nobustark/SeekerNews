import { pgTable, text, varchar, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"),
  author: text("author").default("Admin"),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateArticleSchema = insertArticleSchema.partial();

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Admin schemas
export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type Admin = typeof admins.$inferSelect;

// Firebase types (not stored in database, but used in frontend)
export interface FirebaseArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  author: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
