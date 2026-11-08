import React from 'react';
import { useTranslation } from 'react-i18next';
import { TaasShell } from '../components/Taas/TaasShell';
import { TaasHome } from '../components/Taas/TaasHome';
import { TaasCompanyPage } from '../components/Taas/TaasCompanyPage';
import { TaasRepsPage } from '../components/Taas/TaasRepsPage';
import { taasPageTitle } from '../lib/tracking/landingPageMeta';
import ChoicePage from '../components/ChoicePage';
import { HubPage } from '../components/Hub/HubPage';
import SignInDialog from '../components/SignInDialog';
import RegistrationDialog from '../components/RegistrationDialog';
import PasswordRecoveryDialog from '../components/PasswordRecoveryDialog';
import { useAuthContext } from '../components/layout/AuthShell';
import { buildAuthPageTitle } from '../lib/tracking/registrationSections';
import { usePageTitle } from '../lib/tracking/usePageTitle';

function AuthScreen({ title, children }: { title: string; children: React.ReactNode }) {
  const { i18n } = useTranslation();
  usePageTitle(buildAuthPageTitle(title, i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr'));
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
  usePageTitle(taasPageTitle('home', i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr'));
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
  usePageTitle(taasPageTitle('company', i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr'));
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
  usePageTitle(taasPageTitle('reps', i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr'));
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
  return (
    <AuthScreen title="Connexion">
      <SignInDialog
        onRegister={() => navigate('/auth/choice')}
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
