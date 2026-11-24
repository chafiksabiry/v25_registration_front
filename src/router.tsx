import React from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation, type RouteObject } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import ReactivateAccount from './components/ReactivateAccount';
import { getRouterBasename } from './utils/routerBasename';
import { PrivateRoute, GuestOnly } from './components/layout/guards';
import HistorySync from './components/layout/HistorySync';
import VisitorTracker from './lib/VisitorTracker';
import RecetteMarker from './components/RecetteMarker';
import AuthShell from './components/layout/AuthShell';
import {
  HubScreen,
  TaasScreen,
  TaasCompanyScreen,
  TaasRepsScreen,
  ChoiceScreen,
  SignInScreen,
  RegisterScreen,
  RegisterCompanyScreen,
  RegisterRepScreen,
  RegisterCallCenterScreen,
  RegisterNomadScreen,
  NomadSignInScreen,
  LegacyRegisterNomadRedirect,
  RecoveryScreen,
} from './routes/AuthRoutes';
import AdminLayout from './components/admin/AdminLayout';
import AdminSignInPage from './components/admin/AdminSignInPage';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import AdminUsersPage from './components/admin/AdminUsersPage';
import AdminUserDetailPage from './components/admin/AdminUserDetailPage';
import AdminWalletPage from './components/admin/AdminWalletPage';
import AdminAiTokensPage from './components/admin/AdminAiTokensPage';
import AdminPricingMinutesPage from './components/admin/AdminPricingMinutesPage';
import AdminPricingPhonePage from './components/admin/AdminPricingPhonePage';
import AdminCompanyPlansPage from './components/admin/AdminCompanyPlansPage';
import AdminRepPlansPage from './components/admin/AdminRepPlansPage';
import AdminObjectivesPage from './components/admin/AdminObjectivesPage';
import AdminInboxPage from './components/admin/AdminInboxPage';
import AdminIdentityPage from './components/admin/AdminIdentityPage';
import AdminSatisfactionPage from './components/admin/AdminSatisfactionPage';
import AdminErrorPage from './components/admin/AdminErrorPage';
import { AdminGuestOnly, AdminRoute } from './components/admin/adminGuards';
import InvitationsPage from './components/InvitationsPage';
import InviteLogin from './components/InviteLogin';
import { LegalPage } from './components/legal/LegalPage';
import NotFoundPage from './components/NotFoundPage';
import { isRoleComingSoon } from './config/offers';
import { hardNavigate } from './lib/appNavigation';
import { nomadHandoff, registerCompanyFallback, rememberExplicitLang, telephonyHandoff } from './lib/publicRoutes';
import { AuthSpinner } from './components/layout/guards';

