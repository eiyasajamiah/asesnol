'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { DEPOSIT_NETWORKS } from '@/lib/wallet-config';
import { Copy, Check, Download, LogOut } from 'lucide-react';
import BrokerPromo from '@/components/BrokerPromo';

type Plan = { id: string; slug: string; name: string; priceMonthly: string };
type Me = {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  isEarlyBird: boolean;
  subscription: {
    planName: string;
    status: string;
    billingCycle: string;
    endDate: string | null;
    licenseKey: string | null;
  } | null;
};

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>(DEPOSIT_NETWORKS[0]?.id || '');
  const [txHash, setTxHash] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchMe = useCallback(async () => {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      router.push('/login');
      return;
    }
    const data = (await res.json()) as { user: Me };
    setMe(data.user);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchMe();
    fetch('/api/plans')
      .then((r) => r.json())
      .then((d) => {
        const plans = (d as { plans?: Plan[] }).plans;
        setPlans(plans || []);
        if (plans?.[0]) setSelectedPlan(plans[0].slug);
      });
  }, [fetchMe]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  function copyReferral() {
    if (!me) return;
    navigator.clipboard.writeText(me.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!txHash.trim()) return;
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/subscription/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug: selectedPlan,
          billingCycle: 'MONTHLY',
          txHash: txHash.trim(),
          network: selectedNetwork,
        }),
      });
      const data = (await res.json()) as { error?: string; autoVerified?: boolean };
      if (!res.ok) {
        setError(data.error || tc('error'));
        setSubmitLoading(false);
        return;
      }
      setMessage(data.autoVerified ? t('activated') : t('pendingReview'));
      setTxHash('');
      fetchMe();
    } catch {
      setError(tc('error'));
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }
  if (!me) return null;

  const network = DEPOSIT_NETWORKS.find((n) => n.id === selectedNetwork);
  const activeSub = me.subscription;

  return (
    <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-text">
          {t('welcome')}, {me.name}
        </h1>
        <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text border border-border">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <BrokerPromo />

      <div className="grid md:grid-cols-2 gap-5 mt-5">
        <div className="p-6 rounded-2xl bg-panel border border-border">
          <h2 className="font-display font-semibold text-text mb-4">{t('subscriptionActive')}</h2>
          {activeSub && activeSub.status === 'ACTIVE' ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t('plan')}</span>
                <span className="text-text font-medium">{activeSub.planName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t('expiresOn')}</span>
                <span className="tabular text-text">
                  {activeSub.endDate ? new Date(activeSub.endDate).toLocaleDateString(locale) : t('lifetime')}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-text-muted">{t('licenseKey')}</span>
                <code className="tabular text-gold text-xs">{activeSub.licenseKey}</code>
              </div>
              <a href="/api/bots/download/latest" className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold hover:bg-gold-bright text-bg font-semibold text-sm transition-colors">
                <Download className="w-4 h-4" />
                {t('downloadBot')}
              </a>
            </div>
          ) : (
            <p className="text-text-muted text-sm">{t('noSubscription')}</p>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-panel border border-border">
          <h2 className="font-display font-semibold text-text mb-4">{t('referralCode')}</h2>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2.5 rounded-lg bg-panel-raised text-gold tabular text-sm">{me.referralCode}</code>
            <button onClick={copyReferral} className="p-2.5 rounded-lg bg-panel-raised hover:bg-border text-text-muted">
              {copied ? <Check className="w-4 h-4 text-up" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {(!activeSub || activeSub.status !== 'ACTIVE') && (
        <div className="mt-5 p-6 rounded-2xl bg-panel border border-border">
          <h2 className="font-display font-semibold text-text mb-4">{t('subscribeNow')}</h2>
          <form onSubmit={handleSubscribe} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-down/10 border border-down/30 text-down text-sm">{error}</div>}
            {message && <div className="p-3 rounded-lg bg-up/10 border border-up/30 text-up text-sm">{message}</div>}
            <div className="grid sm:grid-cols-2 gap-3">
              <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="px-4 py-2.5 rounded-lg bg-panel-raised border border-border text-text">
                {plans.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name} — ${p.priceMonthly}</option>
                ))}
              </select>
              <select value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} className="px-4 py-2.5 rounded-lg bg-panel-raised border border-border text-text">
                {DEPOSIT_NETWORKS.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1.5">{t('walletAddress')}</label>
              <code className="block px-3 py-2.5 rounded-lg bg-panel-raised text-gold tabular text-xs break-all">{network?.address}</code>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1.5">{t('txHash')}</label>
              <input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder={t('txHashPlaceholder')}
                className="w-full px-4 py-2.5 rounded-lg bg-panel-raised border border-border text-text font-mono text-xs focus:outline-none focus:border-gold" />
            </div>
            <button type="submit" disabled={submitLoading} className="w-full py-3 rounded-lg bg-gold hover:bg-gold-bright disabled:opacity-50 text-bg font-semibold transition-colors">
              {submitLoading ? tc('loading') : t('submitPayment')}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
