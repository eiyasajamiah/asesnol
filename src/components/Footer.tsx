'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-xs">
              A
            </div>
            <span className="font-semibold text-white">Asesnol</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/risks" className="hover:text-emerald-400 transition-colors">
              {t('risks')}
            </Link>
            <Link href="/faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </Link>
            <a href="mailto:support@asesnol.com" className="hover:text-emerald-400 transition-colors">
              {t('contact')}
            </a>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Asesnol. {t('rights')}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600 max-w-2xl mx-auto">
          Trading involves substantial risk of loss and is not suitable for all investors. 
          Past performance is not indicative of future results. Demo results are for illustration only.
        </p>
      </div>
    </footer>
  );
}
