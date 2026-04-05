"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../components/SideNav';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const usrStr = localStorage.getItem('user');
    if (!usrStr) { router.push('/login'); return; }
    const usr = JSON.parse(usrStr);
    setUser(usr);
    fetch(`/api/registrations?student_id=${usr.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setRegistrations(d.registrations); });
  }, [router]);

  if (!user) return <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="student" />
      <main className="ml-20 pt-10 pb-12 px-8 max-w-7xl mx-auto">

        {/* Athlete Hero Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 mt-4">
          <div className="lg:col-span-8 bg-surface-container-high rounded-xl overflow-hidden relative border border-outline-variant/10" style={{ boxShadow: '0 0 30px rgba(186,255,57,0.15)' }}>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/3 relative h-64 md:h-auto">
                <img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800" alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high md:bg-gradient-to-r md:from-transparent md:to-surface-container-high" />
              </div>
              <div className="md:w-2/3 p-8 flex flex-col justify-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 backdrop-blur-md rounded-full w-fit mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary font-label text-[10px] uppercase tracking-[0.2em] font-bold">Active Roster</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-black italic tracking-tighter uppercase mb-2">{user.name || 'Athlete'}</h1>
                <p className="text-secondary font-headline font-bold uppercase tracking-widest text-sm mb-6">{user.email}</p>
                <div className="grid grid-cols-3 gap-4">
                  {[['Status', 'CLEARED', 'text-primary'], ['Registered', registrations.length, 'text-on-surface'], ['Tier', 'VARSITY', 'text-secondary']].map(([label, val, cls]) => (
                    <div key={label} className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20 text-center">
                      <span className="block text-on-surface-variant font-label text-[10px] uppercase tracking-widest mb-1">{label}</span>
                      <span className={`font-headline font-bold ${cls}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Panel */}
          <div className="lg:col-span-4 bg-surface-container-high rounded-xl p-8 border border-outline-variant/10 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-headline uppercase tracking-tight font-bold italic text-xl">Performance</h3>
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>
            {[['Conditioning', 94, 'text-primary', 'bg-primary'], ['Event Readiness', 88, 'text-secondary', 'bg-secondary'], ['Velocity Score', 78, 'text-tertiary', 'bg-tertiary']].map(([label, pct, tcls, bcls]) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-label uppercase tracking-widest mb-2">
                  <span>{label}</span><span className={tcls}>{pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full ${bcls}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-zinc-500 text-[10px] font-headline font-bold uppercase tracking-widest">Active Velocity</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-headline font-bold italic text-primary">78.2%</span>
                  <span className="text-primary text-xs font-bold">+12%</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary text-3xl">speed</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-primary w-[78%]" />
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-zinc-500 text-[10px] font-headline font-bold uppercase tracking-widest">Upcoming Session</h4>
                <h3 className="text-xl font-headline font-bold italic text-on-surface">Explosive Power Drills</h3>
              </div>
              <span className="material-symbols-outlined text-secondary text-3xl">timer</span>
            </div>
            <button className="w-full bg-secondary/10 hover:bg-secondary/20 text-secondary py-2 rounded font-headline font-bold text-[10px] uppercase tracking-widest transition-colors mt-4">Check-in Early</button>
          </div>
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-zinc-500 text-[10px] font-headline font-bold uppercase tracking-widest">Recovery Level</h4>
                <span className="text-4xl font-headline font-bold italic">Optimal</span>
              </div>
              <span className="material-symbols-outlined text-tertiary text-3xl">battery_charging_full</span>
            </div>
            <div className="flex gap-1 h-5">
              {[1,2,3,4].map(i => <div key={i} className="flex-1 bg-tertiary rounded-sm" />)}
              <div className="flex-1 bg-tertiary/20 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Registered Events */}
        <h2 className="text-2xl font-headline font-bold italic tracking-tight mb-8 flex items-center gap-3">
          <span className="w-8 h-[2px] bg-primary" />
          Registered Performance Tracks
        </h2>
        {registrations.length === 0 ? (
          <div className="bg-surface-container-high rounded-xl p-12 text-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">event_busy</span>
            <p className="text-on-surface-variant font-headline italic">No events registered yet.</p>
            <button onClick={() => router.push('/events')} className="mt-6 bg-primary text-on-primary font-headline font-bold italic px-8 py-3 rounded-lg hover:scale-105 transition-transform">
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {registrations.map((reg) => (
              <div key={reg.id} className="bg-surface-container-high rounded-xl overflow-hidden group border border-outline-variant/10 hover:border-primary/30 transition-colors" style={{ transform: 'perspective(1000px)', transition: 'transform 0.5s ease' }}>
                <div className="relative h-40 overflow-hidden">
                  <img src={reg.image_url || 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800'} alt={reg.event_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800' }} />
                  <div className="absolute top-4 left-4">
                    <span className={`text-[9px] font-headline font-bold px-2 py-1 uppercase tracking-tighter ${reg.status === 'approved' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                      {reg.status || 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-[10px] text-primary font-headline font-bold uppercase mb-1">{reg.sport}</p>
                  <h3 className="font-headline font-bold text-lg mb-4 line-clamp-1">{reg.event_name || reg.name}</h3>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-zinc-500">
                      <p className="uppercase font-bold tracking-widest">Date</p>
                      <p className="text-on-surface">{reg.date ? new Date(reg.date).toLocaleDateString() : '—'}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/events/${reg.event_id}`)}
                      className="bg-surface-container-highest text-[10px] font-headline font-bold uppercase tracking-widest px-4 py-2 hover:bg-primary hover:text-on-primary transition-all"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
