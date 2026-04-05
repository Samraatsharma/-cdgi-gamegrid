"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';

export default function Logistics() {
  const router = useRouter();
  const [logistics, setLogistics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') { router.push('/login'); return; }
    fetchLogistics();
  }, []);

  const fetchLogistics = async () => {
    const res = await fetch('/api/logistics');
    const data = await res.json();
    if (data.success) setLogistics(data.logistics);
    setLoading(false);
  };

  const assignGround = async (eventId, groundName) => {
    await fetch('/api/logistics', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_id: eventId, ground: groundName }) });
  };

  if (loading) return <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="admin" />
      <main className="ml-20 p-8 lg:p-12">
        <header className="mb-10">
          <h1 className="font-headline italic font-black text-4xl tracking-tighter mb-2">EVENT <span className="text-primary">LOGISTICS</span></h1>
          <p className="text-on-surface-variant font-body">Auto-calculated resource requirements for all active events.</p>
        </header>

        <div className="bg-surface-container-high rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            <h2 className="font-headline font-bold italic text-xl">Resource Allocation</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-highest/30">
                  {['Event Name', 'Sport', 'Registrations', 'Hostel Rooms', 'Food Packets', 'Ground'].map(h => (
                    <th key={h} className="text-left py-4 px-6 text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logistics.map(l => (
                  <tr key={l.id} className="border-b border-outline-variant/5 hover:bg-surface-container-highest/20 transition-colors">
                    <td className="py-4 px-6 font-headline font-bold">{l.event_name}</td>
                    <td className="py-4 px-6"><span className="text-[10px] font-headline font-bold uppercase px-2 py-1 bg-primary/10 text-primary rounded">{l.sport}</span></td>
                    <td className="py-4 px-6 font-headline font-bold text-primary">{l.total_students}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{l.rooms} rooms</td>
                    <td className="py-4 px-6 text-on-surface-variant">{l.food_required} packets</td>
                    <td className="py-4 px-6">
                      <input
                        type="text"
                        defaultValue={l.ground || ''}
                        placeholder="Assign ground..."
                        onBlur={e => assignGround(l.event_id, e.target.value)}
                        className="bg-surface-container-highest text-on-surface text-sm rounded px-3 py-2 outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20 w-40"
                      />
                    </td>
                  </tr>
                ))}
                {logistics.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant font-headline italic">No logistics data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
