import React from 'react';
import { ArrowRight, Building2, Headphones, LayoutDashboard, LayoutGrid, LogOut, Menu, Phone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { LanguageSelector } from '../LanguageSelector';
import { persistHarxLanguage } from '../../lib/i18n';
import { withLangPrefix } from '../../lib/langRoutes';
import { useAuth } from '../../contexts/AuthContext';
import {
  getPostLoginRedirectUrl,
  getSessionToken,
  getSessionUserId,
  hasUiSession,
} from '../../lib/authRedirect';
import { hardNavigate } from '../../lib/appNavigation';
import { subscribeAuthChanged } from '../../lib/authSync';
import { getAvailableOffers, resolveOfferHref, type OfferConfig } from '../../config/offers';

/** HARX navbar gradient — vivid red (left) transitioning to magenta/pink (right). */
const HARX_NAV_GRADIENT = 'linear-gradient(90deg, #E51A4C 0%, #E01070 55%, #E6188D 100%)';

type NavLink = {
  id: string;
  label: string;
  variant?: 'default' | 'company' | 'rep';
};

interface HeaderProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  /**
   * Called when the user clicks a navbar entry whose target section
   * does NOT exist in the current DOM (e.g. user is on the ChoicePage
   * or a dialog). The parent is then expected to switch back to the
   * landing page and scroll to that section.
   */
  onNavigateToSection?: (sectionId: string) => void;
  /** Écrans d'inscription et de connexion du produit Téléphonie : bandeau propre au produit (logo, pastille « Telephony »), sans le menu du site HARX. */
  telephony?: boolean;
  /** Accueil de l'ensemble HARX (hub) : liens vers les offres, pas de menu de sections ni de « Démarrer ». */
  hub?: boolean;
}

