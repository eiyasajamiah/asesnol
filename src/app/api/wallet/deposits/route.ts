import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getUserDeposits } from '@/lib/store';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deposits = await getUserDeposits(user.id);
  return NextResponse.json({ deposits });
}
