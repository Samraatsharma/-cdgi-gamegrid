"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { toast } from 'react-hot-toast';

export default function ManageTrials() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') { router.push('/login'); return; }
    fetch('/api/events').then(r => r.json()).then(d => {
      if (d.success) setEvents(d.events.filter(e => e.status === 'approved'));
    }).finally(() => setLoading(false));
  }, []);

  const fetchTrials = async (eventId) => {
    const res = await fetch(`/api/trials?event_id=${eventId}`);
    const data = await res.json();
    if (data.success) setTrials(data.trials);
  };

  const updateTrial = async (trialId, updates) => {
    const trial = trials.find(t => t.id === trialId);
    const res = await fetch('/api/trials', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...trial, ...updates }) });
    if (res.ok) fetchTrials(selectedEventId);
    else toast.error('Failed to update');
  };

  if (loading) return <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="admin" />
      <main className="ml-20 p-8 lg:p-12">
        <header className="mb-10">
          <h1 className="font-headline italic font-black text-4xl tracking-tighter mb-2">MANAGE <span className="text-primary">TRIALS</span></h1>
          <p className="text-on-surface-variant font-body">Mark attendance and selection status for registered athletes.</p>
        </header>

        <div className="bg-surface-container-high rounded-xl p-8 border border-outline-variant/10 mb-8">
          <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Select Event</label>
          <div className="relative max-w-md">
            <select
              className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 px-4 rounded-lg text-on-surface outline-none font-body appearance-none"
              value={selectedEventId}
              onChange={e => { setSelectedEventId(e.target.value); if (e.target.value) fetchTrials(e.target.value); else setTrials([]); }}
            >
              <option value="">-- Choose Event --</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name} ({e.sport})</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>

        {selectedEventId && (
          <div className="bg-surface-container-high rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">groups</span>
              <h2 className="font-headline font-bold italic text-xl">Registered Students</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container-highest/30">
                    {['Student Name', 'Course', 'Attendance', 'Selection Status'].map(h => (
                      <th key={h} className="text-left py-4 px-6 text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trials.map(trial => (
                    <tr key={trial.id} className="border-b border-outline-variant/5 hover:bg-surface-container-highest/20 transition-colors">
                      <td className="py-4 px-6 font-headline font-bold">{trial.student_name}</td>
                      <td className="py-4 px-6 text-on-surface-variant text-sm">{trial.course}</td>
                      <td className="py-4 px-6">
                        <select
                          value={trial.attendance}
                          onChange={e => updateTrial(trial.id, { attendance: e.target.value })}
                          className="bg-surface-container-highest text-on-surface text-sm rounded px-3 py-2 outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20"
                        >
                          <option value="absent">Absent</option>
                          <option value="present">Present</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={trial.selection_status}
                          onChange={e => updateTrial(trial.id, { selection_status: e.target.value })}
                          className="bg-surface-container-highest text-on-surface text-sm rounded px-3 py-2 outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20"
                        >
                          <option value="pending">Pending</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {trials.length === 0 && (
                    <tr><td colSpan={4} className="py-12 text-center text-on-surface-variant font-headline italic">No students registered for this event yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