export function Header({ onSignIn, onGetStarted, onNavigateToSection, telephony = false, hub = false }: HeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [dashboardLoading, setDashboardLoading] = React.useState(false);
  const [sessionTick, setSessionTick] = React.useState(0);
  const { t, i18n } = useTranslation();
  const { token, setToken, loading: authLoading } = useAuth();
  const siteLang = (i18n.language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
  /** Accueil de l'ensemble (hub) et page de l'offre TAAS (sections « Comment ça marche », « Tarifs »…). */
  const homeHref = withLangPrefix('/', siteLang);
  const taasHref = withLangPrefix('/taas', siteLang);
  const offerLinks = getAvailableOffers();

  const openOffer = (e: React.MouseEvent<HTMLAnchorElement>, offer: OfferConfig) => {
    e.preventDefault();
    const href = resolveOfferHref(offer, siteLang);
    if (!href) return;
    setIsMenuOpen(false);
    try {
      persistHarxLanguage(siteLang, siteLang === 'en' ? { explicit: true } : undefined);
    } catch {
      /* ignore */
    }
    hardNavigate(href);
  };

  /** Retour à l'accueil de l'ensemble (logo, « Toutes les offres HARX »). */
  const goToHub = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    navigate('/');
  };

  React.useEffect(() => {
    return subscribeAuthChanged(() => {
      setSessionTick((n) => n + 1);
    });
  }, []);

  // JWT or userId cookie/localStorage (same soft session as /reps).
  const loggedIn = React.useMemo(
    () => !authLoading && hasUiSession(token || undefined),
    [authLoading, token, sessionTick]
  );

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigateToSection) {
      e.preventDefault();
      onNavigateToSection(sectionId);
    }
    setIsMenuOpen(false);
  };

  const goToDashboard = async () => {
    setDashboardLoading(true);
    setIsMenuOpen(false);
    try {
      // Persist current landing language so /reps does not fall back to English.
      try {
        const lang = (i18n.language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
        persistHarxLanguage(lang, lang === 'en' ? { explicit: true } : undefined);
      } catch {
        /* ignore */
      }
      const userId = getSessionUserId(token);
      if (!userId) {
        hardNavigate('/company');
        return;
      }
      const dest = await getPostLoginRedirectUrl(userId, getSessionToken());
      hardNavigate(dest || '/company');
    } catch {
      hardNavigate('/company');
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    setToken(null);
    hardNavigate('/');
  };

  const navLinks: NavLink[] = [
    { id: 'how-it-works', label: t('header.howItWorks', 'How It Works') },
    { id: 'pricing', label: t('header.pricing', 'Pricing') },
    { id: 'clients', label: t('header.forCompanies', 'For Companies'), variant: 'company' },
    { id: 'reps', label: t('header.forReps', 'For Reps'), variant: 'rep' },
  ];

  const linkClass = (variant: NavLink['variant']) => {
    if (variant === 'company') {
      return 'nav-audience-pill nav-audience-pill--company';
    }
    if (variant === 'rep') {
      return 'nav-audience-pill nav-audience-pill--rep';
    }
    return 'nav-link-default';
  };

  const renderLinkIcon = (variant: NavLink['variant']) => {
    if (variant === 'company') {
      return <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
    }
    if (variant === 'rep') {
      return <Headphones className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
    }
    return null;
  };

  const authActionsDesktop = loggedIn ? (
    <>
      <button
        type="button"
        className="nav-cta nav-cta--started group"
        onClick={() => void goToDashboard()}
        disabled={dashboardLoading}
      >
        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        {dashboardLoading
          ? t('header.loading', 'Loading…')
          : t('header.dashboard', 'Dashboard')}
      </button>
      <button type="button" className="nav-cta nav-cta--signin" onClick={handleLogout}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {t('header.logout', 'Log out')}
      </button>
    </>
  ) : (
    <>
      <button type="button" className="nav-cta nav-cta--signin" onClick={onSignIn}>
        {t('header.signIn', 'Sign In')}
      </button>
      {!hub && (
        <button type="button" className="nav-cta nav-cta--started group" onClick={onGetStarted}>
          {t('header.getStarted', 'Get Started')}
          <ArrowRight className="nav-cta-arrow h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </>
  );

  const authActionsMobile = loggedIn ? (
    <>
      <button
        type="button"
        className="nav-cta nav-cta--started nav-cta--full group"
        onClick={() => void goToDashboard()}
        disabled={dashboardLoading}
      >
        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        {dashboardLoading
          ? t('header.loading', 'Loading…')
          : t('header.dashboard', 'Dashboard')}
      </button>
      <button type="button" className="nav-cta nav-cta--signin nav-cta--full" onClick={handleLogout}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {t('header.logout', 'Log out')}
      </button>
    </>
  ) : (
    <>
      <button type="button" className="nav-cta nav-cta--signin nav-cta--full" onClick={onSignIn}>
        {t('header.signIn', 'Sign In')}
      </button>
      {!hub && (
        <button type="button" className="nav-cta nav-cta--started nav-cta--full group" onClick={onGetStarted}>
          {t('header.getStarted', 'Get Started')}
          <ArrowRight className="nav-cta-arrow h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </>
  );

  if (telephony) {
    const lang = (i18n.language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
    return (
      <header
        style={{ backgroundImage: HARX_NAV_GRADIENT }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"
        data-testid="telephony-header"
      >
        <nav className="max-w-[1400px] mx-auto pl-3 pr-4 md:pl-4 md:pr-6 h-20 md:h-24 flex items-center justify-between gap-3">
          <a href="/telephony" className="flex items-center gap-3 transition-transform hover:scale-[1.02]" aria-label="HARX Telephony">
            <Logo className="h-14 w-auto md:h-20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] md:px-5 md:py-2.5 md:text-sm font-black tracking-[0.18em] shadow">
              <Phone className="h-3.5 w-3.5 text-[#E01070]" aria-hidden="true" />
              <span className="bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#a855f7] bg-clip-text text-transparent">TELEPHONY</span>
            </span>
          </a>
          <div className="flex items-center gap-2.5">
            <LanguageSelector />
            <button type="button" className="nav-cta nav-cta--signin" onClick={() => hardNavigate(withLangPrefix('/auth/signin?product=callcentre', lang))}>{t('telephonyHeader.signIn', 'Sign in')}</button>
            <button type="button" className="nav-cta nav-cta--started group" onClick={() => hardNavigate(withLangPrefix('/auth/register-call-center?product=callcentre', lang))}>
              {t('telephonyHeader.signUp', 'Create my account')}
              <ArrowRight className="nav-cta-arrow h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header
      style={{ backgroundImage: HARX_NAV_GRADIENT }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"
    >
      <nav className="max-w-[1400px] mx-auto pl-3 pr-4 md:pl-4 md:pr-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <a
            href={homeHref}
            className="flex shrink-0 items-center transition-transform hover:scale-[1.02]"
            onClick={goToHub}
            aria-label={t('header.allOffers', 'All HARX offers')}
          >
            <Logo className="h-14 w-auto md:h-16" />
          </a>

          <div className="hidden md:flex items-center gap-1">
            {hub
              ? offerLinks.map((offer) => (
                  <a
                    key={offer.id}
                    href={resolveOfferHref(offer, siteLang) ?? '#'}
                    className="nav-link-default"
                    data-testid={`nav-offer-${offer.id}`}
                    onClick={(e) => openOffer(e, offer)}
                  >
                    <span>{t(offer.navKey)}</span>
                  </a>
                ))
              : (
                <>
                  <a
                    href={homeHref}
                    className="nav-link-default hidden 2xl:inline-flex items-center gap-1.5 whitespace-nowrap"
                    data-testid="nav-all-offers"
                    title={t('header.allOffers', 'All HARX offers')}
                    onClick={goToHub}
                  >
                    <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t('header.allOffers', 'All HARX offers')}</span>
                  </a>
                  {navLinks.map((link) => (
                    <a
                      key={link.id}
                      href={`${taasHref}#${link.id}`}
                      className={linkClass(link.variant)}
                      onClick={(e) => handleNavClick(e, link.id)}
                    >
                      {renderLinkIcon(link.variant)}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </>
              )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <LanguageSelector />
          {authActionsDesktop}
        </div>

        <button
          className="md:hidden text-white p-2 hover:bg-white/10 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div
          style={{ backgroundImage: HARX_NAV_GRADIENT }}
          className="md:hidden absolute top-full left-0 right-0 border-t border-white/15 p-6 shadow-xl animate-fade-in"
        >
          <div className="flex flex-col space-y-1">
            {hub
              ? offerLinks.map((offer) => (
                  <a
                    key={offer.id}
                    href={resolveOfferHref(offer, siteLang) ?? '#'}
                    className="px-3 py-2.5 text-base font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={(e) => openOffer(e, offer)}
                  >
                    <span>{t(offer.navKey)}</span>
                  </a>
                ))
              : (
                <>
                  <a
                    href={homeHref}
                    className="px-3 py-2.5 text-base font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={goToHub}
                  >
                    {t('header.allOffers', 'All HARX offers')}
                  </a>
                  {navLinks.map((link) => (
                    <a
                      key={link.id}
                      href={`${taasHref}#${link.id}`}
                      className={
                        link.variant
                          ? `${linkClass(link.variant)} my-1 w-full justify-center`
                          : 'px-3 py-2.5 text-base font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white'
                      }
                      onClick={(e) => handleNavClick(e, link.id)}
                    >
                      {renderLinkIcon(link.variant)}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </>
              )}
            <div className="pt-4 mt-2 border-t border-white/15 space-y-3">
              <div className="flex justify-center mb-4">
                <LanguageSelector />
              </div>
              {authActionsMobile}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
