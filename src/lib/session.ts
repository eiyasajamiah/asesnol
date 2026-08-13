import { getPrisma } from './prisma';
import {
  createSession as createJwtSession,
  destroySession as destroyJwtSession,
  verifySession,
} from './auth';
import type { User, Subscription, Plan, UserSettings } from '@prisma/client';

// النوع الصحيح للمستخدم مع العلاقات المضمَّنة
type UserWithRelations = User & {
  subscriptions: (Subscription & { plan: Plan })[];
  settings: UserSettings | null;
};

export const createSession = createJwtSession;
export const destroySession = destroyJwtSession;

export async function getSessionUserId(): Promise<string | null> {
  return verifySession();
}

export async function getSessionUser(): Promise<UserWithRelations | null> {
  const userId = await verifySession();
  if (!userId) return null;

  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({
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

  return user as UserWithRelations | null;
}