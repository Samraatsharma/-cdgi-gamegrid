"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

const SPORTS = [
  { name: 'Cricket', label: 'Seasonal', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800' },
  { name: 'Football', label: 'Active League', img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800' },
  { name: 'Basketball', label: 'Championship', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800' },
  { name: 'Volleyball', label: 'Individual', img: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=800' },
];

const PULSE = [
  { tag: 'News', tagColor: 'text-secondary bg-secondary/20', time: '2h ago', title: 'Basketball Finals relocated to Main Stadium Arena' },
  { tag: 'Update', tagColor: 'text-primary bg-primary/20', time: '5h ago', title: 'Kinetic Velocity registration extended for Athletics' },
  { tag: 'Pro', tagColor: 'text-tertiary bg-tertiary/20', time: '12h ago', title: 'Elite scout visiting CDGI for Cricket tryouts next week' },
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    fetch('/api/events').then(r => r.json()).then(d => {
      if (d.success) setEvents(d.events.filter(e => e.status !== 'completed').slice(0, 3));
    });
  }, []);

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <TopNav activeTab="Live" />

      {/* Hero */}
      <section className="relative h-[760px] w-full overflow-hidden flex items-center px-8 md:px-16 pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=2000"
            alt="Stadium"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-on-primary font-headline font-bold italic text-sm" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            CHAMPIONSHIP SEASON
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-black italic uppercase leading-none tracking-tighter" style={{ textShadow: '0 0 10px rgba(186,255,57,0.4)' }}>
            Inter-College <br />
            <span className="text-primary">Kinetic Velocity</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl font-light tracking-wide">
            The elite collegiate sports hub of Chameli Devi Group. Push your limits, redefine speed, and dominate the arena.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href={user ? '/events' : '/login'}>
              <button className="px-8 py-4 bg-primary text-on-primary font-headline font-bold italic tracking-wider uppercase text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(186,255,57,0.4)]">
                Register Now
              </button>
            </Link>
            <Link href="/events">
              <button className="px-8 py-4 border border-outline-variant text-on-surface font-headline font-bold italic tracking-wider uppercase text-lg transition-all hover:bg-surface-container-high">
                View Schedule
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="px-8 md:px-16 -mt-24 relative z-20 pb-20 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Live Feed + Disciplines */}
        <div className="md:col-span-8 space-y-6">
          {/* Live Scoreboard */}
          <div className="p-8 rounded-xl border border-outline-variant/10 shadow-2xl relative overflow-hidden group" style={{ background: 'rgba(38,37,40,0.6)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[100px] -z-10" />
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-headline font-bold italic uppercase tracking-tighter flex items-center gap-3">
                  <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                  Live Scoreboard
                </h2>
                <p className="text-on-surface-variant font-label text-xs tracking-widest uppercase">Varsity Football League • Quarter Finals</p>
              </div>
              <span className="px-3 py-1 bg-surface-container-highest text-secondary text-[10px] font-headline font-bold uppercase tracking-widest rounded-full">Round 3 of 4</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 py-4">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                </div>
                <span className="font-headline font-bold uppercase tracking-tight text-xl">CDGI Titans</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-6xl md:text-8xl font-headline font-black italic tracking-tighter flex items-center gap-6" style={{ textShadow: '0 0 10px rgba(186,255,57,0.4)' }}>
                  <span>2</span>
                  <span className="text-2xl text-on-surface-variant font-light not-italic">:</span>
                  <span>1</span>
                </div>
                <span className="text-on-surface-variant font-label uppercase text-xs tracking-widest mt-4">74:20 Minute</span>
              </div>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                </div>
                <span className="font-headline font-bold uppercase tracking-tight text-xl">SVC Raiders</span>
              </div>
            </div>
          </div>

          {/* Explore Disciplines */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-headline font-bold italic uppercase tracking-tight">Explore Disciplines</h3>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {SPORTS.map((sp) => (
                <Link key={sp.name} href={`/events?sport=${sp.name}`} className="flex-shrink-0">
                  <div className="w-[260px] h-80 relative group rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-500">
                    <img src={sp.img} alt={sp.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-secondary/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      <div className="text-xs font-headline font-bold uppercase text-secondary tracking-widest mb-1">{sp.label}</div>
                      <h4 className="text-2xl font-headline font-black italic uppercase">{sp.name}</h4>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats + Pulse */}
        <div className="md:col-span-4 space-y-6">
          {/* Performance Stats */}
          <div className="bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-[50px]" />
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-headline font-bold italic uppercase tracking-tighter">Upcoming Events</h3>
              <span className="material-symbols-outlined text-primary">event</span>
            </div>
            <div className="space-y-4">
              {events.length > 0 ? events.map((ev) => (
                <Link href={`/events/${ev.id}`} key={ev.id}>
                  <div className="flex items-center gap-4 p-4 bg-surface-container-highest/40 hover:bg-surface-container-highest transition-colors cursor-pointer rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg">sports</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-sm">{ev.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{ev.sport} • {new Date(ev.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Link>
              )) : (
                <p className="text-on-surface-variant text-sm font-body italic">No upcoming events.</p>
              )}
              <Link href="/events">
                <button className="w-full py-3 bg-surface-variant text-primary font-headline font-bold italic uppercase tracking-widest text-sm hover:bg-primary hover:text-on-primary transition-all rounded-lg mt-2">
                  View All Events
                </button>
              </Link>
            </div>
          </div>

          {/* Pulse Feed */}
          <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border border-outline-variant/10">
            <h3 className="text-sm font-label font-bold uppercase tracking-[0.2em] text-on-surface-variant">Pulse Feed</h3>
            <div className="space-y-3">
              {PULSE.map((item, i) => (
                <div key={i} className="p-4 bg-surface-container-highest/40 hover:bg-surface-container-highest transition-colors cursor-pointer group rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${item.tagColor}`}>{item.tag}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase">{item.time}</span>
                  </div>
                  <h4 className="text-sm font-headline font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
