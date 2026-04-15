"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  registration_open: { label: 'Open', color: 'bg-primary/20 text-primary border-primary/30', dot: 'bg-primary', canRegister: true },
  upcoming:          { label: 'Upcoming', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', canRegister: false },
  ongoing:           { label: 'Live', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-400', canRegister: false },
  completed:         { label: 'Completed', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30', dot: 'bg-zinc-400', canRegister: false },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-headline font-bold uppercase tracking-widest border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'ongoing' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

function SlotBar({ registered, max }) {
  const pct = Math.min(100, Math.round((registered / max) * 100));
  const isFull = registered >= max;
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">Slots</span>
        <span className={`text-[10px] font-headline font-bold ${isFull ? 'text-red-400' : 'text-on-surface-variant'}`}>
          {isFull ? 'FULL' : `${registered} / ${max}`}
        </span>
      </div>
      <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : pct > 75 ? 'bg-yellow-400' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sportFilter = searchParams?.get('sport');

  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [applying, setApplying] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEventToApply, setSelectedEventToApply] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState(sportFilter || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [eligibilityOnly, setEligibilityOnly] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      if (parsed.role === 'student') {
        fetch(`/api/registrations?student_id=${parsed.id}`)
          .then(r => r.json())
          .then(d => { if (d.success) setRegistrations(d.registrations); });
      }
    }
    fetch('/api/events')
      .then(r => r.json())
      .then(d => { if (d.success) setAllEvents(d.events); })
      .finally(() => setLoading(false));
  }, []);

  const checkEligibility = (event) => {
    if (!user || user.role !== 'student') return { eligible: true }; // Admin or Landing visitor

    const branches = event.allowed_branches || 'All';
    const years = event.allowed_years || 'All';

    const branchMatch = branches === 'All' || branches.split(',').includes(user.branch);
    const yearMatch = years === 'All' || years.split(',').includes(user.year.toString());

    if (!branchMatch) return { eligible: false, reason: `Only for ${branches}` };
    if (!yearMatch) return { eligible: false, reason: `Only for Years ${years}` };

    return { eligible: true };
  };

  const initiateApply = (event) => {
    if (!user || user.role !== 'student') { router.push('/login'); return; }
    
    const { eligible, reason } = checkEligibility(event);
    if (!eligible) {
      toast.error(`Ineligible: ${reason}`);
      return;
    }

    if (event.entry_fee > 0) {
      setSelectedEventToApply(event);
      setShowPaymentModal(true);
    } else {
      handleApply(event.id);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = async (eventId, screenshotUrl = null) => {
    if (!user || user.role !== 'student') { router.push('/login'); return; }
    
    const event = allEvents.find(e => e.id === eventId);
    if (event.entry_fee > 0 && !screenshotUrl) {
      toast.error('Payment screenshot is required.');
      return;
    }

    setApplying(eventId);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id, event_id: eventId, payment_screenshot_url: screenshotUrl }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('🎉 Registered successfully!');
        setRegistrations(prev => [...prev, { event_id: eventId }]);
        
        // Add Smart Notification
        const eObj = allEvents.find(e => e.id === eventId);
        const newNotif = { 
          id: Date.now(), 
          title: 'Registration Verified', 
          message: `Successfully registered for ${eObj?.name}. Check your dashboard for details.`, 
          time: 'Just now', 
          type: 'success' 
        };
        const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
        localStorage.setItem('notifications', JSON.stringify([newNotif, ...notifs]));
        
        setAllEvents(prev => prev.map(e => e.id === eventId ? { ...e, registered_count: (e.registered_count || 0) + 1 } : e));
        
        setShowPaymentModal(false);
        setScreenshotPreview(null);
        setSelectedEventToApply(null);
      } else {
        toast.error(data.error || 'Registration failed.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setApplying(null);
    }
  };

  const filtered = allEvents
    .filter(e => {
      const sMatch = !sport || e.sport.toLowerCase() === sport.toLowerCase();
      const stMatch = !statusFilter || e.status === statusFilter;
      const qMatch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.sport.toLowerCase().includes(search.toLowerCase());
      
      let eligibleMatch = true;
      if (eligibilityOnly && user?.role === 'student') {
          eligibleMatch = checkEligibility(e).eligible;
      }

      return sMatch && stMatch && qMatch && eligibleMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.registered_count || 0) - (a.registered_count || 0);
      return b.id - a.id;
    });

  const SPORTS = ['', 'Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Athletics'];

  return (
    <div className="bg-surface-container-lowest min-h-screen font-body">
      <TopNav activeTab="Schedule" />
      <div className="pt-20 max-w-[1600px] mx-auto px-8 py-12">

        <header className="mb-12 relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-center md:text-left">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <h1 className="font-headline text-6xl md:text-8xl italic font-black tracking-tighter leading-[0.8] mb-3">
               BATTLE <span className="text-primary italic">READY</span>
            </h1>
            <p className="font-body text-on-surface-variant text-lg max-w-2xl">
              CDGI Tournament Schedule. Browse and register for upcoming events.
            </p>
          </div>
          {user?.role === 'student' && (
             <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/10 flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                   <span className="material-symbols-outlined text-primary">person</span>
                </div>
                <div>
                   <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">My Profile</p>
                   <p className="font-headline font-black italic text-sm text-primary uppercase">{user.branch} • Year {user.year}</p>
                </div>
             </div>
          )}
        </header>

        <div className="relative mb-8 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for events..."
            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary outline-none font-headline font-bold tracking-widest transition-all shadow-lg"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-80 shrink-0 sticky top-28 bg-surface-container-high/40 backdrop-blur-3xl rounded-2xl p-7 border border-outline-variant/15 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <h2 className="font-headline font-black italic text-xl uppercase tracking-tighter">Event Filters</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">Sport Selection</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 px-4 text-on-surface focus:border-primary outline-none appearance-none font-headline font-bold italic tracking-widest text-xs"
                    value={sport} onChange={e => setSport(e.target.value)}
                  >
                    {SPORTS.map(s => <option key={s} value={s}>{s || 'All Disciplines'}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>

              <div>
                <label className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">Lifecycle Status</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 px-4 text-on-surface focus:border-primary outline-none appearance-none font-headline font-bold italic tracking-widest text-xs"
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Cycles</option>
                    <option value="registration_open">🟢 Registration Open</option>
                    <option value="upcoming">🟡 Upcoming Cycle</option>
                    <option value="ongoing">🟠 Live In Arena</option>
                    <option value="completed">⚫ Cycle Concluded</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>

              {user?.role === 'student' && (
                <label className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 cursor-pointer hover:bg-surface-container-highest transition-all">
                  <input 
                    type="checkbox" 
                    checked={eligibilityOnly} 
                    onChange={e => setEligibilityOnly(e.target.checked)}
                    className="w-5 h-5 rounded border-primary bg-surface-container-highest text-primary"
                  />
                   <div className="flex flex-col">
                      <span className="text-[11px] font-headline font-black italic uppercase tracking-widest text-primary">Smart Eligibility</span>
                      <span className="text-[9px] text-on-surface-variant uppercase font-bold">Only show events I can join</span>
                   </div>
                </label>
              )}

              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setSortBy('latest')} className={`py-3 rounded-xl font-headline font-black italic uppercase text-[10px] tracking-widest transition-all ${sortBy === 'latest' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>Latest</button>
                 <button onClick={() => setSortBy('popular')} className={`py-3 rounded-xl font-headline font-black italic uppercase text-[10px] tracking-widest transition-all ${sortBy === 'popular' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>Popular</button>
              </div>

              <button 
                onClick={() => { setSport(''); setStatusFilter(''); setSearch(''); setSortBy('latest'); setEligibilityOnly(false); }}
                className="w-full bg-surface-container-highest text-on-surface-variant font-headline font-bold italic py-4 rounded-xl hover:bg-error hover:text-white transition-all text-xs uppercase tracking-widest border border-outline-variant/10"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          <section className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-24"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full bg-surface-container/40 rounded-3xl p-24 text-center border-2 border-dashed border-outline-variant/10">
                <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-6">event_busy</span>
                <p className="text-on-surface-variant font-headline italic font-bold text-2xl uppercase tracking-tighter">No Events Found Matching Criteria</p>
              </div>
            ) : filtered.map((ev) => {
              const hasApplied = registrations.some(r => r.event_id === ev.id);
              const isFull = (ev.registered_count || 0) >= ev.max_participants;
              const { eligible, reason } = checkEligibility(ev);
              const isOpen = ev.status === 'registration_open' && !isFull && eligible;
              const isApplying = applying === ev.id;

              return (
                <article key={ev.id} className="group relative">
                  <div className={`bg-surface-container-high rounded-3xl overflow-hidden flex flex-col h-full border ${eligible ? 'border-outline-variant/10 hover:border-primary/40 shadow-xl' : 'border-error/20 opacity-80'} transition-all duration-500`}>
                    <div className="relative h-60 overflow-hidden cursor-pointer" onClick={() => router.push(`/events/${ev.id}`)}>
                      <img
                        src={ev.image_url || 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800'}
                        className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${!eligible ? 'grayscale sepia' : ''}`}
                        alt={ev.name}
                        onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <StatusBadge status={ev.status} />
                        {user?.role === 'student' && !eligible && (
                          <span className="px-3 py-1 bg-error text-white font-headline font-black italic text-[10px] uppercase tracking-widest rounded-full shadow-lg">Ineligible</span>
                        )}
                        {user?.role === 'student' && eligible && (
                          <span className="px-3 py-1 bg-green-500 text-white font-headline font-black italic text-[10px] uppercase tracking-widest rounded-full shadow-lg border border-green-400/30">Eligible</span>
                        )}
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-headline text-secondary text-xs font-black italic uppercase tracking-[0.3em]">{ev.sport}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tournament</span>
                      </div>
                      <h3 onClick={() => router.push(`/events/${ev.id}`)} className="font-headline text-2xl font-black italic tracking-tighter text-on-surface mb-4 line-clamp-2 leading-none cursor-pointer hover:text-primary transition-colors">{ev.name}</h3>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between text-[11px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {ev.date === ev.end_date || !ev.end_date ? (
                              new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            ) : (
                              `${new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(ev.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                            )}
                          </span>
                          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">school</span>{ev.eligibility}</span>
                        </div>
                        {!eligible && (
                           <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-[10px] font-headline font-black italic uppercase tracking-widest text-center mt-2 animate-pulse">
                              RESTRICTED: {reason}
                           </div>
                        )}
                      </div>

                      <SlotBar registered={ev.registered_count || 0} max={ev.max_participants || 50} />

                      <div className="mt-8 pt-6 border-t border-outline-variant/10 flex gap-3">
                        <Link href={`/events/${ev.id}`} className="flex-1">
                          <button className="w-full bg-surface-container-highest text-on-surface font-headline font-black italic py-4 rounded-2xl border border-outline-variant/10 hover:border-secondary transition-all text-xs uppercase tracking-widest">
                            VIEW DETAILS
                          </button>
                        </Link>

                        {user?.role !== 'admin' && (
                          hasApplied ? (
                            <button disabled className="flex-1 bg-primary/10 text-primary font-headline font-black italic py-4 rounded-2xl text-xs border border-primary/30 shadow-inner">
                              REGISTERED
                            </button>
                          ) : isOpen ? (
                            <button
                              onClick={() => initiateApply(ev)}
                              disabled={isApplying}
                              className="flex-1 bg-primary text-on-primary font-headline font-black italic py-4 rounded-2xl text-xs hover:scale-[1.03] transition-all shadow-xl disabled:opacity-60"
                            >
                              {isApplying ? '...' : 'REGISTER'}
                            </button>
                          ) : (
                            <button disabled className="flex-1 bg-surface-container-highest text-on-surface-variant/40 font-headline font-black italic py-4 rounded-2xl text-xs border border-outline-variant/10 cursor-not-allowed uppercase tracking-widest">
                              {isFull ? 'FULL' : !eligible ? 'LOCKED' : 'CLOSED'}
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

      {/* Payment Processing Modal */}
      {showPaymentModal && selectedEventToApply && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-container-high border border-outline-variant/20 rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => { setShowPaymentModal(false); setScreenshotPreview(null); setSelectedEventToApply(null); }}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-2xl font-headline font-black italic uppercase tracking-tighter mb-2">Complete Payment</h3>
            <p className="text-on-surface-variant text-sm mb-6">Entry fee for {selectedEventToApply.name} is <strong className="text-primary">₹{selectedEventToApply.entry_fee}</strong>.</p>
            
            {selectedEventToApply.payment_qrcode ? (
              <div className="mb-6 flex flex-col items-center">
                <img src={selectedEventToApply.payment_qrcode} alt="Payment QR Code" className="w-48 h-48 rounded-xl border-4 border-surface-container-highest mb-2" />
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Scan to Pay</span>
              </div>
            ) : (
              <div className="mb-6 p-6 bg-surface-container-highest rounded-xl text-center border-2 border-dashed border-outline-variant/30">
                <span className="material-symbols-outlined text-4xl mb-2 text-primary/40">qr_code_scanner</span>
                <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">No QR Code Provided</p>
                <p className="text-[10px] text-on-surface-variant/60 mt-1">Contact Coordinator: {selectedEventToApply.coordinator_name} ({selectedEventToApply.coordinator_contact})</p>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-2">Upload Payment Screenshot</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all font-body cursor-pointer"
              />
              {screenshotPreview && (
                <div className="mt-4 relative rounded-xl overflow-hidden border border-outline-variant/20 h-32">
                  <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button 
              onClick={() => handleApply(selectedEventToApply.id, screenshotPreview)}
              disabled={applying === selectedEventToApply.id || !screenshotPreview}
              className="w-full py-4 rounded-xl font-headline font-black italic text-lg bg-primary text-on-primary shadow-[0_10px_30px_rgba(184,253,55,0.3)] hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {applying === selectedEventToApply.id ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">verified</span>}
              {applying === selectedEventToApply.id ? 'PROCESSING...' : 'SUBMIT REGISTRATION'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-container-lowest flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <EventsContent />
    </Suspense>
  );
}
