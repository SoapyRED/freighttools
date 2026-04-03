/**
 * Vercel KV helpers for users, API keys, sessions, and usage tracking.
 */
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface User {
  email: string;
  plan: 'free' | 'pro';
  apiKey: string;
  stripeCustomerId: string | null;
  createdAt: string;
}

export interface KeyRecord {
  email: string;
  plan: 'free' | 'pro';
}

// ─────────────────────────────────────────────────────────────
//  Users
// ─────────────────────────────────────────────────────────────

export async function getUser(email: string): Promise<User | null> {
  return kv.get<User>(`user:${email}`);
}

export async function createUser(email: string): Promise<User> {
  const existing = await getUser(email);
  if (existing) return existing;

  const apiKey = `fu_live_${nanoid(24)}`;
  const user: User = {
    email,
    plan: 'free',
    apiKey,
    stripeCustomerId: null,
    createdAt: new Date().toISOString(),
  };

  await kv.set(`user:${email}`, user);
  await kv.set(`key:${apiKey}`, { email, plan: 'free' } satisfies KeyRecord);

  return user;
}

export async function updateUserPlan(email: string, plan: 'free' | 'pro', stripeCustomerId?: string): Promise<void> {
  const user = await getUser(email);
  if (!user) return;

  user.plan = plan;
  if (stripeCustomerId) user.stripeCustomerId = stripeCustomerId;

  await kv.set(`user:${email}`, user);
  await kv.set(`key:${user.apiKey}`, { email, plan } satisfies KeyRecord);
}

// ─────────────────────────────────────────────────────────────
//  API Keys
// ─────────────────────────────────────────────────────────────

export async function lookupApiKey(apiKey: string): Promise<KeyRecord | null> {
  return kv.get<KeyRecord>(`key:${apiKey}`);
}

// ─────────────────────────────────────────────────────────────
//  Usage Tracking
// ─────────────────────────────────────────────────────────────

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const monthKey = () => new Date().toISOString().slice(0, 7);  // YYYY-MM

export async function incrementUsage(identifier: string, type: 'key' | 'ip'): Promise<number> {
  const key = type === 'key'
    ? `usage:${identifier}:${todayKey()}`
    : `usage:ip:${identifier}:${todayKey()}`;
  const count = await kv.incr(key);
  // Set TTL on first increment
  if (count === 1) await kv.expire(key, 172800); // 48h
  return count;
}

export async function getUsageToday(identifier: string, type: 'key' | 'ip'): Promise<number> {
  const key = type === 'key'
    ? `usage:${identifier}:${todayKey()}`
    : `usage:ip:${identifier}:${todayKey()}`;
  return (await kv.get<number>(key)) ?? 0;
}

export async function getUsageMonth(apiKey: string): Promise<number> {
  // Sum daily keys for this month
  const prefix = `usage:${apiKey}:${monthKey()}`;
  // For simplicity, scan keys — on Upstash free tier this is fine for low volume
  const keys = await kv.keys(`${prefix}*`);
  if (keys.length === 0) return 0;
  const values = await Promise.all(keys.map(k => kv.get<number>(k)));
  return values.reduce<number>((sum, v) => sum + (v ?? 0), 0);
}

// ─────────────────────────────────────────────────────────────
//  Magic Link Tokens
// ─────────────────────────────────────────────────────────────

export async function createMagicToken(email: string): Promise<string> {
  const token = nanoid(32);
  await kv.set(`magic:${token}`, { email }, { ex: 900 }); // 15 min TTL
  return token;
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  const data = await kv.get<{ email: string }>(`magic:${token}`);
  if (!data) return null;
  await kv.del(`magic:${token}`); // one-time use
  return data.email;
}

// ─────────────────────────────────────────────────────────────
//  Sessions
// ─────────────────────────────────────────────────────────────

export async function createSession(email: string): Promise<string> {
  const token = nanoid(32);
  await kv.set(`session:${token}`, { email }, { ex: 604800 }); // 7 days
  return token;
}

export async function getSession(token: string): Promise<string | null> {
  const data = await kv.get<{ email: string }>(`session:${token}`);
  return data?.email ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  await kv.del(`session:${token}`);
}
