"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../lib/auth-context';

export default function CoordinatorParticipants() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'coordinator') { router.push('/login'); return; }
    fetch(`/api/coordinator/events?sport=${encodeURIComponent(user.assigned_sport)}`)
      .then(r => r.json())
      .then(d => { if (d.success) setEvents(d.events); })
      .catch(() => toast.error('Failed to load events.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  useEffect(() => {
    if (selectedEventId) {
      const ev = events.find(e => String(e.id) === String(selectedEventId));
      setParticipants(ev?.participants || []);
    } else {
      // Show all participants across all events (deduplicated)
      const all = [];
      const seen = new Set();
      events.forEach(ev => {
        (ev.participants || []).forEach(p => {
          const key = `${p.id}-${ev.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            all.push({ ...p, event_name: ev.name, event_id: ev.id });
          }
        });
      });
      setParticipants(all);
    }
    setSearchTerm('');
  }, [selectedEventId, events]);

  const filtered = participants.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-[10px] font-headline font-black italic uppercase tracking-[0.4em] text-sky-400">Participants</p>
          </div>
          <h1 className="font-headline font-black italic text-5xl uppercase tracking-tighter">
            PARTICIPANT <span className="text-sky-400">LIST</span>
          </h1>
          <p className="text-xs text-on-surface-variant/60 font-bold uppercase tracking-widest mt-2">
            {user.assigned_sport} &mdash; {filtered.length} participants shown
          </p>
        </header>

        {/* Filters */}
        <div className="relative z-10 flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Filter by Event</label>
            <select
              className="w-full bg-surface-container-highest px-4 py-3 rounded-xl outline-none font-bold text-sm border border-outline-variant/10 focus:border-sky-500 transition-all"
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
            >
              <option value="">All Events ({user.assigned_sport})</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Search Participant</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                placeholder="Name, Roll No, Branch..."
                className="w-full bg-surface-container-highest px-4 py-3 pl-12 rounded-xl outline-none font-bold text-sm border border-outline-variant/10 focus:border-sky-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="relative z-10 overflow-x-auto rounded-2xl border border-outline-variant/10">
          <table className="w-full text-left bg-surface-container text-sm">
            <thead className="bg-surface-container-highest text-[10px] font-headline font-black uppercase tracking-widest">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Roll No.</th>
                <th className="p-4">Branch / Year</th>
                <th className="p-4">Phone</th>
                {!selectedEventId && <th className="p-4">Event</th>}
                <th className="p-4">Registered At</th>
                <th className="p-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((p, i) => (
                <tr key={`${p.id}-${i}`} className="hover:bg-surface-container-high transition-colors">
                  <td className="p-4 font-bold font-headline italic text-sky-400">{p.name}</td>
                  <td className="p-4 text-xs font-bold text-on-surface-variant">{p.roll_number || '—'}</td>
                  <td className="p-4 text-xs text-on-surface-variant/70">{p.branch} • Yr. {p.year}</td>
                  <td className="p-4 text-xs text-on-surface-variant/70">{p.phone || '—'}</td>
                  {!selectedEventId && <td className="p-4 text-xs font-bold text-secondary">{p.event_name}</td>}
                  <td className="p-4 text-xs opacity-70">
                    {p.registered_at ? new Date(p.registered_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      p.payment_status === 'verified' ? 'bg-green-500/20 text-green-400' :
                      p.payment_status === 'pending'  ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {p.payment_status || 'no fee'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-12 text-center opacity-40 italic font-bold">No participants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
