// The complete, corrected code for server/storage.ts

import { articles, admins, type Article, type InsertArticle, type UpdateArticle, type Admin, type InsertAdmin } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Articles
  getArticles(): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: UpdateArticle): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  getPublishedArticles(): Promise<Article[]>;
  
  // Admins
  getAdminById(id: number): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

// MemStorage is great for testing but we are not using it in production.
export class MemStorage implements IStorage {
  // ... (all the MemStorage code remains the same)
}

// This is the real class that talks to our database.
export class DatabaseStorage implements IStorage {
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article || undefined;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(insertArticle)
      .returning();
    return article;
  }

  async updateArticle(id: number, updateArticle: UpdateArticle): Promise<Article | undefined> {
    const [article] = await db
      .update(articles)
      .set(updateArticle)
      .where(eq(articles.id, id))
      .returning();
    return article || undefined;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPublishedArticles(): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.published, true)).orderBy(desc(articles.createdAt));
  }

  async getAdminById(id: number): Promise<Admin | undefined> {
    // We are using Firebase now, so this is not strictly needed, but we keep it for interface compatibility.
    // In a real app, you might fetch extended user profiles from your own DB.
    return undefined;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    // This is also not used by our new Firebase auth flow.
    return undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    // This is not used by our new Firebase auth flow.
    throw new Error("createAdmin is not supported in DatabaseStorage with Firebase Auth");
  }
}

// *** THIS IS THE FIX ***
// We are now telling the entire application to use the real database.
export const storage = new DatabaseStorage();