import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, ChevronDown, Layers, PhoneCall, Phone, Sparkles, Target, Wallet, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '../LandingPage/Header';
import { Footer } from '../LandingPage/Footer';
import type { SignupUserType } from '../ChoicePage';
import harxMascotte from '../LandingPage/assets/harx-mascotte.webp';
import { persistHarxLanguage } from '../../lib/i18n';
import { hardNavigate } from '../../lib/appNavigation';
import {
  getAvailableOffers,
  NEEDS,
  OFFERS,
  resolveChildTarget,
  resolveNeed,
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

/** Barre de progression de lecture (transform) et décalage parallaxe léger du hero. */
function useScrollEffects(barRef: React.RefObject<HTMLDivElement>, heroRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const y = window.scrollY;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (heroRef.current && y < window.innerHeight * 1.2) heroRef.current.style.setProperty('--sy', String(y));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [barRef, heroRef]);
}

/** Projecteur lumineux discret qui suit la souris (souris uniquement, pas en mouvement réduit). */
function useSpotlight(spotRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (spotRef.current) {
            spotRef.current.style.opacity = '1';
            spotRef.current.style.transform = `translate3d(${x - 260}px, ${y - 260}px, 0)`;
          }
        });
      }
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [spotRef]);
}

function Flow() {
  const { t } = useTranslation();
  const nodes: Array<{ id: string; label: string; icon?: LucideIcon; mascot?: boolean }> = [
    { id: 'company', label: t('hub.flow1'), icon: Building2 },
    { id: 'agents', label: t('hub.flow2'), mascot: true },
    { id: 'result', label: t('hub.flow3'), icon: Target },
    { id: 'pay', label: t('hub.flow4'), icon: Wallet },
  ];
  return (
    <ol className="hub-flow" aria-label={t('hub.flowAria')} data-testid="hub-flow">
      {nodes.map((n, i) => {
        const Icon = n.icon;
        return (
          <React.Fragment key={n.id}>
            <li className="hub-flow__node" style={{ ['--i' as string]: i }}>
              <span className={`hub-flow__circle${n.mascot ? ' hub-flow__circle--mascot' : ''}`}>
                {n.mascot ? <img src={harxMascotte} alt="" className="hub-flow__mascot" /> : Icon && <Icon className="h-6 w-6" aria-hidden="true" />}
              </span>
              <span className="hub-flow__label">{n.label}</span>
            </li>
            {i < nodes.length - 1 && (
              <li className="hub-flow__link" aria-hidden="true">
                <span className="hub-flow__dot" style={{ ['--d' as string]: `${i * 0.6}s` }} />
              </li>
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}

function Hero({ heroRef }: { heroRef: React.RefObject<HTMLElement> }) {
  const { t } = useTranslation();
  const go = () => {
    const el = document.getElementById('hub-story');
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
  const lines = ['l1', 'l2', 'l3'];
  return (
    <section ref={heroRef} className="hub-hero relative isolate flex items-center overflow-hidden px-4" data-testid="hub-hero">
      <div className="hub-aurora" aria-hidden="true">
        <div className="hub-aurora__blob hub-aurora__blob--a" />
        <div className="hub-aurora__blob hub-aurora__blob--b" />
        <div className="hub-aurora__blob hub-aurora__blob--c" />
      </div>
      <div className="hub-grain" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.2fr_.8fr] lg:gap-12">
        <div className="hub-parallax text-center lg:text-left">
          <h1 className="hub-h1 font-black leading-[1.05] tracking-tight">
            {lines.map((k, i) => (
              <span key={k} className="hub-line block" style={{ ['--i' as string]: i }}>{t(`hub.${k}`)}</span>
            ))}
            <span className="hub-line hub-title-grad block" style={{ ['--i' as string]: 3 }}>{t('hub.l4')}</span>
          </h1>
          <p className="hub-line mx-auto mt-3 max-w-xl text-sm md:text-lg leading-snug text-slate-200 lg:mx-0" style={{ ['--i' as string]: 4.5 }}>
            {t('hub.heroSub')}
          </p>
          <div className="hub-line mt-4 md:mt-6 flex justify-center lg:justify-start" style={{ ['--i' as string]: 5.2 }}>
            <button type="button" onClick={go} data-testid="hub-discover" className="hub-cta inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d4d] to-[#ec4899] px-8 text-base font-bold text-white shadow-lg shadow-rose-500/30 transition-transform active:scale-[0.98]">
              {t('hub.discover')}
              <ChevronDown className="hub-bob h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="hub-parallax hub-parallax--slow hub-line" style={{ ['--i' as string]: 4 }}>
          <Flow />
        </div>
      </div>
    </section>
  );
}

function SectionHead({ kicker, title, sub, id }: { kicker: string; title: string; sub?: string; id?: string }) {
  return (
    <div className="mb-8 md:mb-10 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-300">{kicker}</p>
      <h2 id={id} className="mt-2 text-3xl md:text-5xl font-black leading-tight">{title}</h2>
      {sub && <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-slate-300">{sub}</p>}
    </div>
  );
}

/** Mini-interaction AVANT / AVEC HARX, strictement qualitative. */
function Compare() {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  const [withHarx, setWithHarx] = useState(false);
  const keys = (withHarx ? ['a1', 'a2', 'a3', 'a4'] : ['b1', 'b2', 'b3', 'b4']).map((k) => `hub.${k}`);
  return (
    <section ref={reveal.ref} aria-labelledby="hub-prob" className={`hub-section mx-auto max-w-4xl ${reveal.className}`} data-testid="hub-compare">
      <SectionHead kicker={t('hub.probKicker')} title={t('hub.probTitle')} sub={t('hub.probSub')} id="hub-prob" />
      <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/[0.05] p-1.5" role="group" aria-label={t('hub.probSub')}>
        <button type="button" aria-pressed={!withHarx} data-testid="compare-before" onClick={() => setWithHarx(false)} className={`hub-pill${!withHarx ? ' is-on' : ''}`}>{t('hub.before')}</button>
        <button type="button" aria-pressed={withHarx} data-testid="compare-after" onClick={() => setWithHarx(true)} className={`hub-pill${withHarx ? ' is-on' : ''}`}>{t('hub.after')}</button>
      </div>
      <div className={`hub-compare mt-8 ${withHarx ? 'is-after' : 'is-before'}`} aria-live="polite">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300">{withHarx ? t('hub.afterLead') : t('hub.beforeLead')}</p>
        <ul className="mt-5 grid gap-3" key={withHarx ? 'after' : 'before'}>
          {keys.map((k, i) => (
            <li key={k} className="hub-compare__row" style={{ ['--i' as string]: i }}>
              {withHarx ? <CheckCircle2 className="h-6 w-6 shrink-0 text-rose-300" aria-hidden="true" /> : <span className="hub-compare__x" aria-hidden="true">×</span>}
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  const steps = [
    { n: 1, icon: Target },
    { n: 2, icon: Sparkles },
    { n: 3, icon: Wallet },
  ];
  return (
    <section ref={reveal.ref} aria-labelledby="hub-how" className={`hub-section mx-auto max-w-6xl ${reveal.className}`} data-testid="hub-how">
      <SectionHead kicker={t('hub.howKicker')} title={t('hub.howTitle2')} sub={t('hub.howSub')} id="hub-how" />
      <ol className="hub-steps grid gap-5 md:grid-cols-3">
        <span className="hub-steps__line" aria-hidden="true" />
        {steps.map(({ n, icon: Icon }) => (
          <li key={n} className="hub-step relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-7" style={{ ['--i' as string]: n }}>
            <span className="hub-step__badge"><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <span className="hub-step__n" aria-hidden="true">{n}</span>
            <h3 className="mt-4 text-xl font-bold text-white">{t(`hub.st${n}t`)}</h3>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-300">{t(`hub.st${n}d`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Telephony({ lang }: { lang: OfferLang }) {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  const offer = OFFERS.find((o) => o.id === 'telephony');
  if (!offer) return null;
  return (
    <section ref={reveal.ref} aria-labelledby="hub-phone" className={`hub-section mx-auto max-w-6xl ${reveal.className}`} data-testid="hub-phone">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-300">{t('hub.phoneKicker')}</p>
          <h2 id="hub-phone" className="mt-2 text-3xl md:text-5xl font-black leading-tight">{t('hub.phoneTitle')}</h2>
          <p className="mt-4 max-w-xl text-base md:text-lg leading-relaxed text-slate-200">{t('hub.phoneText')}</p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="hub-chip">{t(`hub.ph${n}`)}</li>
            ))}
          </ul>
          <a
            href={resolveOfferHref(offer, lang) ?? '#'}
            data-testid="phone-cta"
            onClick={(e) => {
              e.preventDefault();
              openOffer(offer, lang);
            }}
            className="hub-cta mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d4d] to-[#ec4899] px-8 text-base font-bold text-white shadow-lg shadow-rose-500/30"
          >
            {t(offer.ctaKey)}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
        <div className="hub-phone" aria-hidden="true">
          <span className="hub-phone__ring hub-phone__ring--1" />
          <span className="hub-phone__ring hub-phone__ring--2" />
          <span className="hub-phone__ring hub-phone__ring--3" />
          <span className="hub-phone__core"><PhoneCall className="h-10 w-10" /></span>
          <p className="hub-phone__caption">{t('hub.phoneVisual')}</p>
        </div>
      </div>
    </section>
  );
}

/** Compteur qui se dessine à l'entrée dans l'écran ; valeur finale affichée d'emblée en mouvement réduit. */
function CountUp({ to, lang }: { to: number; lang: OfferLang }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(prefersReducedMotion() || typeof IntersectionObserver === 'undefined' ? to : 0);
  useEffect(() => {
    const el = ref.current;
    if (!el || v === to || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1600);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref}>{v.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR')}+</span>;
}

function Network({ lang }: { lang: OfferLang }) {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  return (
    <section ref={reveal.ref} aria-label={t('hub.netKicker')} className={`hub-section mx-auto max-w-5xl text-center ${reveal.className}`} data-testid="hub-network">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-300">{t('hub.netKicker')}</p>
      <p className="hub-title-grad mt-2 text-6xl md:text-8xl font-black leading-none" data-testid="hub-count"><CountUp to={60000} lang={lang} /></p>
      <p className="mt-2 text-2xl md:text-3xl font-black">{t('hub.netLabel')}</p>
      <p className="mx-auto mt-3 max-w-xl text-base md:text-lg text-slate-300">{t('hub.netText')}</p>
    </section>
  );
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

function Needs({ lang, onSelectRole }: { lang: OfferLang; onSelectRole: (role: SignupUserType) => void }) {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLElement>();
  return (
    <section ref={reveal.ref} aria-labelledby="hub-needs" className={`mx-auto max-w-6xl ${reveal.className}`}>
      <h3 id="hub-needs" className="mb-5 text-center text-xl md:text-2xl font-bold text-white">{t('hub.needsTitle')}</h3>
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


export function HubPage({ onSelectRole, onNavigateToSection }: HubPageProps) {
  const { t, i18n } = useTranslation();
  const lang: OfferLang = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  usePageTitle(hubPageTitle(lang));
  const available = getAvailableOffers();
  const barRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  useScrollEffects(barRef, heroRef);
  useSpotlight(spotRef);

  return (
    <div id="top" className="hub-root relative overflow-x-hidden text-white">
      <div ref={barRef} className="hub-progress" aria-hidden="true" />
      <div ref={spotRef} className="hub-spot" aria-hidden="true" />
      <Header hub onSignIn={() => {}} onGetStarted={() => {}} onNavigateToSection={onNavigateToSection} />

      <Hero heroRef={heroRef} />

      <main id="hub-story" className="relative z-10 space-y-24 px-4 pb-20 pt-20 md:space-y-36 md:pt-32">
        <Compare />
        <HowItWorks />
        <Telephony lang={lang} />
        <Network lang={lang} />

        <section id="hub-offers" aria-label={t('hub.offersAria')} className="hub-section mx-auto max-w-6xl scroll-mt-24">
          <SectionHead kicker={t('hub.chooseKicker')} title={t('hub.chooseTitle')} sub={t('hub.offersSub')} />
          <Needs lang={lang} onSelectRole={onSelectRole} />
          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2">
            {available.map((offer, i) => (
              <OfferCard key={offer.id} offer={offer} lang={lang} index={i} onSelectRole={onSelectRole} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HubPage;
