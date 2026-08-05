import { getRequestContext } from '@cloudflare/next-on-pages';
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
    return (env as any).ASESNOL_KV as KVNamespace;
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

  if (users.find((u) => u.email
