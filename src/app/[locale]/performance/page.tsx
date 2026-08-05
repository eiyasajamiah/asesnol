import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TrendingUp, Target, Activity, BarChart3 } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
};

// Demo data - clearly marked as experimental
const DEMO_STATS = {
  totalProfit: 18420,
  winRate: 68.4,
  maxDrawdown: 12.7,
  trades: 247,
  period: 'Jan 2026 – Jul 2026',
};

const DEMO_MONTHLY = [
  { month: 'Jan', profit: 2100 },
  { month: 'Feb', profit: 1850 },
  { month: 'Mar', profit: 3200 },
  { month: 'Apr', profit: 1540 },
  { month: 'May', profit: 2890 },
  { month: 'Jun', profit: 3410 },
  { month: 'Jul', profit: 3430 },
];

export default async function PerformancePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Performance');

  const maxProfit = Math.max(...DEMO_MONTHLY.map((m) => m.profit));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          {t('title')} — DEMO
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t('title')}</h1>
        <p className="text-slate-400 max-w-xl mx-auto">{t('subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          {
            icon: TrendingUp,
            label: t('totalProfit'),
            value: `$${DEMO_STATS.totalProfit.toLocaleString()}`,
            color: 'text-emerald-400',
          },
          {
            icon: Target,
            label: t('winRate'),
            value: `${DEMO_STATS.winRate}%`,
            color: 'text-teal-400',
          },
          {
            icon: Activity,
            label: t('maxDrawdown'),
            value: `${DEMO_STATS.maxDrawdown}%`,
            color: 'text-amber-400',
          },
          {
            icon: BarChart3,
            label: t('trades'),
            value: DEMO_STATS.trades.toString(),
            color: 'text-sky-400',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-sm text-slate-400">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Simple bar chart */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Monthly Profit (Demo)</h2>
          <span className="text-sm text-slate-500">{DEMO_STATS.period}</span>
        </div>

        <div className="flex items-end gap-3 h-48">
          {DEMO_MONTHLY.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-emerald-400 font-medium">
                ${(item.profit / 1000).toFixed(1)}k
              </span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                style={{ height: `${(item.profit / maxProfit) * 100}%` }}
              />
              <span className="text-xs text-slate-500">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strong Disclaimer */}
      <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/30">
        <p className="text-sm text-amber-200/90 leading-relaxed text-center">
          ⚠️ {t('disclaimer')}
        </p>
      </div>
    </div>
  );
}
