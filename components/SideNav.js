"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

const adminLinks = [
  { href: '/dashboard/admin',             icon: 'grid_view',         label: 'Dashboard' },
  { href: '/dashboard/admin/coordinators', icon: 'manage_accounts',  label: 'Coordinators' },
  { href: '/dashboard/admin/trials',      icon: 'sports_score',      label: 'Trials' },
  { href: '/dashboard/admin/team',        icon: 'group',             label: 'Teams' },
  { href: '/dashboard/admin/logistics',   icon: 'inventory_2',       label: 'Logistics' },
  { href: '/dashboard/admin/results',     icon: 'emoji_events',      label: 'Results' },
  { href: '/dashboard/admin/reports',     icon: 'analytics',         label: 'Reports' },
];

const coordinatorLinks = [
  { href: '/dashboard/coordinator',       icon: 'grid_view',         label: 'My Dashboard' },
  { href: '/dashboard/coordinator/events', icon: 'event',            label: 'My Events' },
  { href: '/dashboard/coordinator/participants', icon: 'group',      label: 'Participants' },
  { href: '/dashboard/coordinator/reports', icon: 'analytics',       label: 'Reports' },
];

const studentLinks = [
  { href: '/dashboard/student',           icon: 'grid_view',         label: 'Dashboard' },
  { href: '/events',                      icon: 'event',             label: 'Events' },
  { href: '/results',                     icon: 'leaderboard',       label: 'Results' },
];

const ROLE_CONFIG = {
  admin: {
    links: adminLinks,
    brand: 'SPORTS SPHERE ADMIN',
    subtitle: 'Administrative Portal',
    accentClass: 'text-primary',
    activeClass: 'bg-gradient-to-r from-[#BAFF39]/20 to-transparent text-[#BAFF39] border-l-4 border-[#BAFF39]',
    hoverClass: 'text-zinc-500 hover:bg-zinc-800 hover:text-[#BAFF39]',
  },
  coordinator: {
    links: coordinatorLinks,
    brand: 'COORDINATOR PORTAL',
    subtitle: 'Sport Coordinator',
    accentClass: 'text-sky-400',
    activeClass: 'bg-gradient-to-r from-sky-400/20 to-transparent text-sky-400 border-l-4 border-sky-400',
    hoverClass: 'text-zinc-500 hover:bg-zinc-800 hover:text-sky-400',
  },
  student: {
    links: studentLinks,
    brand: 'SPORTS SPHERE',
    subtitle: 'Student Portal',
    accentClass: 'text-primary',
    activeClass: 'bg-gradient-to-r from-[#BAFF39]/20 to-transparent text-[#BAFF39] border-l-4 border-[#BAFF39]',
    hoverClass: 'text-zinc-500 hover:bg-zinc-800 hover:text-[#00CFFC]',
  },
};

export default function SideNav({ role = 'student' }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  // For coordinator, show the assigned sport as a badge
  const sportBadge = role === 'coordinator' && user?.assigned_sport ? user.assigned_sport : null;

  return (
    <nav className="h-screen w-20 hover:w-64 fixed left-0 top-0 transition-all duration-500 z-40 bg-zinc-950 flex flex-col py-8 gap-8 shadow-2xl group overflow-hidden border-r border-zinc-900/50">
      {/* Brand */}
      <div className="px-6 flex items-center gap-4 mb-4">
        <div className={`w-8 h-8 ${role === 'coordinator' ? 'bg-sky-500' : 'bg-primary'} rounded-sm flex items-center justify-center flex-shrink-0`}>
          <span
            className={`material-symbols-outlined ${role === 'coordinator' ? 'text-white' : 'text-on-primary'} font-bold`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {role === 'coordinator' ? 'manage_accounts' : 'bolt'}
          </span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <p className={`font-headline font-bold italic ${cfg.accentClass} leading-none text-sm`}>{cfg.brand}</p>
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">{cfg.subtitle}</p>
          {sportBadge && (
            <span className="mt-1 inline-block px-2 py-0.5 bg-sky-500/20 text-sky-400 text-[9px] font-black uppercase tracking-widest rounded-full">
              {sportBadge}
            </span>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex flex-col gap-1 flex-grow">
        {cfg.links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link href={link.href} key={link.href}>
              <div className={`flex items-center px-6 py-4 gap-4 transition-all duration-300 ${
                isActive ? cfg.activeClass : cfg.hoverClass
              }`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {link.icon}
                </span>
                <span className="font-headline uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* User & Logout */}
      <div className="px-4 pb-4 mt-auto">
        <div className="mb-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-headline font-bold text-zinc-500 uppercase tracking-widest">Logged in as</p>
          <p className={`text-xs font-headline font-black italic ${cfg.accentClass} uppercase tracking-wider truncate`}>
            {user ? (user.username || user.name || 'User') : '...'}
          </p>
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-0.5">
            {role === 'coordinator' ? 'COORDINATOR' : role === 'admin' ? 'ADMIN' : 'STUDENT'}
          </p>
        </div>
        <button
          className="w-full bg-surface-container-high text-on-surface font-headline font-bold py-3 rounded-lg text-xs uppercase tracking-wider hover:bg-error/20 hover:text-error transition-all opacity-0 group-hover:opacity-100"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
