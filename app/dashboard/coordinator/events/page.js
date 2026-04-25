"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../lib/auth-context';

const STATUS_CONFIG = {
  registration_open: { label: 'Open',      color: 'bg-primary/20 text-primary' },
  upcoming:          { label: 'Upcoming',  color: 'bg-yellow-500/20 text-yellow-400' },
  ongoing:           { label: 'Live Now',  color: 'bg-orange-500/20 text-orange-400' },
  completed:         { label: 'Completed', color: 'bg-zinc-500/20 text-zinc-400' },
};

export default function CoordinatorEvents() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'coordinator') { router.push('/login'); return; }
    fetch(`/api/coordinator/events?sport=${encodeURIComponent(user.assigned_sport)}`)
      .then(r => r.json())
      .then(d => { if (d.success) setEvents(d.events); })
      .catch(() => toast.error('Failed to load events.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading || !user) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="coordinator" />
      <main className="ml-20 p-8 lg:p-12 relative">
        <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="mb-10 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-sky-400 animate-ping" />
            <p className="text-[10px] font-headline font-black italic uppercase tracking-[0.4em] text-sky-400">{user.assigned_sport} Events</p>
          </div>
          <h1 className="font-headline font-black italic text-5xl uppercase tracking-tighter">
            MY <span className="text-sky-400">EVENTS</span>
          </h1>
          <p className="text-xs text-on-surface-variant/60 font-bold uppercase tracking-widest mt-2">
            Showing all {user.assigned_sport} events &mdash; {events.length} total
          </p>
        </header>

        {events.length === 0 ? (
          <div className="relative z-10 bg-surface-container/40 p-24 rounded-3xl border-2 border-dashed border-outline-variant/20 text-center">
            <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-6">event_busy</span>
            <p className="text-on-surface-variant font-headline italic font-bold text-2xl uppercase opacity-40">
              No {user.assigned_sport} events yet.
            </p>
          </div>
        ) : (
          <div className="relative z-10 overflow-x-auto rounded-2xl border border-outline-variant/10">
            <table className="w-full text-left bg-surface-container text-sm">
              <thead className="bg-surface-container-highest text-[10px] font-headline font-black uppercase tracking-widest">
                <tr>
                  <th className="p-4">Event Name</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Venue</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Participants</th>
                  <th className="p-4">Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {events.map(ev => {
                  const sCfg = STATUS_CONFIG[ev.status] || STATUS_CONFIG.upcoming;
                  return (
                    <tr key={ev.id} className="hover:bg-surface-container-high transition-colors">
                      <td className="p-4 font-bold font-headline italic">{ev.name}</td>
                      <td className="p-4 opacity-80 text-xs">
                        {new Date(ev.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant/70">{ev.venue || 'TBD'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black italic uppercase ${sCfg.color}`}>
                          {sCfg.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-sky-400">{ev.registered_count || 0}</span>
                        <span className="text-on-surface-variant/50">/{ev.max_participants || 50}</span>
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant/70">{ev.event_format || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
