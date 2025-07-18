// The FINAL, COMPLETE, CORRECTED code for server/storage.ts

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
  
  // Admins (placeholders for interface compatibility)
  getAdminById(id: number): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
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
    // *** THIS IS THE FIX ***
    // Explicitly define the columns to be returned after the insert.
    const [article] = await db
      .insert(articles)
      .values(insertArticle)
      .returning({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        excerpt: articles.excerpt,
        imageUrl: articles.imageUrl,
        author: articles.author,
        published: articles.published,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      });
    return article;
  }

  async updateArticle(id: number, updateArticle: UpdateArticle): Promise<Article | undefined> {
    // *** THIS IS THE FIX ***
    // Also apply the explicit returning columns here for consistency and safety.
    const [article] = await db
      .update(articles)
      .set(updateArticle)
      .where(eq(articles.id, id))
      .returning({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        excerpt: articles.excerpt,
        imageUrl: articles.imageUrl,
        author: articles.author,
        published: articles.published,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      });
    return article || undefined;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPublishedArticles(): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.published, true)).orderBy(desc(articles.createdAt));
  }

  // These admin functions are no longer used with Firebase Auth but are kept for interface compatibility.
  async getAdminById(id: number): Promise<Admin | undefined> {
    return undefined;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    throw new Error("createAdmin is not supported with Firebase Auth");
  }
}

// Ensure the application uses the real database.
export const storage = new DatabaseStorage();