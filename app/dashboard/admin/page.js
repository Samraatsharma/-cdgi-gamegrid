"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../components/SideNav';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', sport: 'Cricket', date: '', eligibility: '', image_url: '' });

  useEffect(() => {
    const usrStr = localStorage.getItem('user');
    if (!usrStr) { router.push('/login'); return; }
    const usr = JSON.parse(usrStr);
    if (usr.role !== 'admin') { router.push('/dashboard/student'); return; }
    setUser(usr);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date || !newEvent.eligibility) {
      toast.error('Please fill all required fields'); return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Event created successfully!');
      setShowModal(false);
      setNewEvent({ name: '', sport: 'Cricket', date: '', eligibility: '', image_url: '' });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <SideNav role="admin" />

      <main className="ml-20 min-h-screen p-8 lg:p-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
          <div>
            <h1 className="font-headline italic font-black text-4xl tracking-tighter text-on-surface mb-2">
              PRECISION CONTROL <span className="text-primary">PANEL</span>
            </h1>
            <p className="font-body text-on-surface-variant max-w-md">Real-time oversight for CDGI high-performance athletic programs.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-zinc-500">System Status</p>
              <p className="text-secondary font-bold flex items-center justify-end gap-2">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                OPERATIONAL
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <section className="relative w-full h-[350px] md:h-[420px] rounded-xl overflow-hidden mb-12 shadow-2xl group">
          <img
            src="https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=2000"
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 contrast-125 scale-105 group-hover:scale-100 transition-transform duration-700"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(184,253,55,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,207,252,0.1) 0%, transparent 50%)' }} />
          <div className="relative h-full flex flex-col justify-end p-8 md:p-12 max-w-4xl">
            <div className="inline-flex items-center px-3 py-1 bg-primary text-on-primary font-headline italic font-bold text-xs mb-6 w-fit" style={{ transform: 'skewX(-12deg)' }}>
              <span style={{ transform: 'skewX(12deg)' }}>FEATURED TOURNAMENT</span>
            </div>
            <h2 className="font-headline italic font-black text-4xl md:text-6xl lg:text-8xl tracking-tighter text-on-surface mb-8 leading-[0.9]">
              INTER-COLLEGE<br />
              <span className="text-primary" style={{ textShadow: '0 0 10px rgba(184,253,55,0.5)' }}>CHAMPIONSHIP</span>
            </h2>
            <div className="flex flex-wrap items-center gap-8">
              <button className="bg-primary hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(184,253,55,0.3)] text-on-primary px-8 py-3 font-headline italic font-black text-lg flex items-center gap-3">
                MANAGE REGISTRATIONS
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className="flex gap-8 md:gap-12">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-zinc-400">Total Teams</p>
                  <p className="font-headline italic text-2xl font-bold">128 UNITS</p>
                </div>
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-zinc-400">Prize Pool</p>
                  <p className="font-headline italic text-2xl font-bold text-secondary">$50,000</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Performance Overview */}
          <div className="p-8 rounded-xl relative overflow-hidden group" style={{ background: 'rgba(38,37,40,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
            </div>
            <p className="font-label text-xs uppercase tracking-widest text-zinc-500 mb-2">Performance Overview</p>
            <div className="flex items-baseline gap-2 mb-4">
              <h3 className="font-headline italic font-bold text-5xl">{events.length}</h3>
              <span className="text-primary font-bold text-sm">ACTIVE EVENTS</span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-secondary to-primary w-[75%]" />
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">System-wide athlete engagement has increased by 12% since previous cycle.</p>
          </div>

          {/* Urgent Actions */}
          <div className="p-8 rounded-xl lg:col-span-2" style={{ background: 'rgba(38,37,40,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline italic font-bold text-xl uppercase tracking-widest">Urgent Actions</h3>
              <span className="text-error font-label text-[10px] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-error rounded-full" /> 2 High Priority
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-high p-4 flex items-center gap-4 hover:bg-surface-variant transition-colors cursor-pointer rounded-lg">
                <div className="w-10 h-10 bg-error/10 text-error flex items-center justify-center rounded-lg">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Medical Clearances Pending</p>
                  <p className="text-xs text-on-surface-variant">Athletes requiring review</p>
                </div>
              </div>
              <div className="bg-surface-container-high p-4 flex items-center gap-4 hover:bg-surface-variant transition-colors cursor-pointer rounded-lg">
                <div className="w-10 h-10 bg-secondary/10 text-secondary flex items-center justify-center rounded-lg">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Vendor Payment Approval</p>
                  <p className="text-xs text-on-surface-variant">Logistics: Stage 2 delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Inventory */}
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-headline italic font-black text-3xl tracking-tight uppercase">
            Active Event <span className="text-primary">Inventory</span>
          </h2>
          <div className="flex gap-4">
            <button className="font-label text-[10px] tracking-widest uppercase px-4 py-2 bg-surface-container-high text-on-surface hover:text-primary transition-colors rounded">Filter</button>
            <button className="font-label text-[10px] tracking-widest uppercase px-4 py-2 bg-surface-container-high text-on-surface hover:text-primary transition-colors rounded">Sort</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((ev, i) => (
            <div key={ev.id} className="bg-surface-container-high rounded-xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col border border-outline-variant/10 hover:border-primary/30 group">
              <div className="h-48 relative overflow-hidden">
                <img
                  src={ev.image_url || 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800'}
                  alt={ev.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className={`text-[10px] font-headline font-bold uppercase tracking-widest px-2 py-1 backdrop-blur-md ${i % 2 === 0 ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                    Tier {i + 1}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`text-[9px] font-headline font-bold uppercase px-2 py-1 ${ev.status === 'approved' ? 'bg-primary text-on-primary' : ev.status === 'completed' ? 'bg-zinc-700 text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {ev.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <p className="text-[10px] text-secondary font-headline font-bold uppercase tracking-widest mb-1">{ev.sport}</p>
                <h4 className="font-headline italic font-bold text-xl mb-2">{ev.name}</h4>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-6">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span>{new Date(ev.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>CDGI Ground</span>
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <button
                    className="text-secondary hover:text-primary transition-colors font-headline text-sm uppercase tracking-widest"
                    onClick={() => router.push('/dashboard/admin/trials')}
                  >
                    Manage {'>'}
                  </button>
                  <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">more_horiz</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FAB - Create Event */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary text-on-primary shadow-[0_0_30px_rgba(184,253,55,0.5)] flex items-center justify-center hover:scale-110 transition-all duration-300 group z-50 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="material-symbols-outlined text-3xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <div className="absolute right-20 bg-surface-container-highest text-primary font-headline italic font-bold text-xs py-2 px-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ transform: 'skewX(-10deg)' }}>
          <span style={{ display: 'block', transform: 'skewX(10deg)' }}>CREATE EVENT</span>
        </div>
      </button>

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-outline-variant/20 rounded-xl p-8 w-full max-w-lg shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-t-xl" />
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline font-black italic text-2xl uppercase tracking-tighter">Create <span className="text-primary">Event</span></h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div>
                <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Event Name *</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 px-4 rounded-lg text-on-surface outline-none font-body"
                  placeholder="e.g., Inter-College Cricket Cup"
                  value={newEvent.name}
                  onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Sport *</label>
                  <select
                    className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 px-4 rounded-lg text-on-surface outline-none font-body"
                    value={newEvent.sport}
                    onChange={e => setNewEvent({ ...newEvent, sport: e.target.value })}
                  >
                    {['Cricket', 'Football', 'Basketball', 'Volleyball', 'Athletics'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Date *</label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 px-4 rounded-lg text-on-surface outline-none font-body"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Eligibility *</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 px-4 rounded-lg text-on-surface outline-none font-body"
                  placeholder="e.g., All Undergrads, B.Tech Only"
                  value={newEvent.eligibility}
                  onChange={e => setNewEvent({ ...newEvent, eligibility: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Image URL (optional)</label>
                <input
                  type="url"
                  className="w-full bg-surface-container-highest/50 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-3 px-4 rounded-lg text-on-surface outline-none font-body"
                  placeholder="https://..."
                  value={newEvent.image_url}
                  onChange={e => setNewEvent({ ...newEvent, image_url: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-primary text-on-primary font-headline font-black italic uppercase py-4 rounded-lg shadow-[0_0_25px_rgba(184,253,55,0.3)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                {creating ? 'CREATING...' : 'LAUNCH EVENT'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
