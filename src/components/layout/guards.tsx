import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isSessionActive, redirectIfAuthenticated } from '../../lib/authRedirect';

const isPasswordRecoveryRoute = (pathname: string) =>
  pathname === '/auth/recovery' || pathname.endsWith('/auth/recovery');

/** Landing home — stay here when logged in; user opens Dashboard from the header. */
const isLandingHomeRoute = (pathname: string) =>
  pathname === '/' || pathname === '';

export function AuthSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-space-dark-950">
      <div className="animate-spin h-8 w-8 border-4 border-harx-500 border-t-transparent rounded-full" />
    </div>
  );
}

/** Blocks guest auth screens for users who already have a session (not the landing `/`). */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { loading, token } = useAuth();
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const onRecovery = isPasswordRecoveryRoute(location.pathname);
  const onLanding = isLandingHomeRoute(location.pathname);

  useEffect(() => {
    // Password reset + landing home: never auto-redirect away.
    if (loading || onRecovery || onLanding) {
      setAllowed(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const redirected = await redirectIfAuthenticated(token);
      if (!cancelled) setAllowed(!redirected);
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, token, onRecovery, onLanding]);

  if (onRecovery || onLanding) return <>{children}</>;
  if (loading || allowed === null) return <AuthSpinner />;
  if (!allowed) return <AuthSpinner />;
  return <>{children}</>;
}

/** Requires an active session, otherwise redirects to sign-in. */
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { loading, token } = useAuth();

  if (loading) {
    return <AuthSpinner />;
  }

  if (!isSessionActive(token)) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
}
