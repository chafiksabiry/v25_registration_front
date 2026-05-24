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
  // Keep the latest callback in a ref so it doesn't have to be a
  // dependency of the scroll effect (which would re-run on every
  // parent render and could cancel the in-flight scroll).
  const onSectionAppliedRef = useRef(onSectionApplied);
  useEffect(() => {
    onSectionAppliedRef.current = onSectionApplied;
  }, [onSectionApplied]);

  useEffect(() => {
    if (!initialSection || appliedRef.current === initialSection) return;

    const id = initialSection;
    let cancelled = false;
    const timers: number[] = [];
    const rafs: number[] = [];

    const performScroll = () => {
      if (cancelled || appliedRef.current === id) return;

      const el = document.getElementById(id);
      if (!el) {
        if (id === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          appliedRef.current = id;
          onSectionAppliedRef.current?.();
        }
        return;
      }

      // Two-step scroll: snap close to the target instantly so the
      // smooth animation starts from a stable position, then animate.
      // 112px == scroll-mt-28 (Tailwind) -- keeps the section under
      // the fixed navbar (~64px) with a bit of breathing room.
      const target = el.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top: Math.max(0, target), behavior: 'auto' });

      const smooth = window.setTimeout(() => {
        if (cancelled) return;
        const stillThere = document.getElementById(id);
        if (stillThere) {
          stillThere.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 40);
      timers.push(smooth);

      appliedRef.current = id;
      onSectionAppliedRef.current?.();
    };

    // Double RAF + a small timeout: ensures the new view has been
    // painted at least once (sections + their images contributed to
    // layout) before we try to compute target offsets.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        performScroll();
      });
      rafs.push(raf2);
    });
    rafs.push(raf1);

    // Safety net in case requestAnimationFrame didn't fire (tab in
    // background, etc.) or layout was still shifting on first paint.
    const fallback = window.setTimeout(performScroll, 200);
    timers.push(fallback);

    return () => {
      cancelled = true;
      rafs.forEach(cancelAnimationFrame);
      timers.forEach(clearTimeout);
    };
  }, [initialSection]);

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
