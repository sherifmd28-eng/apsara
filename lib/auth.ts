import crypto from 'crypto';
import { cookies } from 'next/headers';
import { User, readDatabase } from './db';

// Use environment secret or fall back to a generated key for local development
const SESSION_SECRET = process.env.SESSION_SECRET || 'apsara-super-secret-key-32-chars-long!';
const ENCRYPTION_KEY = crypto.scryptSync(SESSION_SECRET, 'apsarasalt', 32); // 32 bytes key for AES-256
const IV_LENGTH = 16;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    // Check fallback for seed admin which uses a direct hash for simplicity
    const hashDirectAdmin = crypto.pbkdf2Sync(password, 'apsarasalt', 1000, 64, 'sha512').toString('hex');
    const hashDirectUser = crypto.pbkdf2Sync(password, 'apsarasalt', 1000, 64, 'sha512').toString('hex');
    return storedHash === hashDirectAdmin || storedHash === hashDirectUser;
  }
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export function encryptSession(user: { id: string; name: string; email: string; role: 'user' | 'admin' }): string {
  const sessionData = JSON.stringify({
    ...user,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
  });

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(sessionData, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return iv + encrypted string
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptSession(token: string): { id: string; name: string; email: string; role: 'user' | 'admin' } | null {
  try {
    if (!token || !token.includes(':')) return null;
    const [ivHex, encryptedHex] = token.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const session = JSON.parse(decrypted);
    if (Date.now() > session.expiresAt) {
      return null; // Session expired
    }

    return {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
    };
  } catch (err) {
    console.error('Session decryption failed', err);
    return null;
  }
}

export async function setSessionCookie(user: { id: string; name: string; email: string; role: 'user' | 'admin' }) {
  const token = encryptSession(user);
  const cookieStore = await cookies();
  cookieStore.set('apsara_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set('apsara_session', '', { maxAge: 0, path: '/' });
}

export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('apsara_session')?.value;
    if (!token) return null;

    const sessionUser = decryptSession(token);
    if (!sessionUser) return null;

    const db = readDatabase();
    const user = db.users.find(u => u.id === sessionUser.id);
    return user || null;
  } catch (err) {
    console.error('Error fetching authenticated user', err);
    return null;
  }
}
