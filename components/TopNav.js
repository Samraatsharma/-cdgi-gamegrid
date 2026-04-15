"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function TopNav({ activeTab = 'Live' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    
    // Seed initial notifications if empty
    const savedNotifs = localStorage.getItem('notifications');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    } else {
      const initialNotifs = [
        { id: 1, title: 'Welcome to GameGrid Sports', message: 'Complete your profile and view the upcoming events.', time: 'Just now', type: 'info' },
        { id: 2, title: 'Cricket Cup Live', message: 'Registration for the Annual Inter-College Cricket Cup is now open.', time: '2h ago', type: 'success' }
      ];
      setNotifications(initialNotifs);
      localStorage.setItem('notifications', JSON.stringify(initialNotifs));
    }

    // Close notifications on click outside
    const handleOutsideClick = () => setShowNotifications(false);
    if (showNotifications) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showNotifications]);

  const logout = () => { 
    localStorage.removeItem('user'); 
    setUser(null); 
    toast.success('Logged out successfully.');
    router.push('/'); 
  };

  const tabs = [
    { label: 'Live', href: '/' },
    { label: 'Schedule', href: '/events' },
    { label: 'Leaderboard', href: '/leaderboard' }, // Added target
    { label: 'Dashboard', href: user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student', authRequired: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 w-full z-[150] bg-surface-container-lowest/80 backdrop-blur-2xl border-b border-outline-variant/10 flex justify-between items-center px-8 h-20">
      <Link href="/">
        <div className="text-2xl font-black italic tracking-tighter text-primary font-headline cursor-pointer hover:scale-105 transition-transform">
          GameGrid Sports
        </div>
      </Link>

      <div className="hidden md:flex gap-10 items-center">
        {tabs.map(({ label, href, authRequired }) => {
          if (authRequired && !user) return null;
          return (
            <Link href={href} key={label}>
              <span className={`font-headline italic font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                activeTab === label
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-6 relative">
        {user && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/20 hover:bg-surface-container-highest transition-all relative group"
            >
              <span className={`material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors ${unreadCount > 0 ? 'animate-swing' : ''}`}>notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[8px] font-black rounded-full flex items-center justify-center border-2 border-surface-container-lowest animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-14 right-0 w-80 bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-highest">
                  <h4 className="font-headline font-black italic text-xs uppercase tracking-widest">Notifications</h4>
                  <span className="text-[10px] font-bold text-primary uppercase cursor-pointer hover:underline" onClick={() => setNotifications([])}>Clear All</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-outline-variant/10 hover:bg-surface-container-highest/50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`font-headline font-bold text-[11px] uppercase tracking-wide group-hover:text-primary transition-colors ${n.type === 'success' ? 'text-green-400' : 'text-on-surface'}`}>{n.title}</p>
                        <span className="text-[9px] text-on-surface-variant/40 font-bold uppercase">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">{n.message}</p>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-on-surface-variant/40 font-headline italic text-sm italic">No notifications</div>
                  )}
                </div>
                {notifications.length > 0 && (
                   <div className="p-3 text-center bg-surface-container-highest/30">
                      <Link href="/notifications" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">View History</Link>
                   </div>
                )}
              </div>
            )}
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-4 border-l border-outline-variant/20 pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-headline font-black italic uppercase text-on-surface tracking-tighter leading-none">{user.name || user.username}</p>
              <p className="text-[8px] font-bold text-primary uppercase tracking-widest mt-1 opacity-70">Role: {user.role === 'admin' ? 'Administrator' : 'Student Athlete'}</p>
            </div>
            <button
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high border border-outline-error/20 hover:bg-error/10 hover:border-error group transition-all"
              title="Logout"
            >
              <span className="material-symbols-outlined text-error/60 group-hover:text-error transition-all">logout</span>
            </button>
          </div>
        ) : (
          <Link href="/login">
            <button className="px-6 py-2.5 bg-primary text-on-primary font-headline font-black italic text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(184,253,55,0.3)]">
              Login
            </button>
          </Link>
        )}
      </div>

      <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(10deg); }
          20%, 40% { transform: rotate(-10deg); }
          50% { transform: rotate(0deg); }
        }
        .animate-swing {
          animation: swing 2s ease infinite;
        }
      `}</style>
    </nav>
  );
}
