import React from 'react';

/** Fond commun des écrans de connexion et d'inscription : mêmes aurores et grille que les pages d'accueil (hub, COMPANY, REPS). */
export function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-40 -top-24 h-[34rem] w-[34rem] rounded-full bg-rose-600/20 blur-[140px] animate-float" />
      <div className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-fuchsia-600/20 blur-[140px] animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(70% 60% at 50% 40%, #000, transparent)' }} />
    </div>
  );
}
