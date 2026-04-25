"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

const ROLE_LABELS = {
  admin: 'Administrator',
  coordinator: 'Coordinator',
  student: 'Student Athlete',
};

const ROLE_DASHBOARDS = {
  admin: '/dashboard/admin',
  coordinator: '/dashboard/coordinator',
  student: '/dashboard/student',
};

export default function TopNav({ activeTab = '' }) {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch notifications from DB
    if (user && isLoggedIn) {
      fetch(`/api/notifications?user_id=${user.id}&role=${user.role}`)
        .then(r => r.json())
        .then(d => { if (d.success) setNotifications(d.notifications); })
        .catch(() => {});
    }

    // Close notifications on click outside
    const handleOutsideClick = () => setShowNotifications(false);
    if (showNotifications) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showNotifications, user, isLoggedIn]);

  // Dynamic dashboard link based on role
  const dashboardHref = user ? (ROLE_DASHBOARDS[user.role] || '/dashboard/student') : '/dashboard/student';

  const tabs = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Results', href: '/results' },
    { label: 'Dashboard', href: dashboardHref, authRequired: true },
  ];

  // Detect active tab from pathname
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (pathname === '/') return 'Home';
    if (pathname.startsWith('/events')) return 'Events';
    if (pathname.startsWith('/leaderboard')) return 'Leaderboard';
    if (pathname.startsWith('/results')) return 'Results';
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    return '';
  };

  const currentTab = getActiveTab();
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const roleLabel = user ? (ROLE_LABELS[user.role] || 'User') : '';

  return (
    <>
      <nav className="fixed top-0 w-full z-[150] bg-surface-container-lowest/80 backdrop-blur-2xl border-b border-outline-variant/10 flex justify-between items-center px-6 md:px-8 h-20">
        {/* Brand */}
        <Link href="/">
          <div className="text-2xl font-black italic tracking-tighter text-primary font-headline cursor-pointer hover:scale-105 transition-transform">
            Sports Sphere
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {tabs.map(({ label, href, authRequired }) => {
            if (authRequired && !user) return null;
            return (
              <Link href={href} key={label}>
                <span className={`font-headline italic font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  currentTab === label
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-primary'
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right side: notifications + auth */}
        <div className="flex items-center gap-4 relative">
          {/* Notification Bell (authenticated only) */}
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
                    {notifications.length > 0 && (
                      <span
                        className="text-[10px] font-bold text-primary uppercase cursor-pointer hover:underline"
                        onClick={() => {
                          if (user) {
                            fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mark_all_read: true, user_id: user.id }) });
                          }
                          setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
                        }}
                      >
                        Mark All Read
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.slice(0, 15).map((n) => {
                      const typeColor = n.type === 'success' ? 'text-green-400' : n.type === 'error' ? 'text-red-400' : n.type === 'warning' ? 'text-yellow-400' : 'text-on-surface';
                      const timeAgo = n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
                      return (
                        <div key={n.id} className={`p-4 border-b border-outline-variant/10 hover:bg-surface-container-highest/50 transition-colors cursor-pointer group ${!n.is_read ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                          onClick={() => {
                            if (!n.is_read && user) {
                              fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id, is_read: true }) });
                              setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
                            }
                            if (n.action_url) window.location.href = n.action_url;
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={`font-headline font-bold text-[11px] uppercase tracking-wide group-hover:text-primary transition-colors ${typeColor}`}>{n.title}</p>
                            <span className="text-[9px] text-on-surface-variant/40 font-bold">{timeAgo}</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant leading-relaxed">{n.message}</p>
                        </div>
                      );
                    }) : (
                      <div className="p-8 text-center text-on-surface-variant/40 font-headline italic text-sm">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth State: Logged in vs Logged out */}
          {user ? (
            <div className="flex items-center gap-3 border-l border-outline-variant/20 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-headline font-black italic uppercase text-on-surface tracking-tighter leading-none">
                  {user.name || user.username}
                </p>
                <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 opacity-70 ${
                  user.role === 'coordinator' ? 'text-sky-400' : user.role === 'admin' ? 'text-primary' : 'text-secondary'
                }`}>
                  {roleLabel}{user.role === 'coordinator' ? ` • ${user.assigned_sport}` : ''}
                </p>
              </div>
              <button
                onClick={logout}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/20 hover:bg-error/10 hover:border-error group transition-all"
                title="Logout"
              >
                <span className="material-symbols-outlined text-error/60 group-hover:text-error transition-all">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="px-5 py-2.5 bg-primary text-on-primary font-headline font-black italic text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(184,253,55,0.3)] rounded-lg">
                  Login
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-20 right-0 w-72 bg-surface-container-high border-l border-outline-variant/10 h-[calc(100vh-5rem)] p-6 flex flex-col gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {tabs.map(({ label, href, authRequired }) => {
              if (authRequired && !user) return null;
              return (
                <Link href={href} key={label} onClick={() => setMobileMenuOpen(false)}>
                  <div className={`py-3 px-4 rounded-xl font-headline italic font-bold text-xs uppercase tracking-widest transition-all ${
                    currentTab === label ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'
                  }`}>
                    {label}
                  </div>
                </Link>
              );
            })}

            <div className="mt-auto border-t border-outline-variant/10 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs font-headline font-black italic uppercase text-on-surface">{user.name || user.username}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${
                      user.role === 'coordinator' ? 'text-sky-400' : 'text-primary'
                    }`}>
                      {roleLabel}
                    </p>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full py-3 bg-error/10 text-error font-headline font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-error/20 transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-3 bg-primary text-on-primary font-headline font-black italic text-xs tracking-widest uppercase rounded-xl">
                    Login
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
