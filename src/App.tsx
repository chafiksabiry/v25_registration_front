import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import { getRouterBasename } from './utils/routerBasename';
import { PrivateRoute } from './components/layout/guards';
import HistorySync from './components/layout/HistorySync';
import AuthShell from './components/layout/AuthShell';
import { GuestOnly } from './components/layout/guards';

import {
  LandingScreen,
  ChoiceScreen,
  SignInScreen,
  RegisterScreen,
  RecoveryScreen,
} from './routes/AuthRoutes';

function GuestAuthLayout() {
  return (
    <GuestOnly>
      <AuthShell />
    </GuestOnly>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename={getRouterBasename()}>
        <HistorySync />
        <Routes>
          {/* LinkedIn OAuth callbacks */}
          <Route path="/linkedin/callback" element={<LinkedInCallback />} />
          <Route path="/linkedin/signin/callback" element={<LinkedInSignInCallback />} />

          {/* Legacy redirects */}
          <Route path="/app2" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />

          {/* Protected (session) routes */}
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

          {/* Auth screens — explicit routes (no catch-all) so Back/Forward remounts correctly */}
          <Route element={<GuestAuthLayout />}>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/auth/choice" element={<ChoiceScreen />} />
            <Route path="/auth/signin" element={<SignInScreen />} />
            <Route path="/auth/register" element={<RegisterScreen />} />
            <Route path="/auth/recovery" element={<RecoveryScreen />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
