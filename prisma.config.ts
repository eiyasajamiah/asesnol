// Prisma 7 نقل إعدادات الاتصال بقاعدة البيانات من schema.prisma إلى هذا
// الملف. هذا يُستخدم فقط من قبل أوامر Prisma CLI (generate, db push,
// studio, migrate) — الاتصال الفعلي وقت التشغيل على Cloudflare Workers
// يمر عبر src/lib/prisma.ts (Neon adapter) وليس من هنا.

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
