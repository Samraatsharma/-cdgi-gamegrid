"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '../../../components/TopNav';
import Footer from '../../../components/Footer';
import { toast } from 'react-hot-toast';

export default function EventDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      if (parsed.role === 'student') {
        fetch(`/api/registrations?student_id=${parsed.id}`).then(r => r.json()).then(d => {
          if (d.success) setHasApplied(d.registrations.some(r => r.event_id === parseInt(id)));
        });
      }
    }
    fetch(`/api/events/${id}`).then(r => r.json()).then(d => {
      if (d.success) setEvent(d.event);
      else router.push('/events');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!user) { router.push('/login'); return; }
    if (user.role === 'admin') return;
    setApplying(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id, event_id: parseInt(id) }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Registered successfully!'); setHasApplied(true); }
      else toast.error(data.error);
    } catch { toast.error('Error'); }
    finally { setApplying(false); }
  };

  if (loading) return <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!event) return null;

  return (
    <div className="bg-surface-container-lowest min-h-screen font-body">
      <TopNav />
      <main className="pt-20 pb-24">
        {/* Hero Banner */}
        <section className="relative w-full h-[600px] flex items-end overflow-hidden group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${event.image_url || 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=2000'}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent" />
          <div className="relative w-full max-w-7xl mx-auto px-8 pb-16">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-primary/10 border border-primary/20 backdrop-blur-md rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-label text-xs uppercase tracking-[0.2em] font-bold">{event.sport} • {event.eligibility}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-black italic tracking-tighter leading-none uppercase">
                <span className="block text-white">{event.name}</span>
              </h1>
              <div className="flex flex-wrap gap-8 mt-6 items-center">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Date</span>
                  <span className="text-xl font-bold font-headline italic">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="w-px h-10 bg-outline-variant/30 hidden md:block" />
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Status</span>
                  <span className={`text-xl font-bold font-headline italic ${event.status === 'approved' ? 'text-primary' : 'text-secondary'}`}>{event.status.toUpperCase()}</span>
                </div>
                <div className="ml-auto">
                  {user?.role !== 'admin' && event.status === 'approved' && (
                    hasApplied ? (
                      <button disabled className="bg-surface-container-highest text-on-surface-variant px-10 py-5 rounded-lg font-headline font-bold italic text-lg opacity-70">
                        ✓ REGISTERED
                      </button>
                    ) : (
                      <button onClick={handleApply} disabled={applying} className="bg-primary text-on-primary px-10 py-5 rounded-lg font-headline font-bold italic text-lg tracking-tight shadow-[0_0_40px_rgba(184,253,55,0.3)] hover:scale-105 hover:shadow-[0_0_60px_rgba(184,253,55,0.5)] transition-all duration-300 active:scale-95 disabled:opacity-50">
                        {applying ? 'REGISTERING...' : 'REGISTER NOW'}
                      </button>
                    )
                  )}
                  {!user && (
                    <Link href="/login">
                      <button className="bg-primary text-on-primary px-10 py-5 rounded-lg font-headline font-bold italic text-lg tracking-tight shadow-[0_0_40px_rgba(184,253,55,0.3)] hover:scale-105 transition-all duration-300">
                        LOGIN TO REGISTER
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Description */}
            <div className="bg-surface-container-high/40 backdrop-blur-xl border border-outline-variant/10 p-8 rounded-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center gap-4 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">description</span>
                <h2 className="font-headline font-bold italic text-2xl uppercase tracking-tight">Event Description</h2>
              </div>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                This event is part of the CDGI elite athletic program. Athletes will compete in a high-intensity circuit designed to test performance, teamwork, and athletic excellence at the collegiate level.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[['Eligibility', event.eligibility], ['Sport', event.sport], ['Format', 'Knockout'], ['Level', 'Varsity']].map(([k, v]) => (
                  <div key={k} className="p-4 bg-surface-container-highest/60 rounded-lg border border-outline-variant/5">
                    <span className="block text-primary font-headline font-bold text-lg italic">{v}</span>
                    <span className="text-on-surface-variant font-label text-[10px] uppercase">{k}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-surface-container-high/40 backdrop-blur-xl border border-outline-variant/10 p-8 rounded-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
              <div className="flex items-center gap-4 mb-6">
                <span className="material-symbols-outlined text-secondary text-3xl">gavel</span>
                <h2 className="font-headline font-bold italic text-2xl uppercase tracking-tight">Rules & Eligibility</h2>
              </div>
              <div className="space-y-6">
                {[['Valid ID Required', 'All participants must carry a valid CDGI student ID and pass pre-event health check.'], ['Official Gear Only', 'Only institution-approved sportswear permitted during official event timing.']].map(([title, desc], i) => (
                  <div key={i}>
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full border border-primary/30 flex items-center justify-center shrink-0 font-headline italic font-bold text-primary">0{i + 1}</div>
                      <div>
                        <h4 className="text-white font-headline font-bold italic text-lg uppercase">{title}</h4>
                        <p className="text-on-surface-variant text-sm mt-1">{desc}</p>
                      </div>
                    </div>
                    {i === 0 && <div className="h-px w-full bg-gradient-to-r from-primary/20 to-transparent mt-6" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface-container-highest border border-outline-variant/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="h-40 bg-surface-container-high relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800" alt="Venue" className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <h3 className="font-headline font-bold italic text-xl uppercase">CDGI Ground</h3>
                </div>
                <p className="text-on-surface-variant text-sm mb-4">Chameli Devi Group of Institutions, Main Campus</p>
              </div>
            </div>

            <div className="p-6 bg-surface-container-high rounded-xl border border-outline-variant/5 flex items-center gap-6">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">groups</span>
              </div>
              <div>
                <span className="block text-on-surface-variant font-label text-xs uppercase tracking-widest">Sport</span>
                <span className="block font-headline font-black text-3xl italic text-white">{event.sport.toUpperCase()}</span>
              </div>
            </div>

            <div className="p-6 bg-surface-container-high rounded-xl border border-outline-variant/5 flex items-center gap-6">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-3xl">calendar_today</span>
              </div>
              <div>
                <span className="block text-on-surface-variant font-label text-xs uppercase tracking-widest">Date</span>
                <span className="block font-headline font-black text-xl italic text-white">{new Date(event.date).toLocaleDateString()}</span>
              </div>
            </div>

            <Link href="/events">
              <button className="w-full py-4 border border-outline-variant/20 text-on-surface font-headline font-bold italic uppercase tracking-wider hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 rounded-xl">
                <span className="material-symbols-outlined text-sm">arrow_back</span> All Events
              </button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
