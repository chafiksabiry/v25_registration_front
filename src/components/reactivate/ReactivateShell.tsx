import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../LandingPage/Header';
import type { ReactivateLang } from './reactivateCopy';

/**
 * Cadre de la page : le bandeau commun à tous les écrans HARX (même composant que l'accueil, le choix de profil et les pages
 * légales) puis le contenu. Les REPS relèvent de l'offre TAAS : le bandeau affiche l'espace REPS.
 */
export function ReactivateShell({ children }: { lang: ReactivateLang; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-950 text-slate-200 flex flex-col" data-testid="reactivate-page">
      <Header taas="reps" onSignIn={() => navigate('/auth/signin')} onGetStarted={() => navigate('/auth/choice')} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-28 sm:px-6 sm:pt-32">{children}</main>
    </div>
  );
}
