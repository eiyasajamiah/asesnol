import type { User, Subscription, Plan } from '@prisma/client';
import { getPrisma } from './prisma';
import { verifySession } from './auth';
import { expireIfPastDue } from './subscription-activation';

type UserWithRelations = User & {
  subscriptions: (Subscription & { plan: Plan })[];
};

export async function getSessionUser(): Promise<UserWithRelations | null> {
  const userId = await verifySession();
  if (!userId) return null;

  const prisma = await getPrisma();
  const user = (await prisma.user.findUnique({
    where: { id: userId },
    include: {
      // نجيب آخر اشتراك ACTIVE أو EXPIRED حديث — بما فيها المنتهية —
      // عشان نقدر نطبّق "الانتهاء الكسول" أدناه بدل الاعتماد فقط على
      // الحالة المخزّنة بقاعدة البيانات وقت الشراء.
      subscriptions: {
        where: { status: { in: ['ACTIVE', 'EXPIRED'] } },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { plan: true },
      },
    },
  })) as UserWithRelations | null;

  if (!user || user.status !== 'ACTIVE') return null;

  const sub = user.subscriptions[0];
  if (sub) {
    const fresh = await expireIfPastDue(sub);
    user.subscriptions = fresh.status === 'ACTIVE' ? [{ ...fresh, plan: sub.plan }] : [];
  }

  return user;
}
