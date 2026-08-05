import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  referralCode: string;
  referredBy: string | null;
  balance: number; // USD
  totalProfit: number;
  totalDeposited: number;
  isEarlyBird: boolean;
  createdAt: string;
  referrals: string[]; // user ids who used this user's code
};

export type DepositRequest = {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
};

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readUsers(): Promise<User[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]) {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'asesnol-salt-v1').digest('hex');
}

export function generateReferralCode(): string {
  return 'ASN' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

export function calculateProfitShare(referralCount: number, isEarlyBird: boolean): number {
  // Early bird: 100% for first 30 days (handled separately by date check)
  // Base 50% + 20% per referral, max 100%
  const share = Math.min(50 + referralCount * 20, 100);
  return share;
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
    if (!referrer) {
      return { error: 'Invalid referral code' };
    }
    referredBy = referrer.id;
  }

  // First 50 users are early birds
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

  // Update referrer's referrals list
  if (referredBy) {
    const referrer = users.find((u) => u.id === referredBy);
    if (referrer) {
      referrer.referrals.push(user.id);
    }
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

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserPublicStats(user: User) {
  const referralCount = user.referrals.length;
  const earlyBirdActive = user.isEarlyBird && isWithinEarlyBirdPeriod(user.createdAt);
  const profitShare = earlyBirdActive ? 100 : calculateProfitShare(referralCount, user.isEarlyBird);

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

// Simple deposit requests store
const DEPOSITS_FILE = path.join(DATA_DIR, 'deposits.json');

async function readDeposits(): Promise<DepositRequest[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(DEPOSITS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeDeposits(deposits: DepositRequest[]) {
  await ensureDataDir();
  await fs.writeFile(DEPOSITS_FILE, JSON.stringify(deposits, null, 2), 'utf-8');
}

export async function createDepositRequest(
  userId: string,
  amount: number
): Promise<DepositRequest | { error: string }> {
  if (amount < 50) {
    return { error: 'Minimum deposit is $50' };
  }
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
  return deposits.filter((d) => d.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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
