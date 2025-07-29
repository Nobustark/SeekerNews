// THE NEW, UPGRADED code for server/storage.ts

import { articles, users, type Article, type InsertArticle, type UpdateArticle, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// This is the real class that talks to our database.
export class DatabaseStorage {
  // --- Article Methods ---
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }
  async getArticleById(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }
  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article;
  }
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }
  async updateArticle(id: number, updateArticle: UpdateArticle): Promise<Article | undefined> {
    const [article] = await db.update(articles).set(updateArticle).where(eq(articles.id, id)).returning();
    return article;
  }
  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getPublishedArticles(): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.published, true)).orderBy(desc(articles.createdAt));
  }

  // --- New User Methods ---
  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, uid));
    return user;
  }
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async approveUser(uid: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ role: 'author' }).where(eq(users.firebaseUid, uid)).returning();
    return user;
  }
}

export const storage = new DatabaseStorage();