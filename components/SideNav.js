"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminLinks = [
  { href: '/dashboard/admin', icon: 'grid_view', label: 'Dashboard' },
  { href: '/dashboard/admin/trials', icon: 'sports_score', label: 'Trials' },
  { href: '/dashboard/admin/team', icon: 'group', label: 'Teams' },
  { href: '/dashboard/admin/logistics', icon: 'inventory_2', label: 'Logistics' },
  { href: '/dashboard/admin/results', icon: 'emoji_events', label: 'Results' },
];

const studentLinks = [
  { href: '/dashboard/student', icon: 'grid_view', label: 'Dashboard' },
  { href: '/events', icon: 'event', label: 'Events' },
  { href: '/results', icon: 'leaderboard', label: 'Results' },
];

export default function SideNav({ role = 'student' }) {
  const pathname = usePathname();
  const links = role === 'admin' ? adminLinks : studentLinks;
  const brand = role === 'admin' ? 'SPORTS SPHERE ADMIN' : 'SPORTS SPHERE';
  const subtitle = role === 'admin' ? 'Administrative Portal' : 'Student Portal';

  return (
    <nav className="h-screen w-20 hover:w-64 fixed left-0 top-0 transition-all duration-500 z-40 bg-zinc-950 flex flex-col py-8 gap-8 shadow-2xl group overflow-hidden border-r border-zinc-900/50">
      {/* Brand */}
      <div className="px-6 flex items-center gap-4 mb-4">
        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-on-primary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <p className="font-headline font-bold italic text-primary leading-none">{brand}</p>
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">{subtitle}</p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex flex-col gap-1 flex-grow">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link href={link.href} key={link.href}>
              <div className={`flex items-center px-6 py-4 gap-4 transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#BAFF39]/20 to-transparent text-[#BAFF39] border-l-4 border-[#BAFF39]'
                  : 'text-zinc-500 hover:bg-zinc-800 hover:text-[#00CFFC]'
              }`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{link.icon}</span>
                <span className="font-headline uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom: Logout */}
      <div className="px-4">
        <button
          className="w-full bg-surface-container-high text-on-surface font-headline font-bold py-3 rounded-lg text-xs uppercase tracking-wider hover:bg-error/20 hover:text-error transition-all opacity-0 group-hover:opacity-100"
          onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
