// FINAL CORRECTED CODE for server/routes.ts

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, updateArticleSchema, insertAdminSchema, loginSchema } from "@shared/schema";
import { generateSummary, generateTitle, generateTags } from "./gemini";
// *** CHANGE #1: Import createAdmin directly from auth.ts ***
import { createAdmin, hashPassword, verifyPassword, generateToken, verifyToken } from "./auth";
import cookieParser from "cookie-parser";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // ... (all other routes remain the same, so I am omitting them for brevity)
  // ...
  // ... (All GET/POST/PUT/DELETE routes for /api/articles and /api/admin/articles are unchanged) ...
  // ...

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

      // *** CHANGE #2: Call the correct createAdmin function from auth.ts ***
      // This function handles hashing internally and correctly.
      const admin = await createAdmin(result.data);

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

  // ... (all other routes like /login, /logout, /me are unchanged)
  // ...
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
