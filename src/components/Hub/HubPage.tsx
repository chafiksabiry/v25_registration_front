import React from 'react';
import { ArrowRight, Check, Cloud, Globe, Layers, Sparkles, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../LandingPage/Header';
import type { SignupUserType } from '../ChoicePage';
import { persistHarxLanguage } from '../../lib/i18n';
import { hardNavigate } from '../../lib/appNavigation';
import {
  getAvailableOffers,
  resolveChildTarget,
  isChildComingSoon,
  resolveOfferHref,
  resolveOfferSignInHref,
  type OfferChild,
  type OfferConfig,
  type OfferIcon,
  type OfferLang,
} from '../../config/offers';
import { normalizeSiteLang } from '../../lib/langRoutes';
import { usePageTitle } from '../../lib/tracking/usePageTitle';
import { hubPageTitle } from '../../lib/tracking/hubMeta';
import './hub.css';

const OFFER_ICONS: Record<OfferIcon, LucideIcon> = { layers: Layers, cloud: Cloud, globe: Globe };

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

function OfferCard({ offer, lang, onSelectRole }: { offer: OfferConfig; lang: OfferLang; onSelectRole: (role: SignupUserType) => void }) {
  const { t } = useTranslation();
  const Icon = OFFER_ICONS[offer.icon];
  const href = resolveOfferHref(offer, lang) ?? '#';
  const signInHref = resolveOfferSignInHref(offer, lang);
  const titleId = `hub-offer-${offer.id}-title`;

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
    <article className="hub-card hub-rise" data-offer={offer.id} data-testid={`hub-panel-${offer.id}`} aria-labelledby={titleId}>
      <header className="hub-card__head">
        <span className="hub-badge"><Icon className="h-6 w-6" aria-hidden="true" /></span>
        <div className="hub-card__id">
          <p className="hub-acronym" data-testid={`hub-acronym-${offer.id}`}>{offer.acronym}</p>
          <p className="hub-ai" data-testid={`hub-ai-${offer.id}`}><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />{t('hub.aiPowered')}</p>
        </div>
      </header>
      <h2 id={titleId} className="hub-card__title">{t(offer.titleKey)}</h2>
      <p className="hub-card__target">{t(offer.targetKey)}</p>
      <ul className="hub-benefits" data-testid={`hub-benefits-${offer.id}`}>
        {offer.benefitKeys.map((key) => (
          <li key={key}>
            <Check className="hub-benefits__tick" aria-hidden="true" />
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
      <div className="hub-card__actions">
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
          <ArrowRight className="h-5 w-5 hub-cta__arrow" aria-hidden="true" />
        </a>
        <div className="hub-more">
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
                    href={target.type === 'href' ? target.href : '#'}
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
      </div>
      <p className="hub-signin">
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
    </article>
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
      <span>{t('footer.rights', '© {{year}} HARX Technologies Inc. All rights reserved.', { year: new Date().getFullYear() })}</span>
    </footer>
  );
}

export function HubPage({ onSelectRole, onNavigateToSection }: HubPageProps) {
  const { t, i18n } = useTranslation();
  const lang: OfferLang = normalizeSiteLang(i18n.language);
  usePageTitle(hubPageTitle(lang));
  const offers = getAvailableOffers();

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

        <h1 className="hub-defline hub-rise" data-testid="hub-definition">{t('hub.definition')}</h1>

        <div className="hub-panels" data-count={offers.length}>
          {offers.map((o) => (
            <OfferCard key={o.id} offer={o} lang={lang} onSelectRole={onSelectRole} />
          ))}
        </div>
      </main>

      <ThinFooter />
    </div>
  );
}

export default HubPage;
