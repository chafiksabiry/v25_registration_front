import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Pricing } from './Pricing';
import { ForClients } from './ForClients';
import { ForReps } from './ForReps';
import { FeaturedGigs } from './FeaturedGigs';
import { BudgetSimulator, RepsJoinSection } from './TaasWidgets';
import { Footer } from './Footer';
import { LANDING_SECTION_IDS, landingPageTabTitle } from '../../lib/tracking/landingPageMeta';
import { usePageTitle } from '../../lib/tracking/usePageTitle';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Headphones } from 'lucide-react';
import { withLangPrefix } from '../../lib/langRoutes';

interface LandingPageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  /** Rejoindre HARX en tant que professionnel (inscription REPS). */
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

type TaasTab = 'company' | 'rep';

/** Onglet qui contient une section de la page (les ancres du bandeau ouvrent l'onglet voulu). */
function tabOfSection(sectionId: string | null | undefined): TaasTab | null {
  if (!sectionId) return null;
  if (sectionId === 'reps' || sectionId === 'featured-gigs') return 'rep';
  if (sectionId === 'how-it-works' || sectionId === 'pricing' || sectionId === 'clients') return 'company';
  return null;
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
  const [tab, setTab] = useState<TaasTab>(() => tabOfSection(initialSection) ?? 'company');
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

  /** Ouvre l'onglet qui contient la section, puis y défile (bouton « Voir comment ça marche » du haut de page). */
  const goToSection = (sectionId: string) => {
    const wanted = tabOfSection(sectionId);
    if (wanted) setTab(wanted);
    window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 60);
  };

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Une ancre du bandeau (ou du pied de page) ouvre l'onglet qui contient sa section, avant le défilement.
  useLayoutEffect(() => {
    const wanted = tabOfSection(initialSection);
    if (wanted) setTab(wanted);
    if (!initialSection) appliedRef.current = null;
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
  }, [tab]);

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

      <Hero onGetStarted={onGetStarted} onSeeHow={() => goToSection('how-it-works')} />

      {/* Deux parcours : COMPANY (publier un gig) et REPS (trouver des gigs). */}
      <div id="taas-tabs" className="bg-white px-4 pt-10 text-slate-900">
        <div role="tablist" aria-label={t('landingTabs.aria', 'Choose your path')} className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-2 rounded-3xl bg-slate-100 p-1.5">
          {([
            { id: 'company' as const, icon: Building2, tag: t('choicePage.companyTag', 'COMPANY'), title: t('choicePage.companyTitle', 'Post a Gig') },
            { id: 'rep' as const, icon: Headphones, tag: t('choicePage.repTag', 'REPS'), title: t('choicePage.repTitle', 'Find Gigs') },
          ]).map(({ id, icon: Icon, tag, title }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              data-testid={`taas-tab-${id}`}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-left transition-all ${
                tab === id ? 'bg-gradient-harx text-white shadow-lg shadow-harx-500/25' : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-black tracking-wide">{tag}</span>
                <span className={`text-xs font-semibold ${tab === id ? 'text-white/90' : 'text-slate-500'}`}>{title}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'company' ? (
        <div role="tabpanel" data-testid="taas-panel-company">
          <section id="how-it-works" className="scroll-mt-28 bg-white text-slate-900">
            <HowItWorks onGetStarted={onGetStarted} />
          </section>

          <BudgetSimulator />

          <section id="pricing" className="scroll-mt-28 bg-white text-slate-900">
            <Pricing onGetStarted={onGetStarted} />
          </section>

          <section id="clients" className="scroll-mt-28 bg-white text-slate-900">
            <ForClients onGetStarted={onGetStarted} />
          </section>
        </div>
      ) : (
        <div role="tabpanel" data-testid="taas-panel-rep">
          <FeaturedGigs onJoin={onFindGigs} />

          <RepsJoinSection onJoin={onFindGigs} />

          <section id="reps" className="scroll-mt-28 bg-white text-slate-900">
            <ForReps onGetStarted={onGetStarted} />
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default LandingPage;
