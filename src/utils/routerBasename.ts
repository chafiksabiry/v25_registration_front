import { getLangFromPath } from '../lib/langRoutes';

/**
 * React Router basename for the registration (auth) micro-app.
 *
 * The auth micro-app is mounted by the qiankun host at the root and serves the
 * landing page (`/`), the auth screens (`/auth/*`) and the legal pages. The
 * public pages are also served under a language prefix (`/fr/…`, `/en/…`): the
 * basename is then that prefix, so every in-app navigation keeps the language.
 * It is read from the URL on each call (the prefix only changes on a full page load).
 */
const MOUNT_PREFIX = '/';

export function getRouterBasename(): string {
  if (typeof window === 'undefined') {
    return MOUNT_PREFIX;
  }
  const lang = getLangFromPath(window.location.pathname);
  return lang ? `/${lang}` : MOUNT_PREFIX;
}
