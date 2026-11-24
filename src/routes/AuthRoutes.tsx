import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import { TaasShell } from '../components/Taas/TaasShell';
import { TaasHome } from '../components/Taas/TaasHome';
import { TaasCompanyPage } from '../components/Taas/TaasCompanyPage';
import { TaasRepsPage } from '../components/Taas/TaasRepsPage';
import { taasPageTitle } from '../lib/tracking/landingPageMeta';
import { getLangFromPath, normalizeSiteLang } from '../lib/langRoutes';
import { hardNavigate } from '../lib/appNavigation';
import ChoicePage from '../components/ChoicePage';
import { HubPage } from '../components/Hub/HubPage';
import SignInDialog from '../components/SignInDialog';
import RegistrationDialog from '../components/RegistrationDialog';
import PasswordRecoveryDialog from '../components/PasswordRecoveryDialog';
import { useAuthContext } from '../components/layout/AuthShell';
import { buildAuthPageTitle } from '../lib/tracking/registrationSections';
import { usePageTitle } from '../lib/tracking/usePageTitle';
import { isCallcentreProduct, isNomadVisitor } from '../lib/product';
import { NOMAD_PRODUCT, NOMAD_REGISTER_PATH, NOMAD_SIGN_IN_PATH, nomadRegisterSearch } from '../lib/offerRegister';

/**
 * Adresse NOMAD (/nomad/connexion, /nomad/inscription) : sans préfixe de langue. Depuis une page préfixée (/fr/auth/signin), le
 * routeur garderait le préfixe : chargement complet (la langue est déjà mémorisée) ; sinon navigation interne.
 */
function goNomadAddress(navigate: (to: string) => void, path: string): void {
  if (typeof window !== 'undefined' && getLangFromPath(window.location.pathname)) hardNavigate(path);
  else navigate(path);
}

function AuthScreen({ title, children }: { title: string; children: React.ReactNode }) {
  const { i18n } = useTranslation();
  usePageTitle(buildAuthPageTitle(title, normalizeSiteLang(i18n.language)));
  return <>{children}</>;
}

/**
 * Auth module screens — rendered as child routes of AuthShell (see App.tsx).
 * Each screen is a real route so Back/Forward mounts the correct page.
 */

/** `/` : accueil de l'ensemble HARX (une carte par offre, voir src/config/offers.ts). */
export function HubScreen() {
  const { handleSelectRole, handleNavigateToSection } = useAuthContext();
  return <HubPage onSelectRole={handleSelectRole} onNavigateToSection={handleNavigateToSection} />;
}

/** `/taas` : accueil de l'offre TAAS, avec deux portes (espace COMPANY, espace REPS). */
export function TaasScreen() {
  const { navigate, pendingSection, setPendingSection, handleNavigateToSection } = useAuthContext();
  const { i18n } = useTranslation();
  usePageTitle(taasPageTitle('home', normalizeSiteLang(i18n.language)));
  return (
    <TaasShell
      page="home"
      onSignIn={() => navigate('/auth/signin')}
      onGetStarted={() => navigate('/auth/choice')}
      onNavigateToSection={handleNavigateToSection}
      pendingSection={pendingSection}
      onSectionApplied={() => setPendingSection(null)}
    >
      <TaasHome />
    </TaasShell>
  );
}

/** `/taas/company` : espace COMPANY (publier un gig). */
export function TaasCompanyScreen() {
  const { navigate, pendingSection, setPendingSection, handleNavigateToSection } = useAuthContext();
  const { i18n } = useTranslation();
  usePageTitle(taasPageTitle('company', normalizeSiteLang(i18n.language)));
  return (
    <TaasShell
      page="company"
      onSignIn={() => navigate('/auth/signin')}
      onGetStarted={() => navigate('/auth/choice')}
      onNavigateToSection={handleNavigateToSection}
      pendingSection={pendingSection}
      onSectionApplied={() => setPendingSection(null)}
    >
      <TaasCompanyPage />
    </TaasShell>
  );
}

/** `/taas/reps` : espace REPS (trouver des gigs). */
export function TaasRepsScreen() {
  const { navigate, pendingSection, setPendingSection, handleNavigateToSection, handleSelectRole } = useAuthContext();
  const { i18n } = useTranslation();
  usePageTitle(taasPageTitle('reps', normalizeSiteLang(i18n.language)));
  return (
    <TaasShell
      page="reps"
      onSignIn={() => navigate('/auth/signin')}
      onGetStarted={() => navigate('/auth/choice')}
      onNavigateToSection={handleNavigateToSection}
      pendingSection={pendingSection}
      onSectionApplied={() => setPendingSection(null)}
    >
      <TaasRepsPage onJoin={() => handleSelectRole('rep')} />
    </TaasShell>
  );
}

export function ChoiceScreen() {
  const { navigate, handleSelectRole, handleNavigateToSection } = useAuthContext();
  return (
    <AuthScreen title="Choix du profil">
      <ChoicePage
        onSelectRole={handleSelectRole}
        onSignIn={() => navigate('/auth/signin')}
        onNavigateToSection={handleNavigateToSection}
      />
    </AuthScreen>
  );
}

export function SignInScreen() {
  const { navigate, handleNavigateToSection } = useAuthContext();
  const location = useLocation();
  // Ancienne connexion NOMAD (/auth/signin?product=nomad) : adresse NOMAD /nomad/connexion (24/11/2026), autres paramètres gardés.
  if (new URLSearchParams(location.search || window.location.search).get('product') === NOMAD_PRODUCT) {
    return <Navigate replace to={{ pathname: NOMAD_SIGN_IN_PATH, search: nomadRegisterSearch(location.search || window.location.search) }} state={location.state} />;
  }
  return <SignInScreenContent navigate={navigate} handleNavigateToSection={handleNavigateToSection} />;
}

