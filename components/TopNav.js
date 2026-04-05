"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopNav({ activeTab = 'Live' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => { localStorage.removeItem('user'); setUser(null); router.push('/login'); };

  const tabs = [
    { label: 'Live', href: '/' },
    { label: 'Schedule', href: '/events' },
    { label: 'Athletes', href: '/sports' },
    { label: 'Results', href: '/results' },
  ];

  const dashHref = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student';

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl shadow-[0_0_15px_rgba(186,255,57,0.1)] flex justify-between items-center px-8 h-20">
      <Link href="/">
        <div className="text-2xl font-black italic tracking-tighter text-[#BAFF39] font-headline cursor-pointer">
          CDGI GameGrid
        </div>
      </Link>

      <div className="hidden md:flex gap-8 items-center">
        {tabs.map(({ label, href }) => (
          <Link href={href} key={label}>
            <span className={`font-headline italic font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              activeTab === label
                ? 'text-[#BAFF39] border-b-2 border-[#BAFF39] pb-1'
                : 'text-zinc-400 font-medium hover:text-[#00CFFC]'
            }`}>
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href={dashHref}>
              <span className="font-headline italic text-xs uppercase font-bold text-zinc-400 hover:text-primary transition-colors tracking-widest">Dashboard</span>
            </Link>
            <button
              onClick={logout}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-error/30 bg-surface-container-high hover:bg-error/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-error text-xl">logout</span>
            </button>
          </>
        ) : (
          <Link href="/login">
            <div className="h-10 px-5 flex items-center justify-center rounded-full border border-primary/30 bg-surface-container-high transition-all cursor-pointer hover:bg-primary/10 gap-2">
              <span className="material-symbols-outlined text-primary text-lg">login</span>
              <span className="font-headline italic text-xs uppercase font-bold text-primary tracking-widest">Login</span>
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
