"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams?.get('registered');

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') router.push('/dashboard/admin');
        else router.push('/dashboard/student');
      } catch(e) {}
    }
    if (registered) toast.success('Registration successful! Please login.');
  }, [registered, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.identifier.trim().length <= 2 || formData.password.length <= 3) {
        toast.error('Invalid credentials format.');
        return;
    }

    setLoading(true);

    const payload = {
      email: formData.identifier.trim(),
      password: formData.password.trim(),
      role
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name ? data.user.name.split(' ')[0] : 'Admin'} ⚡`);
      
      if (data.user.role === 'admin') router.push('/dashboard/admin');
      else router.push('/dashboard/student');

    } catch (err) {
       toast.error(err.message || "Authentication Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen overflow-x-hidden flex items-center justify-center relative">
      {/* Background Cinematic Shell */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuApBd2NEHSjWExdBzsszXHrxeq73yjZR72GX5OG2u7mSCwcgAREInWTS3sIUogumkw1d5HzKLRMfscqJ4buPiUL3vSFi6gr9g1dNEhZVjZZJG_RkLKo1DGi5jefUdbjz4Ryy6HpjjWqZrwD9AzZLGciD_NYH0R1qBTjBS19w2Ogagh4Lc_tNg9sceKwRvTgLt7SMyeuKcJ2PWMwIq9vw3icLoaV8PyRu3xy0cRzFofEASv9ZcUBz1XPToWVHSPDtZ66wF8CLLaRBzkB" 
          className="w-full h-full object-cover filter brightness-50 contrast-125 saturate-50" 
          alt="Stadium background" 
        />
        <div className="absolute inset-0 stadium-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-container-lowest/40 to-surface-container-lowest"></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Brand Identity Section */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-6xl font-black italic tracking-tighter text-primary font-headline mb-2 drop-shadow-2xl cursor-pointer">
              CDGI GameGrid
            </h1>
          </Link>
          <p className="font-headline text-[10px] uppercase tracking-[0.3em] text-secondary font-bold">
            Elite Performance Management
          </p>
          <p className="text-on-surface-variant text-xs mt-1 font-medium">
            Chameli Devi Group
          </p>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="glass-card p-10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t-2 border-primary/30 relative group overflow-hidden">
          {/* Accent Glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-[80px]"></div>
          
          <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
            {/* Role Toggle */}
            <div className="bg-surface-container-low p-1 rounded-lg flex items-center gap-1 border border-outline-variant/20">
              <button 
                type="button" 
                onClick={() => setRole('admin')}
                className={`flex-1 py-2.5 px-4 text-xs font-headline font-bold uppercase tracking-widest rounded transition-all duration-300 ${role === 'admin' ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(184,253,55,0.3)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Admin
              </button>
              <button 
                type="button" 
                onClick={() => setRole('student')}
                className={`flex-1 py-2.5 px-4 text-xs font-headline font-bold uppercase tracking-widest rounded transition-all duration-300 ${role === 'student' ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(184,253,55,0.3)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Student
              </button>
            </div>

            {/* Input Group */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant ml-1">
                  Access Identifier
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-lg">person</span>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-highest/50 border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-4 pl-12 pr-4 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 font-medium transition-all outline-none" 
                    placeholder={role === 'admin' ? "Admin Username" : "Student Email"}
                    value={formData.identifier}
                    onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant ml-1">
                  Secure Key
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-lg">lock</span>
                  <input 
                    type="password" 
                    className="w-full bg-surface-container-highest/50 border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary py-4 pl-12 pr-4 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 font-medium transition-all outline-none" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="space-y-6 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline font-black italic uppercase py-5 rounded-lg text-lg tracking-tighter transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(184,253,55,0.2)] hover:shadow-[0_15px_40px_rgba(184,253,55,0.4)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Initialize Session'}
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </button>
              
              <div className="flex items-center justify-between px-1">
                <Link href="/register" className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
                  Create Account
                </Link>
                <div className="h-1 w-1 rounded-full bg-outline-variant/30"></div>
                <a href="#" className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
                  System Support
                </a>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Utility */}
        <footer className="mt-12 text-center space-y-4">
          <div className="flex justify-center items-center gap-6">
            <div className="flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-primary mb-1">security</span>
              <span className="text-[9px] font-headline font-bold uppercase tracking-tighter">Biometric Ready</span>
            </div>
            <div className="h-8 w-px bg-outline-variant/20"></div>
            <div className="flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-secondary mb-1">speed</span>
              <span className="text-[9px] font-headline font-bold uppercase tracking-tighter">Low Latency</span>
            </div>
            <div className="h-8 w-px bg-outline-variant/20"></div>
            <div className="flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-on-surface-variant mb-1">verified</span>
              <span className="text-[9px] font-headline font-bold uppercase tracking-tighter">CDGI Certified</span>
            </div>
          </div>
          <p className="text-[10px] text-on-surface-variant/40 font-medium tracking-tight">
            © 2024 CDGI GameGrid. Engineered for Velocity. Restricted Access.
          </p>
        </footer>
      </main>

      {/* Aesthetic Corner Ticker */}
      <div className="fixed bottom-8 left-8 hidden lg:block border-l border-primary/20 pl-4 py-2">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-sm">sensors</span>
          <span className="text-[10px] font-headline font-black italic uppercase tracking-widest">System Online</span>
        </div>
        <div className="text-[9px] text-on-surface-variant font-medium mt-1">Core Performance Node: IND-04</div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-container-lowest flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
