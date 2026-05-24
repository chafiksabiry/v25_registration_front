import React, { useEffect, useRef } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Pricing } from './Pricing';
import { About } from './About';
import { ForClients } from './ForClients';
import { ForReps } from './ForReps';
import { Footer } from './Footer';

interface LandingPageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  /**
   * If provided, the landing page will smoothly scroll to that section id
   * once it has mounted. Used when navigating back to the landing from
   * another view (e.g. ChoicePage / SignIn / Register) via the navbar.
   */
  initialSection?: string | null;
  /**
   * Called right after the initialSection has been consumed so the parent
   * can clear it (avoids re-scrolling on subsequent renders).
   */
  onSectionApplied?: () => void;
  /**
   * Used by the Header when a section anchor doesn't exist on the current
   * view. Forwarded as-is to the Header.
   */
  onNavigateToSection?: (sectionId: string) => void;
}

export function LandingPage({
  onSignIn,
  onGetStarted,
  initialSection,
  onSectionApplied,
  onNavigateToSection,
}: LandingPageProps) {
  const appliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!initialSection || appliedRef.current === initialSection) return;

    const id = initialSection;
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const raf = requestAnimationFrame(() => {
      scroll();
      appliedRef.current = id;
      onSectionApplied?.();
    });

    return () => cancelAnimationFrame(raf);
  }, [initialSection, onSectionApplied]);

  return (
    <div id="top" className="min-h-screen bg-space-dark-default text-white">
      <Header
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onNavigateToSection={onNavigateToSection}
      />

      <Hero onGetStarted={onGetStarted} />

      <section id="how-it-works" className="scroll-mt-28 bg-white text-slate-900">
        <HowItWorks onGetStarted={onGetStarted} />
      </section>

      <section id="pricing" className="scroll-mt-28 bg-slate-50 text-slate-900">
        <Pricing onGetStarted={onGetStarted} />
      </section>

      <section id="about" className="scroll-mt-28 bg-white text-slate-900">
        <About onGetStarted={onGetStarted} />
      </section>

      <section id="clients" className="scroll-mt-28 bg-slate-50 text-slate-900">
        <ForClients onGetStarted={onGetStarted} />
      </section>

      <section id="reps" className="scroll-mt-28 bg-white text-slate-900">
        <ForReps onGetStarted={onGetStarted} />
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
