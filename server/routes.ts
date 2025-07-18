// THE TRULY COMPLETE AND CORRECTED server/routes.ts

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, updateArticleSchema } from "@shared/schema";
import { generateSummary, generateTitle, generateTags } from "./gemini";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';
import { firebaseAdmin } from './firebase-admin';

const SESSION_SECRET = process.env.SESSION_SECRET || 'a-fallback-secret-for-local-dev';
const ADMIN_EMAIL = process.env.FIREBASE_ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
  throw new Error("FIREBASE_ADMIN_EMAIL environment variable is not set!");
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  const requireAuth = async (req: any, res: any, next: any) => {
    const sessionCookie = req.cookies.session || '';
    try {
      const decodedClaims = jwt.verify(sessionCookie, SESSION_SECRET) as any;
      if (decodedClaims.email !== ADMIN_EMAIL) {
        return res.status(403).json({ message: "Forbidden: Not an admin" });
      }
      req.user = decodedClaims;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Authentication required" });
    }
  };

  app.post('/api/auth/session-login', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) return res.status(401).send('No Firebase token provided');
    try {
      const decodedFirebaseToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      if (decodedFirebaseToken.email !== ADMIN_EMAIL) {
        return res.status(403).json({ message: 'Forbidden: You are not the designated admin.' });
      }
      const sessionPayload = { uid: decodedFirebaseToken.uid, email: decodedFirebaseToken.email };
      const sessionToken = jwt.sign(sessionPayload, SESSION_SECRET, { expiresIn: '7d' });
      res.cookie('session', sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(401).json({ message: 'Invalid Firebase token' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('session');
    res.json({ message: "Logout successful" });
  });

  app.get("/api/auth/me", requireAuth, (req: any, res) => {
    res.json(req.user);
  });

  // --- PUBLIC ARTICLE ROUTES ---
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getPublishedArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article || !article.published) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // --- ADMIN ARTICLE ROUTES ---
  app.get("/api/admin/articles", requireAuth, async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/admin/articles/:id", requireAuth, async (req, res) => {
    try {
      const article = await storage.getArticleById(parseInt(req.params.id));
      if (!article) return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // *** THIS IS THE MISSING ROUTE TO CREATE ARTICLES ***
  app.post("/api/admin/articles", requireAuth, async (req, res) => {
    try {
      const result = insertArticleSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json(result.error);
      const article = await storage.createArticle(result.data);
      res.status(201).json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // *** THIS IS THE MISSING ROUTE TO UPDATE ARTICLES ***
  app.put("/api/admin/articles/:id", requireAuth, async (req, res) => {
    try {
      const result = updateArticleSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json(result.error);
      const article = await storage.updateArticle(parseInt(req.params.id), result.data);
      if (!article) return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to update article" });
    }
  });
  
  // *** THIS IS THE MISSING ROUTE TO DELETE ARTICLES ***
  app.delete("/api/admin/articles/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteArticle(parseInt(req.params.id));
      if (!success) return res.status(404).json({ message: "Article not found" });
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // *** THESE ARE THE MISSING AI HELPER ROUTES ***
  app.post("/api/admin/ai/generate-summary", requireAuth, async (req, res) => {
    try {
      const summary = await generateSummary(req.body.content);
      res.json({ summary });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  app.post("/api/admin/ai/generate-title", requireAuth, async (req, res) => {
    try {
      const title = await generateTitle(req.body.content);
      res.json({ title });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate title" });
    }
  });

  app.post("/api/admin/ai/generate-tags", requireAuth, async (req, res) => {
    try {
      const tags = await generateTags(req.body.content);
      res.json({ tags });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate tags" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}