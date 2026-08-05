'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Check,
  X,
  Users,
  Wallet,
  RefreshCw,
  Lock,
} from 'lucide-react';

type Deposit = {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
};

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

const STORAGE_KEY = 'asesnol_admin_key';

export default function AdminPage() {
  const locale = useLocale();
  const [adminKey, setAdminKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<'deposits' | 'users'>('deposits');
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAdminKey(saved);
      setAuthenticated(true);
    }
  }, []);

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
    }),
    [adminKey]
  );

  const fetchDeposits = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/deposits', { headers: headers() });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          sessionStorage.removeItem(STORAGE_KEY);
          setError(locale === 'ar' ? 'مفتاح غير صحيح' : 'Invalid admin key');
        } else {
          setError('Failed to load deposits');
        }
        return;
      }
      const data = await res.json();
      setDeposits(data.deposits || []);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [adminKey, headers, locale]);

  const fetchUsers = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', { headers: headers() });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          sessionStorage.removeItem(STORAGE_KEY);
        }
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [adminKey, headers]);

  useEffect(() => {
    if (authenticated && adminKey) {
      if (tab === 'deposits') fetchDeposits();
      else fetchUsers();
    }
  }, [authenticated, adminKey, tab, fetchDeposits, fetchUsers]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem(STORAGE_KEY, keyInput.trim());
    setAdminKey(keyInput.trim());
    setAuthenticated(true);
    setError('');
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAdminKey('');
    setAuthenticated(false);
    setDeposits([]);
    setUsers([]);
  }

  async function handleAction(depositId: string, action: 'approve' | 'reject') {
    setActionLoading(depositId);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ depositId, action }),
      });
      if (res.ok) {
        await fetchDeposits();
      } else {
        const data = await res.json();
        setError(data.error || 'Action failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setActionLoading(null);
    }
  }

  function userName(userId: string) {
    const u = users.find((x) => x.id === userId);
    return u ? `${u.name} (${u.email})` : userId.slice(0, 8) + '…';
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              {locale === 'ar' ? 'أدخل مفتاح الأدمن للمتابعة' : 'Enter admin key to continue'}
            </p>
          </div>
          <form onSubmit={handleLogin} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Admin key"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors"
            >
              {locale === 'ar' ? 'دخول' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingCount = deposits.filter((d) => d.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">
              {locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
            </h1>
            <p className="text-sm text-slate-400">
              {pendingCount > 0
                ? locale === 'ar'
                  ? `${pendingCount} طلب إيداع قيد الانتظار`
                  : `${pendingCount} pending deposit(s)`
                : locale === 'ar'
                  ? 'لا توجد طلبات معلقة'
                  : 'No pending requests'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (tab === 'deposits' ? fetchDeposits() : fetchUsers())}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800"
          >
            {locale === 'ar' ? 'خروج' : 'Logout'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('deposits')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'deposits'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Wallet className="w-4 h-4" />
          {locale === 'ar' ? 'الإيداعات' : 'Deposits'}
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('users')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'users'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Users className="w-4 h-4" />
          {locale === 'ar' ? 'المستخدمون' : 'Users'}
        </button>
      </div>

      {/* Deposits tab */}
      {tab === 'deposits' && (
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          {loading && deposits.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Loading…</div>
          ) : deposits.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {locale === 'ar' ? 'لا توجد إيداعات' : 'No deposits yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/50">
                    <th className="text-start py-3 px-4 font-medium">Amount</th>
                    <th className="text-start py-3 px-4 font-medium">User ID</th>
                    <th className="text-start py-3 px-4 font-medium">Status</th>
                    <th className="text-start py-3 px-4 font-medium">Date</th>
                    <th className="text-start py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr key={d.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-white font-semibold">
                        ${d.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                        {d.userId.slice(0, 8)}…
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${
                            d.status === 'pending'
                              ? 'text-amber-400 bg-amber-500/10'
                              : d.status === 'approved'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-red-400 bg-red-500/10'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(d.createdAt).toLocaleString(locale === 'ar' ? 'ar' : 'en')}
                      </td>
                      <td className="py-3 px-4">
                        {d.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(d.id, 'approve')}
                              disabled={actionLoading === d.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {locale === 'ar' ? 'موافقة' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleAction(d.id, 'reject')}
                              disabled={actionLoading === d.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              {locale === 'ar' ? 'رفض' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          {loading && users.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Loading…</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {locale === 'ar' ? 'لا يوجد مستخدمون' : 'No users yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/50">
                    <th className="text-start py-3 px-4 font-medium">Name</th>
                    <th className="text-start py-3 px-4 font-medium">Email</th>
                    <th className="text-start py-3 px-4 font-medium">Balance</th>
                    <th className="text-start py-3 px-4 font-medium">Share</th>
                    <th className="text-start py-3 px-4 font-medium">Refs</th>
                    <th className="text-start py-3 px-4 font-medium">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-white">
                        {u.name}
                        {u.earlyBirdActive && (
                          <span className="ml-2 text-xs text-amber-400">★</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{u.email}</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">
                        ${u.balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-teal-400">{u.profitShare}%</td>
                      <td className="py-3 px-4 text-slate-300">{u.referralCount}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
                        {u.referralCode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
