"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../lib/auth-context';

export default function ManageTeam() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') { router.push('/login'); return; }
    fetch('/api/events').then(r => r.json()).then(d => {
      if (d.success) setEvents(d.events.filter(e => e.status === 'approved'));
    }).finally(() => setLoading(false));
  }, [user]);

  const fetchTeam = async (eventId) => {
    const res = await fetch(`/api/teams?event_id=${eventId}`);
    const data = await res.json();
    if (data.success) setTeam(data.team);
  };

  if (loading) return <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="admin" />
      <main className="ml-20 p-8 lg:p-12">
        <header className="mb-10">
          <h1 className="font-headline italic font-black text-4xl tracking-tighter mb-2">FINAL <span className="text-primary">TEAMS</span></h1>
          <p className="text-on-surface-variant font-body">View selected athletes for each event.</p>
        </header>

        <div className="bg-surface-container-high rounded-xl p-8 border border-outline-variant/10 mb-8">
          <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Select Event</label>
          <div className="relative max-w-md">
            <select
              className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 px-4 rounded-lg text-on-surface outline-none font-body appearance-none"
              value={selectedEventId}
              onChange={e => { setSelectedEventId(e.target.value); if (e.target.value) fetchTeam(e.target.value); else setTeam([]); }}
            >
              <option value="">-- Choose Event --</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name} ({e.sport})</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>

        {selectedEventId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.length === 0 ? (
              <div className="col-span-full bg-surface-container-high rounded-xl p-12 text-center border border-outline-variant/10">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">group_off</span>
                <p className="text-on-surface-variant font-headline italic">No athletes selected yet. Use Manage Trials to select athletes.</p>
              </div>
            ) : team.map((member, i) => (
              <div key={member.id} className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/10 hover:border-primary/30 transition-colors flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-headline font-bold text-primary">#{i + 1}</span>
                </div>
                <div>
                  <p className="font-headline font-bold">{member.student_name}</p>
                  <p className="text-xs text-on-surface-variant font-body">{member.course}</p>
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-headline font-bold uppercase">SELECTED</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
