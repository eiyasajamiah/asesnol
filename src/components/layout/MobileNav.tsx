// src/components/layout/MobileNav.tsx
'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { Home, Bot, Wallet, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: Home, label: 'الرئيسية' },
  { href: '/bots', icon: Bot, label: 'البوتات' },
  { href: '/wallet', icon: Wallet, label: 'المحفظة' },
  { href: '/profile', icon: User, label: 'حسابي' },
];

export function MobileNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center p-2 ${
              pathname === item.href ? 'text-black' : 'text-gray-400'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}