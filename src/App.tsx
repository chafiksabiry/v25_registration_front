import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignInDialog from './components/SignInDialog';
import RegistrationDialog from './components/RegistrationDialog';
import PasswordRecoveryDialog from './components/PasswordRecoveryDialog';
import ChoicePage from './components/ChoicePage';
import { LandingPage } from './components/LandingPage';
import LinkedInCallback from './components/LinkedInCallback'; // Import the LinkedIn callback component
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AuthRoutes() {
  const [view, setView] = useState<'landing' | 'choice' | 'signin' | 'register' | 'recovery'>('landing');
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  const handleSelectRole = (role: 'company' | 'rep') => {
    localStorage.setItem('pendingUserType', role);
    setView('register');
  };

  // Triggered by the navbar when the requested section isn't on the
  // current view. Switches back to the landing page and remembers the
  // target so LandingPage can scroll to it after it mounts.
  const handleNavigateToSection = (sectionId: string) => {
    setPendingSection(sectionId);
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-harx-50 to-white">
      {view === 'landing' && (
        <LandingPage
          onSignIn={() => setView('signin')}
          onGetStarted={() => setView('choice')}
          initialSection={pendingSection}
          onSectionApplied={() => setPendingSection(null)}
          onNavigateToSection={handleNavigateToSection}
        />
      )}
      {view === 'choice' && (
        <ChoicePage
          onSelectRole={handleSelectRole}
          onSignIn={() => setView('signin')}
          onNavigateToSection={handleNavigateToSection}
        />
      )}
      {view === 'signin' && (
        <SignInDialog
          onRegister={() => setView('choice')}
          onForgotPassword={() => setView('recovery')}
          onGetStarted={() => setView('choice')}
          onNavigateToSection={handleNavigateToSection}
        />
      )}
      {view === 'register' && (
        <RegistrationDialog
          onSignIn={() => setView('signin')}
          onGetStarted={() => setView('choice')}
          onNavigateToSection={handleNavigateToSection}
        />
      )}
      {view === 'recovery' && (
        <PasswordRecoveryDialog onBack={() => setView('signin')} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthRoutes />} />
          <Route path="/linkedin/callback" element={<LinkedInCallback />} /> {/* 👈 Add this line */}
          <Route path="/linkedin/signin/callback" element={<LinkedInSignInCallback />} />
          {/* `/app2` was the deprecated rep dashboard placeholder that now
              renders blank in production. Redirect any deep-link / cached
              bookmark back to the landing page so users never get stranded. */}
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;