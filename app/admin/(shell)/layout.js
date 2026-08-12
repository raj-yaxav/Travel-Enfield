'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ADMIN_NAV } from '../../../lib/admin-api';
import * as Icons from '../../../components/admin/Icons';

export default function AdminShellLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh">
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-purple font-heading text-sm font-extrabold text-white">TE</div>
          <div>
            <p className="font-heading text-sm font-extrabold leading-tight text-brand-deep">TravelEnfield</p>
            <p className="text-xs leading-tight text-gray-400">Admin panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV.map(item => {
            const Icon = Icons[item.icon];
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-brand-purple/10 text-brand-purple' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-deep'}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600">
            <Icons.IconLogout className="h-5 w-5 shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
          <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Icons.IconMenu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-brand-deep">
            View site <Icons.IconExternal className="h-4 w-4" />
          </a>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
