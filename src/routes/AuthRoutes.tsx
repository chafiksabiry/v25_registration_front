import React from 'react';
import { LandingPage } from '../components/LandingPage';
import ChoicePage from '../components/ChoicePage';
import SignInDialog from '../components/SignInDialog';
import RegistrationDialog from '../components/RegistrationDialog';
import PasswordRecoveryDialog from '../components/PasswordRecoveryDialog';
import { useAuthContext } from '../components/layout/AuthShell';

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
    <ChoicePage
      onSelectRole={handleSelectRole}
      onSignIn={() => navigate('/auth/signin')}
      onNavigateToSection={handleNavigateToSection}
    />
  );
}

export function SignInScreen() {
  const { navigate, handleNavigateToSection } = useAuthContext();
  return (
    <SignInDialog
      onRegister={() => navigate('/auth/choice')}
      onForgotPassword={() => navigate('/auth/recovery')}
      onGetStarted={() => navigate('/auth/choice')}
      onNavigateToSection={handleNavigateToSection}
    />
  );
}

export function RegisterScreen() {
  const { navigate, handleNavigateToSection } = useAuthContext();
  return (
    <RegistrationDialog
      onSignIn={() => navigate('/auth/signin')}
      onGetStarted={() => navigate('/auth/choice')}
      onNavigateToSection={handleNavigateToSection}
    />
  );
}

export function RecoveryScreen() {
  const { navigate } = useAuthContext();
  return <PasswordRecoveryDialog onBack={() => navigate('/auth/signin')} />;
}
