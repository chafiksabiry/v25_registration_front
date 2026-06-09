import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../components/LandingPage';
import ChoicePage from '../components/ChoicePage';
import SignInDialog from '../components/SignInDialog';
import RegistrationDialog from '../components/RegistrationDialog';
import PasswordRecoveryDialog from '../components/PasswordRecoveryDialog';
import AuthShell, { useAuthContext } from '../components/layout/AuthShell';
import { GuestOnly } from '../components/layout/guards';

/**
 * Auth module routes.
 *
 * Mirrors the rep orchestrator's route modules (e.g. DashboardRoutes):
 *  - a layout route (<AuthShell />) provides the shared wrapper + navigation
 *    helpers via the outlet context;
 *  - each screen is a real route, so the browser Back button mounts/unmounts
 *    the correct page instead of relying on local component state.
 */

function LandingScreen() {
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

function ChoiceScreen() {
  const { navigate, handleSelectRole, handleNavigateToSection } = useAuthContext();
  return (
    <ChoicePage
      onSelectRole={handleSelectRole}
      onSignIn={() => navigate('/auth/signin')}
      onNavigateToSection={handleNavigateToSection}
    />
  );
}

function SignInScreen() {
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

function RegisterScreen() {
  const { navigate, handleNavigateToSection } = useAuthContext();
  return (
    <RegistrationDialog
      onSignIn={() => navigate('/auth/signin')}
      onGetStarted={() => navigate('/auth/choice')}
      onNavigateToSection={handleNavigateToSection}
    />
  );
}

function RecoveryScreen() {
  const { navigate } = useAuthContext();
  return <PasswordRecoveryDialog onBack={() => navigate('/auth/signin')} />;
}

export default function AuthRoutes() {
  return (
    <GuestOnly>
      <Routes>
        <Route element={<AuthShell />}>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/auth/choice" element={<ChoiceScreen />} />
          <Route path="/auth/signin" element={<SignInScreen />} />
          <Route path="/auth/register" element={<RegisterScreen />} />
          <Route path="/auth/recovery" element={<RecoveryScreen />} />
        </Route>
      </Routes>
    </GuestOnly>
  );
}
