import type { User, Subscription, Plan } from '@prisma/client';
import { getPrisma } from './prisma';
import { verifySession } from './auth';

type UserWithRelations = User & {
  subscriptions: (Subscription & { plan: Plan })[];
};

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
    },
  });
  return user as UserWithRelations | null;
}
