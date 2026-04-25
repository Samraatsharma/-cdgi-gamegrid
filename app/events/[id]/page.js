"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '../../../components/TopNav';
import Footer from '../../../components/Footer';
import PaymentQRModal from '../../../components/PaymentQRModal';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../lib/auth-context';

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
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => {
    if (user?.role === 'student') {
      fetch(`/api/registrations?student_id=${user.id}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) setHasApplied(d.registrations.some(r => r.event_id === parseInt(id)));
        });
    }
    fetch(`/api/events/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setEvent(d.event);
        else router.push('/events');
      })
      .finally(() => setLoading(false));
  }, [id, user]);

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

  const initiateApply = () => {
    if (!user) { router.push('/login'); return; }
    if (user.role === 'admin') return;

    const { eligible, reason } = checkEligibility();
    if (!eligible) {
      toast.error(`Ineligible: ${reason}`);
      return;
    }

    if (event.entry_fee > 0) {
      setShowPaymentModal(true);
    } else {
      handleApply();
    }
  };

  // Screenshot state is now managed inside PaymentQRModal

  const handleApply = async (screenshotUrl = null) => {
    if (event.entry_fee > 0 && !screenshotUrl) {
      toast.error('Payment screenshot is required.');
      return;
    }

    setApplying(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id, event_id: parseInt(id), payment_screenshot_url: screenshotUrl }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('🎉 Operative recruitment confirmed! Check your dashboard.');
        setHasApplied(true);
        
        // Add Smart Notification
        const newNotif = { 
          id: Date.now(), 
          title: 'Registration Confirmed', 
          message: `Your registration for ${event?.name} has been verified.`, 
          time: 'Just now', 
          type: 'success' 
        };
        const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
        localStorage.setItem('notifications', JSON.stringify([newNotif, ...notifs]));

        setEvent(prev => ({ ...prev, registered_count: (prev.registered_count || 0) + 1 }));
        setShowPaymentModal(false);
      } else {
        toast.error(data.error || 'Registration failed.');
      }
    } catch {
      toast.error('Network error — please try again.');
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
          REGISTERED
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
      const label = isFull ? 'EVENT FULL' :
        event.status === 'upcoming' ? 'NOT OPEN YET' :
        event.status === 'completed' ? 'EVENT ENDED' : 'CLOSED';
      return (
        <button disabled className="px-12 py-5 rounded-2xl font-headline font-black italic text-lg bg-surface-container-high text-on-surface-variant border border-outline-variant/20 cursor-not-allowed opacity-70">
          {label}
        </button>
      );
    }
    return (
      <button
        onClick={initiateApply}
        disabled={applying}
        className="px-12 py-5 rounded-2xl font-headline font-black italic text-lg bg-primary text-on-primary shadow-[0_15px_50px_rgba(184,253,55,0.4)] hover:scale-105 hover:shadow-[0_20px_60px_rgba(184,253,55,0.6)] transition-all duration-500 active:scale-95 disabled:opacity-60 flex items-center gap-3"
      >
        {applying ? (
          <>
            <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            PROCESSING...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">how_to_reg</span>
            REGISTER NOW
          </>
        )}
      </button>
    );
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen font-body">
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
                  <span className="text-on-surface-variant font-headline font-black italic text-[10px] uppercase tracking-widest opacity-60">EVENT DATE</span>
                  <span className="text-2xl font-black font-headline italic tracking-tighter text-white">
                    {event.date === event.end_date || !event.end_date ? (
                      new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    ) : (
                      `${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(event.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    )}
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
                      <button className="px-12 py-5 rounded-2xl font-headline font-black italic text-lg bg-primary text-on-primary shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                        <span className="material-symbols-outlined">login</span>
                        LOGIN TO REGISTER
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
                <h2 className="font-headline font-black italic text-3xl uppercase tracking-tighter">About the Event</h2>
              </div>
              <p className="text-on-surface-variant text-xl leading-relaxed italic font-medium opacity-80 decoration-primary decoration-2 underline-offset-4 mb-4">
                {event.description || 'This is an official sports event verified by CDGI.'}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 mb-8">
                {[
                  ['Eligibility', event.eligibility, 'school'],
                  ['Category', event.gender_category || 'Open for All', 'wc'],
                  ['Format', event.event_format || 'Knockout', 'format_list_numbered'],
                  ['Slots', event.max_participants, 'group'],
                  ['Fee', event.entry_fee > 0 ? `₹${event.entry_fee}` : 'Free', 'payments'],
                  ['Prize', event.prize_pool || 'Medals & Certs', 'emoji_events'],
                  ['Equip / Gear', event.equipment || 'Standard', 'sports_baseball'],
                  ['Coordinator', event.coordinator_name || 'TBD', 'person'],
                ].map(([k, v, icon], idx) => (
                  <div key={idx} className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:border-primary/40 transition-colors group flex flex-col justify-between">
                    <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors mb-2">{icon}</span>
                    <span className="block text-on-surface font-headline font-black text-xl italic tracking-tighter truncate" title={v}>{v}</span>
                    <span className="text-on-surface-variant font-headline font-bold text-[9px] uppercase tracking-widest block mt-1">{k}</span>
                  </div>
                ))}
              </div>

              {event.rules && (
                <div className="mt-8 p-6 rounded-[20px] bg-secondary/10 border-l-4 border-secondary space-y-2">
                   <h4 className="text-xs font-headline font-black italic uppercase tracking-widest text-secondary flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">gavel</span> Arena Regulations
                   </h4>
                   <p className="text-white text-sm whitespace-pre-line">{event.rules}</p>
                </div>
              )}
            </div>

            {/* Protocol Block */}
            <div className="bg-surface-container-high/40 backdrop-blur-2xl border border-outline-variant/10 p-10 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-secondary text-4xl">security</span>
                <h2 className="font-headline font-black italic text-3xl uppercase tracking-tighter">Participation Guidelines</h2>
              </div>
              <div className="space-y-6">
                {[
                  ['Identity Verification', 'College ID/Roll Number verification required at venue entrance.'],
                  ['Standard Gear', 'Participate only in appropriate sports apparel.'],
                  ['Fair Play', 'Maintain sportsmanship and strictly follow the referee rules.'],
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
              <h3 className="font-headline font-black italic text-lg uppercase tracking-widest text-on-surface-variant/40">VENUE DETAILS</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="material-symbols-outlined text-primary">distance</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">Campus</p>
                      <p className="font-headline font-black italic text-white uppercase tracking-tight">CDGI Campus</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shrink-0">
                      <span className="material-symbols-outlined text-secondary">explore</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">Location</p>
                      <p className="font-headline font-black italic text-white uppercase tracking-tight line-clamp-1">{event.venue || 'To Be Decided'}</p>
                   </div>
                </div>
              </div>
              <SlotBar registered={event.registered_count || 0} max={event.max_participants || 50} />
            </div>

            {/* Profile Check */}
            {user?.role === 'student' && (
               <div className={`p-8 rounded-3xl border-2 ${eligible ? 'bg-primary/5 border-primary/20' : 'bg-error/5 border-error/20'} shadow-2xl`}>
                  <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-4">ELIGIBILITY CHECK</p>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/5">
                        <span className="text-[10px] font-headline font-black italic uppercase tracking-widest opacity-60">YOUR BRANCH</span>
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
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-2 transition-transform">arrow_back</span>
              BACK TO EVENTS
            </button>
          </div>
        </section>
      </main>

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <PaymentQRModal
          event={event}
          onSubmit={(screenshotUrl) => handleApply(screenshotUrl)}
          onClose={() => setShowPaymentModal(false)}
          submitting={applying}
        />
      )}

      <Footer />
    </div>
  );
}
