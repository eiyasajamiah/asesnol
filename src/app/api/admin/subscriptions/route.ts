import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { activateSubscription, rejectSubscription } from '@/lib/subscription-activation';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'asesnol-admin-change-me';

function checkAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  return key === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prisma = await getPrisma();
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      plan: { select: { name: true, slug: true } },
      transactions: { where: { status: 'PENDING' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ subscriptions });
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = (await req.json()) as { subscriptionId?: string; action?: 'approve' | 'reject' };
    const { subscriptionId, action } = body;
    if (!subscriptionId || !action) {
      return NextResponse.json({ error: 'Missing subscriptionId or action' }, { status: 400 });
    }

    const result = action === 'approve' ? await activateSubscription(subscriptionId) : await rejectSubscription(subscriptionId);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
