import { useTranslations } from 'next-intl';
import { RECOMMENDED_BROKER } from '@/lib/broker-config';
import { ExternalLink } from 'lucide-react';

export default function BrokerPromo() {
  const t = useTranslations('BrokerPromo');

  return (
    <a
      href={RECOMMENDED_BROKER.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group block p-5 rounded-2xl bg-panel border border-gold/25 hover:border-gold/50 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[11px] font-semibold mb-2">
            {t('badge')}
          </span>
          <h3 className="font-display font-semibold text-text mb-1">
            {t('title', { broker: RECOMMENDED_BROKER.name })}
          </h3>
          <p className="text-sm text-text-muted">{t('subtitle')}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-bg text-sm font-semibold group-hover:bg-gold-bright transition-colors">
          {t('cta')}
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
}
