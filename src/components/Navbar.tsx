'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role?: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser((d as { user: { name: string; role?: string } | null }).user))
      .finally(() => setLoaded(true));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-2 h-6 bg-gold rounded-sm" />
          <span className="w-2 h-4 bg-gold/60 rounded-sm" />
          <span className="w-2 h-8 bg-gold rounded-sm" />
          <span className="font-display font-extrabold text-lg text-text ms-1">Asesnol</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/" className="px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text transition-colors">
            {t('home')}
          </Link>
          <Link href="/pricing" className="px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text transition-colors">
            {t('pricing')}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {loaded && user ? (
            <>
              <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm text-text hover:text-gold transition-colors">
                {t('dashboard')}
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-gold transition-colors">
                  {t('admin')}
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm text-text hover:text-gold transition-colors">
                {t('login')}
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-bright text-bg text-sm font-semibold transition-colors">
                {t('register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
