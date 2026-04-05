"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', course: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.course || formData.password.length < 6) {
        toast.error('Please complete all fields properly.');
        return;
    }
    
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      router.push('/login?registered=true');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Atmospheric Glows */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Registration Content */}
        <main className="w-full max-w-2xl px-6 pt-12 pb-20 z-10">
            {/* Header Section */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-headline font-bold uppercase tracking-[0.2em] text-[10px] text-primary/80">System Online</span>
                </div>
                <h1 className="font-headline font-bold italic kinetic-title text-5xl md:text-6xl uppercase tracking-tighter mb-2">
                    KINETIC REGISTRATION
                </h1>
                <p className="font-body text-on-surface-variant tracking-wide">
                    Precision Entry System at <span className="text-primary font-bold">CDGI</span>
                </p>
            </div>

            {/* Glassmorphic Form Card */}
            <div className="glass-card turf-texture neon-border-glow rounded-xl p-8 md:p-12 relative overflow-hidden">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Name Field */}
                    <div className="group">
                        <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-secondary transition-colors">
                            Candidate Name
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors text-xl">person</span>
                            <input 
                                type="text" 
                                className="w-full bg-surface-container-low border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary/30 rounded-lg py-4 pl-12 pr-4 font-headline text-sm tracking-widest text-on-surface placeholder:text-outline-variant transition-all duration-300 outline-none" 
                                placeholder="ENTER FULL NAME"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {/* Email & Pass Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-secondary transition-colors">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors text-xl">mail</span>
                                <input 
                                    type="email" 
                                    className="w-full bg-surface-container-low border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary/30 rounded-lg py-4 pl-12 pr-4 font-headline text-sm tracking-widest text-on-surface placeholder:text-outline-variant transition-all duration-300 outline-none" 
                                    placeholder="STUDENT EMAIL"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-secondary transition-colors">
                                Access Key
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors text-xl">lock</span>
                                <input 
                                    type="password" 
                                    className="w-full bg-surface-container-low border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary/30 rounded-lg py-4 pl-12 pr-4 font-headline text-sm tracking-widest text-on-surface placeholder:text-outline-variant transition-all duration-300 outline-none" 
                                    placeholder="PASSWORD"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Course / Branch Field */}
                    <div className="group">
                        <label className="block font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-secondary transition-colors">
                            Branch / Course
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors text-xl">school</span>
                            <select
                                className="w-full bg-surface-container-low border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary/30 rounded-lg py-4 pl-12 pr-4 font-headline text-sm tracking-widest text-on-surface transition-all duration-300 outline-none appearance-none"
                                value={formData.course}
                                onChange={e => setFormData({...formData, course: e.target.value})}
                                required
                            >
                                <option value="">SELECT YOUR BRANCH</option>
                                <option value="B.Tech CSE">B.Tech CSE</option>
                                <option value="B.Tech IT">B.Tech IT</option>
                                <option value="B.Tech ECE">B.Tech ECE</option>
                                <option value="B.Tech ME">B.Tech ME</option>
                                <option value="B.Tech CE">B.Tech CE</option>
                                <option value="MBA">MBA</option>
                                <option value="MCA">MCA</option>
                                <option value="BCA">BCA</option>
                                <option value="BBA">BBA</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                        </div>
                    </div>

                    {/* Initialize Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-8 bg-primary hover:bg-primary-container text-on-primary font-headline font-bold italic uppercase tracking-[0.2em] py-5 rounded-lg flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(184,253,55,0.4)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        {loading ? 'INITIALIZING...' : 'INITIALIZE REGISTRATION'}
                    </button>

                    <div className="text-center mt-4 pt-4 border-t border-outline-variant/10">
                        <Link href="/login" className="text-[10px] font-headline font-bold uppercase tracking-widest text-secondary hover:text-on-surface transition-colors">
                            Already configured? Return to Login
                        </Link>
                    </div>

                </form>

                {/* Decorative corner accent */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-secondary/20 to-transparent pointer-events-none opacity-50"></div>
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none opacity-30"></div>
            </div>
        </main>
    </div>
  );
}
