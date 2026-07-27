'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '#' },
  { href: '/projects', label: 'Projects', icon: '[]' },
  { href: '/activity', label: 'Activity', icon: '~' },
  { href: '/submit', label: 'Submit Project', icon: '+' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#050508] border-r border-[#1a1a2e]">
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#1a1a2e]">
        <div className="w-8 h-8 rounded-lg bg-[#818cf8] flex items-center justify-center text-black font-bold text-sm shrink-0">
          A
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-[#e2e2e2]">
            Arc Radar
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#818cf8]/10 text-[#818cf8]'
                  : 'text-[#8a8a8a] hover:text-[#e2e2e2] hover:bg-[#12121a]'
              )}
            >
              <span className="w-5 text-center text-xs font-mono shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#1a1a2e]">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-[#6b6b80]">Testnet Phase</p>
            <p className="text-xs text-[#818cf8] mt-0.5">Mainnet expected Q3 2026</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex w-full items-center justify-center px-3 py-2 rounded-lg text-[#6b6b80] hover:text-[#e2e2e2] hover:bg-[#12121a] transition-colors"
        >
          <span className={`text-xs transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}>
            {'<'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-30 transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="relative w-64 h-full bg-[#050508]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
