"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../lib/auth-context';

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Athletics', 'Table Tennis', 'Kabaddi', 'Kho-Kho', 'Swimming'];

const BLANK = { name: '', email: '', password: '', assigned_sport: 'Cricket' };

export default function AdminCoordinators() {
  const router = useRouter();
  const { user } = useAuth();
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [filterSport, setFilterSport] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') { router.push('/dashboard/student'); return; }
    fetchCoordinators();
  }, [user, router]);

  const fetchCoordinators = async () => {
    try {
      const res = await fetch('/api/coordinators');
      const data = await res.json();
      if (data.success) setCoordinators(data.coordinators);
    } catch {
      toast.error('Failed to load coordinators.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(BLANK);
    setShowPassword(false);
  };

  const openEdit = (coord) => {
    setForm({ name: coord.name, email: coord.email, password: '', assigned_sport: coord.assigned_sport });
    setEditingId(coord.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email.includes('@')) return toast.error('Valid email required');
    if (!editingId && form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const payload = editingId
        ? { ...form, id: editingId, ...(form.password ? {} : { password: undefined }) }
        : form;
      const res = await fetch('/api/coordinators', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');
      toast.success(editingId ? '✅ Coordinator updated!' : '🚀 Coordinator created!');
      closeModal();
      fetchCoordinators();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove coordinator "${name}"? They will lose dashboard access immediately.`)) return;
    try {
      const res = await fetch(`/api/coordinators?id=${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Coordinator removed.'); fetchCoordinators(); }
      else toast.error('Failed to delete.');
    } catch { toast.error('Network error.'); }
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const displayed = filterSport
    ? coordinators.filter(c => c.assigned_sport === filterSport)
    : coordinators;

  // Group by sport
  const bySport = {};
  displayed.forEach(c => {
    if (!bySport[c.assigned_sport]) bySport[c.assigned_sport] = [];
    bySport[c.assigned_sport].push(c);
  });

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="admin" />
      <main className="ml-20 p-8 lg:p-12 relative">
        <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
              <p className="text-[10px] font-headline font-black italic uppercase tracking-[0.4em] text-primary">Administrative Portal</p>
            </div>
            <h1 className="font-headline font-black italic text-5xl md:text-6xl tracking-tighter uppercase leading-tight mt-4 mb-2">
              COORDINATOR <span className="text-primary italic">MANAGEMENT</span>
            </h1>
            <p className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-widest opacity-60">
              Assign & manage sport coordinators
            </p>
          </div>
          <button
            id="btn-create-coordinator"
            onClick={() => setShowModal(true)}
            className="group px-8 py-4 bg-primary text-on-primary font-headline font-black italic rounded-2xl flex items-center gap-3 shadow-[0_15px_40px_rgba(184,253,55,0.3)] hover:scale-105 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
            <span className="uppercase tracking-widest text-sm">ADD COORDINATOR</span>
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
          {[
            { label: 'Total Coordinators', value: coordinators.length, icon: 'manage_accounts', color: 'text-primary' },
            { label: 'Sports Covered',     value: [...new Set(coordinators.map(c => c.assigned_sport))].length, icon: 'sports', color: 'text-secondary' },
            { label: 'Active Sports',      value: SPORTS.length, icon: 'event', color: 'text-yellow-400' },
            { label: 'Unassigned Sports',  value: Math.max(0, SPORTS.length - [...new Set(coordinators.map(c => c.assigned_sport))].length), icon: 'warning', color: 'text-orange-400' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-surface-container-high/60 backdrop-blur-3xl rounded-3xl p-8 border border-outline-variant/10 shadow-2xl group hover:border-primary/30 transition-all">
              <span className={`material-symbols-outlined text-4xl ${color} mb-4 group-hover:scale-110 transition-transform`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <p className={`font-headline font-black text-3xl italic tracking-tighter ${color}`}>{value}</p>
              <p className="text-on-surface-variant text-xs font-headline font-black italic uppercase tracking-widest mt-2 opacity-60">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="relative z-10 flex items-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setFilterSport('')}
            className={`px-6 py-2.5 rounded-2xl font-headline font-black italic uppercase tracking-widest text-xs transition-all ${!filterSport ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
          >
            All Sports
          </button>
          {[...new Set(coordinators.map(c => c.assigned_sport))].sort().map(sport => (
            <button
              key={sport}
              onClick={() => setFilterSport(sport)}
              className={`px-6 py-2.5 rounded-2xl font-headline font-black italic uppercase tracking-widest text-xs transition-all ${filterSport === sport ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Coordinator Grid — Grouped by Sport */}
        <div className="relative z-10 space-y-10">
          {Object.keys(bySport).length === 0 ? (
            <div className="bg-surface-container/40 p-24 rounded-3xl border-2 border-dashed border-outline-variant/20 text-center">
              <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-6">manage_accounts</span>
              <p className="text-on-surface-variant font-headline italic font-bold text-2xl uppercase opacity-40">No coordinators yet. Add one!</p>
            </div>
          ) : (
            Object.entries(bySport).map(([sport, coords]) => (
              <div key={sport}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports</span>
                  <h2 className="font-headline font-black italic text-2xl uppercase tracking-tighter">
                    {sport} <span className="text-primary">({coords.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coords.map(coord => (
                    <div key={coord.id} className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant/10 hover:border-primary/40 transition-all group shadow-xl">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(coord)}
                            className="w-10 h-10 bg-surface-container-highest border border-outline-variant/10 hover:border-primary/40 rounded-xl flex items-center justify-center transition-all"
                          >
                            <span className="material-symbols-outlined text-lg text-on-surface-variant hover:text-primary transition-colors">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(coord.id, coord.name)}
                            className="w-10 h-10 bg-surface-container-highest border border-outline-variant/10 hover:border-error/40 rounded-xl flex items-center justify-center transition-all"
                          >
                            <span className="material-symbols-outlined text-lg text-on-surface-variant hover:text-error transition-colors">person_remove</span>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-headline font-black italic text-xl uppercase tracking-tighter mb-1 group-hover:text-primary transition-colors">
                        {coord.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant/60 font-bold mb-4">{coord.email}</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sports</span>
                        <span className="text-[10px] font-headline font-black italic uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {coord.assigned_sport}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-outline-variant/10">
                        <p className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Login: {coord.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-6"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-surface-container-high border border-outline-variant/10 rounded-[40px] w-full max-w-lg shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-headline font-black italic text-3xl uppercase tracking-tighter">
                    {editingId ? 'EDIT' : 'ADD'} <span className="text-primary">COORDINATOR</span>
                  </h2>
                  <p className="text-xs font-headline font-black italic text-on-surface-variant uppercase tracking-widest opacity-60 mt-1">
                    {editingId ? 'Update coordinator details' : 'Create a new sport coordinator account'}
                  </p>
                </div>
                <button onClick={closeModal} className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="group">
                  <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block group-focus-within:text-primary transition-colors">Full Name</label>
                  <input
                    type="text"
                    id="coord-name"
                    className="w-full bg-surface-container-highest px-5 py-4 rounded-2xl font-bold text-sm border border-outline-variant/10 focus:border-primary outline-none transition-all placeholder:opacity-30"
                    placeholder="Prof. Example Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="group">
                  <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block group-focus-within:text-primary transition-colors">Email (Login ID)</label>
                  <input
                    type="email"
                    id="coord-email"
                    className="w-full bg-surface-container-highest px-5 py-4 rounded-2xl font-bold text-sm border border-outline-variant/10 focus:border-primary outline-none transition-all placeholder:opacity-30"
                    placeholder="coordinator@cdgi.edu"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                {/* Password */}
                <div className="group">
                  <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block group-focus-within:text-primary transition-colors">
                    Password {editingId && <span className="text-on-surface-variant/40">(leave blank to keep unchanged)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="coord-password"
                      className="w-full bg-surface-container-highest px-5 py-4 pr-12 rounded-2xl font-bold text-sm border border-outline-variant/10 focus:border-primary outline-none transition-all placeholder:opacity-30"
                      placeholder={editingId ? 'Leave blank to keep current' : 'Min. 6 characters'}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required={!editingId}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* Assigned Sport */}
                <div className="group">
                  <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block group-focus-within:text-primary transition-colors">
                    Assigned Sport
                  </label>
                  <div className="relative">
                    <select
                      id="coord-sport"
                      className="w-full bg-surface-container-highest px-5 py-4 rounded-2xl font-headline font-bold text-sm uppercase tracking-widest border border-outline-variant/10 focus:border-primary outline-none transition-all appearance-none"
                      value={form.assigned_sport}
                      onChange={e => setForm({ ...form, assigned_sport: e.target.value })}
                    >
                      {SPORTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                  </div>
                  <p className="text-[9px] text-on-surface-variant/40 mt-2 font-bold uppercase tracking-widest">
                    This coordinator will ONLY see {form.assigned_sport} events.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="px-8 py-4 border-2 border-outline-variant text-[11px] font-headline font-black italic uppercase tracking-[0.2em] rounded-2xl hover:bg-surface-container-highest transition-all">
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    id="coord-submit"
                    disabled={saving}
                    className="flex-1 bg-primary text-on-primary font-headline font-black italic uppercase text-sm tracking-[0.2em] py-4 rounded-2xl shadow-[0_15px_50px_rgba(184,253,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                        {editingId ? 'UPDATE COORDINATOR' : 'CREATE COORDINATOR'}
                      </>
                    )}
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
