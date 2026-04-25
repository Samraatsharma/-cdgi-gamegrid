"use client";

import { useState, useRef, useEffect } from 'react';

/**
 * HelpTooltip — A "?" icon button that shows a simple explanation on click.
 * Used next to forms, payment sections, and event creation fields.
 */
export function HelpTooltip({ text, position = 'top' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <span className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-all flex-shrink-0"
        aria-label="Help"
      >
        <span className="text-[10px] font-black">?</span>
      </button>
      {open && (
        <div className={`absolute z-[300] ${positionClasses[position]} w-56 bg-surface-container-high border border-outline-variant/20 rounded-xl p-3 shadow-2xl animate-in fade-in duration-200`}>
          <p className="text-[11px] text-on-surface-variant leading-relaxed font-body">{text}</p>
          <div className="mt-2 text-[9px] text-primary/50 font-bold uppercase tracking-widest">Tap anywhere to close</div>
        </div>
      )}
    </span>
  );
}

/**
 * FirstTimeTour — A simple 3-4 step onboarding overlay shown only once per user.
 * Stored in localStorage so it never shows again.
 */
export function FirstTimeTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('tour_completed');
    if (!seen) {
      // Small delay so page loads first
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('tour_completed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  const steps = [
    {
      icon: 'search',
      title: 'Browse Events',
      desc: 'Go to the Events page to see all upcoming sports tournaments. Use filters to find events matching your branch and year.',
    },
    {
      icon: 'how_to_reg',
      title: 'Register Easily',
      desc: 'Click "Register" on any open event. If your profile is complete, you can register with a single click.',
    },
    {
      icon: 'qr_code_2',
      title: 'Pay & Upload Proof',
      desc: 'For paid events, scan the QR code, make the payment, then upload a screenshot. Your registration is confirmed once the admin verifies it.',
    },
    {
      icon: 'dashboard',
      title: 'Track Everything',
      desc: 'Your Student Dashboard shows all registrations, payment statuses, and waitlist positions. Check notifications for updates.',
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-surface-container-high border border-outline-variant/20 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-surface-container-highest">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 text-center">
          {/* Step counter */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/40' : 'bg-outline-variant/20'}`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {current.icon}
            </span>
          </div>

          {/* Content */}
          <h3 className="font-headline font-black italic text-xl uppercase tracking-tighter mb-3">
            {current.title}
          </h3>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            {current.desc}
          </p>

          {/* Navigation */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={dismiss}
              className="px-6 py-3 text-on-surface-variant font-headline font-bold uppercase text-xs tracking-widest hover:text-on-surface transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={() => {
                if (step < steps.length - 1) setStep(step + 1);
                else dismiss();
              }}
              className="px-8 py-3 bg-primary text-on-primary font-headline font-black italic uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              {step < steps.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
