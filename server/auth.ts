import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { admins, type Admin, type InsertAdmin } from '@shared/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(adminId: number): string {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { adminId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { adminId: number };
  } catch {
    return null;
  }
}

export async function createAdmin(adminData: InsertAdmin): Promise<Admin> {
  const hashedPassword = await hashPassword(adminData.password);
  
  const [admin] = await db
    .insert(admins)
    .values({
      ...adminData,
      password: hashedPassword,
    })
    .returning();
    
  return admin;
}

export async function loginAdmin(email: string, password: string): Promise<{ admin: Admin; token: string } | null> {
  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email));
    
  if (!admin) {
    return null;
  }
  
  const isValidPassword = await verifyPassword(password, admin.password);
  if (!isValidPassword) {
    return null;
  }
  
  const token = generateToken(admin.id);
  
  return { admin, token };
}

export async function getAdminById(id: number): Promise<Admin | null> {
  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.id, id));
    
  return admin || null;
}