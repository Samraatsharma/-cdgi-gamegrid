"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { useAuth } from '../../../../lib/auth-context';

const PAYMENT_LABELS = { not_required: 'Free', pending: 'Pending', verified: 'Verified', rejected: 'Rejected', waitlisted: 'Waitlisted' };
const PAYMENT_COLORS = { not_required: 'text-zinc-400', pending: 'text-yellow-400', verified: 'text-green-400', rejected: 'text-red-400', waitlisted: 'text-blue-400' };

export default function AdminInsights() {
  const router = useRouter();
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') { router.push('/login'); return; }
    fetch('/api/admin/insights')
      .then(r => r.json())
      .then(d => { if (d.success) setInsights(d.insights); })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading || !insights) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { totalEvents, totalRegistrations, totalStudents, totalRevenue, avgFillRate, topSports, paymentBreakdown, waitlistCount, recentRegistrations, eventBreakdown, openEvents, completedEvents } = insights;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="admin" />
      <main className="ml-24 pt-12 pb-24 px-8 max-w-7xl mx-auto relative">
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

        <h1 className="font-headline font-black italic text-4xl uppercase tracking-tighter mb-2 relative z-10">
          SYSTEM <span className="text-primary">INSIGHTS</span>
        </h1>
        <p className="text-on-surface-variant text-sm mb-10 relative z-10">Professional analytics overview</p>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10 relative z-10">
          {[
            { label: 'Total Events', value: totalEvents, icon: 'event', color: 'text-primary' },
            { label: 'Students', value: totalStudents, icon: 'people', color: 'text-secondary' },
            { label: 'Registrations', value: totalRegistrations, icon: 'how_to_reg', color: 'text-blue-400' },
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-green-400' },
            { label: 'Fill Rate', value: `${avgFillRate}%`, icon: 'donut_small', color: 'text-yellow-400' },
            { label: 'Waitlisted', value: waitlistCount, icon: 'hourglass_top', color: 'text-orange-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-surface-container-high/60 backdrop-blur-xl rounded-2xl p-5 border border-outline-variant/10 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className={`material-symbols-outlined text-lg ${kpi.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
                <span className="text-[9px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">{kpi.label}</span>
              </div>
              <p className={`font-headline font-black italic text-2xl tracking-tighter ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Top Sports */}
          <div className="bg-surface-container-high/60 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/10 shadow-xl">
            <h3 className="font-headline font-black italic text-lg uppercase tracking-tighter mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              Top Sports
            </h3>
            {topSports.length === 0 ? (
              <p className="text-on-surface-variant text-sm">No registrations yet.</p>
            ) : (
              <div className="space-y-3">
                {topSports.map((s, i) => (
                  <div key={s.sport} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>{i + 1}</span>
                      <span className="font-headline font-bold text-sm">{s.sport}</span>
                    </div>
                    <span className="font-headline font-black italic text-sm text-on-surface-variant">{s.registrations} reg</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Status Breakdown */}
          <div className="bg-surface-container-high/60 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/10 shadow-xl">
            <h3 className="font-headline font-black italic text-lg uppercase tracking-tighter mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
              Payment Status
            </h3>
            <div className="space-y-3">
              {paymentBreakdown.map(p => (
                <div key={p.payment_status} className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${PAYMENT_COLORS[p.payment_status] || 'text-on-surface-variant'}`}>
                    {PAYMENT_LABELS[p.payment_status] || p.payment_status}
                  </span>
                  <span className="font-headline font-black italic text-lg">{p.count}</span>
                </div>
              ))}
              {paymentBreakdown.length === 0 && <p className="text-on-surface-variant text-sm">No data yet.</p>}
            </div>
          </div>

          {/* Event Status */}
          <div className="bg-surface-container-high/60 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/10 shadow-xl">
            <h3 className="font-headline font-black italic text-lg uppercase tracking-tighter mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
              Event Status
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Open for Registration', value: openEvents, color: 'text-primary' },
                { label: 'Completed', value: completedEvents, color: 'text-zinc-400' },
                { label: 'Total Events', value: totalEvents, color: 'text-on-surface' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface-variant">{item.label}</span>
                  <span className={`font-headline font-black italic text-lg ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Fill Rate Breakdown */}
        <div className="mt-8 bg-surface-container-high/60 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/10 shadow-xl relative z-10">
          <h3 className="font-headline font-black italic text-lg uppercase tracking-tighter mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
            Event Fill Rates
          </h3>
          <div className="space-y-4">
            {eventBreakdown.map(ev => {
              const pct = Math.min(100, Math.round((ev.registrations / (ev.max_participants || 50)) * 100));
              return (
                <div key={ev.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-sm truncate max-w-xs">{ev.name}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">{ev.sport}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {ev.waitlisted > 0 && <span className="text-[9px] font-bold text-yellow-400">{ev.waitlisted} waitlisted</span>}
                      <span className="text-[10px] font-headline font-black text-on-surface-variant">{ev.registrations}/{ev.max_participants} ({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct > 75 ? 'bg-yellow-400' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="mt-8 bg-surface-container-high/60 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/10 shadow-xl relative z-10">
          <h3 className="font-headline font-black italic text-lg uppercase tracking-tighter mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            Recent Registrations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[9px] font-headline font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
                  <th className="text-left py-3 pr-4">Student</th>
                  <th className="text-left py-3 pr-4">Event</th>
                  <th className="text-left py-3 pr-4">Payment</th>
                  <th className="text-left py-3 pr-4">Confidence</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map(reg => (
                  <tr key={reg.id} className="border-b border-outline-variant/5 hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-bold">{reg.student_name}</p>
                      <p className="text-[10px] text-on-surface-variant">{reg.branch} • Y{reg.year}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-bold truncate max-w-[200px]">{reg.event_name}</p>
                      <p className="text-[10px] text-on-surface-variant">{reg.sport}</p>
                    </td>
                    <td className={`py-3 pr-4 font-bold ${PAYMENT_COLORS[reg.payment_status] || 'text-on-surface-variant'}`}>
                      {PAYMENT_LABELS[reg.payment_status] || reg.payment_status}
                    </td>
                    <td className="py-3 pr-4">
                      {reg.payment_confidence && reg.payment_confidence !== 'none' ? (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          reg.payment_confidence === 'high' ? 'bg-green-500/10 text-green-400' :
                          reg.payment_confidence === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                        }`}>{reg.payment_confidence}</span>
                      ) : <span className="text-on-surface-variant/30">—</span>}
                    </td>
                    <td className="py-3">
                      {reg.waitlist_position > 0 ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          Waitlist #{reg.waitlist_position}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          Confirmed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
