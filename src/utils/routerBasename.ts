import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

/**
 * React Router basename for the registration (auth) micro-app.
 *
 * Unlike the rep app (mounted under a single `/reps` prefix), the auth
 * micro-app is mounted by the qiankun host at the root and serves both the
 * landing page (`/`) and the auth screens (`/auth/*`, `/linkedin/*`).
 * The basename is therefore always `/` — but we keep this helper so the
 * routing setup mirrors the rep orchestrator (single source of truth for
 * the mount prefix).
 */
const MOUNT_PREFIX = '/';

export function getRouterBasename(): string {
  if (typeof window === 'undefined') {
    return MOUNT_PREFIX;
  }
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    return MOUNT_PREFIX;
  }
  return MOUNT_PREFIX;
}
