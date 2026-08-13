import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { getNetworkById } from '@/lib/wallet-config';
import { verifyCryptoPayment } from '@/lib/crypto-verify';
import { activateSubscription } from '@/lib/subscription-activation';

const EARLY_BIRD_DISCOUNT_PERCENT = 20;

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      planSlug?: string;
      billingCycle?: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
      txHash?: string;
      network?: string;
    };
    const { planSlug, billingCycle, txHash, network } = body;

    if (!planSlug || !billingCycle) {
      return NextResponse.json({ error: 'Missing plan or billing cycle' }, { status: 400 });
    }
    const cleanHash = (txHash || '').trim();
    if (!cleanHash || cleanHash.length < 6) {
      return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 });
    }
    if (!network || !getNetworkById(network)) {
      return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
    }

    const prisma = await getPrisma();

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug, isActive: true } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const duplicateTx = await prisma.transaction.findUnique({ where: { txHash: cleanHash } });
    if (duplicateTx) {
      return NextResponse.json({ error: 'This transaction hash was already submitted' }, { status: 400 });
    }

    let amount: number;
    if (billingCycle === 'LIFETIME') {
      amount = Number(plan.priceMonthly);
    } else if (billingCycle === 'YEARLY') {
      if (!plan.priceYearly) {
        return NextResponse.json({ error: 'Yearly billing not available for this plan' }, { status: 400 });
      }
      amount = Number(plan.priceYearly);
    } else {
      amount = Number(plan.priceMonthly);
    }

    const hasExistingSubscription = await prisma.subscription.findFirst({ where: { userId: user.id } });
    if (user.isEarlyBird && !hasExistingSubscription) {
      amount = Math.round(amount * (1 - EARLY_BIRD_DISCOUNT_PERCENT / 100) * 100) / 100;
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'PENDING',
        billingCycle,
        paymentMethod: 'CRYPTO',
      },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        type: 'SUBSCRIPTION_PURCHASE',
        amount,
        status: 'PENDING',
        txHash: cleanHash,
        network,
        description: `${plan.name} — ${billingCycle}`,
      },
    });

    const verification = await verifyCryptoPayment(network, cleanHash, amount);
    if (verification.verified) {
      await activateSubscription(subscription.id);
      return NextResponse.json({
        subscription: { id: subscription.id, status: 'ACTIVE' },
        autoVerified: true,
      });
    }

    return NextResponse.json({
      subscription: { id: subscription.id, status: 'PENDING' },
      autoVerified: false,
      note: 'Your payment will be manually reviewed shortly.',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
