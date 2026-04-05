"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../components/SideNav';
import { toast } from 'react-hot-toast';

const BLANK_EVENT = { 
  name: '', sport: 'Cricket', date: '', eligibility: '', 
  image_url: '', status: 'registration_open', 
  max_participants: 50, description: '',
  allowed_branches: 'All', allowed_years: 'All'
};

const STATUS_OPTIONS = [
  { value: 'registration_open', label: '🟢 Open for Registration' },
  { value: 'upcoming',          label: '🟡 Upcoming (Registration Not Open)' },
  { value: 'ongoing',           label: '🟠 Ongoing (Event In Progress)' },
  { value: 'completed',         label: '⚫ Completed' },
];

const STATUS_COLORS = {
  registration_open: 'bg-primary/20 text-primary',
  upcoming:          'bg-yellow-500/20 text-yellow-400',
  ongoing:           'bg-orange-500/20 text-orange-400',
  completed:         'bg-zinc-600/30 text-zinc-400',
};

const BRANCHES = ['CSE', 'IT', 'ME', 'CE', 'ECE', 'MBA', 'MCA', 'BCA', 'BBA'];
const ACADEMIC_YEARS = ['1', '2', '3', '4'];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [newEvent, setNewEvent] = useState(BLANK_EVENT);
  const [stats, setStats] = useState(null);
  
  // Winner modal states
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [winnerLoading, setWinnerLoading] = useState(false);
  const [winnerId, setWinnerId] = useState('');
  const [winnerText, setWinnerText] = useState('');
  const [winnerDetails, setWinnerDetails] = useState('');

  useEffect(() => {
    const usrStr = localStorage.getItem('user');
    if (!usrStr) { router.push('/login'); return; }
    const usr = JSON.parse(usrStr);
    if (usr.role !== 'admin') { router.push('/dashboard/student'); return; }
    setUser(usr);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [eventsRes, statsRes] = await Promise.all([fetch('/api/events'), fetch('/api/stats')]);
      const eventsData = await eventsRes.json();
      const statsData = await statsRes.json();
      if (eventsData.success) setEvents(eventsData.events);
      if (statsData.success) setStats(statsData.stats);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEventId(null);
    setNewEvent(BLANK_EVENT);
  };

  const closeWinnerModal = () => {
    setShowWinnerModal(false);
    setSelectedEventId(null);
    setParticipants([]);
    setWinnerId('');
    setWinnerText('');
    setWinnerDetails('');
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!newEvent.name.trim()) return toast.error('Event name is required');
    if (!newEvent.date) return toast.error('Event date is required');
    if (!newEvent.eligibility.trim()) return toast.error('Eligibility description required');
    
    setCreating(true);
    try {
      const method = editingEventId ? 'PATCH' : 'POST';
      const payload = editingEventId ? { ...newEvent, id: editingEventId } : newEvent;
      const res = await fetch('/api/events', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editingEventId ? '✅ Event updated successfully' : '🚀 Event created and eligibility finalized!');
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Event creation failed.');
    } finally {
      setCreating(false);
    }
  };

  const openWinnerModal = async (eventId) => {
    setSelectedEventId(eventId);
    setShowWinnerModal(true);
    setWinnerLoading(true);
    try {
      // Fetch registrations for this event to pick a winner
      const res = await fetch(`/api/registrations/event?event_id=${eventId}`);
      const data = await res.json();
      if (data.success) {
        setParticipants(data.registrations);
      }
    } catch {
      toast.error('Failed to fetch participant tactical data.');
    } finally {
      setWinnerLoading(false);
    }
  };

  const handleDeclareWinner = async (e) => {
    e.preventDefault();
    if (!winnerId && !winnerText) return toast.error('Specify a victor or text identifier');
    
    setWinnerLoading(true);
    try {
      const res = await fetch('/api/events/winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedEventId,
          winner_student_id: winnerId || null,
          winner_text: winnerText,
          details: winnerDetails
        })
      });
      if (res.ok) {
        toast.success('🏆 Winner verified and registered in system.');
        closeWinnerModal();
        fetchData();
      } else {
         throw new Error('Declaration rejected by system.');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWinnerLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event? All student registrations will be removed.')) return;
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Event deleted.'); fetchData(); }
      else toast.error('Failed to delete.');
    } catch { toast.error('Network error.'); }
  };

  const openEdit = (ev) => {
    setNewEvent({
      name: ev.name, sport: ev.sport, date: ev.date,
      eligibility: ev.eligibility, image_url: ev.image_url || '',
      status: ev.status || 'registration_open',
      max_participants: ev.max_participants || 50,
      description: ev.description || '',
      allowed_branches: ev.allowed_branches || 'All',
      allowed_years: ev.allowed_years || 'All'
    });
    setEditingEventId(ev.id);
    setShowModal(true);
  };

  const quickStatusChange = async (ev, newStatus) => {
    try {
      const res = await fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ev, id: ev.id, status: newStatus }),
      });
      if (res.ok) { 
        toast.success(`${ev.name} status updated to ${newStatus}`); 
        fetchData(); 
      }
    } catch { toast.error('Status update failure.'); }
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body overflow-x-hidden">
      <SideNav role="admin" />
      <main className="ml-20 min-h-screen p-8 lg:p-12 relative">
        <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
               <p className="text-[10px] font-headline font-black italic uppercase tracking-[0.4em] text-primary">Administrative Portal</p>
            </div>
            <h1 className="font-headline font-black italic text-6xl md:text-7xl tracking-tighter uppercase leading-[0.8] mb-2">
               ADMIN <span className="text-primary italic">DASHBOARD</span>
            </h1>
            <p className="font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest opacity-60">CDGI Sports Sphere Management Hub</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group px-8 py-4 bg-primary text-on-primary font-headline font-black italic rounded-2xl flex items-center gap-3 shadow-[0_15px_40px_rgba(184,253,55,0.3)] hover:scale-105 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            <span className="uppercase tracking-widest text-sm">CREATE NEW EVENT</span>
          </button>
        </header>

        {/* Intelligence Hub Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 relative z-10">
          {[
            { icon: 'group', label: 'Students', value: stats?.athletes ?? '—', color: 'text-primary' },
            { icon: 'event_available', label: 'Active Events', value: events.filter(e => e.status !== 'completed').length, color: 'text-green-400' },
            { icon: 'how_to_reg', label: 'Total Registrations', value: stats?.totalRegistrations || 0, color: 'text-secondary' },
            { icon: 'sports_score', label: 'Most Popular Sport', value: stats?.mostPopularSport || '—', color: 'text-yellow-400' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-surface-container-high/60 backdrop-blur-3xl rounded-3xl p-8 border border-outline-variant/10 shadow-2xl group hover:border-primary/30 transition-all">
              <span className={`material-symbols-outlined text-4xl ${color} mb-4 group-hover:scale-110 transition-transform`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <p className={`font-headline font-black text-3xl italic tracking-tighter ${color}`}>{value}</p>
              <p className="text-on-surface-variant text-[10px] font-headline font-black italic uppercase tracking-[0.2em] mt-2 opacity-60">{label}</p>
            </div>
          ))}
        </section>

        {/* Event Inventory Grid */}
        <div className="mb-10 relative z-10">
           <h2 className="font-headline font-black italic text-3xl uppercase tracking-tighter mb-8 flex items-center gap-4">
              EVENT <span className="text-primary italic">LIST</span>
              <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant">{events.length}</span>
           </h2>

           {events.length === 0 ? (
             <div className="bg-surface-container/40 p-24 rounded-3xl border-2 border-dashed border-outline-variant/20 text-center">
                <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-6">event_busy</span>
                <p className="text-on-surface-variant font-headline italic font-bold text-2xl uppercase opacity-40">No events found.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {events.map((ev) => {
                 const regPct = Math.min(100, Math.round(((ev.registered_count || 0) / (ev.max_participants || 50)) * 100));
                 const statusCfg = STATUS_COLORS[ev.status] || STATUS_COLORS.upcoming;
                 return (
                   <div key={ev.id} className="bg-surface-container-high rounded-3xl overflow-hidden border border-outline-variant/10 flex flex-col shadow-2xl group hover:border-primary/40 transition-all duration-500">
                     <div className="h-52 relative overflow-hidden">
                       <img
                         src={ev.image_url || 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800'}
                         alt={ev.name}
                         className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                         onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=800'; }}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high transition-opacity group-hover:opacity-60" />
                       <div className="absolute top-4 right-4">
                         <span className={`text-[10px] font-headline font-black italic uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-white/5 ${statusCfg}`}>
                           {ev.status.replace('_', ' ')}
                         </span>
                       </div>
                     </div>

                     <div className="p-8 flex flex-col flex-1">
                       <div className="flex justify-between items-start mb-4">
                          <span className="font-headline font-black italic text-xs uppercase tracking-[0.3em] text-secondary">{ev.sport} Hub</span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant">
                             <span className="material-symbols-outlined text-sm">schedule</span>
                             {new Date(ev.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                       </div>
                       
                       <h4 className="font-headline font-black italic text-2xl uppercase tracking-tighter mb-4 leading-none group-hover:text-primary transition-colors line-clamp-1">{ev.name}</h4>
                       
                       <div className="space-y-4 mb-8">
                         <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant">PERSONNEL LOAD</span>
                            <span className="text-xs font-black italic text-primary">{ev.registered_count || 0} / {ev.max_participants || 50}</span>
                         </div>
                         <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/10">
                            <div className={`h-full rounded-full transition-all duration-1000 ${regPct >= 100 ? 'bg-red-500' : regPct > 70 ? 'bg-yellow-400' : 'bg-primary'}`} style={{ width: `${regPct}%` }} />
                         </div>
                       </div>

                       <div className="mt-auto space-y-4">
                          {/* Lifecycle Change */}
                          <div className="relative group/sel">
                            <select
                              value={ev.status}
                              onChange={e => quickStatusChange(ev, e.target.value)}
                              className="w-full bg-surface-container-low border border-outline-variant/10 text-[11px] font-headline font-black italic uppercase tracking-widest py-3 px-4 rounded-xl outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                            >
                              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                          </div>

                          <div className="flex gap-2">
                             {(ev.status === 'ongoing' || ev.status === 'completed') && (
                                <button 
                                  onClick={() => openWinnerModal(ev.id)}
                                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-headline font-black italic text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                   <span className="material-symbols-outlined text-sm">emoji_events</span>
                                   VICTOR
                                </button>
                             )}
                             <button onClick={() => openEdit(ev)} className="w-12 h-12 bg-surface-container-highest border border-outline-variant/10 hover:border-primary/40 rounded-xl flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined text-lg text-on-surface-variant hover:text-primary transition-colors">edit</span>
                             </button>
                             <button onClick={() => handleDelete(ev.id)} className="w-12 h-12 bg-surface-container-highest border border-outline-variant/10 hover:border-error/40 rounded-xl flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined text-lg text-on-surface-variant hover:text-error transition-colors">delete_forever</span>
                             </button>
                          </div>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
        </div>
      </main>

      {/* Main Event Config Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-6 lg:p-12 overflow-y-auto" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-surface-container-high border border-outline-variant/10 rounded-[40px] w-full max-w-4xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
            <div className="p-10 lg:p-16">
              <div className="flex justify-between items-start mb-10">
                <div>
                   <h2 className="font-headline font-black italic text-4xl md:text-5xl uppercase tracking-tighter mb-2">
                     EVENT <span className="text-primary italic">SETUP</span>
                   </h2>
                   <p className="text-[10px] font-headline font-black italic text-on-surface-variant uppercase tracking-[0.4em]">Configuration Protocol: SPORTS-EVENT-SYS-01</p>
                </div>
                <button onClick={closeModal} className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-2 space-y-8">
                      <div className="group">
                        <label className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant mb-3 block group-focus-within:text-primary transition-colors">Event Title</label>
                        <input
                          type="text"
                          className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary py-4 text-2xl font-headline font-black italic text-on-surface outline-none transition-all placeholder:opacity-30"
                          placeholder="E.G. ANNUAL CRICKET TOURNAMENT"
                          value={newEvent.name}
                          onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                         <div className="group">
                           <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Sport Category</label>
                           <select
                             className="w-full bg-surface-container-highest px-4 py-4 rounded-2xl font-headline font-bold text-xs uppercase tracking-widest border border-outline-variant focus:border-primary outline-none transition-all appearance-none"
                             value={newEvent.sport}
                             onChange={e => setNewEvent({ ...newEvent, sport: e.target.value })}
                           >
                             {['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Athletics'].map(s => <option key={s}>{s}</option>)}
                           </select>
                         </div>
                         <div className="group">
                           <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Event Date</label>
                           <input
                             type="date"
                             className="w-full bg-surface-container-highest px-4 py-4 rounded-2xl font-headline font-bold text-xs uppercase tracking-widest border border-outline-variant focus:border-primary outline-none transition-all"
                             value={newEvent.date}
                             onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                             required
                           />
                         </div>
                      </div>

                      <div className="group">
                         <label className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant mb-3 block group-focus-within:text-primary transition-colors">Eligibility Summary (Required)</label>
                         <input
                           type="text"
                           className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary py-3 text-sm font-bold text-on-surface outline-none transition-all"
                           placeholder="E.G. OPEN TO ALL UNDERGRADS"
                           value={newEvent.eligibility}
                           onChange={e => setNewEvent({ ...newEvent, eligibility: e.target.value })}
                           required
                         />
                      </div>
                   </div>

                   <div className="bg-surface-container-low p-8 rounded-[30px] border border-outline-variant/10 space-y-6">
                      <h4 className="text-[10px] font-headline font-black uppercase tracking-widest text-primary mb-2">REGISTRATION RULES</h4>
                      
                      <div className="space-y-4">
                         <div>
                            <p className="text-[9px] font-bold text-on-surface-variant mb-2 uppercase tracking-tight">Allowed Branches</p>
                            <div className="flex flex-wrap gap-2">
                               {['All', ...BRANCHES].map(b => (
                                 <button
                                   key={b} type="button"
                                   onClick={() => {
                                      const current = newEvent.allowed_branches || 'All';
                                      if (b === 'All') { setNewEvent({...newEvent, allowed_branches: 'All'}); return; }
                                      let branches = current === 'All' ? [] : current.split(',');
                                      if (branches.includes(b)) branches = branches.filter(x => x !== b);
                                      else branches.push(b);
                                      setNewEvent({...newEvent, allowed_branches: branches.length === 0 ? 'All' : branches.join(',')});
                                   }}
                                   className={`px-3 py-1 rounded text-[9px] font-black italic uppercase transition-all border ${newEvent.allowed_branches?.includes(b) ? 'bg-primary text-black border-primary' : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'}`}
                                 >
                                   {b}
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div>
                            <p className="text-[9px] font-bold text-on-surface-variant mb-2 uppercase tracking-tight">Allowed Academic Years</p>
                            <div className="flex flex-wrap gap-2">
                               {['All', ...ACADEMIC_YEARS].map(y => (
                                 <button
                                   key={y} type="button"
                                   onClick={() => {
                                      const current = newEvent.allowed_years || 'All';
                                      if (y === 'All') { setNewEvent({...newEvent, allowed_years: 'All'}); return; }
                                      let years = current === 'All' ? [] : current.split(',');
                                      if (years.includes(y)) years = years.filter(x => x !== y);
                                      else years.push(y);
                                      setNewEvent({...newEvent, allowed_years: years.length === 0 ? 'All' : years.join(',')});
                                   }}
                                   className={`px-3 py-1.5 rounded text-[9px] font-black italic uppercase transition-all border ${newEvent.allowed_years?.includes(y) ? 'bg-secondary text-black border-secondary' : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'}`}
                                 >
                                   YR-{y}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-outline-variant/10">
                         <p className="text-[9px] font-bold text-on-surface-variant/40 italic uppercase">{newEvent.allowed_branches === 'All' ? 'OPEN TO ALL DEPARTMENTS' : `RESTRICT TO: ${newEvent.allowed_branches}`}</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant mb-3 block">Event Description</label>
                      <textarea
                        rows={3}
                        className="w-full bg-surface-container-highest p-6 rounded-[30px] border border-outline-variant/10 focus:border-primary outline-none transition-all placeholder:opacity-20 text-sm font-bold text-on-surface-variant"
                        placeholder="Provide details about the event structure and rules..."
                        value={newEvent.description}
                        onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                      />
                   </div>
                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant mb-2 block">Event Status</label>
                            <select
                              className="w-full bg-surface-container-highest px-4 py-4 rounded-2xl font-headline font-bold text-xs uppercase border border-outline-variant focus:border-primary outline-none transition-all"
                              value={newEvent.status}
                              onChange={e => setNewEvent({ ...newEvent, status: e.target.value })}
                            >
                              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant mb-2 block">Participant Limit</label>
                            <input
                              type="number"
                              className="w-full bg-surface-container-highest px-4 py-4 rounded-2xl font-headline font-bold text-xs uppercase border border-outline-variant focus:border-primary outline-none transition-all"
                              value={newEvent.max_participants}
                              onChange={e => setNewEvent({ ...newEvent, max_participants: parseInt(e.target.value) })}
                            />
                         </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant mb-2 block group-focus-within:text-primary transition-colors">Event Image (URL)</label>
                        <input
                          type="url"
                          className="w-full bg-surface-container-highest px-4 py-4 rounded-2xl font-headline font-bold text-xs border border-outline-variant focus:border-primary outline-none transition-all"
                          placeholder="HTTPS://IMAGE-URL.PNG"
                          value={newEvent.image_url}
                          onChange={e => setNewEvent({ ...newEvent, image_url: e.target.value })}
                        />
                      </div>
                   </div>
                </div>

                <div className="pt-6 flex gap-4">
                   <button type="button" onClick={closeModal} className="px-10 py-5 border-2 border-outline-variant text-[11px] font-headline font-black italic uppercase tracking-[0.2em] rounded-2xl hover:bg-surface-container-highest transition-all">CANCEL</button>
                   <button
                     type="submit"
                     disabled={creating}
                     className="flex-1 bg-primary text-on-primary font-headline font-black italic uppercase text-lg tracking-[0.2em] py-5 rounded-2xl shadow-[0_15px_50px_rgba(184,253,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {creating ? <span className="w-6 h-6 border-3 border-on-primary border-t-transparent rounded-full animate-spin" /> : editingEventId ? 'UPDATE EVENT' : 'CREATE EVENT'}
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Victor Declaration Modal */}
      {showWinnerModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[1100] flex items-center justify-center p-6" onClick={e => e.target === e.currentTarget && closeWinnerModal()}>
           <div className="bg-surface-container-high border-2 border-yellow-500/30 rounded-[40px] w-full max-w-2xl shadow-[0_0_100px_rgba(234,179,8,0.2)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-white to-yellow-500 animate-pulse" />
              <div className="p-10 lg:p-14">
                 <div className="text-center mb-10">
                    <span className="material-symbols-outlined text-yellow-500 text-6xl mb-4 animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    <h2 className="font-headline font-black italic text-4xl uppercase tracking-tighter text-white">DECLARE <span className="text-yellow-500">VICTOR</span></h2>
                    <p className="text-[10px] font-headline font-black italic text-on-surface-variant uppercase tracking-[0.3em] mt-2">End-of-Mission Performance Audit</p>
                 </div>

                 <form onSubmit={handleDeclareWinner} className="space-y-8">
                    <div>
                       <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-3 block">Identify Personnel (from Registered)</label>
                       <div className="relative group">
                          {winnerLoading ? (
                             <div className="w-full h-14 bg-surface-container-highest animate-pulse rounded-2xl" />
                          ) : (
                             <select 
                               value={winnerId}
                               onChange={e => setWinnerId(e.target.value)}
                               className="w-full bg-surface-container-highest border-2 border-outline-variant/20 focus:border-yellow-500/50 py-4 px-6 rounded-2xl text-on-surface font-headline font-bold italic uppercase tracking-widest text-xs outline-none transition-all appearance-none"
                             >
                                <option value="">SELECT CANDIDATE</option>
                                {participants.map(p => (
                                   <option key={p.id} value={p.student_id}>{p.name} ({p.roll_number})</option>
                                ))}
                             </select>
                          )}
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="group">
                          <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Collective Designation (Team/Alternative Winner)</label>
                          <input 
                            type="text" 
                            className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-yellow-500 py-3 text-xl font-headline font-black italic text-on-surface outline-none transition-all placeholder:opacity-20"
                            placeholder="E.G. CSE TITANS TEAM"
                            value={winnerText}
                            onChange={e => setWinnerText(e.target.value)}
                          />
                       </div>

                       <div className="group">
                          <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Performance Logs / Citations</label>
                          <textarea 
                            rows={3}
                            className="w-full bg-surface-container-highest p-6 rounded-3xl border border-outline-variant/10 focus:border-yellow-500/30 outline-none transition-all placeholder:opacity-20 text-sm font-bold text-on-surface-variant"
                            placeholder="Detail the metrics of victory..."
                            value={winnerDetails}
                            onChange={e => setWinnerDetails(e.target.value)}
                          />
                       </div>
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-4">
                       <button type="button" onClick={closeWinnerModal} className="py-5 border-2 border-outline-variant text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant rounded-2xl hover:bg-surface-container-highest transition-all">CANCEL</button>
                       <button 
                         type="submit" 
                         disabled={winnerLoading}
                         className="bg-yellow-500 hover:bg-yellow-400 text-black font-headline font-black italic uppercase text-lg tracking-widest py-5 rounded-2xl shadow-[0_15px_40px_rgba(234,179,8,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                          {winnerLoading ? 'SAVING...' : 'SAVE RESULTS'}
                          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
