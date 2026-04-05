"use client";

import { useEffect, useState } from 'react';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState('All');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => { if (d.success) setLeaderboard(d.leaderboard); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = leaderboard.filter(s => branchFilter === 'All' || s.branch === branchFilter);
  const topThree = filtered.slice(0, 3);
  const others = filtered.slice(3);

  const BRANCHES = ['All', 'CSE', 'IT', 'ME', 'CE', 'ECE', 'MBA', 'MCA', 'BCA', 'BBA'];

  return (
    <div className="bg-surface-container-lowest min-h-screen font-body text-on-surface">
      <TopNav activeTab="Leaderboard" />
      
      <main className="pt-24 pb-32 px-8 max-w-6xl mx-auto">
        <header className="mb-16 text-center space-y-4">
           <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <p className="text-[10px] font-headline font-black italic uppercase tracking-[0.4em] text-primary">Global Performance Index</p>
           </div>
           <h1 className="text-6xl md:text-8xl font-headline font-black italic tracking-tighter uppercase leading-none">
             THE <span className="text-primary italic">RANKINGS</span>
           </h1>
           <p className="text-on-surface-variant max-w-xl mx-auto font-headline font-black italic uppercase text-xs tracking-widest opacity-60">CDGI Athletic Dominance Node • Indore Hub</p>
        </header>

        {/* Branch Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
           {BRANCHES.map(b => (
             <button
               key={b}
               onClick={() => setBranchFilter(b)}
               className={`px-6 py-2 rounded-full font-headline font-black italic text-[10px] uppercase tracking-widest transition-all border ${branchFilter === b ? 'bg-primary text-on-primary border-primary shadow-xl scale-110' : 'bg-surface-container-high text-on-surface-variant border-outline-variant/10 hover:border-primary/40'}`}
             >
               {b}
             </button>
           ))}
        </div>

        {loading ? (
           <div className="flex justify-center py-40"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
           <div className="text-center py-40 bg-surface-container-high/40 rounded-3xl border-2 border-dashed border-outline-variant/20">
              <p className="font-headline italic font-bold text-2xl uppercase opacity-20">No active rankings in current perimeter.</p>
           </div>
        ) : (
           <div className="space-y-20">
              {/* Podium Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end relative overflow-hidden p-10 bg-surface-container-high/40 rounded-3xl border border-outline-variant/10">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none" />
                 
                 {/* 2nd Place */}
                 {topThree[1] && (
                   <div className="order-2 md:order-1 flex flex-col items-center">
                     <div className="relative group mb-4">
                        <div className="w-32 h-32 rounded-3xl bg-zinc-400 rotate-3 group-hover:rotate-6 transition-transform" />
                        <div className="absolute inset-0 w-32 h-32 bg-surface-container flex items-center justify-center rounded-3xl border-2 border-zinc-400 shadow-2xl">
                           <span className="material-symbols-outlined text-zinc-400 text-5xl">military_tech</span>
                        </div>
                     </div>
                     <h3 className="font-headline font-black italic text-xl uppercase tracking-tighter text-zinc-400">#2 {topThree[1].name}</h3>
                     <p className="text-[10px] font-bold text-on-surface-variant mt-1">{topThree[1].branch} • {topThree[1].wins} WINS</p>
                   </div>
                 )}

                 {/* 1st Place */}
                 {topThree[0] && (
                   <div className="order-1 md:order-2 flex flex-col items-center scale-110 relative z-10">
                      <div className="relative group mb-6 animate-bounce-slow">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-primary rotate-6 group-hover:rotate-12 transition-transform shadow-[0_0_80px_rgba(184,253,55,0.4)]" />
                        <div className="absolute inset-0 w-40 h-40 bg-surface-container flex items-center justify-center rounded-[2.5rem] border-4 border-primary shadow-2xl overflow-hidden">
                           <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                           <span className="material-symbols-outlined text-primary text-6xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                        </div>
                     </div>
                     <h3 className="font-headline font-black italic text-3xl uppercase tracking-tighter text-primary">#1 {topThree[0].name}</h3>
                     <p className="text-xs font-black italic text-on-surface uppercase tracking-[0.2em] mt-1">{topThree[0].branch} • ALPHA RANK</p>
                     <div className="flex items-center gap-2 mt-4 bg-primary/20 px-4 py-1.5 rounded-full border border-primary/30">
                        <span className="material-symbols-outlined text-primary text-sm">stars</span>
                        <span className="text-[10px] font-headline font-black italic text-primary uppercase tracking-widest">{topThree[0].wins} RECORD WINS</span>
                     </div>
                   </div>
                 )}

                 {/* 3rd Place */}
                 {topThree[2] && (
                   <div className="order-3 flex flex-col items-center">
                     <div className="relative group mb-4">
                        <div className="w-28 h-28 rounded-3xl bg-secondary -rotate-3 group-hover:-rotate-6 transition-transform" />
                        <div className="absolute inset-0 w-28 h-28 bg-surface-container flex items-center justify-center rounded-3xl border-2 border-secondary shadow-2xl">
                           <span className="material-symbols-outlined text-secondary text-4xl">workspace_premium</span>
                        </div>
                     </div>
                     <h3 className="font-headline font-black italic text-lg uppercase tracking-tighter text-secondary">#3 {topThree[2].name}</h3>
                     <p className="text-[10px] font-bold text-on-surface-variant mt-1">{topThree[2].branch} • {topThree[2].wins} WINS</p>
                   </div>
                 )}
              </div>

              {/* Main List Table */}
              <div className="bg-surface-container-high/40 backdrop-blur-2xl rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-2xl">
                 <table className="w-full text-left font-headline">
                    <thead>
                       <tr className="bg-surface-container-highest/60 border-b border-outline-variant/10">
                          <th className="px-8 py-6 text-[10px] font-black italic uppercase tracking-[0.3em] text-on-surface-variant opacity-60">VECTOR / RANK</th>
                          <th className="px-8 py-6 text-[10px] font-black italic uppercase tracking-[0.3em] text-on-surface-variant opacity-60">IDENTIFIER</th>
                          <th className="px-8 py-6 text-[10px] font-black italic uppercase tracking-[0.3em] text-on-surface-variant opacity-60">BRANCH MAP</th>
                          <th className="px-8 py-6 text-[10px] font-black italic uppercase tracking-[0.3em] text-on-surface-variant opacity-60 text-right">METRICS (W/R)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                       {others.map((s, i) => (
                         <tr key={s.id} className="hover:bg-primary/5 transition-colors group">
                           <td className="px-8 py-6">
                              <span className="text-xl font-black italic tracking-tighter group-hover:text-primary transition-colors">#{i + 4}</span>
                           </td>
                           <td className="px-8 py-6">
                              <div>
                                 <p className="font-black italic text-lg uppercase tracking-tight">{s.name}</p>
                                 <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Candidate-S-0{s.id}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-black italic uppercase text-secondary border border-secondary/20">{s.branch}</span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex flex-col items-end">
                                 <span className="font-black italic text-xl text-primary">{s.wins} W</span>
                                 <span className="text-[9px] font-black italic text-on-surface-variant tracking-widest">{s.registrations} RECRUITMENTS</span>
                              </div>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
         @keyframes bounce-slow {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-15px); }
         }
         .animate-bounce-slow {
           animation: bounce-slow 4s ease-in-out infinite;
         }
      `}</style>
    </div>
  );
}
