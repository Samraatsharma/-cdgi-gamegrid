"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', 
    roll_number: '', branch: '', year: '', 
    section: '', phone: '' 
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive Validation
    if (!formData.name.trim()) return toast.error('Name is required');
    if (!formData.email.trim() || !formData.email.includes('@')) return toast.error('Valid email is required');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!formData.roll_number.trim()) return toast.error('Roll Number is required');
    if (!formData.branch) return toast.error('Please select your branch');
    if (!formData.year) return toast.error('Please select your academic year');
    if (!formData.phone.trim()) return toast.error('Phone number is required');
    
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      toast.success('Registration successful! Redirecting to dashboard...');
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard/student');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-20 px-6">
        {/* Background Atmospheric Glows */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Registration Content */}
        <main className="w-full max-w-3xl z-10">
            {/* Header Section */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-headline font-bold uppercase tracking-[0.2em] text-[10px] text-primary/80">Student Registration</span>
                </div>
                <h1 className="font-headline font-bold italic text-5xl md:text-6xl uppercase tracking-tighter mb-2">
                    STUDENT <span className="text-primary">PORTAL</span>
                </h1>
                <p className="font-body text-on-surface-variant tracking-wide">
                    Official Registration for <span className="text-primary font-bold">CDGI Sports Sphere</span>
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-surface-container p-8 md:p-12 rounded-2xl border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Identity Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                          <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                              Full Name *
                          </label>
                          <div className="relative">
                              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">person</span>
                              <input 
                                  type="text" 
                                  className="w-full bg-surface-container-highest/40 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-4 pl-12 pr-4 font-headline text-sm tracking-widest text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                                  placeholder="E.G. AARAV PATEL"
                                  value={formData.name}
                                  onChange={e => setFormData({...formData, name: e.target.value})}
                                  required
                              />
                          </div>
                      </div>

                      <div className="group">
                          <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                              Roll Number *
                          </label>
                          <div className="relative">
                              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">badge</span>
                              <input 
                                  type="text" 
                                  className="w-full bg-surface-container-highest/40 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-4 pl-12 pr-4 font-headline text-sm tracking-widest text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                                  placeholder="E.G. CDGI-21-001"
                                  value={formData.roll_number}
                                  onChange={e => setFormData({...formData, roll_number: e.target.value})}
                                  required
                              />
                          </div>
                      </div>
                    </div>

                    {/* Email & Pass Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                                College Email *
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">mail</span>
                                <input 
                                    type="email" 
                                    className="w-full bg-surface-container-highest/40 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-4 pl-12 pr-4 font-headline text-sm tracking-widest text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                                    placeholder="EMAIL@CDGI.EDU"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                                Password *
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">lock</span>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="w-full bg-surface-container-highest/40 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-4 pl-12 pr-12 font-headline text-sm tracking-widest text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Academic Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group">
                            <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                                Branch / Course *
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">school</span>
                                <select
                                    className="w-full bg-surface-container-highest/40 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-4 pl-12 pr-4 font-headline text-xs tracking-widest text-on-surface transition-all outline-none appearance-none"
                                    value={formData.branch}
                                    onChange={e => setFormData({...formData, branch: e.target.value})}
                                    required
                                >
                                    <option value="">SELECT</option>
                                    {['CSE', 'IT', 'ME', 'CE', 'ECE', 'MBA', 'MCA', 'BCA', 'BBA'].map(b => (
                                      <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                                Year *
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">calendar_today</span>
                                <select
                                    className="w-full bg-surface-container-highest/40 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-4 pl-12 pr-4 font-headline text-xs tracking-widest text-on-surface transition-all outline-none appearance-none"
                                    value={formData.year}
                                    onChange={e => setFormData({...formData, year: e.target.value})}
                                    required
                                >
                                    <option value="">SELECT</option>
                                    {[1, 2, 3, 4].map(y => (
                                      <option key={y} value={y}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                                Section
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">meeting_room</span>
                                <select
                                    className="w-full bg-surface-container-highest/40 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-4 pl-12 pr-4 font-headline text-xs tracking-widest text-on-surface transition-all outline-none appearance-none"
                                    value={formData.section}
                                    onChange={e => setFormData({...formData, section: e.target.value})}
                                >
                                    <option value="">SELECT</option>
                                    {['A', 'B', 'C', 'D'].map(s => (
                                      <option key={s} value={s}>Section {s}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Detail */}
                    <div className="group">
                        <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                            Phone Number *
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">phone</span>
                            <input 
                                type="tel" 
                                className="w-full bg-surface-container-highest/40 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-4 pl-12 pr-4 font-headline text-sm tracking-widest text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                                placeholder="+91 XXXXX XXXXX"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-8 bg-primary hover:bg-primary-container text-on-primary font-headline font-black italic uppercase tracking-[0.2em] py-5 rounded-xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(184,253,55,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                        {loading ? 'REGISTERING...' : 'CREATE ACCOUNT'}
                    </button>

                    <div className="text-center mt-6 pt-6 border-t border-outline-variant/10">
                        <Link href="/login" className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors">
                            Already have an account? Login here
                        </Link>
                    </div>

                </form>
            </div>
            
            <p className="text-center mt-12 text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">
              Verified Management System - CDGI Sports Sphere
            </p>
        </main>
    </div>
  );
}
