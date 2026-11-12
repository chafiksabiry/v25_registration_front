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
  isChildComingSoon,
  resolveOfferHref,
  resolveOfferSignInHref,
  type FlowIcon,
  type OfferChild,
  type OfferConfig,
  type OfferIcon,
  type OfferLang,
} from '../../config/offers';
import { normalizeSiteLang } from '../../lib/langRoutes';
import { TAAS_REPS } from '../../lib/taasPaths';
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

function Flow({ offer }: { offer: OfferConfig }) {
  const { t } = useTranslation();
  const steps = offer.hero.flow;
  return (
    <ol className="hub-flow" data-testid={`hub-flow-${offer.id}`}>
      {steps.map((step, i) => {
        const Icon = step.icon === 'mascot' ? null : FLOW_ICONS[step.icon];
        return (
          <li key={step.key} className="hub-flow__node">
            <span className="hub-flow__circle">
              {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : <img src={harxMascotte} alt="" className="hub-flow__mascot" />}
            </span>
            {i < steps.length - 1 && (
              <span className="hub-flow__link" aria-hidden="true">
                <span className="hub-flow__dot" style={{ ['--d' as string]: `${i * 0.55}s` }} />
              </span>
            )}
            <span className="hub-flow__label">{t(step.key)}</span>
          </li>
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
      data-offer={offer.id}
      style={b}
    >
      <div className="hub-cell hub-cell--kicker hub-rise" style={{ ['--i' as string]: 0 }}>
        <span className="hub-kicker" data-row="kicker">
          <span className="hub-kicker__badge"><Icon className="h-4 w-4" aria-hidden="true" /></span>
          {t(offer.titleKey)}
        </span>
      </div>
      <h2 className="hub-cell hub-h2 hub-rise" style={{ ['--i' as string]: 1 }} data-row="title">{t(offer.hero.defKey)}</h2>
      <p className={`hub-cell hub-support hub-rise${offer.hero.supportQuote ? ' hub-support--quote' : ''}`} style={{ ['--i' as string]: 2 }} data-row="support">
        {t(offer.hero.supportKey)}
      </p>
      <div className="hub-cell hub-rise" style={{ ['--i' as string]: 3 }} data-row="flow"><Flow offer={offer} /></div>
      <div className="hub-cell hub-rise" style={{ ['--i' as string]: 4 }} data-row="cta">
        <a
          href={href}
          data-testid={`panel-cta-${offer.id}`}
          onClick={(e) => {
            e.preventDefault();
            openOffer(offer, lang);
          }}
          className="hub-cta"
        >
          {t(offer.ctaKey)}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
      <div className="hub-cell hub-rise" style={{ ['--i' as string]: 5 }} data-row="links">
        {offer.children.length > 0 && (
          <ul className="hub-links" data-testid={`offer-children-${offer.id}`}>
            {offer.children.map((child) => {
              const target = resolveChildTarget(child, lang);
              const mini = !child.hintKey;
              if (isChildComingSoon(child)) {
                return (
                  <li key={child.id} className={mini ? '' : 'hub-links__item'}>
                    <span className="hub-link hub-link--soon" aria-disabled="true" data-testid={`offer-child-${offer.id}-${child.id}`}>
                      {t(child.labelKey)}
                      <span className="hub-soon">{t('hub.comingSoon')}</span>
                    </span>
                    {child.hintKey && <span className="hub-hint">{t(child.hintKey)}</span>}
                  </li>
                );
              }
              return (
                <li key={child.id} className={mini ? '' : 'hub-links__item'}>
                  <a
                    href={target.type === 'href' ? target.href : target.role === 'rep' ? `/${lang}${TAAS_REPS}` : '#'}
                    data-testid={`offer-child-${offer.id}-${child.id}`}
                    onClick={(e) => openChild(e, child)}
                    className={mini ? 'hub-mini' : 'hub-link'}
                  >
                    {t(child.labelKey)}
                  </a>
                  {child.hintKey && <span className="hub-hint">{t(child.hintKey)}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="hub-cell hub-note hub-rise" style={{ ['--i' as string]: 6 }} data-row="note">{t(offer.hero.noteKey)}</p>
      <p className="hub-cell hub-signin hub-rise" style={{ ['--i' as string]: 7 }} data-row="signin">
        {signInHref && (
          <>
            {t('hub.alreadyClient')}{' '}
            <a
              href={signInHref}
              data-testid={`offer-signin-${offer.id}`}
              onClick={(e) => {
                e.preventDefault();
                persistLang(lang);
                hardNavigate(signInHref);
              }}
            >
              {t('hub.signIn')}
            </a>
          </>
        )}
      </p>
    </section>
  );
}

export function ThinFooter() {
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
      <button type="button" className="hub-foot-link" data-testid="legal-manage-cookies" onClick={() => window.dispatchEvent(new Event('harx:open-consent'))}>
        {t('footer.manageCookies', 'Manage cookies')}
      </button>
      <span>{t('footer.rights', '© {{year}} HARX Technologies Inc. All rights reserved.', { year: new Date().getFullYear() })}</span>
    </footer>
  );
}

export function HubPage({ onSelectRole, onNavigateToSection }: HubPageProps) {
  const { t, i18n } = useTranslation();
  const lang: OfferLang = normalizeSiteLang(i18n.language);
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

        <p className="hub-defline hub-rise" style={{ ['--i' as string]: 0 }} data-testid="hub-definition">{t('hub.definition')}</p>

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

        <div className="hub-panels" data-count={offers.length} style={{ ['--n' as string]: offers.length }}>
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
