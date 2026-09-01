'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const t = useTranslations('Auth');
  const tc = useTranslations('Common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, referralCode: referralCode || undefined }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || tc('error'));
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(tc('error'));
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-text mb-6 text-center">{t('registerTitle')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-down/10 border border-down/30 text-down text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-text-muted mb-1.5">{t('name')}</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-panel border border-border text-text focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">{t('email')}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-panel border border-border text-text focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">{t('password')}</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-panel border border-border text-text focus:outline-none focus:border-gold" />
            <p className="text-xs text-text-faint mt-1">{t('minPassword')}</p>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">{t('referralCode')}</label>
            <input value={referralCode} onChange={(e) => setReferralCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-panel border border-border text-text font-mono text-sm focus:outline-none focus:border-gold" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-gold hover:bg-gold-bright disabled:opacity-50 text-bg font-semibold transition-colors">
            {loading ? tc('loading') : t('registerBtn')}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-text-muted">
          {t('hasAccount')} <Link href="/login" className="text-gold hover:underline">{t('loginBtn')}</Link>
        </p>
      </div>
    </main>
  );
}
