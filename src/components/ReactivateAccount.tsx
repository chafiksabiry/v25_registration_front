import React, { useEffect, useRef, useState } from 'react';
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

type Status = 'loading' | 'invalid' | 'expired' | 'request' | 'sent';

/**
 * Landing page of the re-engagement flow for migrated HARX v1 reps.
 * - /auth/reactivate?t=<token>: exchanges the one-click token for a session and resumes onboarding.
 * - /auth/reactivate (no token, the address used in the campaign e-mail): the REP types their
 *   address and the personal one-click link is e-mailed to it.
 */
export default function ReactivateAccount() {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const started = useRef(false);

  usePageTitle(buildAuthPageTitle('Reprise du compte'));

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const linkToken = params.get('t') ?? '';
    // Keep the secret out of the address bar, history and Referer headers.
    window.history.replaceState(null, '', window.location.pathname);
    if (!linkToken) {
      setStatus('request');
      return;
    }

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

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending || !email.trim()) return;
    setSending(true);
    setRequestError(false);
    try {
      await auth.reengageRequest(email.trim());
      setStatus('sent');
    } catch {
      setRequestError(true);
    } finally {
      setSending(false);
    }
  };

  if (status === 'request' || status === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
          {status === 'sent' ? (
            <>
              <h1 className="mb-2 text-lg font-semibold text-white">{t('reactivate.sentTitle', 'Check your mailbox')}</h1>
              <p className="mb-6 text-sm">
                {t('reactivate.sentText', 'If this address is registered, you will receive your personal link in a few minutes. Look in your spam folder if you do not see it.')}
              </p>
              <button
                type="button"
                onClick={() => setStatus('request')}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white"
              >
                {t('reactivate.sendAgain', 'Use another address')}
              </button>
            </>
          ) : (
            <form onSubmit={submitRequest} className="text-left">
              <h1 className="mb-2 text-lg font-semibold text-white">{t('reactivate.requestTitle', 'Get your personal link')}</h1>
              <p className="mb-5 text-sm">
                {t('reactivate.requestIntro', 'Enter the email address where you received our message. We will send you a one-click link to your HARX space.')}
              </p>
              <label htmlFor="reactivate-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('reactivate.emailLabel', 'Email address')}
              </label>
              <input
                id="reactivate-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('reactivate.emailPlaceholder', 'you@example.com')}
                className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-pink-400"
              />
              {requestError && (
                <p className="mb-4 flex items-center gap-2 text-sm text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  {t('reactivate.requestError', 'This did not work. Please check the address and try again.')}
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
              >
                {sending ? t('reactivate.sending', 'Sending...') : t('reactivate.send', 'Send me my link')}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

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
            <button
              type="button"
              onClick={() => setStatus('request')}
              className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white"
            >
              {t('reactivate.requestTitle', 'Get your personal link')}
            </button>
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
