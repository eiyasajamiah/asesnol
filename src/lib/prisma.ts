import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { getCloudflareContext } from '@opennextjs/cloudflare';

let cached: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (cached) return cached;

  let connectionString = process.env.DATABASE_URL;

  // في بيئة Cloudflare Workers، نقرأ المتغيرات عبر getCloudflareContext
  try {
    const { env } = await getCloudflareContext({ async: true });
    connectionString = (env as any).DATABASE_URL || connectionString;
  } catch {
    // نتجاهل الخطأ عند التشغيل خارج Workers (البناء المحلي)
  }

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Add it via `npx wrangler secret put DATABASE_URL` (production) or .env.local (development).'
    );
  }

  // ✅ مع Prisma Accelerate، لا نحتاج Neon adapter
  // Accelerate يتعامل مع الاتصال HTTP مباشرة
  cached = new PrismaClient({
    datasourceUrl: connectionString,
  }).$extends(withAccelerate());

  return cached;
}