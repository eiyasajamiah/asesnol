// أوامر Prisma CLI الخاصة بإدارة الجداول (db push, migrate, studio) لا
// تدعم روابط Prisma Accelerate — تحتاج اتصالاً مباشراً بقاعدة البيانات.
// لذلك نفصل بين رابطين:
//   DIRECT_DATABASE_URL -> رابط Neon المباشر (postgresql://...) لأوامر الـ CLI فقط
//   DATABASE_URL        -> رابط Accelerate (prisma://...) يُستخدم وقت التشغيل بـ src/lib/prisma.ts

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // `prisma generate` does not need a database connection, and Cloudflare's
    // build environment may not have the direct URL configured.
    url: process.env.DIRECT_DATABASE_URL ?? '',
  },
});
