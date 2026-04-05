"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { toast } from 'react-hot-toast';

export default function DeclareResults() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [resultData, setResultData] = useState({ winner: '', details: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') { router.push('/login'); return; }
    fetch('/api/events').then(r => r.json()).then(d => {
      if (d.success) setEvents(d.events.filter(e => e.status === 'approved'));
    });
  }, []);

  const handleDeclareResult = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !resultData.winner) { toast.error('Select event and enter winner'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEventId, ...resultData }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Result declared! Event marked completed.');
        setResultData({ winner: '', details: '' });
        setSelectedEventId('');
        const r2 = await fetch('/api/events');
        const d2 = await r2.json();
        if (d2.success) setEvents(d2.events.filter(e => e.status === 'approved'));
      } else toast.error(data.error || 'Failed');
    } catch { toast.error('Error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="admin" />
      <main className="ml-20 p-8 lg:p-12">
        <header className="mb-10">
          <h1 className="font-headline italic font-black text-4xl tracking-tighter mb-2">DECLARE <span className="text-primary">RESULTS</span></h1>
          <p className="text-on-surface-variant font-body">Declare the final result for a completed event. This action marks the event as closed.</p>
        </header>

        <div className="max-w-2xl">
          <div className="bg-surface-container-high rounded-xl p-8 border border-outline-variant/10">
            <form onSubmit={handleDeclareResult} className="space-y-6">
              <div>
                <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Select Event</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 px-4 rounded-lg text-on-surface outline-none font-body appearance-none"
                    value={selectedEventId}
                    onChange={e => setSelectedEventId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Event --</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name} ({ev.sport})</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Winner(s) *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">emoji_events</span>
                  <input
                    type="text"
                    className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 pl-12 pr-4 rounded-lg text-on-surface outline-none font-body"
                    placeholder="e.g. CS Department Vipers, Team Alpha"
                    value={resultData.winner}
                    onChange={e => setResultData({ ...resultData, winner: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Match Details (optional)</label>
                <textarea
                  className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 px-4 rounded-lg text-on-surface outline-none font-body resize-none"
                  rows={3}
                  placeholder="e.g. Won by 24 runs. Man of the Series: Aarav Patel."
                  value={resultData.details}
                  onChange={e => setResultData({ ...resultData, details: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-on-primary font-headline font-black italic uppercase py-4 rounded-lg shadow-[0_0_25px_rgba(184,253,55,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                {submitting ? 'SUBMITTING...' : 'DECLARE FINAL RESULT'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
