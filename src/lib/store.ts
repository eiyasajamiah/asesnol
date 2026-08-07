import { getCloudflareContext } from '@opennextjs/cloudflare';
import crypto from 'crypto';

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  referralCode: string;
  referredBy: string | null;
  balance: number;
  totalProfit: number;
  totalDeposited: number;
  isEarlyBird: boolean;
  createdAt: string;
  referrals: string[];
};

export type DepositRequest = {
  id: string;
  userId: string;
  amount: number;
  txHash: string;
  network: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
};

// Cache KV instance per request to avoid repeated getCloudflareContext calls
let _kv: any = null;

async function getKV() {
  if (_kv) return _kv;
  try {
    const { env } = await getCloudflareContext({ async: true });
    _kv = (env as any).ASESNOL_KV;
    return _kv;
  } catch {
    return null;
  }
}

async function getJSON<T>(key: string): Promise<T | null> {
  const kv = await getKV();
  if (!kv) return null;
  const data = await kv.get(key);
  return data ? (JSON.parse(data) as T) : null;
}

async function putJSON(key: string, value: unknown) {
  const kv = await getKV();
  if (!kv) return;
  await kv.put(key, JSON.stringify(value));
}

async function appendToIndex(key: string, id: string) {
  const list = (await getJSON<string[]>(key)) || [];
  list.push(id);
  await putJSON(key, list);
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'asesnol-salt-v1').digest('hex');
}

export function generateReferralCode(): string {
  return 'ASN' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

export function calculateProfitShare(referralCount: number): number {
  return Math.min(50 + referralCount * 20, 100);
}

export function isWithinEarlyBirdPeriod(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 30;
}

async function getUserByEmail(email: string): Promise<User | null> {
  const id = await getJSON<string>(`email_idx:${email.toLowerCase()}`);
  if (!id) return null;
  return getJSON<User>(`user:${id}`);
}

async function getUserByReferralCode(code: string): Promise<User | null> {
  const id = await getJSON<string>(`referral_idx:${code.toUpperCase()}`);
  if (!id) return null;
  return getJSON<User>(`user:${id}`);
}

async function saveUser(user: User) {
  await putJSON(`user:${user.id}`, user);
}

async function getUserCount(): Promise<number> {
  const ids = (await getJSON<string[]>('user_ids')) || [];
  return ids.length;
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  referralCodeUsed?: string;
}): Promise<{ user: User } | { error: string }> {
  const email = data.email.toLowerCase();

  if (await getUserByEmail(email)) {
    return { error: 'Email already registered' };
  }

  let referrer: User | null = null;
  if (data.referralCodeUsed) {
    referrer = await getUserByReferralCode(data.referralCodeUsed);
    if (!referrer) return { error: 'Invalid referral code' };
  }

  const isEarlyBird = (await getUserCount()) < 50;

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name: data.name,
    passwordHash: hashPassword(data.password),
    referralCode: generateReferralCode(),
    referredBy: referrer ? referrer.id : null,
    balance: 0,
    totalProfit: 0,
    totalDeposited: 0,
    isEarlyBird,
    createdAt: new Date().toISOString(),
    referrals: [],
  };

  await saveUser(user);
  await putJSON(`email_idx:${email}`, user.id);
  await putJSON(`referral_idx:${user.referralCode}`, user.id);
  await appendToIndex('user_ids', user.id);

  if (referrer) {
    referrer.referrals.push(user.id);
    await saveUser(referrer);
  }

  return { user };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User } | { error: string }> {
  const user = await getUserByEmail(email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return { error: 'Invalid email or password' };
  }
  return { user };
}

export async function getUserById(id: string): Promise<User | null> {
  return getJSON<User>(`user:${id}`);
}

export async function getUserPublicStats(user: User) {
  const referralCount = user.referrals.length;
  const earlyBirdActive = user.isEarlyBird && isWithinEarlyBirdPeriod(user.createdAt);
  const profitShare = earlyBirdActive ? 100 : calculateProfitShare(referralCount);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    referralCode: user.referralCode,
    balance: user.balance,
    totalProfit: user.totalProfit,
    totalDeposited: user.totalDeposited,
    referralCount,
    profitShare,
    isEarlyBird: user.isEarlyBird,
    earlyBirdActive,
    createdAt: user.createdAt,
  };
}

export async function createDepositRequest(
  userId: string,
  amount: number,
  txHash: string,
  network: string
): Promise<DepositRequest | { error: string }> {
  if (amount < 50) return { error: 'Minimum deposit is $50' };
  const cleanHash = txHash.trim();
  if (!cleanHash || cleanHash.length < 6) return { error: 'Invalid transaction hash' };

  const hashKey = `txhash_idx:${cleanHash.toLowerCase()}`;
  if (await getJSON<string>(hashKey)) {
    return { error: 'This transaction hash was already submitted' };
  }

  const req: DepositRequest = {
    id: crypto.randomUUID(),
    userId,
    amount,
    txHash: cleanHash,
    network,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await putJSON(`deposit:${req.id}`, req);
  await putJSON(hashKey, req.id);
  await appendToIndex(`user_deposits:${userId}`, req.id);
  await appendToIndex('deposit_ids', req.id);

  return req;
}

export async function getUserDeposits(userId: string): Promise<DepositRequest[]> {
  const ids = (await getJSON<string[]>(`user_deposits:${userId}`)) || [];
  const deposits = await Promise.all(ids.map((id) => getJSON<DepositRequest>(`deposit:${id}`)));
  return deposits
    .filter((d): d is DepositRequest => d !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function approveDeposit(depositId: string): Promise<{ ok: boolean; error?: string }> {
  const deposit = await getJSON<DepositRequest>(`deposit:${depositId}`);
  if (!deposit || deposit.status !== 'pending') {
    return { ok: false, error: 'Deposit not found or already processed' };
  }

  deposit.status = 'approved';
  deposit.processedAt = new Date().toISOString();
  await putJSON(`deposit:${depositId}`, deposit);

  const user = await getUserById(deposit.userId);
  if (user) {
    user.balance += deposit.amount;
    user.totalDeposited += deposit.amount;
    await saveUser(user);
  }

  return { ok: true };
}

export async function rejectDeposit(depositId: string): Promise<{ ok: boolean; error?: string }> {
  const deposit = await getJSON<DepositRequest>(`deposit:${depositId}`);
  if (!deposit || deposit.status !== 'pending') {
    return { ok: false, error: 'Deposit not found or already processed' };
  }
  deposit.status = 'rejected';
  deposit.processedAt = new Date().toISOString();
  await putJSON(`deposit:${depositId}`, deposit);
  return { ok: true };
}

// Optimized: use kv.list() with prefix instead of fetching each key manually
export async function getAllDeposits(): Promise<DepositRequest[]> {
  const kv = await getKV();
  if (!kv) return [];
  const list = await kv.list({ prefix: 'deposit:' });
  const deposits = await Promise.all(
    list.keys.map((k) => getJSON<DepositRequest>(k.name))
  );
  return deposits
    .filter((d): d is DepositRequest => d !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Optimized: use kv.list() with prefix instead of fetching each key manually
export async function getAllUsersPublic() {
  const kv = await getKV();
  if (!kv) return [];
  const list = await kv.list({ prefix: 'user:' });
  const users = await Promise.all(
    list.keys.map((k) => getJSON<User>(k.name))
  );
  return Promise.all(
    users.filter((u): u is User => u !== null).map((u) => getUserPublicStats(u))
  );
}
