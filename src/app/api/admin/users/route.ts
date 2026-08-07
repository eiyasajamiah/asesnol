import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersPublic } from '@/lib/store';

function checkAdmin(req: NextRequest): boolean {
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET) return false;
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  return key === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const users = await getAllUsersPublic();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
