"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SideNav from '../../../components/SideNav';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  registration_open: { label: 'Open', color: 'bg-primary/20 text-primary', dot: 'bg-primary' },
  upcoming:          { label: 'Upcoming', color: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
  ongoing:           { label: 'Live Now', color: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400' },
  completed:         { label: 'Completed', color: 'bg-zinc-500/20 text-zinc-400', dot: 'bg-zinc-400' },
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const usrStr = localStorage.getItem('user');
    if (!usrStr) { router.push('/login'); return; }
    const usr = JSON.parse(usrStr);
    if (usr.role !== 'student') { router.push('/dashboard/admin'); return; }
    setUser(usr);
    fetchRegistrations(usr.id);
  }, [router]);

  const fetchRegistrations = (studentId) => {
    fetch(`/api/registrations?student_id=${studentId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setRegistrations(d.registrations); })
      .finally(() => setLoading(false));
  };

  const handleCancel = async (reg) => {
    if (!confirm(`Cancel registration for "${reg.event_name}"?`)) return;
    setCancelling(reg.id);
    try {
      const res = await fetch(`/api/registrations?id=${reg.id}&event_id=${reg.event_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Registration cancelled.');
        setRegistrations(prev => prev.filter(r => r.id !== reg.id));
      } else {
        toast.error(data.error || 'Failed to cancel');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setCancelling(null);
    }
  };

  if (!user || loading) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const upcoming = registrations.filter(r => r.status !== 'completed');
  const completed = registrations.filter(r => r.status === 'completed');

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body overflow-x-hidden">
      <SideNav role="student" />
      <main className="ml-24 pt-12 pb-24 px-8 max-w-7xl mx-auto relative">
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

        {/* Dynamic Athlete Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 relative z-10">
          <div className="lg:col-span-8 bg-surface-container-high/60 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-outline-variant/10 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/3 relative h-64 md:h-auto">
                <img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800" alt="Profile" className="w-full h-full object-cover grayscale opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high md:bg-gradient-to-r md:from-transparent md:to-surface-container-high/60" />
                <div className="absolute bottom-6 left-6">
                   <div className="bg-primary text-on-primary px-4 py-2 rounded-xl border border-primary/30 shadow-2xl">
                      <p className="text-[9px] font-headline font-black italic uppercase tracking-widest leading-none mb-1">Matches Won</p>
                      <p className="text-3xl font-headline font-black italic tracking-tighter leading-none">{user.wins || 0} W</p>
                   </div>
                </div>
              </div>

              <div className="md:w-2/3 p-10 flex flex-col justify-center relative">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h1 className="text-5xl md:text-6xl font-headline font-black italic tracking-tighter uppercase leading-none mb-2">{user.name || 'Athlete'}</h1>
                      <p className="text-primary font-headline font-black italic tracking-[0.3em] uppercase text-xs">{user.roll_number || 'IDENT-PENDING'}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant mb-1">Status</p>
                      <p className="text-secondary font-headline font-black italic uppercase tracking-widest text-sm">ACTIVE ATHLETE</p>
                   </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 border-y border-outline-variant/5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">school</span>
                    <p className="text-on-surface-variant font-headline font-bold uppercase tracking-widest text-[10px]">{user.branch}</p>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-outline-variant/30" />
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">calendar_today</span>
                    <p className="text-on-surface-variant font-headline font-bold uppercase tracking-widest text-[10px]">Year {user.year} • Sec {user.section || 'N/A'}</p>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-outline-variant/30" />
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">phone</span>
                    <p className="text-on-surface-variant font-headline font-bold uppercase tracking-widest text-[10px]">{user.phone || 'NO-CONTACT'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    ['Total Registrations', registrations.length, 'text-primary'],
                    ['Upcoming Events', upcoming.length, 'text-secondary'],
                    ['Total Wins', user.wins || 0, 'text-yellow-500'],
                  ].map(([label, val, cls]) => (
                    <div key={label} className="bg-surface-container/60 p-4 rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-all group">
                      <span className="block text-on-surface-variant font-headline font-black italic text-[8px] uppercase tracking-widest mb-1 opacity-60">{label}</span>
                      <span className={`font-headline font-black text-3xl italic tracking-tighter ${cls}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tactical Links */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/leaderboard">
               <div className="bg-surface-container-high/60 backdrop-blur-3xl p-6 rounded-[2rem] border border-outline-variant/10 hover:border-yellow-500/40 transition-all cursor-pointer group shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                     <span className="material-symbols-outlined text-yellow-500 text-3xl group-hover:scale-110 transition-transform">emoji_events</span>
                  </div>
                  <h3 className="font-headline font-black italic text-xl uppercase tracking-tighter mb-1">College Leaderboard</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Compare metrics across the campus</p>
               </div>
            </Link>
            
            <Link href="/calendar">
               <div className="bg-surface-container-high/60 backdrop-blur-3xl p-6 rounded-[2rem] border border-outline-variant/10 hover:border-secondary/40 transition-all cursor-pointer group shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                     <span className="material-symbols-outlined text-secondary text-3xl group-hover:rotate-12 transition-transform">calendar_month</span>
                  </div>
                  <h3 className="font-headline font-black italic text-xl uppercase tracking-tighter mb-1">Sports Calendar</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Official sports scheduling</p>
               </div>
            </Link>

            <Link href="/events" className="flex-1">
               <div className="bg-primary p-6 rounded-[2.5rem] hover:scale-[1.02] transition-all cursor-pointer shadow-[0_15px_40px_rgba(184,253,55,0.3)] flex flex-col justify-center items-center text-center">
                  <span className="material-symbols-outlined text-on-primary text-4xl mb-2">add_circle</span>
                  <p className="font-headline font-black italic text-on-primary uppercase tracking-widest text-lg">REGISTER NEW</p>
                  <p className="text-on-primary/60 text-[10px] font-bold uppercase tracking-widest mt-1">Browse and join events</p>
               </div>
            </Link>
          </div>
        </div>

        {/* Registrations List */}
        <div className="mb-12 relative z-10">
           <div className="flex justify-between items-end mb-8">
              <h2 className="font-headline font-black italic text-3xl uppercase tracking-tighter flex items-center gap-4">
                 MY <span className="text-primary italic">REGISTRATIONS</span>
                 <span className="bg-surface-container text-xs font-bold px-3 py-1 rounded-full text-on-surface-variant">{registrations.length}</span>
              </h2>
           </div>

           {loading ? (
             <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
           ) : registrations.length === 0 ? (
             <div className="bg-surface-container/30 p-24 rounded-[3rem] border-2 border-dashed border-outline-variant/20 text-center">
                <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-6">explore_off</span>
                <p className="text-on-surface-variant font-headline italic font-bold text-2xl uppercase opacity-40">No active event registrations.</p>
                <Link href="/events">
                   <button className="mt-8 px-10 py-4 bg-primary text-on-primary font-headline font-black italic rounded-2xl hover:scale-105 transition-all shadow-xl">VIEW ALL EVENTS</button>
                </Link>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {registrations.map((reg) => {
                  const statusCfg = STATUS_CONFIG[reg.status] || STATUS_CONFIG.upcoming;
                  const isCancelling = cancelling === reg.id;
                  return (
                    <article key={reg.id} className="bg-surface-container-high/60 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all flex flex-col shadow-2xl group">
                       <div className="relative h-44 overflow-hidden">
                          <img 
                            src={reg.image_url || 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800'} 
                            alt={reg.event_name}
                            className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high transition-opacity group-hover:opacity-60" />
                          <div className="absolute top-4 left-4">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-headline font-black italic uppercase tracking-widest border border-white/5 shadow-xl ${statusCfg.color}`}>
                                {statusCfg.label}
                             </span>
                          </div>
                       </div>
                                              <div className="p-8 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-4">
                             <span className="text-secondary font-headline font-black italic text-[10px] uppercase tracking-[0.3em]">{reg.sport}</span>
                             <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                               {reg.date === reg.end_date || !reg.end_date ? (
                                 new Date(reg.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                               ) : (
                                 `${new Date(reg.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(reg.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                               )}
                             </span>
                          </div>
                          
                          <h3 className="font-headline font-black italic text-2xl uppercase tracking-tighter mb-4 leading-none group-hover:text-primary transition-colors">{reg.event_name}</h3>
                          
                          <div className="mt-auto pt-6 border-t border-outline-variant/5 flex gap-3">
                             <Link href={`/events/${reg.event_id}`} className="flex-1">
                                <button className="w-full py-3.5 bg-surface-container-highest text-on-surface font-headline font-black italic uppercase text-[10px] tracking-widest rounded-xl hover:border-primary border border-outline-variant/10 transition-all">VIEW DETAILS</button>
                             </Link>
                             {reg.status !== 'completed' && reg.status !== 'ongoing' && (
                               <button 
                                 onClick={() => handleCancel(reg)}
                                 disabled={isCancelling}
                                 className="w-12 h-12 bg-surface-container-low text-error/40 hover:text-error hover:bg-error/10 border border-outline-variant/10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                               >
                                 <span className="material-symbols-outlined text-xl">{isCancelling ? 'progress_activity' : 'delete'}</span>
                               </button>
                             )}
                          </div>
                       </div>
                    </article>
                  );
                })}
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
