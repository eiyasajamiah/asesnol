import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Bot, Users, Shield, Zap, TrendingUp } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Hero');
  const tFeatures = await getTranslations('Features');
  const tShare = await getTranslations('ProfitShare');
  const tRisk = await getTranslations('Risk');

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {t('badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            {t('title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              {t('titleHighlight')}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-colors"
            >
              {t('cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/performance"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-600 hover:border-slate-400 text-slate-200 font-medium transition-colors"
            >
              {t('ctaSecondary')}
            </Link>
          </div>

          <p className="text-sm text-slate-500">{t('trust')}</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-14">
            {tFeatures('title')}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Bot, title: tFeatures('item1Title'), desc: tFeatures('item1Desc') },
              { icon: Users, title: tFeatures('item2Title'), desc: tFeatures('item2Desc') },
              { icon: Shield, title: tFeatures('item3Title'), desc: tFeatures('item3Desc') },
              { icon: Zap, title: tFeatures('item4Title'), desc: tFeatures('item4Desc') },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profit Share Levels */}
      <section className="py-20 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{tShare('title')}</h2>
            <p className="text-slate-400">{tShare('subtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { level: tShare('level0'), share: '50%' },
              { level: tShare('level1'), share: '70%' },
              { level: tShare('level2'), share: '90%' },
              { level: tShare('level3'), share: '100%' },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl border text-center ${
                  i === 3
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-700'
                }`}
              >
                <p className="text-sm text-slate-400 mb-2">{item.level}</p>
                <p className="text-3xl font-bold text-emerald-400">{item.share}</p>
                <p className="text-xs text-slate-500 mt-1">{tShare('share')}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{tShare('earlyBird')}</span>
          </div>
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="py-12 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-amber-400 mb-3">{tRisk('title')}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{tRisk('text')}</p>
        </div>
      </section>
    </div>
  );
}
