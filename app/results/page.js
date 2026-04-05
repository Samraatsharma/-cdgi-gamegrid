"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/results').then(r => r.json()).then(d => {
      if (d.success) setResults(d.results);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface-container-lowest min-h-screen font-body">
      <TopNav />
      <div className="pt-28 pb-24 max-w-4xl mx-auto px-8">
        <header className="mb-16 text-center">
          <h1 className="font-headline font-black italic text-5xl md:text-7xl tracking-tighter mb-4">
            Tournament <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Results</span>
          </h1>
          <p className="text-on-surface-variant font-body">Final standings and match outcomes for completed CDGI events.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : results.length === 0 ? (
          <div className="bg-surface-container-high rounded-xl p-12 text-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">emoji_events</span>
            <p className="text-on-surface-variant font-headline italic">No results declared yet. Check back after tournaments complete!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result.id} className="bg-surface-container-high rounded-xl border border-outline-variant/10 overflow-hidden hover:border-primary/20 transition-colors group">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="md:w-2 bg-gradient-to-b from-primary to-secondary flex-shrink-0" />
                  <div className="p-8 flex items-start md:items-center gap-6 flex-1">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-3 items-center mb-2">
                        <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-1 rounded font-headline font-bold uppercase">{result.sport}</span>
                        <span className="text-[10px] bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded font-headline font-bold uppercase">Completed</span>
                      </div>
                      <h2 className="font-headline font-black italic text-2xl tracking-tighter text-on-surface mb-1">{result.event_name}</h2>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                        <span className="font-headline font-bold text-primary">{result.winner}</span>
                      </div>
                      {result.details && <p className="text-on-surface-variant text-sm font-body italic">{result.details}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Link href="/">
            <button className="bg-surface-container-high border border-outline-variant/20 text-on-surface font-headline font-bold italic px-8 py-3 rounded-lg hover:bg-primary hover:text-on-primary transition-all">
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
