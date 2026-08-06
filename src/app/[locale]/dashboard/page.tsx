'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  TrendingUp,
  Users,
  Copy,
  Check,
  ArrowDownToLine,
  LogOut,
  Shield,
} from 'lucide-react';

type UserStats = {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  balance: number;
  totalProfit: number;
  totalDeposited: number;
  referralCount: number;
  profitShare: number;
  isEarlyBird: boolean;
  earlyBirdActive: boolean;
  createdAt: string;
};

type Deposit = {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
};

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const tAuth = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();

  const [user, setUser] = useState<UserStats | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMsg, setDepositMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = (await res.json()) as { user?: UserStats };
      setUser(data.user ?? null);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchDeposits = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/deposits');
      if (res.ok) {
        const data = (await res.json()) as { deposits?: Deposit[] };
        setDeposits(data.deposits || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchUser();
    fetchDeposits();
  }, [fetchUser, fetchDeposits]);

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    setDepositMsg('');
    setError('');
    const amount = Number(depositAmount);
    if (!amount || amount < 50) {
      setError(t('minDeposit'));
      return;
    }
    setDepositLoading(true);
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Error');
        setDepositLoading(false);
        return;
      }
      setDepositMsg(t('depositPending'));
      setDepositAmount('');
      fetchDeposits();
    } catch {
      setError('Error');
    } finally {
      setDepositLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  function copyCode() {
    if (!user) return;
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyLink() {
    if (!user) return;
    const link = `${window.location.origin}/${locale}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const statusLabel = (s: string) => {
    if (s === 'pending') return t('statusPending');
    if (s === 'approved') return t('statusApproved');
    return t('statusRejected');
  };

  const statusColor = (s: string) => {
    if (s === 'pending') return 'text-amber-400 bg-amber-500/10';
    if (s === 'approved') return 'text-emerald-400 bg-emerald-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t('welcome')}, {user.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {tAuth('logout')}
        </button>
      </div>

      {/* Early bird banner */}
      {user.earlyBirdActive && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-200">{t('earlyBirdActive')}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Wallet className="w-4 h-4" />
            {t('balance')}
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            {t('totalProfit')}
          </div>
          <p className="text-2xl font-bold text-teal-400">
            ${user.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <ArrowDownToLine className="w-4 h-4" />
            {t('totalDeposited')}
          </div>
          <p className="text-2xl font-bold text-sky-400">
            ${user.totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Users className="w-4 h-4" />
            {t('profitShare')}
          </div>
          <p className="text-2xl font-bold text-emerald-400">{user.profitShare}%</p>
          <p className="text-xs text-slate-500 mt-1">
            {user.referralCount} {t('referrals')}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Referral */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-4">{t('yourCode')}</h2>
          <div className="flex items-center gap-3 mb-4">
            <code className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-emerald-400 font-mono text-lg tracking-wider">
              {user.referralCode}
            </code>
            <button
              onClick={copyCode}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={t('copyCode')}
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-2">{t('shareLink')}</p>
          <button
            onClick={copyLink}
            className="w-full text-left px-4 py-2.5 rounded-xl bg-slate-800/80 text-sm text-slate-300 hover:bg-slate-800 truncate transition-colors"
          >
            {typeof window !== 'undefined'
              ? `${window.location.origin}/${locale}/register?ref=${user.referralCode}`
              : `.../register?ref=${user.referralCode}`}
          </button>
          <p className="text-xs text-slate-500 mt-4">
            {locale === 'ar'
              ? 'كل إحالة ناجحة تزيد حصتك 20% (الحد الأقصى 100%)'
              : 'Each successful referral increases your share by 20% (max 100%)'}
          </p>
        </div>

        {/* Deposit */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-4">{t('deposit')}</h2>
          <form onSubmit={handleDeposit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            {depositMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                {depositMsg}
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">{t('depositAmount')}</label>
              <input
                type="number"
                min={50}
                step={10}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="50"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">{t('minDeposit')}</p>
            </div>
            <button
              type="submit"
              disabled={depositLoading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold transition-colors"
            >
              {depositLoading ? '...' : t('requestDeposit')}
            </button>
          </form>
        </div>
      </div>

      {/* Deposit history */}
      <div className="mt-10 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">{t('depositHistory')}</h2>
        {deposits.length === 0 ? (
          <p className="text-slate-500 text-sm">{t('noDeposits')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-start py-3 px-2 font-medium">#</th>
                  <th className="text-start py-3 px-2 font-medium">USD</th>
                  <th className="text-start py-3 px-2 font-medium">Status</th>
                  <th className="text-start py-3 px-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d, i) => (
                  <tr key={d.id} className="border-b border-slate-800/50">
                    <td className="py-3 px-2 text-slate-500">{i + 1}</td>
                    <td className="py-3 px-2 text-white font-medium">
                      ${d.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${statusColor(d.status)}`}>
                        {statusLabel(d.status)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString(locale === 'ar' ? 'ar' : 'en')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
