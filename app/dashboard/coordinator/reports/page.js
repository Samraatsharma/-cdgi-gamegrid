"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../lib/auth-context';

export default function CoordinatorReports() {
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
      .catch(() => toast.error('Failed to load report data.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading || !user) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalParticipants = events.reduce((s, e) => s + (e.registered_count || 0), 0);
  const totalCompleted = events.filter(e => e.status === 'completed').length;
  const totalActive = events.filter(e => e.status !== 'completed').length;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="coordinator" />
      <main className="ml-20 p-8 lg:p-12 relative">
        <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="mb-10 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-sky-400 animate-ping" />
            <p className="text-[10px] font-headline font-black italic uppercase tracking-[0.4em] text-sky-400">Sport Report</p>
          </div>
          <h1 className="font-headline font-black italic text-5xl uppercase tracking-tighter">
            {user.assigned_sport} <span className="text-sky-400">REPORT</span>
          </h1>
        </header>

        {/* Summary Stats */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Events',       value: events.length,      icon: 'event',           color: 'text-sky-400' },
            { label: 'Active / Upcoming',  value: totalActive,        icon: 'event_available', color: 'text-primary' },
            { label: 'Completed',          value: totalCompleted,     icon: 'sports_score',    color: 'text-yellow-400' },
            { label: 'Total Participants', value: totalParticipants,  icon: 'group',           color: 'text-secondary' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-surface-container-high/60 rounded-3xl p-8 border border-outline-variant/10 shadow-xl">
              <span className={`material-symbols-outlined text-3xl ${color} mb-3`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <p className={`font-headline font-black text-4xl italic tracking-tighter ${color}`}>{value}</p>
              <p className="text-on-surface-variant text-[10px] font-headline font-black italic uppercase tracking-widest mt-1 opacity-60">{label}</p>
            </div>
          ))}
        </div>

        {/* Per-Event Report Table */}
        <div className="relative z-10 overflow-x-auto rounded-2xl border border-outline-variant/10 mb-10">
          <table className="w-full text-left bg-surface-container text-sm">
            <thead className="bg-surface-container-highest text-[10px] font-headline font-black uppercase tracking-widest">
              <tr>
                <th className="p-4">Event</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Participants</th>
                <th className="p-4">Fill Rate</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Prize Pool</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {events.map(ev => {
                const fillPct = Math.min(100, Math.round(((ev.registered_count || 0) / (ev.max_participants || 50)) * 100));
                return (
                  <tr key={ev.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="p-4 font-bold font-headline italic">{ev.name}</td>
                    <td className="p-4 text-xs opacity-70">{ev.date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                        ev.status === 'registration_open' ? 'bg-primary/20 text-primary' :
                        ev.status === 'completed'         ? 'bg-zinc-500/20 text-zinc-400' :
                        ev.status === 'ongoing'           ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>{ev.status.replace('_', ' ')}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-sky-400">{ev.registered_count || 0}</span>
                      <span className="text-on-surface-variant/50">/{ev.max_participants || 50}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${fillPct >= 100 ? 'bg-red-500' : fillPct > 70 ? 'bg-yellow-400' : 'bg-sky-400'}`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{fillPct}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs opacity-70">{ev.venue || '—'}</td>
                    <td className="p-4 text-xs opacity-70">{ev.prize_pool || '—'}</td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr><td colSpan="7" className="p-12 text-center opacity-40 italic">No events to report.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Coordinator Info Card */}
        <div className="relative z-10 bg-gradient-to-r from-sky-500/10 via-sky-400/5 to-transparent rounded-3xl p-8 border border-sky-500/20">
          <h3 className="text-[10px] font-headline font-black uppercase tracking-widest text-sky-400 mb-4">YOUR COORDINATOR PROFILE</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-1">Name</p>
              <p className="font-headline font-black italic text-lg uppercase">{user.name}</p>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-1">Email</p>
              <p className="font-bold text-sm">{user.email}</p>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-1">Assigned Sport</p>
              <p className="font-headline font-black italic text-lg uppercase text-sky-400">{user.assigned_sport}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
