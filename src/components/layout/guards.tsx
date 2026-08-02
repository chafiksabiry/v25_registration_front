import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isSessionActive, redirectIfAuthenticated } from '../../lib/authRedirect';

const isPasswordRecoveryRoute = (pathname: string) =>
  pathname === '/auth/recovery' || pathname.endsWith('/auth/recovery');

export function AuthSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-space-dark-950">
      <div className="animate-spin h-8 w-8 border-4 border-harx-500 border-t-transparent rounded-full" />
    </div>
  );
}

/** Blocks landing/sign-in for users who already have a session. */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { loading, token } = useAuth();
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const onRecovery = isPasswordRecoveryRoute(location.pathname);

  useEffect(() => {
    // Password reset is not a full login — never auto-redirect away from it.
    if (loading || onRecovery) {
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
  }, [loading, token, onRecovery]);

  if (onRecovery) return <>{children}</>;
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
