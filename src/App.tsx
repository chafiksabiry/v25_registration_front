import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignInDialog from './components/SignInDialog';
import RegistrationDialog from './components/RegistrationDialog';
import PasswordRecoveryDialog from './components/PasswordRecoveryDialog';
import Dashboard from './components/BackOffice/Dashboard';
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
    return <Navigate to="/auth" replace />;
  } 

  return <>{children}</>;
}

function AuthRoutes() {
  const [view, setView] = useState<'signin' | 'register' | 'recovery'>('signin');

  return (
    <div className="min-h-screen bg-gray-100">
      {view === 'signin' && (
        <SignInDialog
          onRegister={() => setView('register')}
          onForgotPassword={() => setView('recovery')}
        />
      )}
      {view === 'register' && (
        <RegistrationDialog onSignIn={() => setView('signin')} />
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
          <Route path="/auth/*" element={<AuthRoutes />} />
          <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} /> {/* 👈 Add this line */}
          <Route path="/auth/linkedin/signin/callback" element={<LinkedInSignInCallback />} /> 
          <Route
            path="/app2"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile-completion"
            element={
              <PrivateRoute>
                <div>Profile Completion Page (To be implemented)</div>
              </PrivateRoute>
            }
          />
           <Route
            path="/orchestrator"
            element={
              <PrivateRoute>
                <div>orchestrator Page</div>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;