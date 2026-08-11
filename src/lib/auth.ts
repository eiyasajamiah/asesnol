import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// bcryptjs هي مكتبة JS خالصة (بدون بايندنجز C++)، فتشتغل بدون مشاكل على
// Cloudflare Workers. عامل التكلفة (cost factor) = 10 هو التوازن الموصى
// به بين الأمان وزمن الاستجابة على بيئة serverless.
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateReferralCode(): string {
  return 'ASN' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

export function generateLicenseKey(): string {
  const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ASN-${seg()}-${seg()}-${seg()}`;
}

// ─────────────────────────────────────────────────────────────────
// الجلسات (JWT عبر jose)
// ─────────────────────────────────────────────────────────────────
// jose يعتمد على Web Crypto API القياسي، فيشتغل مباشرة على Cloudflare
// Workers بدون أي تعديل (بعكس مكتبات JWT التقليدية المبنية على Node's
// crypto module فقط).

const COOKIE_NAME = 'session';
const SESSION_DURATION = '7d';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 أيام

async function getSessionSecretKey(): Promise<Uint8Array> {
  let secret = process.env.SESSION_SECRET;
  try {
    const { env } = await getCloudflareContext({ async: true });
    secret = (env as any).SESSION_SECRET || secret;
  } catch {
    // خارج بيئة Workers (بناء محلي مثلاً) — نعتمد على process.env
  }
  if (!secret) {
    throw new Error(
      'SESSION_SECRET is not set. Add it via `npx wrangler secret put SESSION_SECRET` (production) or .env.local (development).'
    );
  }
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
