import React, { useState } from 'react';
import { ArrowRight, Building2, PhoneCall, PhoneIncoming, Sparkles, Target, Voicemail, Wallet, Layers, Phone, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../LandingPage/Header';
import type { SignupUserType } from '../ChoicePage';
import harxMascotte from '../LandingPage/assets/harx-mascotte.webp';
import { persistHarxLanguage } from '../../lib/i18n';
import { hardNavigate } from '../../lib/appNavigation';
import {
  getAvailableOffers,
  resolveChildTarget,
  resolveOfferHref,
  resolveOfferSignInHref,
  type FlowIcon,
  type OfferChild,
  type OfferConfig,
  type OfferIcon,
  type OfferLang,
} from '../../config/offers';
import { usePageTitle } from '../../lib/tracking/usePageTitle';
import { hubPageTitle } from '../../lib/tracking/hubMeta';
import './hub.css';

const OFFER_ICONS: Record<OfferIcon, LucideIcon> = { layers: Layers, phone: Phone, sparkles: Sparkles };
const FLOW_ICONS: Record<Exclude<FlowIcon, 'mascot'>, LucideIcon> = {
  building: Building2,
  target: Target,
  wallet: Wallet,
  phone: PhoneCall,
  calls: PhoneIncoming,
  voicemail: Voicemail,
  sparkles: Sparkles,
};

interface HubPageProps {
  /** Même mécanisme que les cartes de /auth/choice (pendingUserType + retour). */
  onSelectRole: (role: SignupUserType) => void;
  onNavigateToSection?: (sectionId: string) => void;
}

function persistLang(lang: OfferLang) {
  try {
    persistHarxLanguage(lang, lang === 'en' ? { explicit: true } : undefined);
  } catch {
    /* ignore */
  }
}

/** Ouvre l'offre : navigation dure (page ou application distincte), en mémorisant la langue choisie. */
export function openOffer(offer: OfferConfig, lang: OfferLang) {
  const href = resolveOfferHref(offer, lang);
  if (!href) return;
  persistLang(lang);
  hardNavigate(href);
}

function Flow({ offer, base }: { offer: OfferConfig; base: number }) {
  const { t } = useTranslation();
  const steps = offer.hero.flow;
  return (
    <ol className="hub-flow hub-rise" style={{ ['--b' as string]: base, ['--i' as string]: 4 }} data-testid={`hub-flow-${offer.id}`}>
      {steps.map((step, i) => {
        const Icon = step.icon === 'mascot' ? null : FLOW_ICONS[step.icon];
        return (
          <React.Fragment key={step.key}>
            <li className="hub-flow__node">
              <span className={`hub-flow__circle${Icon ? '' : ' hub-flow__circle--mascot'}`}>
                {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : <img src={harxMascotte} alt="" className="hub-flow__mascot" />}
              </span>
              <span className="hub-flow__label">{t(step.key)}</span>
            </li>
            {i < steps.length - 1 && (
              <li className="hub-flow__link" aria-hidden="true">
                <span className="hub-flow__dot" style={{ ['--d' as string]: `${i * 0.55}s` }} />
              </li>
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}

function Panel({ offer, index, active, lang, onSelectRole }: { offer: OfferConfig; index: number; active: boolean; lang: OfferLang; onSelectRole: (role: SignupUserType) => void }) {
  const { t } = useTranslation();
  const Icon = OFFER_ICONS[offer.icon];
  const href = resolveOfferHref(offer, lang) ?? '#';
  const signInHref = resolveOfferSignInHref(offer, lang);
  const lines = offer.hero.lineKeys;
  const b = { ['--b' as string]: index };

  const openChild = (e: React.MouseEvent, child: OfferChild) => {
    e.preventDefault();
    const target = resolveChildTarget(child, lang);
    if (target.type === 'role') onSelectRole(target.role);
    else {
      persistLang(lang);
      hardNavigate(target.href);
    }
  };

  return (
    <section
      id={`hub-panel-${offer.id}`}
      role="tabpanel"
      aria-label={t(offer.titleKey)}
      data-testid={`hub-panel-${offer.id}`}
      data-active={active}
      className="hub-panel"
    >
      <span className="hub-kicker hub-rise" style={{ ...b, ['--i' as string]: 0 }}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {t(offer.titleKey)}
      </span>
      <h2 className="hub-h2 mt-3">
        {lines.map((k, i) => (
          <span key={k} className="hub-rise block" style={{ ...b, ['--i' as string]: i + 1 }}>{t(k)}</span>
        ))}
        <span className="hub-rise hub-title-grad block" style={{ ...b, ['--i' as string]: lines.length + 1 }}>{t(offer.hero.accentKey)}</span>
      </h2>
      {offer.hero.subKey && (
        <p className="hub-rise hub-sub mt-2 max-w-md text-sm leading-snug text-slate-200" style={{ ...b, ['--i' as string]: lines.length + 2 }}>{t(offer.hero.subKey)}</p>
      )}
      <div className="mt-4"><Flow offer={offer} base={index} /></div>

      <div className="hub-rise mt-4 flex flex-col items-start gap-2.5" style={{ ...b, ['--i' as string]: 6 }}>
        <a
          href={href}
          data-testid={`panel-cta-${offer.id}`}
          onClick={(e) => {
            e.preventDefault();
            openOffer(offer, lang);
          }}
          className="hub-cta inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d4d] to-[#ec4899] px-7 text-base font-bold text-white shadow-lg shadow-rose-500/30 transition-transform active:scale-[0.98]"
        >
          {t(offer.ctaKey)}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </a>
        {offer.children.length > 0 && (
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5" data-testid={`offer-children-${offer.id}`}>
            {offer.children.map((child) => {
              const target = resolveChildTarget(child, lang);
              const mini = offer.children.length > 2;
              return (
                <li key={child.id}>
                  <a
                    href={target.type === 'href' ? target.href : '#'}
                    data-testid={`offer-child-${offer.id}-${child.id}`}
                    onClick={(e) => openChild(e, child)}
                    className={mini ? 'hub-mini' : 'hub-link'}
                  >
                    {t(child.labelKey)}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
        {signInHref && (
          <p className="text-sm text-slate-300">
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
      </div>
    </section>
  );
}

function ThinFooter() {
  const { t } = useTranslation();
  const links = [
    { to: '/privacy', label: t('footer.navPrivacy', 'Privacy Policy') },
    { to: '/terms', label: t('footer.navTerms', 'Terms of Service') },
    { to: '/cookies', label: t('footer.navCookie', 'Cookie Policy') },
    { to: '/gdpr', label: t('footer.navGDPR', 'GDPR Compliance') },
  ];
  return (
    <footer className="hub-foot" aria-label={t('hub.legalAria')}>
      {links.map((l) => (
        <Link key={l.to} to={l.to} data-testid={`legal-${l.to.slice(1)}`}>{l.label}</Link>
      ))}
      <span>{t('footer.rights', '© {{year}} HARX Technologies Inc. All rights reserved.', { year: new Date().getFullYear() })}</span>
    </footer>
  );
}

export function HubPage({ onSelectRole, onNavigateToSection }: HubPageProps) {
  const { t, i18n } = useTranslation();
  const lang: OfferLang = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  usePageTitle(hubPageTitle(lang));
  const offers = getAvailableOffers();
  const [activeId, setActiveId] = useState(offers[0]?.id ?? '');

  return (
    <div id="top" className="hub-root hub-screen relative overflow-x-hidden text-white">
      <Header hub onSignIn={() => {}} onGetStarted={() => {}} onNavigateToSection={onNavigateToSection} />

      <main className="hub-stage" aria-label={t('hub.offersAria')}>
        <div className="hub-aurora" aria-hidden="true">
          <div className="hub-aurora__blob hub-aurora__blob--a" />
          <div className="hub-aurora__blob hub-aurora__blob--b" />
          <div className="hub-aurora__blob hub-aurora__blob--c" />
        </div>
        <div className="hub-grain" aria-hidden="true" />

        {/* Mobile : un panneau à la fois */}
        <div className="hub-tabs" role="tablist" aria-label={t('hub.tabsAria')}>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] p-1.5">
            {offers.map((o) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                aria-selected={activeId === o.id}
                aria-controls={`hub-panel-${o.id}`}
                data-testid={`hub-tab-${o.id}`}
                onClick={() => setActiveId(o.id)}
                className={`hub-pill${activeId === o.id ? ' is-on' : ''}`}
              >
                {t(o.navKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="hub-panels" data-count={offers.length}>
          {offers.map((o, i) => (
            <Panel key={o.id} offer={o} index={i} active={activeId === o.id} lang={lang} onSelectRole={onSelectRole} />
          ))}
        </div>
      </main>

      <ThinFooter />
    </div>
  );
}

export default HubPage;
