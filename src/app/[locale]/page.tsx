import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Bot, Shield, Coins, Wallet } from 'lucide-react';
import PriceTicker from '@/components/PriceTicker';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('Home');

  const features = [
    { icon: Bot, title: t('f1Title'), desc: t('f1Desc') },
    { icon: Shield, title: t('f2Title'), desc: t('f2Desc') },
    { icon: Coins, title: t('f3Title'), desc: t('f3Desc') },
    { icon: Wallet, title: t('f4Title'), desc: t('f4Desc') },
  ];

  return (
    <main className="flex-1">
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-semibold mb-5">
          {t('badge')}
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-text leading-tight mb-4">
          {t('title')} <span className="text-gold">{t('titleHighlight')}</span>
        </h1>
        <p className="text-text-muted max-w-xl mx-auto mb-8">{t('subtitle')}</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/register" className="px-6 py-3 rounded-lg bg-gold hover:bg-gold-bright text-bg font-semibold transition-colors">
            {t('cta')}
          </Link>
          <Link href="/pricing" className="px-6 py-3 rounded-lg border border-border text-text hover:border-gold/50 transition-colors">
            {t('ctaSecondary')}
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mb-16">
        <PriceTicker />
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-panel border border-border">
                <Icon className="w-5 h-5 text-gold mb-3" />
                <h3 className="font-display font-semibold text-text mb-1.5">{f.title}</h3>
                <p className="text-sm text-text-muted">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