/** `/nomad/connexion` : connexion NOMAD (porte NOMAD), même écran que la connexion Téléphonie. */
export function NomadSignInScreen() {
  const { navigate, handleNavigateToSection } = useAuthContext();
  return <SignInScreenContent navigate={navigate} handleNavigateToSection={handleNavigateToSection} />;
}

function SignInScreenContent({ navigate, handleNavigateToSection }: Pick<ReturnType<typeof useAuthContext>, 'navigate' | 'handleNavigateToSection'>) {
  return (
    <AuthScreen title="Connexion">
      <SignInDialog
        // « S'inscrire » mène à l'inscription de l'offre de la porte (NOMAD, CLOUD), jamais à la page TAAS depuis une autre offre.
        onRegister={() => (isNomadVisitor() ? goNomadAddress(navigate, NOMAD_REGISTER_PATH) : navigate(isCallcentreProduct() ? '/auth/register-call-center?product=callcentre' : '/auth/choice'))}
        onForgotPassword={() => navigate('/auth/recovery')}
        onGetStarted={() => navigate('/auth/choice')}
        onNavigateToSection={handleNavigateToSection}
      />
    </AuthScreen>
  );
}

export function RegisterScreen() {
  const { navigate, handleNavigateToSection } = useAuthContext();
  return (
    <AuthScreen title="Inscription">
      <RegistrationDialog
        onSignIn={() => navigate('/auth/signin')}
        onGetStarted={() => navigate('/auth/choice')}
        onNavigateToSection={handleNavigateToSection}
      />
    </AuthScreen>
  );
}

export function RegisterCompanyScreen() {
  const { navigate, handleNavigateToSection } = useAuthContext();
  return (
    <AuthScreen title="Inscription entreprise">
      <RegistrationDialog
        defaultUserType="company"
        onSignIn={() => navigate('/auth/signin')}
        onGetStarted={() => navigate('/auth/choice')}
        onNavigateToSection={handleNavigateToSection}
      />
    </AuthScreen>
  );
}

export function RegisterRepScreen() {
  const { navigate, handleNavigateToSection } = useAuthContext();
  return (
    <AuthScreen title="Inscription rep">
      <RegistrationDialog
        defaultUserType="rep"
        onSignIn={() => navigate('/auth/signin')}
        onGetStarted={() => navigate('/auth/choice')}
        onNavigateToSection={handleNavigateToSection}
      />
    </AuthScreen>
  );
}

export function RegisterCallCenterScreen() {
  const { t } = useTranslation();
  const { navigate, handleNavigateToSection } = useAuthContext();
  const location = useLocation();
  // Ancienne adresse (/auth/register-call-center?product=callcentre) dans un parcours Nomad : remplacée par l'adresse NOMAD
  // /nomad/inscription, étape et autres paramètres gardés. Les offres CLOUD restent ici.
  if (isNomadVisitor(location.pathname)) {
    return <Navigate replace to={{ pathname: NOMAD_REGISTER_PATH, search: nomadRegisterSearch(location.search || window.location.search) }} state={location.state} />;
  }
  return (
    <AuthScreen title={t('authScreens.registerCallCenter', 'Call center signup')}>
      <RegistrationDialog
        defaultUserType="call-center"
        onSignIn={() => navigate('/auth/signin')}
        onGetStarted={() => navigate('/auth/choice')}
        onNavigateToSection={handleNavigateToSection}
      />
    </AuthScreen>
  );
}

/**
 * `/nomad/inscription` : inscription de l'offre NOMAD (Nomad Solo), même formulaire que l'inscription Téléphonie.
 * L'ancienne adresse `/auth/register-nomad?product=nomad` y est redirigée (voir `LegacyRegisterNomadRedirect`).
 */
export function RegisterNomadScreen() {
  const { t } = useTranslation();
  const { navigate, handleNavigateToSection } = useAuthContext();
  return (
    <AuthScreen title={t('authScreens.registerCallCenter', 'Call center signup')}>
      <RegistrationDialog
        defaultUserType="call-center"
        // « Se connecter » : connexion NOMAD (porte NOMAD), plus la connexion générale.
        onSignIn={() => goNomadAddress(navigate, NOMAD_SIGN_IN_PATH)}
        onGetStarted={() => navigate('/auth/choice')}
        onNavigateToSection={handleNavigateToSection}
      />
    </AuthScreen>
  );
}

/** Ancienne inscription NOMAD (`/auth/register-nomad?product=nomad`) : adresse NOMAD `/nomad/inscription`, étape et autres paramètres gardés. */
export function LegacyRegisterNomadRedirect() {
  const location = useLocation();
  return <Navigate replace to={{ pathname: NOMAD_REGISTER_PATH, search: nomadRegisterSearch(location.search || window.location.search) }} state={location.state} />;
}

export function RecoveryScreen() {
  const { navigate, handleNavigateToSection } = useAuthContext();
  return (
    <AuthScreen title="Récupération de compte">
      <PasswordRecoveryDialog
        onBack={() => navigate('/auth/signin')}
        onGetStarted={() => navigate('/auth/choice')}
        onNavigateToSection={handleNavigateToSection}
      />
    </AuthScreen>
  );
}
