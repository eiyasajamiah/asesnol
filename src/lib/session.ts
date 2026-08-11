import { getPrisma } from './prisma';
import {
  createSession as createJwtSession,
  destroySession as destroyJwtSession,
  verifySession,
} from './auth';

// طبقة توافق فوق نظام الجلسات الجديد (JWT عبر jose في auth.ts)، تُبقي
// نفس أسماء الدوال المستخدمة بباقي المشروع (createSession, destroySession,
// getSessionUser) لتقليل عدد الملفات اللي تحتاج تعديل، لكن getSessionUser
// الآن يرجّع مستخدم Prisma (مع اشتراكه النشط) بدل مستخدم KV القديم.

export const createSession = createJwtSession;
export const destroySession = destroyJwtSession;

export async function getSessionUserId(): Promise<string | null> {
  return verifySession();
}

export async function getSessionUser() {
  const userId = await verifySession();
  if (!userId) return null;

  const prisma = await getPrisma();
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { plan: true },
      },
      settings: true,
    },
  });
}
