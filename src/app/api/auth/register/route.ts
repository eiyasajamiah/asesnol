import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserPublicStats } from '@/lib/store';
import { createSession } from '@/lib/session';

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

    const result = await createUser({
      email,
      name,
      password,
      referralCodeUsed: referralCode || undefined,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await createSession(result.user.id);
    const stats = await getUserPublicStats(result.user);

    return NextResponse.json({ user: stats });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
