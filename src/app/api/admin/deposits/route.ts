import { NextRequest, NextResponse } from 'next/server';
import { approveDeposit, rejectDeposit, getAllDeposits } from '@/lib/store';

function checkAdmin(req: NextRequest): boolean {
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET) return false;
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  return key === ADMIN_SECRET;
}

/** GET: list all deposits (admin) */
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const deposits = await getAllDeposits();
    return NextResponse.json({ deposits });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch deposits' }, { status: 500 });
  }
}

/** POST: approve or reject a deposit */
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { depositId?: string; action?: string };
    const { depositId, action } = body;

    if (!depositId) {
      return NextResponse.json({ error: 'Missing depositId' }, { status: 400 });
    }

    if (action === 'approve') {
      const result = await approveDeposit(depositId);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'reject') {
      const result = await rejectDeposit(depositId);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action. Use approve or reject' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
