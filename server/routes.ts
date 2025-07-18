// THE NEW, COMPLETE, FIREBASE-POWERED server/routes.ts

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, updateArticleSchema } from "@shared/schema";
import { generateSummary, generateTitle, generateTags } from "./gemini";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';
// Import our new Firebase Admin SDK
import { firebaseAdmin } from './firebase-admin';

const SESSION_SECRET = process.env.SESSION_SECRET || 'a-fallback-secret-for-local-dev';
const ADMIN_EMAIL = process.env.FIREBASE_ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
  throw new Error("FIREBASE_ADMIN_EMAIL environment variable is not set!");
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // === NEW FIREBASE AUTH MIDDLEWARE ===
  const requireAuth = async (req: any, res: any, next: any) => {
    const sessionCookie = req.cookies.session || '';
    try {
      // Use our own JWT cookie to manage the session
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

  // === NEW SESSION LOGIN ENDPOINT ===
  app.post('/api/auth/session-login', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).send('No Firebase token provided');
    }

    try {
      // Let Firebase verify the token is valid
      const decodedFirebaseToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const userEmail = decodedFirebaseToken.email;

      // Check if the verified user is THE admin
      if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ message: 'Forbidden: You are not the designated admin.' });
      }

      // If they are the admin, create our own session JWT
      const sessionPayload = {
        uid: decodedFirebaseToken.uid,
        email: userEmail,
      };
      const sessionToken = jwt.sign(sessionPayload, SESSION_SECRET, { expiresIn: '7d' });

      // Send the session token back in a secure, httpOnly cookie
      res.cookie('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Session login error:', error);
      res.status(401).json({ message: 'Invalid Firebase token' });
    }
  });

  // Logout clears the session cookie
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('session');
    res.json({ message: "Logout successful" });
  });

  // "Me" endpoint now verifies our own session cookie
  app.get("/api/auth/me", requireAuth, (req: any, res) => {
    res.json(req.user);
  });

  // --- ALL YOUR OTHER ADMIN & PUBLIC ROUTES STAY THE SAME ---
  // They are now protected by the new Firebase-powered requireAuth middleware

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
      
      if (!article || !article.published) {
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

  // ... All other POST, PUT, DELETE routes for articles and AI helpers remain the same ...

  const httpServer = createServer(app);
  return httpServer;
}