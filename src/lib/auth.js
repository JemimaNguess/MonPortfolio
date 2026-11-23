import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { verifyTotp } from './totp';

const COOKIE = 'mj_admin';
const MAX_AGE = 60 * 60 * 8; // 8 heures

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('ADMIN_SESSION_SECRET manquant ou trop court (32 caractères minimum).');
  return new TextEncoder().encode(s);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET);
}

export function totpEnabled() {
  return Boolean(process.env.ADMIN_TOTP_SECRET);
}

// Anti-force brute simple, en mémoire : 5 essais ratés par quart d'heure et par IP.
const attempts = new Map();
export function tooManyAttempts(key) {
  const now = Date.now();
  const list = (attempts.get(key) || []).filter((t) => now - t < 15 * 60_000);
  attempts.set(key, list);
  return list.length >= 5;
}
export function recordFailure(key) {
  const list = attempts.get(key) || [];
  list.push(Date.now());
  attempts.set(key, list);
}

export async function checkCredentials(email, password, token) {
  if (!adminConfigured()) return false;
  const okEmail = String(email || '').trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase();
  const okPass = await bcrypt.compare(String(password || ''), process.env.ADMIN_PASSWORD_HASH);
  if (!okEmail || !okPass) return false;
  if (totpEnabled() && !verifyTotp(process.env.ADMIN_TOTP_SECRET, token)) return false;
  return true;
}

export async function createSession() {
  const jwt = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdmin() {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secret());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

// À appeler en tête de chaque page et action admin.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}
