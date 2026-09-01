import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// تشفير كلمات المرور عبر PBKDF2 (Web Crypto API القياسي) — مدعوم أصلاً
// بـ Cloudflare Workers و Node.js بدون أي مكتبة خارجية.
const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  return `${PBKDF2_ITERATIONS}:${salt.toString('hex')}:${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [iterationsStr, saltHex, keyHex] = stored.split(':');
  const iterations = Number(iterationsStr);
  if (!iterations || !saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const expectedKey = Buffer.from(keyHex, 'hex');
  const actualKey = crypto.pbkdf2Sync(password, salt, iterations, expectedKey.length, 'sha256');

  return crypto.timingSafeEqual(actualKey, expectedKey);
}

export function generateReferralCode(): string {
  return 'ASN' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

export function generateLicenseKey(): string {
  const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ASN-${seg()}-${seg()}-${seg()}`;
}

const COOKIE_NAME = 'session';
const SESSION_DURATION = '7d';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

async function getSessionSecretKey(): Promise<Uint8Array> {
  let secret = process.env.SESSION_SECRET;
  try {
    const { env } = await getCloudflareContext({ async: true });
    secret = (env as any).SESSION_SECRET || secret;
  } catch {
    // خارج بيئة Workers
  }
  if (!secret) throw new Error('SESSION_SECRET is not set.');
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string): Promise<void> {
  const key = await getSessionSecretKey();
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function verifySession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const key = await getSessionSecretKey();
    const { payload } = await jwtVerify(token, key, { clockTolerance: 60 });
    return typeof payload.userId === 'string' ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
