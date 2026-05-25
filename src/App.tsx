import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignInDialog from './components/SignInDialog';
import RegistrationDialog from './components/RegistrationDialog';
import PasswordRecoveryDialog from './components/PasswordRecoveryDialog';
import ChoicePage from './components/ChoicePage';
import { LandingPage } from './components/LandingPage';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import { isSessionActive, redirectIfAuthenticated } from './lib/authRedirect';

type AuthView = 'landing' | 'choice' | 'signin' | 'register' | 'recovery';

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

function resolveAuthView(pathname: string): AuthView {
  if (pathname.endsWith('/signin')) return 'signin';
  if (pathname.endsWith('/register')) return 'register';
  if (pathname.endsWith('/choice')) return 'choice';
  if (pathname.endsWith('/recovery')) return 'recovery';
  return 'landing';
}

const VIEW_PATH: Record<AuthView, string> = {
  landing: '/',
  choice: '/auth/choice',
  signin: '/auth/signin',
  register: '/auth/register',
  recovery: '/auth/recovery',
};

function AuthRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = useMemo(() => resolveAuthView(location.pathname), [location.pathname]);
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  const goTo = (next: AuthView) => {
    navigate(VIEW_PATH[next]);
  };

  const handleSelectRole = (role: 'company' | 'rep') => {
    localStorage.setItem('pendingUserType', role);
    goTo('register');
  };

  const handleNavigateToSection = (sectionId: string) => {
    setPendingSection(sectionId);
    goTo('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-harx-50 to-white">
      {view === 'landing' && (
        <LandingPage
          onSignIn={() => goTo('signin')}
          onGetStarted={() => goTo('choice')}
          initialSection={pendingSection}
          onSectionApplied={() => setPendingSection(null)}
          onNavigateToSection={handleNavigateToSection}
        />
      )}
      {view === 'choice' && (
        <ChoicePage
          onSelectRole={handleSelectRole}
          onSignIn={() => goTo('signin')}
          onNavigateToSection={handleNavigateToSection}
        />
      )}
      {view === 'signin' && (
        <SignInDialog
          onRegister={() => goTo('choice')}
          onForgotPassword={() => goTo('recovery')}
          onGetStarted={() => goTo('choice')}
          onNavigateToSection={handleNavigateToSection}
        />
      )}
      {view === 'register' && (
        <RegistrationDialog
          onSignIn={() => goTo('signin')}
          onGetStarted={() => goTo('choice')}
          onNavigateToSection={handleNavigateToSection}
        />
      )}
      {view === 'recovery' && (
        <PasswordRecoveryDialog onBack={() => goTo('signin')} />
      )}
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
          <Route
            path="/"
            element={
              <GuestOnly>
                <AuthRoutes />
              </GuestOnly>
            }
          />
          <Route
            path="/auth"
            element={
              <GuestOnly>
                <Navigate to="/auth/signin" replace />
              </GuestOnly>
            }
          />
          <Route
            path="/auth/*"
            element={
              <GuestOnly>
                <AuthRoutes />
              </GuestOnly>
            }
          />
          <Route path="/linkedin/callback" element={<LinkedInCallback />} />
          <Route path="/linkedin/signin/callback" element={<LinkedInSignInCallback />} />
          <Route path="/app2" element={<Navigate to="/" replace />} />
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
          {/* Unknown paths: guests → landing, sessions → company shell */}
          <Route
            path="*"
            element={
              isSessionActive() ? (
                <Navigate to="/company" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
