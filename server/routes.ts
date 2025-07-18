import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, updateArticleSchema, insertAdminSchema, loginSchema } from "@shared/schema";
import { generateSummary, generateTitle, generateTags } from "./gemini";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "./auth";
import cookieParser from "cookie-parser";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const admin = await storage.getAdminById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  };
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
  app.get("/api/admin/articles", requireAuth, async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Admin routes - Create new article
  app.post("/api/admin/articles", requireAuth, async (req, res) => {
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
  app.put("/api/admin/articles/:id", requireAuth, async (req, res) => {
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
  app.delete("/api/admin/articles/:id", requireAuth, async (req, res) => {
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
  app.get("/api/admin/articles/:id", requireAuth, async (req, res) => {
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

  // AI-powered article assistance endpoints
  app.post("/api/admin/ai/generate-summary", requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const summary = await generateSummary(content);
      res.json({ summary });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  app.post("/api/admin/ai/generate-title", requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const title = await generateTitle(content);
      res.json({ title });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate title" });
    }
  });

  app.post("/api/admin/ai/generate-tags", requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const tags = await generateTags(content);
      res.json({ tags });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate tags" });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertAdminSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.errors });
      }

      const existingAdmin = await storage.getAdminByEmail(result.data.email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists with this email" });
      }

      const hashedPassword = await hashPassword(result.data.password);
      const admin = await storage.createAdmin({
        ...result.data,
        password: hashedPassword,
      });

      const token = generateToken(admin.id);
      res.cookie('authToken', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({ 
        admin: { id: admin.id, email: admin.email, name: admin.name },
        message: "Registration successful"
      });
    } catch (error) {
      console.error("REGISTRATION ERROR:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.errors });
      }

      const admin = await storage.getAdminByEmail(result.data.email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await verifyPassword(result.data.password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(admin.id);
      res.cookie('authToken', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ 
        admin: { id: admin.id, email: admin.email, name: admin.name },
        message: "Login successful"
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: "Logout successful" });
  });

  app.get("/api/auth/me", requireAuth, (req: any, res) => {
    const { password, ...adminData } = req.admin;
    res.json(adminData);
  });

  const httpServer = createServer(app);
  return httpServer;
}
