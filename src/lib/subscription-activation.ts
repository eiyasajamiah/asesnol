import type { Subscription, Plan, Transaction } from '@prisma/client';
import { getPrisma } from './prisma';
import { generateLicenseKey } from './auth';

const REFERRAL_COMMISSION_PERCENT = 20;

type SubscriptionWithPlanAndTransactions = Subscription & {
  plan: Plan;
  transactions: Transaction[];
};

function addBillingPeriod(from: Date, cycle: string): Date | null {
  const d = new Date(from);
  if (cycle === 'MONTHLY') {
    d.setMonth(d.getMonth() + 1);
    return d;
  }
  if (cycle === 'YEARLY') {
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  return null;
}

export async function activateSubscription(subscriptionId: string) {
  const prisma = await getPrisma();

  const subscription = (await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true, transactions: { where: { status: 'PENDING' }, take: 1 } },
  })) as SubscriptionWithPlanAndTransactions | null;

  if (!subscription || subscription.status !== 'PENDING') {
    return { ok: false, error: 'Subscription not found or already processed' };
  }

  const now = new Date();
  const endDate = addBillingPeriod(now, subscription.billingCycle);

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'ACTIVE', startDate: now, endDate, licenseKey: generateLicenseKey() },
  });

  const pendingTx = subscription.transactions[0];
  if (pendingTx) {
    await prisma.transaction.update({ where: { id: pendingTx.id }, data: { status: 'COMPLETED' } });
  }

  const user = await prisma.user.findUnique({ where: { id: subscription.userId } });
  if (user?.referredBy) {
    const priorActiveSubs = await prisma.subscription.count({
      where: { userId: user.id, status: 'ACTIVE', NOT: { id: subscriptionId } },
    });
    if (priorActiveSubs === 0) {
      const referral = await prisma.referral.findUnique({ where: { referredId: user.id } });
      if (referral && referral.status === 'PENDING') {
        const commissionAmount = pendingTx ? Number(pendingTx.amount) * (REFERRAL_COMMISSION_PERCENT / 100) : 0;
        await prisma.referral.update({
          where: { id: referral.id },
          data: { status: 'ACTIVE', commissionAmount },
        });
      }
    }
  }

  return { ok: true };
}

export async function rejectSubscription(subscriptionId: string) {
  const prisma = await getPrisma();

  const subscription = (await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { transactions: { where: { status: 'PENDING' }, take: 1 } },
  })) as (Subscription & { transactions: Transaction[] }) | null;

  if (!subscription || subscription.status !== 'PENDING') {
    return { ok: false, error: 'Subscription not found or already processed' };
  }

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'CANCELED', cancelledAt: new Date() },
  });

  const pendingTx = subscription.transactions[0];
  if (pendingTx) {
    await prisma.transaction.update({ where: { id: pendingTx.id }, data: { status: 'FAILED' } });
  }

  return { ok: true };
}
