import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OfferWordmark } from './OfferWordmark';
import { Header } from '../LandingPage/Header';
import type { SignupUserType } from '../ChoicePage';
import { persistHarxLanguage } from '../../lib/i18n';
import { hardNavigate } from '../../lib/appNavigation';
import {
  getAvailableOffers,
  HUB_HERO_KEYS,
  resolveChildTarget,
  resolveOfferHref,
  resolveOfferSignInHref,
  type OfferChild,
  type OfferConfig,
  type OfferLang,
} from '../../config/offers';
import { normalizeSiteLang } from '../../lib/langRoutes';
import { usePageTitle } from '../../lib/tracking/usePageTitle';
import { hubPageTitle } from '../../lib/tracking/hubMeta';
import './hub.css';

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
      <div className="hub-card__top"><span className="hub-chip" data-testid={`hub-ai-${offer.id}`}>{t('hub.aiPowered')}</span></div>
      <h2 id={titleId} className="hub-acronym" data-testid={`hub-acronym-${offer.id}`}>
        <OfferWordmark offer={offer.id as 'taas' | 'cloud' | 'nomad'} label={offer.acronym} />
      </h2>
      <p className="hub-card__title"><bdi>{t(offer.titleKey)}</bdi></p>
      <p className="hub-card__target"><bdi>{t(offer.targetKey)}</bdi></p>
      <ul className="hub-benefits" data-testid={`hub-benefits-${offer.id}`}>
        {offer.benefitKeys.map((key) => (
          <li key={key}>
            <Check className="hub-benefits__tick" aria-hidden="true" />
            <span><bdi>{t(key)}</bdi></span>
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
          <bdi>{t(offer.ctaKey)}</bdi>
          <ArrowRight className="h-5 w-5 hub-cta__arrow" aria-hidden="true" />
        </a>
        <div className="hub-more">
          {offer.children.length > 0 && (
            <ul className="hub-links" data-testid={`offer-children-${offer.id}`}>
              {offer.children.map((child) => {
                const target = resolveChildTarget(child, lang);
                return (
                  <li key={child.id}>
                    <a
                      href={target.type === 'href' ? target.href : '#'}
                      data-testid={`offer-child-${offer.id}-${child.id}`}
                      onClick={(e) => openChild(e, child)}
                      className="hub-pill"
                    >
                      <bdi>{t(child.labelKey)}</bdi>
                    </a>
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
      <Header hub homeThreePills onSignIn={() => {}} onGetStarted={() => {}} onNavigateToSection={onNavigateToSection} />

      <main className="hub-stage" aria-label={t('hub.offersAria')}>
        <section className="hub-hero hub-rise" data-testid="hub-definition">
          <span className="hub-eyebrow"><i aria-hidden="true" />{t('hub.aiPowered')}</span>
          <h1 className="hub-h1">
            {t(HUB_HERO_KEYS.title1)}
            <br />
            <em>{t(HUB_HERO_KEYS.title2)}</em>
          </h1>
          <p className="hub-sub">{t(HUB_HERO_KEYS.sub)}</p>
        </section>

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
