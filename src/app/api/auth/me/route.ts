import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getUserPublicStats } from '@/lib/store';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const stats = await getUserPublicStats(user);
  return NextResponse.json({ user: stats });
}
