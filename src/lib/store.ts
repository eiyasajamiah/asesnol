import type { KVNamespace } from '@cloudflare/workers-types';
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
};

function getKV() {
  try {
    const { env } = getRequestContext();
    return (env as any).ASESNOL_KV as any;
  } catch {
    return null;
  }
}

async function readUsers(): Promise<User[]> {
  const kv = getKV();
  if (!kv) return [];
  const data = await kv.get('users');
  return data ? JSON.parse(data) : [];
}

async function writeUsers(users: User[]) {
  const kv = getKV();
  if (!kv) return;
  await kv.put('users', JSON.stringify(users));
}

async function readDeposits(): Promise<DepositRequest[]> {
  const kv = getKV();
  if (!kv) return [];
  const data = await kv.get('deposits');
  return data ? JSON.parse(data) : [];
}

async function writeDeposits(deposits: DepositRequest[]) {
  const kv = getKV();
  if (!kv) return;
  await kv.put('deposits', JSON.stringify(deposits));
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

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  referralCodeUsed?: string;
}): Promise<{ user: User } | { error: string }> {
  const users = await readUsers();

  if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { error: 'Email already registered' };
  }

  let referredBy: string | null = null;
  if (data.referralCodeUsed) {
    const referrer = users.find(
      (u) => u.referralCode.toUpperCase() === data.referralCodeUsed!.toUpperCase()
    );
    if (!referrer) return { error: 'Invalid referral code' };
    referredBy = referrer.id;
  }

  const isEarlyBird = users.length < 50;

  const user: User = {
    id: crypto.randomUUID(),
    email: data.email.toLowerCase(),
    name: data.name,
    passwordHash: hashPassword(data.password),
    referralCode: generateReferralCode(),
    referredBy,
    balance: 0,
    totalProfit: 0,
    totalDeposited: 0,
    isEarlyBird,
    createdAt: new Date().toISOString(),
    referrals: [],
  };

  users.push(user);

  if (referredBy) {
    const referrer = users.find((u) => u.id === referredBy);
    if (referrer) referrer.referrals.push(user.id);
  }

  await writeUsers(users);
  return { user };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User } | { error: string }> {
  const users = await readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return { error: 'Invalid email or password' };
  }
  return { user };
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) || null;
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
  amount: number
): Promise<DepositRequest | { error: string }> {
  if (amount < 50) return { error: 'Minimum deposit is $50' };

  const deposits = await readDeposits();
  const req: DepositRequest = {
    id: crypto.randomUUID(),
    userId,
    amount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  deposits.push(req);
  await writeDeposits(deposits);
  return req;
}

export async function getUserDeposits(userId: string): Promise<DepositRequest[]> {
  const deposits = await readDeposits();
  return deposits
    .filter((d) => d.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function approveDeposit(depositId: string): Promise<{ ok: boolean; error?: string }> {
  const deposits = await readDeposits();
  const deposit = deposits.find((d) => d.id === depositId);
  if (!deposit || deposit.status !== 'pending') {
    return { ok: false, error: 'Deposit not found or already processed' };
  }

  deposit.status = 'approved';
  deposit.processedAt = new Date().toISOString();
  await writeDeposits(deposits);

  const users = await readUsers();
  const user = users.find((u) => u.id === deposit.userId);
  if (user) {
    user.balance += deposit.amount;
    user.totalDeposited += deposit.amount;
    await writeUsers(users);
  }

  return { ok: true };
}

export async function rejectDeposit(depositId: string): Promise<{ ok: boolean; error?: string }> {
  const deposits = await readDeposits();
  const deposit = deposits.find((d) => d.id === depositId);
  if (!deposit || deposit.status !== 'pending') {
    return { ok: false, error: 'Deposit not found or already processed' };
  }
  deposit.status = 'rejected';
  deposit.processedAt = new Date().toISOString();
  await writeDeposits(deposits);
  return { ok: true };
}

export async function getAllDeposits(): Promise<DepositRequest[]> {
  const deposits = await readDeposits();
  return deposits.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getAllUsersPublic() {
  const users = await readUsers();
  return Promise.all(users.map((u) => getUserPublicStats(u)));
}