function RootLayout() {
  // Hors production seulement (lib/appEnv.ts) : badge « RECETTE » et titre « [RECETTE] ». Le back office (hors connexion) a sa bande et son badge.
  const { pathname } = useLocation();
  const inAdminShell = /^\/admin(\/|$)/.test(pathname) && !/^\/admin\/signin(\/|$)/.test(pathname);
  return (
    <>
      <HistorySync />
      <VisitorTracker />
      <RecetteMarker showBadge={!inAdminShell} />
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

/**
 * `/:lang/telephony*` (ex. /en/telephony) appartient à l'application Téléphonie. Si l'hôte a quand même monté ce module,
 * on part vers /telephony* avec la langue de l'adresse (chargement complet : l'hôte monte alors la bonne application).
 */
function TelephonyHandoff() {
  const target = typeof window === 'undefined' ? null : telephonyHandoff(window.location);
  React.useEffect(() => {
    if (!target) return;
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { storage = null; }
    rememberExplicitLang(target.lang, storage);
    hardNavigate(target.url);
  }, [target?.url, target?.lang]);
  if (!target) return <NotFoundPage />;
  return <AuthSpinner />;
}

/**
 * `/:lang/nomad*` (ex. /en/nomad, /en/nomad/poste) : les adresses NOMAD n'ont pas de préfixe de langue. Normalement l'hôte redirige
 * avant de monter ce module ; s'il est monté quand même, on part vers /nomad* avec la langue de l'adresse (chargement complet : l'hôte
 * monte alors la bonne application). La connexion et l'inscription NOMAD ont leurs propres routes ci-dessous.
 */
function NomadHandoff() {
  const target = typeof window === 'undefined' ? null : nomadHandoff(window.location);
  React.useEffect(() => {
    if (!target) return;
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { storage = null; }
    rememberExplicitLang(target.lang, storage);
    hardNavigate(target.url);
  }, [target?.url, target?.lang]);
  if (!target) return <NotFoundPage />;
  return <AuthSpinner />;
}

/** T2 : inscription entreprise fermée tant que l'offre Company (TAAS) est « bientôt », même par adresse directe. */
function RegisterCompanyGate() {
  const fallback = registerCompanyFallback(isRoleComingSoon('company'));
  if (fallback) return <Navigate to={fallback} replace />;
  return <RegisterCompanyScreen />;
}

function AuthProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

const routes: RouteObject[] = [
    {
      element: (
        <AuthProviders>
          <RootLayout />
        </AuthProviders>
      ),
      errorElement: <NotFoundPage variant="error" />,
      children: [
        { path: 'auth/reactivate', element: <ReactivateAccount /> },
        { path: 'auth/invite', element: <InviteLogin /> },
        { path: 'telephony', element: <TelephonyHandoff /> },
        { path: 'telephony/*', element: <TelephonyHandoff /> },
        { path: 'nomad', element: <NomadHandoff /> },
        { path: 'nomad/*', element: <NomadHandoff /> },
        {
          path: 'auth/invitations',
          element: (
            <PrivateRoute>
              <InvitationsPage onSignIn={() => { window.location.assign('/auth/signin'); }} />
            </PrivateRoute>
          ),
        },
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
          path: 'admin/signin',
          element: (
            <AdminGuestOnly>
              <AdminSignInPage />
            </AdminGuestOnly>
          ),
        },
        {
          path: 'admin',
          element: (
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          ),
          errorElement: <AdminErrorPage />,
          children: [
            { index: true, element: <AdminDashboardPage /> },
            { path: 'users', element: <AdminUsersPage /> },
            { path: 'users/:userId', element: <AdminUserDetailPage /> },
            { path: 'satisfaction', element: <AdminSatisfactionPage /> },
            { path: 'wallet', element: <AdminWalletPage /> },
            { path: 'ai-tokens', element: <AdminAiTokensPage /> },
            { path: 'objectives', element: <AdminObjectivesPage /> },
            { path: 'inbox', element: <AdminInboxPage /> },
            { path: 'identity', element: <AdminIdentityPage /> },
            { path: 'pricing/minutes', element: <AdminPricingMinutesPage /> },
            { path: 'pricing/phone-line', element: <AdminPricingPhonePage /> },
            { path: 'plans/company', element: <AdminCompanyPlansPage /> },
            { path: 'plans/rep', element: <AdminRepPlansPage /> },
          ],
        },
        // Public legal pages (not behind GuestOnly — readable while logged in too)
        { path: 'privacy', element: <LegalPage /> },
        { path: 'terms', element: <LegalPage /> },
        { path: 'cookies', element: <LegalPage /> },
        { path: 'gdpr', element: <LegalPage /> },
        {
          element: <GuestAuthLayout />,
          children: [
            { index: true, element: <HubScreen /> },
            { path: 'taas', element: <TaasScreen /> },
            { path: 'taas/company', element: <TaasCompanyScreen /> },
            { path: 'taas/reps', element: <TaasRepsScreen /> },
            { path: 'auth/choice', element: <ChoiceScreen /> },
            { path: 'auth/signin', element: <SignInScreen /> },
            { path: 'auth/register', element: <RegisterScreen /> },
            { path: 'auth/register-company', element: <RegisterCompanyGate /> },
            { path: 'auth/register-rep', element: <RegisterRepScreen /> },
            { path: 'auth/register-call-center', element: <RegisterCallCenterScreen /> },
            // Adresses NOMAD (24/11/2026) : connexion et inscription NOMAD ; l'ancienne inscription NOMAD y est redirigée.
            { path: 'nomad/connexion', element: <NomadSignInScreen /> },
            { path: 'nomad/inscription', element: <RegisterNomadScreen /> },
            { path: 'auth/register-nomad', element: <LegacyRegisterNomadRedirect /> },
            { path: 'auth/recovery', element: <RecoveryScreen /> },
          ],
        },
        // Toute autre adresse : page 404 propre, à la charte HARX (plus la page de développeur de React Router).
        { path: '*', element: <NotFoundPage /> },
      ],
    },
];

let cachedRouter: { basename: string; router: ReturnType<typeof createBrowserRouter> } | null = null;

/** Router lié au préfixe de langue de l'URL courante (recréé si le préfixe change). */
export function getAppRouter() {
  const basename = getRouterBasename();
  if (!cachedRouter || cachedRouter.basename !== basename) {
    cachedRouter = { basename, router: createBrowserRouter(routes, { basename }) };
  }
  return cachedRouter.router;
}
