import React from 'react';

/** Halos colorés flous du fond de l'accueil HARX (rose, violet, ambre), à poser dans une section en `relative overflow-hidden`. */
export function Aurora({ tone = 'company' }: { tone?: 'company' | 'reps' | 'pricing' }) {
  const a = tone === 'reps' ? 'bg-fuchsia-600/25' : 'bg-rose-600/25';
  const b = tone === 'pricing' ? 'bg-violet-600/25' : 'bg-pink-600/20';
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className={`absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full blur-[120px] ${a}`} />
      <div className={`absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full blur-[120px] ${b}`} />
      <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-amber-500/10 blur-[120px]" />
    </div>
  );
}
