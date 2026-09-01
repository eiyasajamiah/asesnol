'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Check } from 'lucide-react';

type Plan = {
  id: string; slug: string; name: string; description: string | null;
  priceMonthly: string; priceYearly: string | null; features: string[] | null;
};

export default function PricingPage() {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch('/api/plans').then((r) => r.json()).then((d) => setPlans((d as { plans?: Plan[] }).plans || []));
  }, []);

  return (
    <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text mb-3">{t('plansTitle')}</h1>
        <p className="text-text-muted">{t('plansSubtitle')}</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div key={plan.id} className={`p-6 rounded-2xl border flex flex-col ${plan.slug === 'pro' ? 'bg-panel-raised border-gold/40' : 'bg-panel border-border'}`}>
            <h2 className="font-display font-bold text-lg text-text">{plan.name}</h2>
            <p className="text-sm text-text-muted mt-1 mb-4">{plan.description}</p>
            <div className="mb-5">
              <span className="tabular text-3xl font-bold text-gold">${plan.priceMonthly}</span>
              <span className="text-text-muted text-sm"> {plan.slug === 'lifetime' ? (locale === 'ar' ? 'مرة واحدة' : 'one-time') : `/ ${tc('monthly')}`}</span>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features?.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                  <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className={`text-center py-2.5 rounded-lg font-semibold transition-colors ${plan.slug === 'pro' ? 'bg-gold hover:bg-gold-bright text-bg' : 'border border-border text-text hover:border-gold/50'}`}>
              {locale === 'ar' ? 'ابدأ الآن' : 'Get Started'}
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
