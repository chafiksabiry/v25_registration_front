import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../LandingPage/Header';
import { Footer } from '../LandingPage/Footer';
import { ThinFooter } from '../Hub/HubPage';

export type TaasPage = 'home' | 'company' | 'reps';

interface TaasShellProps {
  page: TaasPage;
  onSignIn: () => void;
  onGetStarted: () => void;
  onNavigateToSection?: (sectionId: string) => void;
  /** Section demandée par le bandeau ou le pied de page : la page y défile une fois affichée. */
  pendingSection?: string | null;
  onSectionApplied?: () => void;
  children: React.ReactNode;
}

/** Cadre commun des trois pages TAAS : bandeau allégé (TAAS · Company · REPS), contenu, pied de page. */
export function TaasShell({ page, onSignIn, onGetStarted, onNavigateToSection, pendingSection, onSectionApplied, children }: TaasShellProps) {
  const { hash } = useLocation();
  const wanted = pendingSection || (hash ? hash.slice(1) : null);
  useEffect(() => {
    if (!wanted) return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(wanted);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onSectionApplied?.();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [wanted, onSectionApplied]);

  return (
    <div id="top" className={`relative bg-space-dark-default text-white ${page === 'home' ? 'flex min-h-svh flex-col' : ''}`}>
      <Header taas={page} onSignIn={onSignIn} onGetStarted={onGetStarted} onNavigateToSection={onNavigateToSection} />
      {children}
      {/* L'accueil TAAS tient sur un seul écran : pied de page réduit aux mentions légales. */}
      {page === 'home' ? <ThinFooter /> : <Footer />}
    </div>
  );
}
