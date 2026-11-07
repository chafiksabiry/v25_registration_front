import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Layers, Phone, Sparkles, CheckCircle2, type LucideIcon } from 'lucide-react';
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
  NEEDS,
  OFFERS,
  resolveNeed,
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
      <div className="flex items-start gap-3.5">
        <span className="hub-icon shrink-0">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-black leading-tight text-white">{t(offer.titleKey)}</h2>
          <p className="mt-0.5 text-sm md:text-base font-semibold leading-snug text-rose-300">{t(offer.taglineKey)}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-snug text-slate-300">{t(offer.forWhoKey)}</p>

      {offer.children.length > 0 && (
        <ul className="mt-3.5 grid gap-2" data-testid={`offer-children-${offer.id}`}>
          {offer.children.map((child, i) => {
            const target = resolveChildTarget(child, lang);
            return (
              <li key={child.id}>
                <a
                  href={target.type === 'href' ? target.href : '#'}
                  data-testid={`offer-child-${offer.id}-${child.id}`}
                  onClick={(e) => openChild(e, child)}
                  className="hub-child text-sm md:text-[15px]"
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

      <ul className="hub-bullets mt-4 flex-1 space-y-2">
        {offer.bulletKeys.map((key) => (
          <li key={key} className="flex items-start gap-2.5 text-sm text-slate-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span className="leading-snug">{t(key)}</span>
          </li>
        ))}
      </ul>
      <div className="flex-1" />

      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          openOffer(offer, lang);
        }}
        className="hub-cta mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d4d] to-[#ec4899] px-4 text-center text-base font-bold text-white shadow-lg shadow-rose-500/30 transition-transform active:scale-[0.98]"
      >
        {t(offer.ctaKey)}
        <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
      </a>

      {signInHref && (
        <p className="mt-2.5 text-center text-sm text-slate-300">
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
    <div ref={reveal.ref} data-testid={`offer-soon-${offer.id}`} className={`hub-soon flex items-center gap-4 px-5 py-3 md:px-6 text-left ${reveal.className}`}>
      <svg className="hub-soon__border" aria-hidden="true" focusable="false">
        <rect x="1" y="1" />
      </svg>
      <span className="inline-flex shrink-0 rounded-xl bg-white/5 p-2.5">
        <Icon className="h-5 w-5 text-rose-300" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-base md:text-lg font-bold text-white">{t(offer.titleKey)}</p>
        <p className="text-sm text-slate-300">{t(offer.taglineKey)}</p>
      </div>
    </div>
  );
}

function Needs({ lang, onSelectRole }: { lang: OfferLang; onSelectRole: (role: SignupUserType) => void }) {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  return (
    <section ref={reveal.ref} aria-labelledby="hub-needs" className={`mx-auto mt-16 md:mt-24 max-w-6xl ${reveal.className}`}>
      <div className="mb-8 text-center">
        <h2 id="hub-needs" className="text-3xl md:text-4xl font-black">{t('hub.needsTitle')}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-slate-300">{t('hub.needsSub')}</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {NEEDS.map((need) => {
          const r = resolveNeed(need);
          if (!r) return null;
          const target = resolveChildTarget(r.child, lang);
          return (
            <li key={need.id}>
              <a
                href={target.type === 'href' ? target.href : '#'}
                data-testid={`need-${need.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (target.type === 'role') onSelectRole(target.role);
                  else {
                    persistLang(lang);
                    hardNavigate(target.href);
                  }
                }}
                className="hub-need group flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <span className="text-lg font-bold leading-snug text-white">{t(need.questionKey)}</span>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-rose-300">
                  {t(r.child.labelKey)}
                  <ArrowRight className="hub-child__arrow h-4 w-4 shrink-0" aria-hidden="true" />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Detail({ lang, onSelectRole }: { lang: OfferLang; onSelectRole: (role: SignupUserType) => void }) {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  return (
    <section ref={reveal.ref} aria-labelledby="hub-detail" className={`mx-auto mt-20 md:mt-28 max-w-6xl ${reveal.className}`}>
      <h2 id="hub-detail" className="text-center text-3xl md:text-4xl font-black">{t('hub.detailTitle')}</h2>
      <div className="mt-10 space-y-14">
        {getAvailableOffers(OFFERS).map((offer) => {
          const Icon = ICONS[offer.icon];
          return (
            <div key={offer.id} data-testid={`detail-${offer.id}`}>
              <div className="flex items-start gap-4">
                <span className="hub-icon shrink-0"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <div>
                  <h3 className="text-2xl font-black text-white">{t(offer.titleKey)}</h3>
                  <p className="mt-1 max-w-3xl text-base md:text-lg leading-relaxed text-slate-200">{t(offer.pitchKey)}</p>
                </div>
              </div>
              <ul className={`mt-6 grid gap-4 sm:grid-cols-2 ${offer.children.length > 2 ? 'lg:grid-cols-4' : ''}`}>
                {offer.children.map((child) => {
                  const target = resolveChildTarget(child, lang);
                  return (
                    <li key={child.id} className="flex">
                      <a
                        href={target.type === 'href' ? target.href : '#'}
                        data-testid={`detail-${offer.id}-${child.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (target.type === 'role') onSelectRole(target.role);
                          else {
                            persistLang(lang);
                            hardNavigate(target.href);
                          }
                        }}
                        className="hub-need flex w-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                      >
                        <span className="text-lg font-black text-white">{t(child.labelKey)}</span>
                        <span className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">{t(child.descKey)}</span>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-rose-300">
                          {t('hub.open')}
                          <ArrowRight className="hub-child__arrow h-4 w-4 shrink-0" aria-hidden="true" />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FinalCta({ lang }: { lang: OfferLang }) {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  return (
    <section ref={reveal.ref} aria-labelledby="hub-final" className={`mx-auto mt-20 md:mt-28 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#ff4d4d]/25 via-[#ec4899]/20 to-[#7c3aed]/20 px-6 py-10 text-center md:px-12 ${reveal.className}`}>
      <h2 id="hub-final" className="text-3xl md:text-4xl font-black">{t('hub.ctaTitle')}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-slate-200">{t('hub.ctaText')}</p>
      <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {getAvailableOffers().map((offer, i) => (
          <a
            key={offer.id}
            href={resolveOfferHref(offer, lang) ?? '#'}
            data-testid={`final-cta-${offer.id}`}
            onClick={(e) => {
              e.preventDefault();
              openOffer(offer, lang);
            }}
            className={`hub-cta inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-7 text-base font-bold text-white transition-transform active:scale-[0.98] ${
              i === 0 ? 'bg-gradient-to-r from-[#ff4d4d] to-[#ec4899] shadow-lg shadow-rose-500/30' : 'border border-white/40 bg-white/10 hover:bg-white/20'
            }`}
          >
            {t(offer.ctaKey)}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}

function Facts() {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  const facts = [1, 2, 3, 4];
  return (
    <section ref={reveal.ref} aria-label={t('hub.factsTitle')} className={`mx-auto mt-20 md:mt-28 max-w-5xl ${reveal.className}`}>
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

      {/* Premier écran : en-tête, titre court, accroche et cartes d'offres, sans défiler */}
      <div className="hub-top relative isolate px-4">
        <div className="hub-aurora" aria-hidden="true">
          <div className="hub-aurora__blob hub-aurora__blob--a" />
          <div className="hub-aurora__blob hub-aurora__blob--b" />
          <div className="hub-aurora__blob hub-aurora__blob--c" />
        </div>
        <div className="hub-grain" aria-hidden="true" />

        <section className="hub-hero relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-5">
            <div className="hub-mascot">
              <div className="hub-mascot__halo" aria-hidden="true" />
              <img src={harxMascotte} alt="HARX" className="hub-mascot__img" loading="eager" />
            </div>
            <h1 className="hub-h1 font-black leading-[1.05] tracking-tight">
              {t('hub.title1')}{' '}
              <span className="hub-title-grad">{t('hub.title2')}</span>
            </h1>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-balance text-sm md:text-lg leading-snug text-slate-200">{t('hub.subtitle')}</p>
        </section>

        <section id="hub-offers" aria-label={t('hub.offersAria')} className="relative z-10 mx-auto mt-4 md:mt-5 max-w-6xl scroll-mt-20 pb-6">
          <div className="grid items-stretch gap-4 md:grid-cols-2 md:gap-5">
            {available.map((offer, i) => (
              <OfferCard key={offer.id} offer={offer} lang={lang} index={i} onSelectRole={onSelectRole} />
            ))}
          </div>
          {soon.length > 0 && (
            <div className="mt-4">
              {soon.map((offer) => (
                <SoonCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </section>
      </div>

      <main className="relative z-10 px-4 pb-20">
        <Needs lang={lang} onSelectRole={onSelectRole} />
        <Detail lang={lang} onSelectRole={onSelectRole} />
        <Facts />
        <Steps />
        <FinalCta lang={lang} />
      </main>

      <Footer />
    </div>
  );
}

export default HubPage;
