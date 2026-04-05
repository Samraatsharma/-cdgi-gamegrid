"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';

const SPORTS_CATEGORIES = [
  { name: 'Cricket', icon: 'sports_cricket', color: 'text-primary', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800' },
  { name: 'Football', icon: 'sports_soccer', color: 'text-secondary', img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800' },
  { name: 'Basketball', icon: 'sports_basketball', color: 'text-orange-500', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800' },
  { name: 'Volleyball', icon: 'sports_volleyball', color: 'text-blue-500', img: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=800' },
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
      // We don't auto-redirect here, as the user might want to see the landing page, 
      // but we'll show "Go to Dashboard" button instead of Login/Signup.
    }

    fetch('/api/events')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setFeaturedEvents(d.events.filter(e => e.status !== 'completed').slice(0, 3));
        }
      });
  }, []);

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body overflow-x-hidden">
      
      {/* Navigation (Landing Specific) */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex justify-between items-center transition-all duration-500 bg-gradient-to-b from-surface-container-lowest via-surface-container-lowest/80 to-transparent backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-black italic tracking-tighter text-primary font-headline">CDGI <span className="text-on-surface">Sports Sphere</span></h1>
        </div>
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <Link href="/dashboard/student">
              <button className="px-6 py-2 bg-primary text-on-primary font-headline font-black italic tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(184,253,55,0.3)]">DASHBOARD</button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs font-headline font-black italic tracking-widest uppercase hover:text-primary transition-colors">LOGIN</Link>
              <Link href="/register">
                <button className="px-6 py-2 bg-primary text-on-primary font-headline font-black italic tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(184,253,55,0.3)]">SIGN UP</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center px-8 md:px-20 overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 scale-105 animate-pulse-slow">
          <img 
            src="https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=2000" 
            alt="Stadium" 
            className="w-full h-full object-cover opacity-60 brightness-50 grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-1 bg-primary/20 border border-primary/30 backdrop-blur-md rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-headline font-bold italic text-xs tracking-widest uppercase">OFFICIAL SPORTS PORTAL</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-headline font-black italic uppercase leading-[0.8] tracking-tighter" style={{ textShadow: '0 0 40px rgba(184,253,55,0.2)' }}>
            MANAGE & <br />
            <span className="text-primary">COMPETE</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-on-surface-variant max-w-2xl font-light tracking-wide leading-relaxed">
            The official platform for CDGI sports management and student participation. Register for upcoming events, track tournament results, and view the global rankings.
          </p>

          <div className="flex flex-wrap gap-6 pt-6">
            <Link href={isLoggedIn ? "/events" : "/register"}>
              <button 
                className="group relative px-10 py-5 bg-primary text-on-primary font-headline font-black italic tracking-widest uppercase text-xl overflow-hidden shadow-[0_15px_40px_rgba(184,253,55,0.3)] hover:scale-105 hover:shadow-[0_20px_50px_rgba(184,253,55,0.5)] transition-all duration-500"
                style={{ transform: 'skewX(-10deg)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative inline-block" style={{ transform: 'skewX(10deg)' }}>GET STARTED</span>
              </button>
            </Link>
            <Link href="/events">
              <button 
                className="px-10 py-5 border-2 border-outline-variant text-on-surface font-headline font-black italic tracking-widest uppercase text-xl hover:bg-surface-container-high transition-all duration-300"
                style={{ transform: 'skewX(-10deg)' }}
              >
                <span className="relative inline-block" style={{ transform: 'skewX(10deg)' }}>VIEW EVENTS</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Floating Ticker */}
        <div className="absolute bottom-10 right-0 w-full overflow-hidden whitespace-nowrap opacity-20 pointer-events-none">
          <div className="inline-block animate-marquee font-headline font-black italic text-8xl uppercase tracking-tighter text-outline-variant">
            CRICKET • FOOTBALL • BASKETBALL • VOLLEYBALL • ATHLETICS • BADMINTON • TABLE TENNIS • 
          </div>
          <div className="inline-block animate-marquee font-headline font-black italic text-8xl uppercase tracking-tighter text-outline-variant">
            CRICKET • FOOTBALL • BASKETBALL • VOLLEYBALL • ATHLETICS • BADMINTON • TABLE TENNIS • 
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="px-8 md:px-20 py-32 bg-surface-container-lowest relative">
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-2">
            <h2 className="text-5xl md:text-7xl font-headline font-black italic tracking-tighter uppercase leading-none">
               ACTIVE <span className="text-primary">EVENTS</span>
            </h2>
            <p className="text-on-surface-variant font-headline font-bold tracking-widest uppercase text-sm">Tournaments currently open for registration</p>
          </div>
          <Link href="/events" className="text-primary font-headline font-black italic uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
            VIEW ALL EVENTS
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredEvents.length > 0 ? (
            featuredEvents.map((ev, i) => (
              <div key={ev.id} className="group relative rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 shadow-xl">
                <div className="h-64 relative overflow-hidden">
                  <img src={ev.image_url} alt={ev.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-primary text-on-primary font-headline font-black italic text-[10px] uppercase tracking-widest rounded-full">OPEN NOW</span>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-2xl font-headline font-black italic uppercase tracking-tight group-hover:text-primary transition-colors">{ev.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-headline font-bold text-on-surface-variant uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">sports</span>{ev.sport}</span>
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">calendar_today</span>{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  <Link href={`/events/${ev.id}`}>
                    <button className="w-full mt-4 py-4 bg-surface-variant text-on-surface font-headline font-black italic tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-all duration-300">DETAILS</button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-3 text-center py-20 bg-surface-container p-12 rounded-2xl border border-dashed border-outline-variant/30">
                <p className="text-on-surface-variant font-headline italic text-2xl">Loading available events...</p>
             </div>
          )}
        </div>
      </section>

      {/* Categories / Explore */}
      <section className="px-8 md:px-20 py-32 relative bg-surface-container-high overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #BAFF39 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="mb-16 text-center space-y-4 relative z-10">
          <h2 className="text-5xl md:text-7xl font-headline font-black italic tracking-tighter uppercase leading-none">EXPLORE <span className="text-secondary">DISCIPLINES</span></h2>
          <p className="text-on-surface-variant font-headline font-bold tracking-widest uppercase text-sm">Official athletic programs at CDGI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {SPORTS_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/events?sport=${cat.name}`} className="group">
              <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10 hover:border-secondary/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <span className={`material-symbols-outlined text-4xl ${cat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                </div>
                <h4 className="text-2xl font-headline font-black italic tracking-widest uppercase mb-2">{cat.name}</h4>
                <span className="text-secondary font-headline font-black italic uppercase text-xs tracking-widest group-hover:translate-x-2 inline-block transition-transform">VIEW CATEGORY →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-8 md:px-20 py-40 relative text-center bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 mask-radial-fade" />
        </div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-6xl md:text-9xl font-headline font-black italic tracking-tighter uppercase text-on-primary leading-none">
            READY TO <br /> COMPETE?
          </h2>
          <p className="text-on-primary/70 max-w-2xl mx-auto text-lg md:text-2xl font-bold italic uppercase tracking-wider">
             Join 500+ CDGI students and manage your sports participation in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            {isLoggedIn ? (
              <Link href="/dashboard/student">
                <button className="px-12 py-5 bg-on-primary text-primary font-headline font-black italic tracking-widest uppercase text-xl hover:scale-105 transition-all shadow-2xl">DASHBOARD</button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <button className="px-12 py-5 bg-on-primary text-primary font-headline font-black italic tracking-widest uppercase text-xl hover:scale-105 transition-all shadow-2xl">CREATE ACCOUNT</button>
                </Link>
                <Link href="/login">
                  <button className="px-12 py-5 border-2 border-on-primary text-on-primary font-headline font-black italic tracking-widest uppercase text-xl hover:bg-on-primary hover:text-primary transition-all duration-300">LOGIN</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 10s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1.05); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .text-outline-variant {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
