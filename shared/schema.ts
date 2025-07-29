// THE NEW, UPGRADED code for shared/schema.ts

import { pgTable, text, varchar, serial, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the roles a user can have
export const roleEnum = pgEnum('role', ['pending', 'author', 'admin']);

// This is our new, authoritative users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: varchar("firebase_uid", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  role: roleEnum('role').default('pending').notNull(),
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
  // We can optionally link articles to a user in the future
  // authorId: varchar("author_id", { length: 255 }).references(() => users.firebaseUid),
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

// New User types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});