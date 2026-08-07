import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { User, DepositRequest } from '@/lib/store';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'asesnol-admin-change-me';

function checkAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  return key === ADMIN_SECRET;
}

/**
 * One-time migration: moves data from the old single-key storage
 * ("users" -> User[], "deposits" -> DepositRequest[]) to the new
 * per-record KV layout (user:<id>, deposit:<id>, plus indexes).
 *
 * Safe to run multiple times — it skips records that already exist
 * under the new layout. Does NOT delete the old "users"/"deposits"
 * keys automatically; call with ?cleanup=1 after verifying the
 * migration worked to remove them.
 */
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const kv = (env as any).ASESNOL_KV as KVNamespace | undefined;
  if (!kv) {
    return NextResponse.json({ error: 'KV not bound' }, { status: 500 });
  }

  const cleanup = req.nextUrl.searchParams.get('cleanup') === '1';

  const oldUsersRaw = await kv.get('users');
  const oldDepositsRaw = await kv.get('deposits');
  const oldUsers: User[] = oldUsersRaw ? JSON.parse(oldUsersRaw) : [];
  const oldDeposits: DepositRequest[] = oldDepositsRaw ? JSON.parse(oldDepositsRaw) : [];

  let migratedUsers = 0;
  let skippedUsers = 0;
  const userIds: string[] = (await kv.get('user_ids').then((v) => (v ? JSON.parse(v) : []))) || [];

  for (const user of oldUsers) {
    const existing = await kv.get(`user:${user.id}`);
    if (existing) {
      skippedUsers++;
      continue;
    }
    await kv.put(`user:${user.id}`, JSON.stringify(user));
    await kv.put(`email_idx:${user.email.toLowerCase()}`, user.id);
    await kv.put(`referral_idx:${user.referralCode.toUpperCase()}`, user.id);
    if (!userIds.includes(user.id)) userIds.push(user.id);
    migratedUsers++;
  }
  await kv.put('user_ids', JSON.stringify(userIds));

  let migratedDeposits = 0;
  let skippedDeposits = 0;
  const depositIds: string[] =
    (await kv.get('deposit_ids').then((v) => (v ? JSON.parse(v) : []))) || [];
  const userDepositsMap: Record<string, string[]> = {};

  for (const dep of oldDeposits) {
    const existing = await kv.get(`deposit:${dep.id}`);
    if (existing) {
      skippedDeposits++;
      continue;
    }
    await kv.put(`deposit:${dep.id}`, JSON.stringify(dep));
    if (dep.txHash) {
      await kv.put(`txhash_idx:${dep.txHash.toLowerCase()}`, dep.id);
    }
    if (!depositIds.includes(dep.id)) depositIds.push(dep.id);
    if (!userDepositsMap[dep.userId]) {
      const existingList = await kv.get(`user_deposits:${dep.userId}`);
      userDepositsMap[dep.userId] = existingList ? JSON.parse(existingList) : [];
    }
    if (!userDepositsMap[dep.userId].includes(dep.id)) {
      userDepositsMap[dep.userId].push(dep.id);
    }
    migratedDeposits++;
  }
  await kv.put('deposit_ids', JSON.stringify(depositIds));
  for (const [userId, ids] of Object.entries(userDepositsMap)) {
    await kv.put(`user_deposits:${userId}`, JSON.stringify(ids));
  }

  let cleaned = false;
  if (cleanup) {
    await kv.delete('users');
    await kv.delete('deposits');
    cleaned = true;
  }

  return NextResponse.json({
    ok: true,
    migratedUsers,
    skippedUsers,
    migratedDeposits,
    skippedDeposits,
    cleaned,
  });
}
