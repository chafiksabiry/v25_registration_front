import React from 'react';
import { ArrowRight, Building2, Headphones, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { LanguageSelector } from '../LanguageSelector';
import { useAuth } from '../../contexts/AuthContext';
import {
  getPostLoginRedirectUrl,
  getSessionToken,
  getSessionUserId,
  hasUiSession,
} from '../../lib/authRedirect';
import { hardNavigate } from '../../lib/appNavigation';
import { subscribeAuthChanged } from '../../lib/authSync';

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
}

export function Header({ onSignIn, onGetStarted, onNavigateToSection }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [dashboardLoading, setDashboardLoading] = React.useState(false);
  const [sessionTick, setSessionTick] = React.useState(0);
  const { t } = useTranslation();
  const { token, setToken, loading: authLoading } = useAuth();

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
      <button type="button" className="nav-cta nav-cta--started group" onClick={onGetStarted}>
        {t('header.getStarted', 'Get Started')}
        <ArrowRight className="nav-cta-arrow h-4 w-4" aria-hidden="true" />
      </button>
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
      <button type="button" className="nav-cta nav-cta--started nav-cta--full group" onClick={onGetStarted}>
        {t('header.getStarted', 'Get Started')}
        <ArrowRight className="nav-cta-arrow h-4 w-4" aria-hidden="true" />
      </button>
    </>
  );

  return (
    <header
      style={{ backgroundImage: HARX_NAV_GRADIENT }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"
    >
      <nav className="max-w-[1400px] mx-auto pl-3 pr-4 md:pl-4 md:pr-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <a
            href="/"
            className="flex items-center transition-transform hover:scale-[1.02]"
            onClick={(e) => handleNavClick(e, 'top')}
          >
            <Logo className="h-14 w-auto md:h-16" />
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`/#${link.id}`}
                className={linkClass(link.variant)}
                onClick={(e) => handleNavClick(e, link.id)}
              >
                {renderLinkIcon(link.variant)}
                <span>{link.label}</span>
              </a>
            ))}
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
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
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
