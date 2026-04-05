"use client";

import { useEffect, useState, Suspense } from 'react';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';
import Link from 'next/link';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function CalendarGrid({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonthDays = new Date(year, month, 0).getDate();
  const prevMonthVisibleDays = Array.from({ length: firstDayOfMonth }, (_, i) => prevMonthDays - firstDayOfMonth + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const totalSlots = 42; // 6 weeks
  const nextMonthVisibleDays = Array.from({ length: totalSlots - prevMonthVisibleDays.length - currentMonthDays.length }, (_, i) => i + 1);

  const getEventsForDate = (d, m, y) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  return (
    <div className="bg-surface-container-high/40 backdrop-blur-3xl rounded-[3rem] border border-outline-variant/10 shadow-2xl overflow-hidden">
      {/* Calendar Header */}
      <div className="p-10 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-highest/30">
         <div className="flex items-center gap-6">
            <button onClick={() => changeMonth(-1)} className="w-12 h-12 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center">
               <span className="material-symbols-outlined text-3xl">chevron_left</span>
            </button>
            <h2 className="text-4xl md:text-5xl font-headline font-black italic uppercase tracking-tighter text-white whitespace-nowrap">
               {MONTHS[month]} <span className="text-primary italic">{year}</span>
            </h2>
            <button onClick={() => changeMonth(1)} className="w-12 h-12 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center">
               <span className="material-symbols-outlined text-3xl">chevron_right</span>
            </button>
         </div>
         <div className="flex gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant">Open</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400" /><span className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant">Upcoming</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-zinc-600" /><span className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant">Past</span></div>
         </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-outline-variant/10">
         {DAYS.map(d => (
           <div key={d} className="py-4 text-center text-[10px] font-headline font-black italic uppercase tracking-[0.3em] text-on-surface-variant opacity-40">
              {d}
           </div>
         ))}
      </div>

      {/* Actual Grid */}
      <div className="grid grid-cols-7">
         {/* Prev Month Days */}
         {prevMonthVisibleDays.map(d => (
           <div key={`prev-${d}`} className="h-40 border-r border-b border-outline-variant/5 bg-surface-container-highest/20 opacity-20 p-4">
              <span className="text-sm font-headline font-black italic">{d}</span>
           </div>
         ))}

         {/* Current Month Days */}
         {currentMonthDays.map(d => {
           const dateEvents = getEventsForDate(d, month, year);
           const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
           
           return (
             <div key={`curr-${d}`} className={`h-40 border-r border-b border-outline-variant/5 group transition-colors hover:bg-primary/5 p-4 relative ${isToday ? 'bg-primary/5' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                   <span className={`text-lg font-headline font-black italic tracking-tighter ${isToday ? 'text-primary' : 'text-on-surface group-hover:text-primary transition-colors'}`}>
                      {String(d).padStart(2, '0')}
                   </span>
                   {isToday && <span className="text-[9px] font-headline font-black italic text-primary uppercase">TODAY</span>}
                </div>
                
                <div className="space-y-1.5 overflow-y-auto max-h-24 no-scrollbar">
                   {dateEvents.map(ev => {
                      const color = ev.status === 'registration_open' ? 'bg-primary border-primary' : ev.status === 'upcoming' ? 'bg-yellow-400 border-yellow-400' : 'bg-zinc-600 border-zinc-600';
                      return (
                        <Link key={ev.id} href={`/events/${ev.id}`}>
                           <div className={`p-1.5 rounded-lg border-l-4 ${color} bg-surface-container-highest hover:translate-x-1 transition-transform cursor-pointer mb-2`}>
                              <p className="text-[9px] font-headline font-black italic uppercase tracking-tighter text-on-surface truncate leading-tight">{ev.name}</p>
                              <div className="flex justify-between items-center mt-0.5">
                                 <span className="text-[7px] font-bold text-on-surface-variant uppercase">{ev.sport}</span>
                                 <span className="text-[7px] font-black italic text-primary uppercase">MAP {'>'}</span>
                              </div>
                           </div>
                        </Link>
                      );
                   })}
                </div>
             </div>
           );
         })}

         {/* Next Month Days */}
         {nextMonthVisibleDays.map(d => (
           <div key={`next-${d}`} className="h-40 border-r border-b border-outline-variant/5 bg-surface-container-highest/20 opacity-20 p-4">
              <span className="text-sm font-headline font-black italic">{d}</span>
           </div>
         ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => { if (d.success) setEvents(d.events); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface-container-lowest min-h-screen font-body text-on-surface overflow-x-hidden">
      <TopNav activeTab="Schedule" />
      
      <main className="pt-24 pb-32 px-8 max-w-7xl mx-auto">
        <header className="mb-16 text-center space-y-4">
           <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              <p className="text-[10px] font-headline font-black italic uppercase tracking-[0.4em] text-secondary">Temporal Logistics Cluster</p>
           </div>
           <h1 className="text-6xl md:text-8xl font-headline font-black italic tracking-tighter uppercase leading-none">
             THE <span className="text-secondary italic">CHRONOS</span>
           </h1>
           <p className="text-on-surface-variant max-w-xl mx-auto font-headline font-black italic uppercase text-xs tracking-widest opacity-60">Master Scheduling Interface • Secure Arena Timeline</p>
        </header>

        {loading ? (
           <div className="flex justify-center py-40"><div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
           <CalendarGrid events={events} />
        )}

        <div className="mt-20 p-10 bg-surface-container-high/40 rounded-[3rem] border border-outline-variant/10 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary/40" />
           <p className="text-on-surface-variant font-headline italic font-bold text-2xl uppercase tracking-tighter mb-4 opacity-40">Ready to synchronize?</p>
           <Link href="/events">
              <button className="px-10 py-4 bg-secondary text-on-secondary font-headline font-black italic uppercase tracking-widest text-sm rounded-2xl hover:scale-105 transition-all shadow-[0_15px_40px_rgba(0,207,252,0.3)]">EXPLORE FULL DIRECTIVE LIST</button>
           </Link>
        </div>
      </main>

      <Footer />
      
      <style jsx global>{`
         .no-scrollbar::-webkit-scrollbar { display: none; }
         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
