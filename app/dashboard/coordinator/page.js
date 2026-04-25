"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SideNav from '../../../components/SideNav';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../lib/auth-context';

const STATUS_CONFIG = {
  registration_open: { label: 'Open',      color: 'bg-primary/20 text-primary',         dot: 'bg-primary' },
  upcoming:          { label: 'Upcoming',  color: 'bg-yellow-500/20 text-yellow-400',    dot: 'bg-yellow-400' },
  ongoing:           { label: 'Live Now',  color: 'bg-orange-500/20 text-orange-400',    dot: 'bg-orange-400' },
  completed:         { label: 'Completed', color: 'bg-zinc-500/20 text-zinc-400',        dot: 'bg-zinc-400' },
};

export default function CoordinatorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'coordinator') {
      if (user.role === 'admin') router.push('/dashboard/admin');
      else router.push('/dashboard/student');
      return;
    }
    fetchEvents(user.assigned_sport);
  }, [user, router]);

  const fetchEvents = async (sport) => {
    try {
      const res = await fetch(`/api/coordinator/events?sport=${encodeURIComponent(sport)}`);
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch {
      toast.error('Failed to load your events.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalParticipants = events.reduce((sum, e) => sum + (e.registered_count || 0), 0);
  const activeEvents = events.filter(e => e.status !== 'completed').length;
  const completedEvents = events.filter(e => e.status === 'completed').length;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body overflow-x-hidden">
      <SideNav role="coordinator" />
      <main className="ml-20 min-h-screen p-8 lg:p-12 relative">
        {/* Ambient glow */}
        <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/5 blur-[150px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-1 rounded-full bg-sky-400 animate-ping" />
              <p className="text-[10px] font-headline font-black italic uppercase tracking-[0.4em] text-sky-400">Coordinator Portal</p>
            </div>
            <h1 className="font-headline font-black italic text-5xl md:text-6xl tracking-tighter uppercase leading-tight mt-4 mb-2">
              MY <span className="text-sky-400 italic">DASHBOARD</span>
            </h1>
            <p className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-widest opacity-60">
              {user.name} &nbsp;•&nbsp; Assigned Sport:{' '}
              <span className="text-sky-400 font-black">{user.assigned_sport}</span>
            </p>
          </div>
        </header>

        {/* Stat Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 relative z-10">
          {[
            { icon: 'event',          label: 'Total Events',       value: events.length,       color: 'text-sky-400' },
            { icon: 'event_available',label: 'Active Events',       value: activeEvents,        color: 'text-primary' },
            { icon: 'sports_score',   label: 'Completed Events',   value: completedEvents,      color: 'text-yellow-400' },
            { icon: 'group',          label: 'Total Participants', value: totalParticipants,    color: 'text-secondary' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-surface-container-high/60 backdrop-blur-3xl rounded-3xl p-8 border border-outline-variant/10 shadow-2xl group hover:border-sky-500/30 transition-all">
              <span className={`material-symbols-outlined text-4xl ${color} mb-4 group-hover:scale-110 transition-transform`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <p className={`font-headline font-black text-3xl italic tracking-tighter ${color}`}>{value}</p>
              <p className="text-on-surface-variant text-xs font-headline font-black italic uppercase tracking-widest mt-2 opacity-60">{label}</p>
            </div>
          ))}
        </section>

        {/* Assigned Sport Banner */}
        <div className="relative z-10 mb-10 bg-gradient-to-r from-sky-500/10 via-sky-400/5 to-transparent rounded-3xl p-8 border border-sky-500/20">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-sky-400 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports</span>
            <div>
              <p className="text-[10px] font-headline font-black uppercase tracking-widest text-sky-400/60">Your Assigned Sport</p>
              <h2 className="font-headline font-black italic text-3xl uppercase tracking-tighter text-sky-400">{user.assigned_sport}</h2>
              <p className="text-xs text-on-surface-variant/60 font-bold uppercase tracking-widest mt-1">
                You manage all {user.assigned_sport} events. Your access is limited to this sport only.
              </p>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="relative z-10 mb-10">
          <h2 className="font-headline font-black italic text-3xl uppercase tracking-tighter mb-8 flex items-center gap-4">
            YOUR <span className="text-sky-400 italic">EVENTS</span>
            <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant">{events.length}</span>
          </h2>

          {events.length === 0 ? (
            <div className="bg-surface-container/40 p-24 rounded-3xl border-2 border-dashed border-outline-variant/20 text-center">
              <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-6">event_busy</span>
              <p className="text-on-surface-variant font-headline italic font-bold text-2xl uppercase opacity-40">
                No {user.assigned_sport} events found.
              </p>
              <p className="text-on-surface-variant/40 text-sm mt-2">Events will appear here once Admin creates them for {user.assigned_sport}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {events.map((ev) => {
                const statusCfg = STATUS_CONFIG[ev.status] || STATUS_CONFIG.upcoming;
                const regPct = Math.min(100, Math.round(((ev.registered_count || 0) / (ev.max_participants || 50)) * 100));
                return (
                  <div
                    key={ev.id}
                    className={`bg-surface-container-high rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col shadow-2xl group cursor-pointer ${
                      selectedEvent?.id === ev.id ? 'border-sky-400/60' : 'border-outline-variant/10 hover:border-sky-400/40'
                    }`}
                    onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)}
                  >
                    {/* Image Banner */}
                    <div className="h-48 relative overflow-hidden flex-shrink-0">
                      <img
                        src={ev.image_url || 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800'}
                        alt={ev.name}
                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                        onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high" />
                      <div className="absolute top-4 left-4">
                        <span className={`text-[10px] font-headline font-black italic uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-white/5 ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="text-[10px] font-headline font-black italic uppercase tracking-widest px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/20">
                          {ev.sport}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-headline font-black italic text-xl uppercase tracking-tighter leading-none group-hover:text-sky-400 transition-colors flex-1 mr-4">
                          {ev.name}
                        </h3>
                        <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">
                          {new Date(ev.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {ev.description && (
                        <p className="text-xs text-on-surface-variant/60 font-bold mb-4 line-clamp-2">{ev.description}</p>
                      )}

                      {/* Participant Progress */}
                      <div className="mb-5">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-xs font-headline font-black italic uppercase tracking-widest text-on-surface-variant">Participants</span>
                          <span className="text-xs font-black italic text-sky-400">{ev.registered_count || 0} / {ev.max_participants || 50}</span>
                        </div>
                        <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${regPct >= 100 ? 'bg-red-500' : regPct > 70 ? 'bg-yellow-400' : 'bg-sky-400'}`}
                            style={{ width: `${regPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Expand toggle */}
                      <button className="text-[10px] font-headline font-black uppercase tracking-widest text-sky-400/60 hover:text-sky-400 transition-colors mt-auto flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          {selectedEvent?.id === ev.id ? 'expand_less' : 'expand_more'}
                        </span>
                        {selectedEvent?.id === ev.id ? 'HIDE PARTICIPANTS' : 'VIEW PARTICIPANTS'}
                      </button>
                    </div>

                    {/* Participant List (Expandable) */}
                    {selectedEvent?.id === ev.id && (
                      <div className="border-t border-sky-400/20 bg-surface-container/50">
                        <div className="p-6">
                          <h4 className="text-[10px] font-headline font-black uppercase tracking-widest text-sky-400 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">group</span>
                            Registered Participants ({ev.participants?.length || 0})
                          </h4>
                          {!ev.participants || ev.participants.length === 0 ? (
                            <p className="text-on-surface-variant/40 text-xs italic text-center py-6">No participants registered yet.</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                              {ev.participants.map((p) => (
                                <div key={p.id} className="flex items-center justify-between bg-surface-container-highest/60 rounded-xl px-4 py-3">
                                  <div>
                                    <p className="font-headline font-black italic text-sm uppercase tracking-tight">{p.name}</p>
                                    <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">
                                      {p.roll_number} &nbsp;•&nbsp; {p.branch} Yr.{p.year}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                                      p.payment_status === 'verified' ? 'bg-green-500/20 text-green-400' :
                                      p.payment_status === 'pending'  ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-zinc-500/20 text-zinc-400'
                                    }`}>
                                      {p.payment_status || 'no fee'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
