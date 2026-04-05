"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '../../../components/TopNav';
import Footer from '../../../components/Footer';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  registration_open: { label: '🟢 Open for Registration', color: 'text-primary', bg: 'bg-primary/20 border-primary/30', canRegister: true },
  upcoming:          { label: '🟡 Upcoming Cycle', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', canRegister: false },
  ongoing:           { label: '🟠 Live In Arena', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', canRegister: false },
  completed:         { label: '⚫ Cycle Concluded', color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20', canRegister: false },
};

function SlotBar({ registered, max }) {
  const pct = Math.min(100, Math.round((registered / max) * 100));
  const isFull = registered >= max;
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-on-surface-variant">Capacity Analysis</span>
        <span className={`text-[10px] font-headline font-black italic uppercase tracking-widest ${isFull ? 'text-red-400' : pct > 75 ? 'text-yellow-400' : 'text-primary'}`}>
          {registered} / {max} {isFull ? '— CRITICAL CAPACITY' : 'LOAD TARGET'}
        </span>
      </div>
      <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/10 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : pct > 75 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-primary to-secondary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

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
        fetch(`/api/registrations?student_id=${parsed.id}`)
          .then(r => r.json())
          .then(d => {
            if (d.success) setHasApplied(d.registrations.some(r => r.event_id === parseInt(id)));
          });
      }
    }
    fetch(`/api/events/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setEvent(d.event);
        else router.push('/events');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const checkEligibility = () => {
    if (!user || user.role !== 'student' || !event) return { eligible: true };

    const branches = event.allowed_branches || 'All';
    const years = event.allowed_years || 'All';

    const branchMatch = branches === 'All' || branches.split(',').includes(user.branch);
    const yearMatch = years === 'All' || years.split(',').includes(user.year.toString());

    if (!branchMatch) return { eligible: false, reason: `Exclusive to ${branches} departments.` };
    if (!yearMatch) return { eligible: false, reason: `Exclusive to Academic Years ${years}.` };

    return { eligible: true };
  };

  const handleApply = async () => {
    if (!user) { router.push('/login'); return; }
    if (user.role === 'admin') return;

    const { eligible, reason } = checkEligibility();
    if (!eligible) {
      toast.error(`Ineligible: ${reason}`);
      return;
    }

    setApplying(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id, event_id: parseInt(id) }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('🎉 Operative recruitment confirmed! Check your dashboard.');
        setHasApplied(true);
        
        // Add Smart Notification
        const newNotif = { 
          id: Date.now(), 
          title: 'Recruitment Confirmed', 
          message: `Your position in ${event?.name} has been verified. Check Temporal Chronos for briefing.`, 
          time: 'Just now', 
          type: 'success' 
        };
        const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
        localStorage.setItem('notifications', JSON.stringify([newNotif, ...notifs]));

        setEvent(prev => ({ ...prev, registered_count: (prev.registered_count || 0) + 1 }));
      } else {
        toast.error(data.error || 'Interface initialization failed.');
      }
    } catch {
      toast.error('Network protocol error — retry suggested.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!event) return null;

  const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
  const isFull = (event.registered_count || 0) >= event.max_participants;
  const { eligible, reason } = checkEligibility();
  const canRegister = cfg.canRegister && !isFull && eligible;

  const getRegisterButton = () => {
    if (hasApplied) {
      return (
        <button disabled className="px-12 py-5 rounded-2xl font-headline font-black italic text-lg bg-primary/10 text-primary border border-primary/30 flex items-center gap-3 shadow-inner">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          CONFIRMED
        </button>
      );
    }
    if (!eligible) {
      return (
        <button disabled className="px-12 py-5 rounded-2xl font-headline font-black italic text-lg bg-error/10 text-error border border-error/30 cursor-not-allowed opacity-70 flex items-center gap-3">
          <span className="material-symbols-outlined">lock</span>
          INELIGIBLE
        </button>
      );
    }
    if (!canRegister) {
      const label = isFull ? 'ARENA FULL' :
        event.status === 'upcoming' ? 'CYCLE NOT OPEN' :
        event.status === 'completed' ? 'CYCLE ENDED' : 'CLOSED';
      return (
        <button disabled className="px-12 py-5 rounded-2xl font-headline font-black italic text-lg bg-surface-container-high text-on-surface-variant border border-outline-variant/20 cursor-not-allowed opacity-70">
          {label}
        </button>
      );
    }
    return (
      <button
        onClick={handleApply}
        disabled={applying}
        className="px-12 py-5 rounded-2xl font-headline font-black italic text-lg bg-primary text-on-primary shadow-[0_15px_50px_rgba(184,253,55,0.4)] hover:scale-105 hover:shadow-[0_20px_60px_rgba(184,253,55,0.6)] transition-all duration-500 active:scale-95 disabled:opacity-60 flex items-center gap-3"
      >
        {applying ? (
          <>
            <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            INITIALIZING...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">bolt</span>
            RECRUIT NOW
          </>
        )}
      </button>
    );
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen font-body overflow-x-hidden">
      <TopNav />
      <main className="pt-20 pb-24">
        {/* Cinematic Hero */}
        <section className="relative w-full h-[650px] flex items-end overflow-hidden group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
            style={{ backgroundImage: `url('${event.image_url || 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=2000'}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          
          <div className="relative w-full max-w-7xl mx-auto px-8 pb-20">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-[10px] font-headline font-black italic uppercase tracking-[0.2em] w-fit shadow-lg ${cfg.bg} ${cfg.color}`}>
                  <span className={`w-2 h-2 rounded-full ${event.status === 'registration_open' ? 'bg-primary animate-pulse' : 'bg-current'}`} />
                  {cfg.label}
                </span>
                <span className="inline-flex items-center gap-2 px-5 py-2 bg-secondary/10 border border-secondary/30 rounded-full w-fit shadow-lg">
                   <span className="text-secondary font-headline font-black italic text-[10px] uppercase tracking-[0.2em]">{event.sport}</span>
                </span>
              </div>

              <h1 className="text-6xl md:text-9xl font-headline font-black italic tracking-tight leading-[0.8] uppercase text-white" style={{ textShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                {event.name}
              </h1>

              <div className="flex flex-wrap gap-10 mt-6 items-center">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-headline font-black italic text-[10px] uppercase tracking-widest opacity-60">MISSION DATE</span>
                  <span className="text-2xl font-black font-headline italic tracking-tighter text-white">
                    {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="w-px h-12 bg-white/10 hidden md:block" />
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-headline font-black italic text-[10px] uppercase tracking-widest opacity-60">ARENA STATUS</span>
                  <span className={`text-2xl font-black font-headline italic tracking-tighter ${isFull ? 'text-red-400' : 'text-primary'}`}>
                    {event.registered_count || 0} / {event.max_participants || 50} SLOTS
                  </span>
                </div>
                <div className="ml-auto flex gap-4 items-center scale-110">
                  {user?.role !== 'admin' && getRegisterButton()}
                  {!user && (
                    <Link href="/login">
                      <button className="px-12 py-5 rounded-2xl font-headline font-black italic text-lg bg-primary text-on-primary shadow-2xl hover:scale-105 transition-all">
                        INITIALIZE LOGIN
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence Grid */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-20">
          <div className="lg:col-span-2 flex flex-col gap-12">

            {/* Ineligibility Warning */}
            {user?.role === 'student' && !eligible && (
               <div className="bg-error/10 border-2 border-error/30 p-8 rounded-3xl shadow-2xl flex items-center gap-6 animate-pulse">
                  <div className="h-16 w-16 bg-error/20 rounded-2xl flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-error text-4xl">warning_amber</span>
                  </div>
                  <div>
                     <h2 className="font-headline font-black italic text-2xl uppercase tracking-tighter text-error">RESTRICTED ACCESS</h2>
                     <p className="text-on-surface-variant font-bold uppercase text-xs tracking-wide">{reason}</p>
                  </div>
               </div>
            )}

            {/* Description Block */}
            <div className="bg-surface-container-high/40 backdrop-blur-2xl border border-outline-variant/10 p-10 rounded-3xl shadow-2xl relative">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-primary text-4xl">database</span>
                <h2 className="font-headline font-black italic text-3xl uppercase tracking-tighter">Mission Brief</h2>
              </div>
              <p className="text-on-surface-variant text-xl leading-relaxed italic font-medium opacity-80 decoration-primary decoration-2 underline-offset-4">
                {event.description || 'Global tournament initialization. This event benchmarks top-tier performance against academic cohorts.'}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                {[
                  ['Eligibility', event.eligibility, 'school'],
                  ['Sport', event.sport, 'sports_martial_arts'],
                  ['Format', 'Elite Knockout', 'format_list_numbered'],
                  ['Slots', event.max_participants, 'group']
                ].map(([k, v, icon]) => (
                  <div key={k} className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:border-primary/40 transition-colors group">
                    <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors mb-2">{icon}</span>
                    <span className="block text-on-surface font-headline font-black text-xl italic tracking-tighter">{v}</span>
                    <span className="text-on-surface-variant font-headline font-bold text-[9px] uppercase tracking-widest block mt-1">{k}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol Block */}
            <div className="bg-surface-container-high/40 backdrop-blur-2xl border border-outline-variant/10 p-10 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-secondary text-4xl">security</span>
                <h2 className="font-headline font-black italic text-3xl uppercase tracking-tighter">Engagement Protocol</h2>
              </div>
              <div className="space-y-6">
                {[
                  ['Identity Verification', 'Biometric/Roll Number verification required at arena entrance.'],
                  ['Standard Gear', 'Participate only in standardized CDGI athletic apparel.'],
                  ['Dynamic Ranking', 'Performance here impacts your global Sports Sphere standing.'],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="h-10 w-10 rounded-xl bg-surface-container-highest flex items-center justify-center font-headline font-black italic text-secondary text-lg border border-secondary/20 group-hover:bg-secondary group-hover:text-on-secondary transition-all">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-headline font-black italic text-xl uppercase tracking-tight">{title}</h4>
                      <p className="text-on-surface-variant text-sm mt-1 opacity-70">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Intelligence */}
          <div className="flex flex-col gap-6">
            <div className="p-8 bg-surface-container-high border border-outline-variant/10 rounded-3xl shadow-2xl space-y-6">
              <h3 className="font-headline font-black italic text-lg uppercase tracking-widest text-on-surface-variant/40">LOCATION DATA</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="material-symbols-outlined text-primary">distance</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">Primary Hub</p>
                      <p className="font-headline font-black italic text-white uppercase tracking-tight">Indore Main Arena</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                      <span className="material-symbols-outlined text-secondary">explore</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">Vector</p>
                      <p className="font-headline font-black italic text-white uppercase tracking-tight">Internal Ground A</p>
                   </div>
                </div>
              </div>
              <SlotBar registered={event.registered_count || 0} max={event.max_participants || 50} />
            </div>

            {/* Profile Check */}
            {user?.role === 'student' && (
               <div className={`p-8 rounded-3xl border-2 ${eligible ? 'bg-primary/5 border-primary/20' : 'bg-error/5 border-error/20'} shadow-2xl`}>
                  <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-4">PROFILE COMPATIBILITY</p>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/5">
                        <span className="text-[10px] font-headline font-black italic uppercase tracking-widest opacity-60">BRANCH MAP</span>
                        <span className={`text-[10px] font-headline font-black italic uppercase tracking-widest ${event.allowed_branches === 'All' || event.allowed_branches?.includes(user.branch) ? 'text-primary' : 'text-error'}`}>{user.branch}</span>
                     </div>
                     <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/5">
                        <span className="text-[10px] font-headline font-black italic uppercase tracking-widest opacity-60">ACADEMIC YEAR</span>
                        <span className={`text-[10px] font-headline font-black italic uppercase tracking-widest ${event.allowed_years === 'All' || event.allowed_years?.includes(user.year.toString()) ? 'text-primary' : 'text-error'}`}>YR-{user.year}</span>
                     </div>
                  </div>
               </div>
            )}

            <button 
              onClick={() => router.push('/events')}
              className="w-full py-5 border border-outline-variant/20 text-on-surface font-headline font-black italic uppercase tracking-widest hover:bg-surface-container-high transition-all flex items-center justify-center gap-3 rounded-3xl group"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-2 transition-transform">arrow_selector_tool</span>
              RETURN TO ARENA
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
