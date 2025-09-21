// THE NEW, UPGRADED code for shared/schema.ts
export const categories = ["Breaking", "World", "Tech", "Business", "Sports", "Health", "Entertainment"] as const;

import { pgTable, text, varchar, serial, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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
  
  // --- MODIFIED/NEW LINES START HERE ---
  author: text("author").notNull().default("TheSeeker Staff"),
  category: text("category", { enum: categories }).notNull().default("Breaking"),
  // --- MODIFIED/NEW LINES END HERE ---

  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articles, {
  // Make certain fields required on creation
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
}).omit({
  // Omit fields that are auto-generated
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateArticleSchema = createSelectSchema(articles).pick({
  // Define which fields can be updated
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  imageUrl: true,
  author: true,
  category: true, // <-- ADD THIS LINE
  published: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});