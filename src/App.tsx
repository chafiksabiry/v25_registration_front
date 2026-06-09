import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import { getRouterBasename } from './utils/routerBasename';
import { PrivateRoute } from './components/layout/guards';

import AuthRoutes from './routes/AuthRoutes';

function App() {
  return (
    <AuthProvider>
      <Router basename={getRouterBasename()}>
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

          {/* Auth module: landing + choice + signin + register + recovery.
              Catch-all (last) so unknown paths fall through to the auth shell.
              GuestOnly inside handles redirecting already-authenticated users. */}
          <Route path="/*" element={<AuthRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
