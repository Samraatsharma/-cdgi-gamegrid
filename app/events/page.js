"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';
import { toast } from 'react-hot-toast';

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sportFilter = searchParams?.get('sport');
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [sport, setSport] = useState(sportFilter || '');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      if (parsed.role === 'student') {
        fetch(`/api/registrations?student_id=${parsed.id}`).then(r => r.json()).then(d => { if (d.success) setRegistrations(d.registrations); });
      }
    }
    fetch('/api/events').then(r => r.json()).then(d => {
      if (d.success) { setAllEvents(d.events); setEvents(d.events.filter(e => e.status !== 'completed')); }
    }).finally(() => setLoading(false));
  }, []);

  const filtered = sport ? events.filter(e => e.sport.toLowerCase() === sport.toLowerCase()) : events;

  const handleApply = async (eventId) => {
    if (!user || user.role !== 'student') { router.push('/login'); return; }
    try {
      const res = await fetch('/api/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_id: user.id, event_id: eventId }) });
      const data = await res.json();
      if (data.success) { toast.success('Applied successfully!'); setRegistrations([...registrations, { event_id: eventId }]); }
      else toast.error(data.error);
    } catch { toast.error('Error applying'); }
  };

  const SPORTS = ['', 'Cricket', 'Football', 'Basketball', 'Volleyball'];

  return (
    <div className="bg-surface-container-lowest min-h-screen font-body">
      <TopNav activeTab="Schedule" />
      <div className="pt-20 pl-0 max-w-[1600px] mx-auto px-8 py-12">
        {/* Header */}
        <header className="mb-16 relative">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />
          <h1 className="font-headline text-6xl md:text-8xl italic font-black tracking-tighter leading-none mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-dim">
              {sport ? `${sport} Events` : 'Upcoming Competitions'}
            </span>
          </h1>
          <p className="font-body text-on-surface-variant text-lg max-w-2xl">
            Elite-level tournaments at CDGI. Secure your spot in the arena.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 sticky top-28 bg-surface-variant/40 backdrop-blur-2xl rounded-xl p-8 border border-outline-variant/15 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary">filter_list</span>
              <h2 className="font-headline font-bold italic text-xl uppercase tracking-wider">Circuit Filters</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">sports_basketball</span> Sport
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-3 px-4 text-on-surface focus:border-primary outline-none appearance-none font-body text-sm"
                    value={sport}
                    onChange={e => setSport(e.target.value)}
                  >
                    {SPORTS.map(s => <option key={s} value={s}>{s || 'All Disciplines'}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>
              <button onClick={() => setSport('')} className="w-full bg-surface-container-high border border-primary/20 text-primary font-headline font-bold italic py-3 mt-4 hover:bg-primary hover:text-on-primary transition-all duration-300">
                RESET FILTERS
              </button>
            </div>
          </aside>

          {/* Event Grid */}
          <section className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full p-12 text-center text-on-surface-variant font-headline italic">No tournaments available for {sport || 'any sport'} right now.</div>
            ) : filtered.map((ev, idx) => {
              const hasApplied = registrations.some(r => r.event_id === ev.id);
              return (
                <article key={ev.id} className="group relative transition-transform duration-300 ease-out hover:scale-[1.02]">
                  <div className="bg-surface-container-high rounded-sm overflow-hidden flex flex-col h-full border border-outline-variant/10 hover:border-primary/30 transition-colors shadow-2xl">
                    <div className="relative h-64 overflow-hidden">
                      <img src={ev.image_url || 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={ev.name} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800' }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="bg-primary text-on-primary font-headline font-bold text-[10px] uppercase px-3 py-1 italic tracking-widest flex items-center gap-1 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-on-primary animate-pulse" />Active Session
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 relative">
                      <div className={`absolute -top-4 left-6 w-12 h-1 ${idx % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`} />
                      <span className={`font-headline ${idx % 2 === 0 ? 'text-secondary' : 'text-primary'} text-xs font-bold uppercase tracking-[0.2em] mb-1`}>{ev.sport} Series</span>
                      <h3 className="font-headline text-2xl font-black italic tracking-tighter text-on-surface mb-4">{ev.name}</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-on-surface-variant text-lg">calendar_today</span>
                          <span className="font-body text-xs text-on-surface-variant">{new Date(ev.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-on-surface-variant text-lg">verified_user</span>
                          <span className="font-body text-xs text-on-surface-variant">{ev.eligibility}</span>
                        </div>
                      </div>
                      <div className="mt-auto flex gap-3">
                        <Link href={`/events/${ev.id}`} className="flex-1">
                          <button className="w-full bg-surface-container-highest text-on-surface font-headline font-black italic py-3 rounded-sm border border-outline-variant/20 hover:border-secondary text-sm">
                            DETAILS
                          </button>
                        </Link>
                        {user?.role !== 'admin' && (
                          hasApplied ? (
                            <button disabled className="flex-1 bg-surface-container-highest text-on-surface-variant font-headline font-black italic py-3 rounded-sm text-sm opacity-60">
                              ✓ APPLIED
                            </button>
                          ) : (
                            <button onClick={() => handleApply(ev.id)} className="flex-1 group/btn relative bg-primary text-on-primary font-headline font-black italic py-3 rounded-sm overflow-hidden hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(186,255,57,0.2)]">
                              <span className="relative z-10">REGISTER</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function EventsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-surface-container-lowest flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}><EventsContent /></Suspense>;
}
