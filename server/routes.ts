import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, updateArticleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all published articles for public homepage
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getPublishedArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get single article by slug
  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      if (!article.published) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Admin routes - Get all articles (including unpublished)
  app.get("/api/admin/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Admin routes - Create new article
  app.post("/api/admin/articles", async (req, res) => {
    try {
      const result = insertArticleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid article data", errors: result.error.errors });
      }

      const article = await storage.createArticle(result.data);
      res.status(201).json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Admin routes - Update article
  app.put("/api/admin/articles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const result = updateArticleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid article data", errors: result.error.errors });
      }

      const article = await storage.updateArticle(articleId, result.data);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  // Admin routes - Delete article
  app.delete("/api/admin/articles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const deleted = await storage.deleteArticle(articleId);
      if (!deleted) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Get article by ID for admin
  app.get("/api/admin/articles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const article = await storage.getArticleById(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
