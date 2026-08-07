import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { createDepositRequest } from '@/lib/store';
import { getNetworkById } from '@/lib/wallet-config';

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      amount?: number | string;
      txHash?: string;
      network?: string;
    };
    const amount = Number(body.amount);
    const txHash = (body.txHash || '').trim();
    const network = (body.network || '').trim();

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!txHash) {
      return NextResponse.json({ error: 'Transaction hash is required' }, { status: 400 });
    }
    if (!network || !getNetworkById(network)) {
      return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
    }

    const result = await createDepositRequest(user.id, amount, txHash, network);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ deposit: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
