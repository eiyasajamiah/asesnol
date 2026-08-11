import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { hashPassword, generateReferralCode, createSession } from '@/lib/auth';

const EARLY_BIRD_USER_LIMIT = 50;
const EARLY_BIRD_DISCOUNT_PERCENT = 20;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      name?: string;
      password?: string;
      referralCode?: string;
    };
    const { email, name, password, referralCode } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const prisma = await getPrisma();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({ where: { referralCode: referralCode.toUpperCase() } });
      if (!referrer) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
      }
    }

    // كود إحالة فريد (نادراً جداً ما يتكرر، لكن نتأكد بأي حال)
    let code = generateReferralCode();
    while (await prisma.user.findUnique({ where: { referralCode: code } })) {
      code = generateReferralCode();
    }

    const userCount = await prisma.user.count();
    const isEarlyBird = userCount < EARLY_BIRD_USER_LIMIT;

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        referralCode: code,
        referredBy: referrer?.id ?? null,
        isEarlyBird,
        settings: { create: {} },
      },
    });

    if (referrer) {
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: user.id,
          status: 'PENDING', // يصير ACTIVE ويُحتسب العمولة عند أول اشتراك مدفوع
        },
      });
    }

    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        isEarlyBird,
        earlyBirdDiscountPercent: isEarlyBird ? EARLY_BIRD_DISCOUNT_PERCENT : 0,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
