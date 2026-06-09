import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignInDialog from './components/SignInDialog';
import RegistrationDialog from './components/RegistrationDialog';
import PasswordRecoveryDialog from './components/PasswordRecoveryDialog';
import ChoicePage from './components/ChoicePage';
import { LandingPage } from './components/LandingPage';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import { isSessionActive, redirectIfAuthenticated } from './lib/authRedirect';

function AuthSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-space-dark-950">
      <div className="animate-spin h-8 w-8 border-4 border-harx-500 border-t-transparent rounded-full" />
    </div>
  );
}

/** Blocks landing/sign-in for users who already have a session. */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { loading, token } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;
    (async () => {
      const redirected = await redirectIfAuthenticated(token);
      if (!cancelled) setAllowed(!redirected);
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, token]);

  if (loading || allowed === null) return <AuthSpinner />;
  if (!allowed) return <AuthSpinner />;
  return <>{children}</>;
}

/**
 * Auth shell — each screen is a real React Router route so the browser
 * Back button mounts/unmounts the correct page (same pattern as /reps/*).
 */
function AuthShell() {
  const navigate = useNavigate();
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  const handleNavigateToSection = (sectionId: string) => {
    setPendingSection(sectionId);
    navigate('/');
  };

  const handleSelectRole = (role: 'company' | 'rep') => {
    localStorage.setItem('pendingUserType', role);
    navigate('/auth/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-harx-50 to-white">
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onSignIn={() => navigate('/auth/signin')}
              onGetStarted={() => navigate('/auth/choice')}
              initialSection={pendingSection}
              onSectionApplied={() => setPendingSection(null)}
              onNavigateToSection={handleNavigateToSection}
            />
          }
        />
        <Route
          path="/auth/choice"
          element={
            <ChoicePage
              onSelectRole={handleSelectRole}
              onSignIn={() => navigate('/auth/signin')}
              onNavigateToSection={handleNavigateToSection}
            />
          }
        />
        <Route
          path="/auth/signin"
          element={
            <SignInDialog
              onRegister={() => navigate('/auth/choice')}
              onForgotPassword={() => navigate('/auth/recovery')}
              onGetStarted={() => navigate('/auth/choice')}
              onNavigateToSection={handleNavigateToSection}
            />
          }
        />
        <Route
          path="/auth/register"
          element={
            <RegistrationDialog
              onSignIn={() => navigate('/auth/signin')}
              onGetStarted={() => navigate('/auth/choice')}
              onNavigateToSection={handleNavigateToSection}
            />
          }
        />
        <Route
          path="/auth/recovery"
          element={
            <PasswordRecoveryDialog onBack={() => navigate('/auth/signin')} />
          }
        />
      </Routes>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { loading, token } = useAuth();

  if (loading) {
    return <AuthSpinner />;
  }

  if (!isSessionActive(token)) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/linkedin/callback" element={<LinkedInCallback />} />
          <Route path="/linkedin/signin/callback" element={<LinkedInSignInCallback />} />
          <Route path="/app2" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />
          <Route
            path="/profile-completion"
            element={
              <PrivateRoute>
                <div>Profile Completion Page (To be implemented)</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/company/*"
            element={
              <PrivateRoute>
                <div>orchestrator Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/*"
            element={
              <GuestOnly>
                <AuthShell />
              </GuestOnly>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
