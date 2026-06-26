import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import { getRouterBasename } from './utils/routerBasename';
import { PrivateRoute, GuestOnly } from './components/layout/guards';
import HistorySync from './components/layout/HistorySync';
import AuthShell from './components/layout/AuthShell';
import {
  LandingScreen,
  ChoiceScreen,
  SignInScreen,
  RegisterScreen,
  RegisterCompanyScreen,
  RegisterRepScreen,
  RecoveryScreen,
} from './routes/AuthRoutes';

function RootLayout() {
  return (
    <>
      <HistorySync />
      <Outlet />
    </>
  );
}

function GuestAuthLayout() {
  return (
    <GuestOnly>
      <AuthShell />
    </GuestOnly>
  );
}

function AuthProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export const appRouter = createBrowserRouter(
  [
    {
      element: (
        <AuthProviders>
          <RootLayout />
        </AuthProviders>
      ),
      children: [
        { path: 'linkedin/callback', element: <LinkedInCallback /> },
        { path: 'linkedin/signin/callback', element: <LinkedInSignInCallback /> },
        { path: 'app2', element: <Navigate to="/" replace /> },
        { path: 'auth', element: <Navigate to="/auth/signin" replace /> },
        {
          path: 'profile-completion',
          element: (
            <PrivateRoute>
              <div>Profile Completion Page (To be implemented)</div>
            </PrivateRoute>
          ),
        },
        {
          path: 'company/*',
          element: (
            <PrivateRoute>
              <div>orchestrator Page</div>
            </PrivateRoute>
          ),
        },
        {
          element: <GuestAuthLayout />,
          children: [
            { index: true, element: <LandingScreen /> },
            { path: 'auth/choice', element: <ChoiceScreen /> },
            { path: 'auth/signin', element: <SignInScreen /> },
            { path: 'auth/register', element: <RegisterScreen /> },
            { path: 'auth/register-company', element: <RegisterCompanyScreen /> },
            { path: 'auth/register-rep', element: <RegisterRepScreen /> },
            { path: 'auth/recovery', element: <RecoveryScreen /> },
          ],
        },
      ],
    },
  ],
  { basename: getRouterBasename() }
);
