"use client";

import Link from 'next/link';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';

const SPORTS = [
  { name: 'Cricket', label: 'Seasonal', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000' },
  { name: 'Football', label: 'Active League', img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000' },
  { name: 'Basketball', label: 'Championship', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000' },
  { name: 'Volleyball', label: 'Individual', img: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000' },
];

export default function SportsPage() {
  return (
    <div className="bg-surface-container-lowest min-h-screen font-body">
      <TopNav activeTab="Athletes" />

      {/* Hero */}
      <section className="relative h-[400px] flex items-end overflow-hidden">
        <img src="https://images.unsplash.com/photo-1518605368461-1e180dcc1c10?q=80&w=2000" alt="Sports Hub" className="absolute inset-0 w-full h-full object-cover brightness-40 contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent" />
        <div className="relative px-8 md:px-16 pb-16 max-w-4xl">
          <h1 className="font-headline font-black italic text-6xl md:text-8xl tracking-tighter mb-4" style={{ textShadow: '0 0 10px rgba(186,255,57,0.4)' }}>
            CDGI GameGrid <span className="text-primary">Hub</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl">
            Select a sport to view upcoming event fixtures, tournament rules, and registration deadlines.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {SPORTS.map((sp, idx) => (
            <Link key={sp.name} href={`/events?sport=${sp.name}`}>
              <div className="group relative h-[380px] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-500 shadow-2xl">
                <img src={sp.img} alt={sp.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-secondary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className={`text-xs font-headline font-bold uppercase tracking-widest mb-1 ${idx % 2 === 0 ? 'text-primary' : 'text-secondary'}`}>{sp.label}</div>
                  <h3 className="text-2xl font-headline font-black italic uppercase text-on-surface mb-2">{sp.name}</h3>
                  <div className={`flex items-center gap-2 text-xs font-headline font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${idx % 2 === 0 ? 'text-primary' : 'text-secondary'}`}>
                    View Trials <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
