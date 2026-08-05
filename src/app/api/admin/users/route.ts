import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersPublic } from '@/lib/store';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'asesnol-admin-change-me';

function checkAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  return key === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = await getAllUsersPublic();
  return NextResponse.json({ users });
}
