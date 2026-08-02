import React from 'react';
import { LandingPage } from '../components/LandingPage';
import ChoicePage from '../components/ChoicePage';
import SignInDialog from '../components/SignInDialog';
import RegistrationDialog from '../components/RegistrationDialog';
import PasswordRecoveryDialog from '../components/PasswordRecoveryDialog';
import { useAuthContext } from '../components/layout/AuthShell';
import { buildAuthPageTitle } from '../lib/tracking/registrationSections';
import { usePageTitle } from '../lib/tracking/usePageTitle';

function AuthScreen({ title, children }: { title: string; children: React.ReactNode }) {
  usePageTitle(buildAuthPageTitle(title));
  return <>{children}</>;
}

/**
 * Auth module screens — rendered as child routes of AuthShell (see App.tsx).
 * Each screen is a real route so Back/Forward mounts the correct page.
 */

export function LandingScreen() {
  const { navigate, pendingSection, setPendingSection, handleNavigateToSection } = useAuthContext();
  return (
    <LandingPage
      onSignIn={() => navigate('/auth/signin')}
      onGetStarted={() => navigate('/auth/choice')}
      initialSection={pendingSection}
      onSectionApplied={() => setPendingSection(null)}
      onNavigateToSection={handleNavigateToSection}
    />
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

export function RecoveryScreen() {
  const { navigate } = useAuthContext();
  return (
    <AuthScreen title="Récupération de compte">
      <PasswordRecoveryDialog onBack={() => navigate('/auth/signin')} />
    </AuthScreen>
  );
}
