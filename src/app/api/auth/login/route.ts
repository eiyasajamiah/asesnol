import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getUserPublicStats } from '@/lib/store';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const result = await authenticateUser(email, password);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await createSession(result.user.id);
    const stats = await getUserPublicStats(result.user);

    return NextResponse.json({ user: stats });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
