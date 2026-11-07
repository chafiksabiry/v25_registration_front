import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Layers, Phone, Sparkles, CheckCircle2, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '../LandingPage/Header';
import { Footer } from '../LandingPage/Footer';
import type { SignupUserType } from '../ChoicePage';
import harxMascotte from '../LandingPage/assets/harx-mascotte.webp';
import { persistHarxLanguage } from '../../lib/i18n';
import { hardNavigate } from '../../lib/appNavigation';
import {
  getAvailableOffers,
  getSoonOffers,
  resolveChildTarget,
  resolveOfferHref,
  resolveOfferSignInHref,
  type OfferChild,
  type OfferConfig,
  type OfferIcon,
  type OfferLang,
} from '../../config/offers';
import { usePageTitle } from '../../lib/tracking/usePageTitle';
import { hubPageTitle } from '../../lib/tracking/hubMeta';
import './hub.css';

const ICONS: Record<OfferIcon, LucideIcon> = {
  layers: Layers,
  phone: Phone,
  sparkles: Sparkles,
};

interface HubPageProps {
  /** Même mécanisme que les cartes de /auth/choice (pendingUserType + retour). */
  onSelectRole: (role: SignupUserType) => void;
  onNavigateToSection?: (sectionId: string) => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Apparition progressive au défilement ; visible d'emblée sans IntersectionObserver ou en mouvement réduit. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, className: `hub-reveal${shown ? ' is-in' : ''}` };
}

/** Ouvre l'offre : navigation dure (page ou application distincte), en mémorisant la langue choisie. */
export function openOffer(offer: OfferConfig, lang: OfferLang) {
  const href = resolveOfferHref(offer, lang);
  if (!href) return;
  persistLang(lang);
  hardNavigate(href);
}

function persistLang(lang: OfferLang) {
  try {
    persistHarxLanguage(lang, lang === 'en' ? { explicit: true } : undefined);
  } catch {
    /* ignore */
  }
}

