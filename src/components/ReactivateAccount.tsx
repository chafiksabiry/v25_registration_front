import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { getPostLoginRedirectUrl, syncSessionUserIdCookie } from '../lib/authRedirect';
import { hardNavigate } from '../lib/appNavigation';
import { buildAuthPageTitle } from '../lib/tracking/registrationSections';
import { usePageTitle } from '../lib/tracking/usePageTitle';

type Status = 'loading' | 'invalid' | 'expired';

/**
 * Landing page of the one-click link sent to migrated HARX v1 reps
 * (/auth/reactivate?t=<token>): exchanges the token for a session and resumes onboarding.
 */
export default function ReactivateAccount() {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const started = useRef(false);

  usePageTitle(buildAuthPageTitle('Reprise du compte'));

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const linkToken = params.get('t') ?? '';
    // Keep the secret out of the address bar, history and Referer headers.
    window.history.replaceState(null, '', window.location.pathname);

    (async () => {
      try {
        const { token } = await auth.reengageLogin(linkToken);
        const { userId } = jwtDecode<{ userId: string }>(token);
        setToken(token, true);
        syncSessionUserIdCookie(token);
        const dest = await getPostLoginRedirectUrl(userId, token);
        hardNavigate(dest || '/auth/signin');
      } catch (err: unknown) {
        const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
        setStatus(code === 'LINK_EXPIRED' ? 'expired' : 'invalid');
      }
    })();
  }, [setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-center">
      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-4 text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>{t('reactivate.loading', 'Opening your HARX space...')}</p>
        </div>
      ) : (
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-amber-400" />
          <h1 className="mb-2 text-lg font-semibold text-white">
            {status === 'expired'
              ? t('reactivate.expiredTitle', 'This link has expired')
              : t('reactivate.invalidTitle', 'This link is not valid')}
          </h1>
          <p className="mb-6 text-sm">
            {t('reactivate.help', 'Sign in with your email to continue. If you have no password yet, use “Forgot password”.')}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/auth/signin" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              {t('reactivate.signIn', 'Sign in')}
            </Link>
            <Link to="/auth/recovery" className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white">
              {t('reactivate.forgot', 'Forgot password')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
