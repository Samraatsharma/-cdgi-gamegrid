"use client";

import { calculateProfileCompleteness } from '../lib/api';

/**
 * ProfileCompleteness — Shows a visual progress bar of how complete the user's profile is.
 * Displays missing fields and a completion percentage.
 */
export default function ProfileCompleteness({ user, compact = false }) {
  if (!user) return null;

  const { percentage, missing, isComplete } = calculateProfileCompleteness(user);

  const barColor = percentage === 100 ? 'bg-green-500' : percentage >= 70 ? 'bg-primary' : percentage >= 40 ? 'bg-yellow-400' : 'bg-red-400';
  const textColor = percentage === 100 ? 'text-green-400' : percentage >= 70 ? 'text-primary' : percentage >= 40 ? 'text-yellow-400' : 'text-red-400';

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${percentage}%` }} />
        </div>
        <span className={`text-[10px] font-headline font-black italic uppercase tracking-widest ${textColor}`}>
          {percentage}%
        </span>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-high/60 rounded-2xl p-6 border border-outline-variant/10 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isComplete ? 'verified_user' : 'manage_accounts'}
          </span>
          <h3 className="font-headline font-black italic text-sm uppercase tracking-tighter">Profile Status</h3>
        </div>
        <span className={`font-headline font-black italic text-lg ${textColor}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${percentage}%` }} />
      </div>

      {isComplete ? (
        <p className="text-[10px] text-green-400 font-headline font-bold uppercase tracking-widest flex items-center gap-1">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Profile complete — One-click registration enabled
        </p>
      ) : (
        <div>
          <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest mb-2">
            Missing fields:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map(field => (
              <span key={field} className="text-[9px] font-bold uppercase tracking-widest bg-error/10 text-error px-2 py-0.5 rounded-full border border-error/20">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
