import React from 'react';
import { ArrowRight, Layers, Phone, Sparkles, CheckCircle2, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '../LandingPage/Header';
import harxMascotte from '../LandingPage/assets/harx-mascotte.webp';
import { persistHarxLanguage } from '../../lib/i18n';
import { hardNavigate } from '../../lib/appNavigation';
import {
  getAvailableOffers,
  getSoonOffers,
  resolveOfferHref,
  type OfferConfig,
  type OfferIcon,
  type OfferLang,
} from '../../config/offers';
import { usePageTitle } from '../../lib/tracking/usePageTitle';
import { hubPageTitle } from '../../lib/tracking/hubMeta';

const ICONS: Record<OfferIcon, LucideIcon> = {
  layers: Layers,
  phone: Phone,
  sparkles: Sparkles,
};

interface HubPageProps {
  onSignIn: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

/** Ouvre l'offre : navigation dure (page ou application distincte), en mémorisant la langue choisie. */
export function openOffer(offer: OfferConfig, lang: OfferLang) {
  const href = resolveOfferHref(offer, lang);
  if (!href) return;
  try {
    persistHarxLanguage(lang, lang === 'en' ? { explicit: true } : undefined);
  } catch {
    /* ignore */
  }
  hardNavigate(href);
}

function OfferCard({ offer, lang }: { offer: OfferConfig; lang: OfferLang }) {
  const { t } = useTranslation();
  const Icon = ICONS[offer.icon];
  const href = resolveOfferHref(offer, lang) ?? '#';
  return (
    <article
      data-testid={`offer-card-${offer.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-harx-400/50 hover:bg-white/[0.07]"
    >
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-harx-500/15 blur-3xl transition-opacity group-hover:opacity-100 opacity-70" aria-hidden="true" />
      <div className="relative mb-5 inline-flex w-fit rounded-2xl bg-gradient-to-br from-harx-500 to-harx-alt-500 p-3 shadow-lg shadow-harx-500/30">
        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
      <h2 className="relative text-2xl md:text-3xl font-black leading-tight text-white">{t(offer.titleKey)}</h2>
      <p className="relative mt-2 text-base md:text-lg font-semibold leading-snug text-harx-300">{t(offer.taglineKey)}</p>
      <ul className="relative mt-5 flex-1 space-y-3">
        {offer.bulletKeys.map((key) => (
          <li key={key} className="flex items-start gap-3 text-sm md:text-base text-slate-300">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-harx-400" aria-hidden="true" />
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
        className="relative mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-harx-500 to-harx-alt-500 px-4 text-center text-base font-bold text-white shadow-lg shadow-harx-500/25 transition-all hover:shadow-harx-500/40 active:scale-[0.98]"
      >
        {t(offer.ctaKey)}
        <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
      </a>
    </article>
  );
}

function SoonCard({ offer }: { offer: OfferConfig }) {
  const { t } = useTranslation();
  const Icon = ICONS[offer.icon];
  return (
    <div
      data-testid={`offer-soon-${offer.id}`}
      className="flex items-center gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-4 text-left"
    >
      <span className="inline-flex shrink-0 rounded-xl bg-white/5 p-2.5">
        <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm md:text-base font-bold text-slate-200">{t(offer.titleKey)}</p>
        <p className="text-xs md:text-sm text-slate-400">{t(offer.taglineKey)}</p>
      </div>
    </div>
  );
}

export function HubPage({ onSignIn, onNavigateToSection }: HubPageProps) {
  const { t, i18n } = useTranslation();
  const lang: OfferLang = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  usePageTitle(hubPageTitle(lang));
  const available = getAvailableOffers();
  const soon = getSoonOffers();

  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden bg-space-dark-default text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-harx-500/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-harx-alt-500/10 blur-[150px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      <Header hub onSignIn={onSignIn} onGetStarted={() => {}} onNavigateToSection={onNavigateToSection} />

      <main className="relative z-10 container mx-auto px-4 pt-28 md:pt-32 pb-16">
        <div className="mx-auto max-w-5xl text-center">
          <div className="relative mx-auto mb-6 w-full max-w-[150px] md:max-w-[180px]">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-harx-500/20 to-harx-alt-500/20 blur-2xl" />
            <img src={harxMascotte} alt="HARX" className="relative z-10 h-auto w-full object-contain animate-float" loading="eager" />
          </div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-slate-200 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-harx-400" aria-hidden="true" />
            {t('hub.badge')}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
            {t('hub.title1')}{' '}
            <span className="bg-gradient-to-r from-harx-400 via-harx-alt-400 to-harx-500 bg-clip-text text-transparent">
              {t('hub.title2')}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-300">{t('hub.subtitle')}</p>
        </div>

        <section aria-label={t('hub.offersAria')} className="mx-auto mt-10 md:mt-14 max-w-5xl">
          <div className="grid items-stretch gap-6 md:grid-cols-2">
            {available.map((offer) => (
              <OfferCard key={offer.id} offer={offer} lang={lang} />
            ))}
          </div>
          {soon.length > 0 && (
            <div className="mx-auto mt-6 max-w-5xl">
              {soon.map((offer) => (
                <SoonCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default HubPage;
