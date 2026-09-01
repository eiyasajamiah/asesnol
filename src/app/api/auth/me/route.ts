import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  const activeSub = user.subscriptions[0] ?? null;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      referralCode: user.referralCode,
      isEarlyBird: user.isEarlyBird,
      role: user.role,
      subscription: activeSub
        ? {
            planName: activeSub.plan.name,
            status: activeSub.status,
            billingCycle: activeSub.billingCycle,
            endDate: activeSub.endDate,
            licenseKey: activeSub.licenseKey,
          }
        : null,
    },
  });
}