function OfferCard({ offer, lang, index, onSelectRole }: { offer: OfferConfig; lang: OfferLang; index: number; onSelectRole: (role: SignupUserType) => void }) {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  const Icon = ICONS[offer.icon];
  const href = resolveOfferHref(offer, lang) ?? '#';
  const signInHref = resolveOfferSignInHref(offer, lang);

  const openChild = (e: React.MouseEvent, child: OfferChild) => {
    e.preventDefault();
    const target = resolveChildTarget(child, lang);
    if (target.type === 'role') {
      onSelectRole(target.role);
    } else {
      persistLang(lang);
      hardNavigate(target.href);
    }
  };

  // Projecteur qui suit la souris (variables CSS, aucune animation JS).
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <article
      ref={reveal.ref}
      data-testid={`offer-card-${offer.id}`}
      onPointerMove={onPointerMove}
      style={{ ['--d' as string]: `${index * 120}ms` }}
      className={`hub-card ${reveal.className}`}
    >
      <span className="hub-icon w-fit">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-2xl md:text-3xl font-black leading-tight text-white">{t(offer.titleKey)}</h2>
      <p className="mt-2 text-base md:text-lg font-semibold leading-snug text-rose-300">{t(offer.taglineKey)}</p>

      {offer.children.length > 0 && (
        <ul className="mt-6 grid gap-2.5" data-testid={`offer-children-${offer.id}`}>
          {offer.children.map((child, i) => {
            const target = resolveChildTarget(child, lang);
            return (
              <li key={child.id}>
                <a
                  href={target.type === 'href' ? target.href : '#'}
                  data-testid={`offer-child-${offer.id}-${child.id}`}
                  onClick={(e) => openChild(e, child)}
                  className="hub-child text-sm md:text-base"
                >
                  <span className="hub-child__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span>{t(child.labelKey)}</span>
                  <ArrowRight className="hub-child__arrow h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <ul className="mt-6 flex-1 space-y-3">
        {offer.bulletKeys.map((key) => (
          <li key={key} className="flex items-start gap-3 text-sm md:text-base text-slate-300">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
            <span className="leading-snug">{t(key)}</span>
          </li>
        ))}
      </ul>

      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          openOffer(offer, lang);
        }}
        className="hub-cta mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d4d] to-[#ec4899] px-4 text-center text-base font-bold text-white shadow-lg shadow-rose-500/30 transition-transform active:scale-[0.98]"
      >
        {t(offer.ctaKey)}
        <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
      </a>

      {signInHref && (
        <p className="mt-4 text-center text-sm text-slate-300">
          {t('hub.alreadyClient')}{' '}
          <a
            href={signInHref}
            data-testid={`offer-signin-${offer.id}`}
            onClick={(e) => {
              e.preventDefault();
              persistLang(lang);
              hardNavigate(signInHref);
            }}
            className="font-bold text-rose-300 underline-offset-4 hover:underline"
          >
            {t('hub.signIn')}
          </a>
        </p>
      )}
    </article>
  );
}

function SoonCard({ offer }: { offer: OfferConfig }) {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLDivElement>();
  const Icon = ICONS[offer.icon];
  return (
    <div ref={reveal.ref} data-testid={`offer-soon-${offer.id}`} className={`hub-soon flex items-center gap-4 px-5 py-5 md:px-7 text-left ${reveal.className}`}>
      <svg className="hub-soon__border" aria-hidden="true" focusable="false">
        <rect x="1" y="1" />
      </svg>
      <span className="inline-flex shrink-0 rounded-xl bg-white/5 p-3">
        <Icon className="h-6 w-6 text-rose-300" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-base md:text-lg font-bold text-white">{t(offer.titleKey)}</p>
        <p className="text-sm text-slate-300">{t(offer.taglineKey)}</p>
      </div>
    </div>
  );
}

function Facts() {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  const facts = [1, 2, 3, 4];
  return (
    <section ref={reveal.ref} aria-label={t('hub.factsTitle')} className={`mx-auto mt-16 md:mt-20 max-w-5xl ${reveal.className}`}>
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((n) => (
          <div key={n} className="hub-fact">
            <dt className="text-2xl md:text-3xl font-black text-white">{t(`hub.f${n}v`)}</dt>
            <dd className="mt-1 text-sm leading-snug text-slate-300">{t(`hub.f${n}`)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Steps() {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  return (
    <section ref={reveal.ref} aria-labelledby="hub-how" className={`mx-auto mt-20 md:mt-28 max-w-5xl ${reveal.className}`}>
      <h2 id="hub-how" className="text-center text-2xl md:text-4xl font-black text-white">{t('hub.howTitle')}</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <li key={n} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
            <span className="hub-step__n" aria-hidden="true">{n}</span>
            <h3 className="mt-3 text-lg md:text-xl font-bold text-white">{t(`hub.s${n}t`)}</h3>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-300">{t(`hub.s${n}d`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HubPage({ onSelectRole, onNavigateToSection }: HubPageProps) {
  const { t, i18n } = useTranslation();
  const lang: OfferLang = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  usePageTitle(hubPageTitle(lang));
  const available = getAvailableOffers();
  const soon = getSoonOffers();

  return (
    <div id="top" className="hub-root relative overflow-x-hidden text-white">
      <Header hub onSignIn={() => {}} onGetStarted={() => {}} onNavigateToSection={onNavigateToSection} />

      {/* Hero */}
      <section className="relative isolate flex min-h-[88vh] flex-col items-center justify-center px-4 pt-28 pb-24 text-center">
        <div className="hub-aurora" aria-hidden="true">
          <div className="hub-aurora__blob hub-aurora__blob--a" />
          <div className="hub-aurora__blob hub-aurora__blob--b" />
          <div className="hub-aurora__blob hub-aurora__blob--c" />
        </div>
        <div className="hub-grain" aria-hidden="true" />
        <div className="hub-fade-bottom" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="hub-mascot mb-8">
            <div className="hub-mascot__halo" aria-hidden="true" />
            <img src={harxMascotte} alt="HARX" className="hub-mascot__img" loading="eager" />
          </div>
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-sm font-semibold text-slate-100 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-rose-300" aria-hidden="true" />
            {t('hub.badge')}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
            {t('hub.title1')}{' '}
            <span className="hub-title-grad">{t('hub.title2')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base md:text-xl leading-relaxed text-slate-200">{t('hub.subtitle')}</p>
          <a href="#hub-offers" className="mt-10 inline-flex flex-col items-center gap-1 text-sm font-semibold text-slate-200 hover:text-white">
            {t('hub.scroll')}
            <ChevronDown className="hub-scrollcue h-6 w-6" aria-hidden="true" />
          </a>
        </div>
      </section>

      <main className="relative z-10 px-4 pb-20">
        <section id="hub-offers" aria-label={t('hub.offersAria')} className="mx-auto max-w-5xl scroll-mt-24">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-300">{t('hub.eyebrow')}</p>
            <h2 className="mt-2 text-3xl md:text-5xl font-black">{t('hub.offersTitle')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-slate-300">{t('hub.offersSub')}</p>
          </div>
          <div className="grid items-stretch gap-6 md:grid-cols-2">
            {available.map((offer, i) => (
              <OfferCard key={offer.id} offer={offer} lang={lang} index={i} onSelectRole={onSelectRole} />
            ))}
          </div>
          {soon.length > 0 && (
            <div className="mt-6">
              {soon.map((offer) => (
                <SoonCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </section>

        <Facts />
        <Steps />
      </main>

      <Footer />
    </div>
  );
}

export default HubPage;
