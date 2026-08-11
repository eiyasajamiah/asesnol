import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Cloudflare Workers لا يدعم اتصال TCP التقليدي لـ Postgres، لذلك نستخدم
// Neon serverless driver (HTTP/WebSocket) عبر Prisma Driver Adapter بدل
// عميل Prisma القياسي. هذا يسمح لنا بالبقاء على نفس بنية النشر الحالية
// (Cloudflare Workers + OpenNext) بدون الحاجة لـ Prisma Accelerate المدفوع.

let cached: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (cached) return cached;

  let connectionString = process.env.DATABASE_URL;

  // في بيئة Cloudflare Workers، متغيرات البيئة تُقرأ عبر getCloudflareContext
  // بدل process.env مباشرة.
  try {
    const { env } = await getCloudflareContext({ async: true });
    connectionString = (env as any).DATABASE_URL || connectionString;
  } catch {
    // نتجاهل الخطأ عند التشغيل خارج بيئة Workers (مثل أثناء البناء المحلي)
  }

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Add it via `npx wrangler secret put DATABASE_URL` (production) or .env.local (development).'
    );
  }

  const adapter = new PrismaNeon({ connectionString });
  cached = new PrismaClient({ adapter });
  return cached;
}
