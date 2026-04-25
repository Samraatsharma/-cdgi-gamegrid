"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../lib/auth-context';

const ROLES = [
  { key: 'admin',       label: 'ADMIN',       icon: 'admin_panel_settings' },
  { key: 'coordinator', label: 'COORDINATOR',  icon: 'manage_accounts' },
  { key: 'student',     label: 'STUDENT',      icon: 'school' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams?.get('registered');
  const { login, isLoggedIn, user: authUser } = useAuth();

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ identifier: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isLoggedIn && authUser) {
      if (authUser.role === 'admin') router.push('/dashboard/admin');
      else if (authUser.role === 'coordinator') router.push('/dashboard/coordinator');
      else router.push('/dashboard/student');
    }
  }, [router, isLoggedIn, authUser]);

  useEffect(() => {
    if (registered) toast.success('Account created! Please log in.');
  }, [registered]);

  const validate = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) newErrors.identifier = 'Identifier is required';
    if (role !== 'admin' && !formData.identifier.includes('@')) newErrors.identifier = 'Valid email required';
    if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.identifier.trim(), password: formData.password.trim(), role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('user', JSON.stringify(data.user));
      login(data.user);
      const firstName = data.user.name ? data.user.name.split(' ')[0] : (data.user.username || 'User');
      toast.success(`Welcome back, ${firstName}!`);
      if (data.user.role === 'admin') router.push('/dashboard/admin');
      else if (data.user.role === 'coordinator') router.push('/dashboard/coordinator');
      else router.push('/dashboard/student');
    } catch (err) {
      if (err.message === 'ACCOUNT_NOT_FOUND') {
        toast.error(
          <span>No account found.{' '}
            {role === 'student' ? <Link href="/register" className="underline font-bold">Register Now</Link> : 'Contact the Admin.'}
          </span>,
          { duration: 6000 }
        );
      } else {
        toast.error(err.message || 'Authentication Failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const activeRole = ROLES.find(r => r.key === role);

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1543326162-8534015fbe8e?q=80&w=2048"
          className="w-full h-full object-cover grayscale opacity-30"
          alt="Stadium background"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest via-transparent to-surface-container-lowest/80" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-7xl font-black italic tracking-tighter text-primary font-headline mb-2 hover:scale-[1.02] transition-transform cursor-pointer">
              Sports Sphere
            </h1>
          </Link>
          <p className="font-headline text-[10px] uppercase tracking-[0.4em] text-on-surface-variant font-black">
            CDGI Sports Management
          </p>
        </div>

        <div className="bg-surface-container p-10 rounded-2xl border border-outline-variant/10 shadow-2xl relative group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl pointer-events-none" />

          <form className="space-y-7 relative z-10" onSubmit={handleSubmit} noValidate>
            {/* 3-way Role Toggle */}
            <div className="bg-surface-container-lowest p-1 rounded-xl flex items-center gap-1 border border-outline-variant/10">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  id={`role-tab-${r.key}`}
                  onClick={() => setRole(r.key)}
                  className={`flex-1 py-2.5 px-1 text-[9px] font-headline font-black italic uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-1 ${
                    role === r.key
                      ? 'bg-primary text-on-primary shadow-xl'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: role === r.key ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {r.icon}
                  </span>
                  {r.label}
                </button>
              ))}
            </div>

            {/* Context Label */}
            <p className="text-center text-[9px] font-headline font-black uppercase tracking-[0.3em] text-on-surface-variant/50 -mt-3">
              {role === 'admin' && 'Administrative Portal'}
              {role === 'coordinator' && 'Sport Coordinator Portal'}
              {role === 'student' && 'Student Athlete Portal'}
            </p>

            {/* Identifier */}
            <div className="group">
              <label className="block text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                {role === 'admin' ? 'ADMIN USERNAME' : 'EMAIL ADDRESS'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">person</span>
                <input
                  type="text"
                  id="login-identifier"
                  className={`w-full bg-surface-container-highest/40 border ${errors.identifier ? 'border-error' : 'border-outline-variant/10'} focus:border-primary focus:ring-1 focus:ring-primary/30 py-4 pl-12 pr-4 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 font-headline text-sm tracking-widest transition-all outline-none`}
                  placeholder={role === 'admin' ? 'ADMIN USERNAME' : role === 'coordinator' ? 'COORDINATOR EMAIL' : 'STUDENT EMAIL'}
                  value={formData.identifier}
                  onChange={(e) => {
                    setFormData({ ...formData, identifier: e.target.value });
                    if (errors.identifier) setErrors({ ...errors, identifier: null });
                  }}
                />
                {errors.identifier && <p className="text-[9px] font-bold text-error mt-1 ml-1 uppercase tracking-widest">{errors.identifier}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                PASSWORD
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className={`w-full bg-surface-container-highest/40 border ${errors.password ? 'border-error' : 'border-outline-variant/10'} focus:border-primary focus:ring-1 focus:ring-primary/30 py-4 pl-12 pr-12 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 font-headline text-sm tracking-widest transition-all outline-none`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
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
                {errors.password && <p className="text-[9px] font-bold text-error mt-1 ml-1 uppercase tracking-widest">{errors.password}</p>}
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline-variant/20 bg-surface-container-highest text-primary focus:ring-primary transition-all"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <span className="text-[10px] font-headline font-black italic uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Remember Me</span>
              </label>
              <span className="text-[9px] font-headline font-black italic uppercase tracking-widest text-primary/60">Forgot? Contact Admin</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline font-black italic uppercase py-5 rounded-xl text-lg tracking-widest transition-all duration-300 shadow-[0_10px_30px_rgba(184,253,55,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'LOGGING IN...' : `LOGIN AS ${activeRole?.label}`}
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
            </button>

            <div className="text-center">
              {role === 'student' && (
                <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40">
                  New student?{' '}
                  <Link href="/register" className="text-secondary hover:text-secondary-container transition-colors">Create an account</Link>
                </p>
              )}
              {role === 'coordinator' && (
                <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40">
                  Coordinator accounts are created by the Admin.
                </p>
              )}
              {role === 'admin' && (
                <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40">
                  Restricted to authorized personnel only.
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
