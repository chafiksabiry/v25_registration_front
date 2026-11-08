import React from 'react';
import { ArrowRight, Building2, Headphones, LayoutDashboard, Layers, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { OfferMark, type OfferMarkId } from '../Brand/OfferMarks';
import { LanguageIcons } from '../Brand/LanguageIcons';
import { persistHarxLanguage } from '../../lib/i18n';
import { TAAS_COMPANY, TAAS_HOME, TAAS_REPS } from '../../lib/taasPaths';
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

interface HeaderProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  /** Conservé pour compatibilité : le bandeau commun n'a plus de menu de sections. */
  onNavigateToSection?: (sectionId: string) => void;
  /** Parcours Téléphonie (connexion, inscription) : l'offre courante est TELEPHONY. */
  telephony?: boolean;
  /** Accueil de l'ensemble HARX : aucune offre courante, pas de connexion dans le bandeau. */
  hub?: boolean;
  /** Pages TAAS (accueil, Company, REPS) : l'offre courante est TAAS, avec ses deux espaces. */
  taas?: 'home' | 'company' | 'reps';
}

/**
 * Bandeau commun à tous les écrans HARX : le logo toujours en haut à gauche, les deux offres (TAAS, TELEPHONY) en pastilles,
 * l'espace courant de TAAS (Company / REPS), le choix de la langue en icônes, puis la connexion.
 */
export function Header({ onSignIn, onGetStarted, telephony = false, hub = false, taas }: HeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [dashboardLoading, setDashboardLoading] = React.useState(false);
  const [sessionTick, setSessionTick] = React.useState(0);
  const { t, i18n } = useTranslation();
  const { token, setToken, loading: authLoading } = useAuth();
  const siteLang = (i18n.language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
  const offer: OfferMarkId | null = hub ? null : telephony ? 'telephony' : 'taas';
  const homeHref = withLangPrefix('/', siteLang);

  React.useEffect(() => subscribeAuthChanged(() => setSessionTick((n) => n + 1)), []);

  const loggedIn = React.useMemo(() => !authLoading && hasUiSession(token || undefined), [authLoading, token, sessionTick]);

  const persistLang = () => {
    try {
      persistHarxLanguage(siteLang, siteLang === 'en' ? { explicit: true } : undefined);
    } catch {
      /* ignore */
    }
  };

  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    navigate('/');
  };

  const goOffer = (e: React.MouseEvent<HTMLAnchorElement>, target: OfferMarkId) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (target === 'taas') {
      navigate(TAAS_HOME);
      return;
    }
    persistLang();
    hardNavigate('/telephony');
  };

  const goTaas = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    navigate(path);
  };

  const goToDashboard = async () => {
    setDashboardLoading(true);
    setIsMenuOpen(false);
    try {
      persistLang();
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

  // Le retour à l'accueil TAAS est la pastille TAAS elle-même : le segment ne propose que les deux espaces.
  const taasLinks: Array<{ id: 'company' | 'reps'; label: string; path: string; Icon: typeof Layers }> = [
    { id: 'company', label: t('choicePage.companyTag', 'COMPANY'), path: TAAS_COMPANY, Icon: Building2 },
    { id: 'reps', label: t('choicePage.repTag', 'REPS'), path: TAAS_REPS, Icon: Headphones },
  ];

  const signInTelephony = () => hardNavigate(withLangPrefix('/auth/signin?product=callcentre', siteLang));
  const signUpTelephony = () => hardNavigate(withLangPrefix('/auth/register-call-center?product=callcentre', siteLang));

  const authActions = (full: boolean) => {
    const full_ = full ? ' nav-cta--full' : '';
    if (loggedIn) {
      return (
        <>
          <button type="button" className={`nav-cta nav-cta--started group${full_}`} onClick={() => void goToDashboard()} disabled={dashboardLoading}>
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            {dashboardLoading ? t('header.loading', 'Loading…') : t('header.dashboard', 'Dashboard')}
          </button>
          <button type="button" className={`nav-cta nav-cta--signin${full_}`} onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('header.logout', 'Log out')}
          </button>
        </>
      );
    }
    if (hub) return null;
    if (telephony) {
      return (
        <>
          <button type="button" className={`nav-cta nav-cta--signin${full_}`} onClick={signInTelephony}>{t('telephonyHeader.signIn', 'Sign in')}</button>
          <button type="button" className={`nav-cta nav-cta--started group${full_}`} onClick={signUpTelephony}>
            {t('telephonyHeader.signUp', 'Create my account')}
            <ArrowRight className="nav-cta-arrow h-4 w-4" aria-hidden="true" />
          </button>
        </>
      );
    }
    return (
      <button type="button" className={`nav-cta nav-cta--signin${full_}`} onClick={onSignIn}>
        {t('header.signIn', 'Sign In')}
      </button>
    );
  };

  const offerMarks = (mobile = false) => (
    <div className={mobile ? 'flex flex-wrap gap-2' : 'flex items-center gap-2'} data-testid="offer-marks">
      {(['taas', 'telephony'] as OfferMarkId[]).map((o) => (
        <OfferMark
          key={o}
          offer={o}
          active={offer === o}
          href={o === 'taas' ? withLangPrefix(TAAS_HOME, siteLang) : '/telephony'}
          onClick={(e) => goOffer(e, o)}
          data-testid={`offer-mark-${o}`}
        />
      ))}
    </div>
  );

  const taasSeg = taas ? (
    <div className="hub-navseg" data-testid="taas-nav">
      {taasLinks.map(({ id, label, path, Icon }) => (
        <a key={id} href={withLangPrefix(path, siteLang)} className="hub-navbtn" aria-current={taas === id ? 'page' : undefined} data-testid={`taas-nav-${id}`} onClick={(e) => goTaas(e, path)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </div>
  ) : null;

  return (
    <header className="harx-bar fixed left-0 right-0 top-0 z-50" data-testid="harx-bar">
      <nav className="relative mx-auto flex h-20 max-w-[1500px] items-center justify-between gap-4 pl-4 pr-4 md:pl-8 md:pr-8">
        <div className="flex min-w-0 items-center gap-5 lg:gap-7">
          <a href={homeHref} onClick={goHome} className="harx-bar-logo flex shrink-0 items-center" aria-label={t('header.allOffers', 'All HARX offers')} data-testid="harx-logo">
            <Logo className="h-14 w-auto md:h-[4.25rem]" />
          </a>
          <span className="hidden h-9 w-px bg-white/25 md:block" aria-hidden="true" />
          <div className="hidden items-center gap-4 md:flex">
            {offerMarks()}
            {taasSeg}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageIcons />
          {authActions(false)}
        </div>

        <button className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="harx-bar absolute left-0 right-0 top-full border-t border-white/15 p-6 shadow-xl animate-fade-in md:hidden">
          <div className="flex flex-col gap-4">
            {offerMarks(true)}
            {taasSeg}
            <div className="flex justify-center"><LanguageIcons /></div>
            <div className="space-y-3 border-t border-white/15 pt-4">{authActions(true)}</div>
          </div>
        </div>
      )}
    </header>
  );
}
