import React, { useEffect, useRef, useState } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { TaasHow, TaasExamples, TaasForPros } from './TaasSections';
import { Footer } from './Footer';
import { LANDING_SECTION_IDS, landingPageTabTitle } from '../../lib/tracking/landingPageMeta';
import { usePageTitle } from '../../lib/tracking/usePageTitle';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { withLangPrefix } from '../../lib/langRoutes';

interface LandingPageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  /** « Trouver des gigs » : parcours professionnel (seul parcours ouvert de TAAS). */
  onFindGigs: () => void;
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
  onFindGigs,
  initialSection,
  onSectionApplied,
  onNavigateToSection,
}: LandingPageProps) {
  const [activeSection, setActiveSection] = useState('top');
  const appliedRef = useRef<string | null>(null);
  // Keep the latest callback in a ref so it doesn't have to be a
  // dependency of the scroll effect (which would re-run on every
  // parent render and could cancel the in-flight scroll).
  const onSectionAppliedRef = useRef(onSectionApplied);
  useEffect(() => {
    onSectionAppliedRef.current = onSectionApplied;
  }, [onSectionApplied]);

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const siteLang = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  usePageTitle(landingPageTabTitle(activeSection, i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr'));

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const sectionId = visible[0]?.target.id;
        if (sectionId) {
          setActiveSection(sectionId);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.2, 0.5, 0.8] },
    );

    LANDING_SECTION_IDS.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

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
    <div id="top" className="relative bg-space-dark-default text-white">
      <Header
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        primaryCta={{ label: t('taasPage.notifyCta', 'Notify me'), sectionId: 'prevenu' }}
        onNavigateToSection={onNavigateToSection}
      />

      {/* Retour vers l'accueil de l'ensemble HARX (le logo de l'en-tête y mène aussi). */}
      <a
        href={withLangPrefix('/', siteLang)}
        data-testid="back-to-hub"
        onClick={(e) => {
          e.preventDefault();
          navigate('/');
        }}
        className="absolute left-4 top-[80px] z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs md:text-sm font-semibold text-slate-200 backdrop-blur-md transition-colors hover:border-harx-400/60 hover:text-white md:left-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('header.allOffers', 'All HARX offers')}
      </a>

      <Hero />

      <section id="how-it-works" className="scroll-mt-28 bg-white text-slate-900">
        <TaasHow />
      </section>

      <section id="examples" className="scroll-mt-28 bg-slate-50 text-slate-900">
        <TaasExamples />
      </section>

      <section id="reps" className="scroll-mt-28 bg-white text-slate-900">
        <TaasForPros onFindGigs={onFindGigs} />
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
