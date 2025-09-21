// THE NEW, UPGRADED, MULTI-USER code for server/routes.ts

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

  // === UPGRADED AUTH MIDDLEWARE ===
  // This middleware now checks for specific roles
  const requireAuth = (allowedRoles: ('author' | 'admin')[]) => async (req: any, res: any, next: any) => {
    const sessionCookie = req.cookies.session || '';
    try {
      const decodedClaims = jwt.verify(sessionCookie, SESSION_SECRET) as any;
      if (!decodedClaims || !allowedRoles.includes(decodedClaims.role)) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }
      req.user = decodedClaims; // Attach user info to the request
      next();
    } catch (error) {
      return res.status(401).json({ message: "Authentication required" });
    }
  };

  // A stricter middleware just for the super-admin
  const requireSuperAdmin = requireAuth(['admin']);

  // === UPGRADED SESSION LOGIN ENDPOINT ===
  app.post('/api/auth/session-login', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) return res.status(401).send('No Firebase token provided');

    try {
      const decodedFirebaseToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const { uid, email, name } = decodedFirebaseToken;

      let user = await storage.getUserByFirebaseUid(uid);

      // If user doesn't exist in our DB, create them (the handshake)
      if (!user) {
        const initialRole = email === ADMIN_EMAIL ? 'admin' : 'pending';
        user = await storage.createUser({
          firebaseUid: uid,
          email: email!,
          name: name || email!,
          role: initialRole,
        });
      }

      // Create our own session token with their role from our database
      const sessionPayload = { uid: user.firebaseUid, email: user.email, name: user.name, role: user.role };
      const sessionToken = jwt.sign(sessionPayload, SESSION_SECRET, { expiresIn: '7d' });

      res.cookie('session', sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
      res.status(200).json({ status: 'success', user });
    } catch (error) {
      console.error('Session login error:', error);
      res.status(401).json({ message: 'Invalid Firebase token' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('session');
    res.json({ message: "Logout successful" });
  });

  // The "me" endpoint is now protected by a general auth check
  app.get("/api/auth/me", requireAuth(['admin', 'author', 'pending']), (req: any, res) => {
    res.json(req.user);
  });

  // --- NEW USER MANAGEMENT ROUTES (FOR ADMIN ONLY) ---
  app.get("/api/admin/users", requireSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:uid/approve", requireSuperAdmin, async (req, res) => {
    try {
      const user = await storage.approveUser(req.params.uid);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

 // --- PUBLIC ARTICLE ROUTES ---
  // Fetches all articles that are marked as 'published'
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getPublishedArticles();
      res.json(articles);
    } catch (error) {
      console.error("Failed to fetch published articles:", error);
      res.status(500).json({ message: "Failed to fetch articles." });
    }
  });

  // Fetches a single published article by its unique slug
  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const article = await storage.getArticleBySlug(slug);

      if (!article || !article.published) {
        // If article doesn't exist or isn't published, return 404
        return res.status(404).json({ message: "Article not found." });
      }

      res.json(article);
    } catch (error) {
      console.error(`Failed to fetch article with slug ${req.params.slug}:`, error);
      res.status(500).json({ message: "Failed to fetch the article." });
    }
  });
 // --- PROTECTED ARTICLE ROUTES ---
  // The middleware now checks for 'author' or 'admin' roles
  const canPost = requireAuth(['author', 'admin']);

  // 1. GET ALL Articles (for the dashboard list - includes drafts)
  app.get("/api/admin/articles", canPost, async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      console.error("Failed to fetch admin articles:", error);
      res.status(500).json({ message: "Failed to fetch articles." });
    }
  });

  // 2. GET SINGLE Article (for the edit form)
  app.get("/api/admin/articles/:id", canPost, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid article ID" });

      const article = await storage.getArticleById(id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      res.json(article);
    } catch (error) {
      console.error("Failed to fetch article for edit:", error);
      res.status(500).json({ message: "Failed to fetch the article." });
    }
  });

  // 3. CREATE Article (The fix we already implemented)
  app.post("/api/admin/articles", canPost, async (req, res) => {
    try {
      const newArticleData = insertArticleSchema.parse(req.body);
      const createdArticle = await storage.createArticle(newArticleData);
      res.status(201).json(createdArticle);
    } catch (error) {
      console.error("Failed to create article:", error);
      res.status(500).json({ message: "Failed to create the article." });
    }
  });

  // 4. UPDATE Article (For the edit functionality)
  app.put("/api/admin/articles/:id", canPost, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid article ID" });

      // Validate the incoming update data
      const updatedData = updateArticleSchema.parse(req.body);

      const updatedArticle = await storage.updateArticle(id, updatedData);

      if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found for update." });
      }

      res.json(updatedArticle);
    } catch (error) {
      console.error("Failed to update article:", error);
      res.status(500).json({ message: "Failed to update the article." });
    }
  });

  // 5. DELETE Article (For the delete functionality)
  app.delete("/api/admin/articles/:id", canPost, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid article ID" });

      const success = await storage.deleteArticle(id);

      if (!success) {
        return res.status(404).json({ message: "Article not found for deletion." });
      }

      // 204 No Content is the standard successful response for DELETE
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete article:", error);
      res.status(500).json({ message: "Failed to delete the article." });
    }
  });
  // AI routes also need protection
  app.post("/api/admin/ai/generate-summary", canPost, async (req, res) => { /* ... */ });
  app.post("/api/admin/ai/generate-title", canPost, async (req, res) => { /* ... */ });
  app.post("/api/admin/ai/generate-tags", canPost, async (req, res) => { /* ... */ });

  const httpServer = createServer(app);
  return httpServer;
}