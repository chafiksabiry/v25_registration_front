import { resolveAdminTabTitle } from '../../components/admin/adminSections';
import { DEFAULT_PAGE_DESCRIPTION, HARX_SITE_URL } from './constants';
import { isAuthPortalPath, resolveAuthTabTitle } from './registrationSections';

export type PageMeta = {
  title: string;
  description: string;
  canonical?: string;
};

const BASE_TITLE = 'HARX';

const ROUTE_META: Array<{ test: (path: string) => boolean; meta: PageMeta }> = [
  {
    test: (p) => p === '/' || p === '',
    meta: {
      title: `${BASE_TITLE} — Accueil`,
      description: DEFAULT_PAGE_DESCRIPTION,
      canonical: `${HARX_SITE_URL}/`,
    },
  },
  {
    test: (p) => p.startsWith('/admin/signin'),
    meta: {
      title: `${BASE_TITLE} — Admin · Connexion`,
      description: 'Connexion back office HARX.',
      canonical: `${HARX_SITE_URL}/admin/signin`,
    },
  },
];

export function normalizeTrackingPath(path: string): string {
  const withoutHash = path.split('#')[0] || '/';
  const pathname = withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`;
  return pathname.replace(/\/+$/, '') || '/';
}

function resolveAdminPageMeta(rawPath: string): PageMeta | null {
  const pathname = normalizeTrackingPath(rawPath.split('?')[0].split('#')[0]);
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/signin')) {
    return null;
  }

  const sectionLabel = resolveAdminTabTitle(pathname);
  return {
    title: `${BASE_TITLE} — Admin · ${sectionLabel}`,
    description: `Back office administrateur HARX — ${sectionLabel}.`,
    canonical: `${HARX_SITE_URL}${pathname === '/admin' ? '/admin' : pathname}`,
  };
}

function resolveAuthPageMeta(rawPath: string): PageMeta | null {
  const pathname = normalizeTrackingPath(rawPath.split('?')[0].split('#')[0]);
  if (!isAuthPortalPath(pathname)) return null;

  const sectionLabel = resolveAuthTabTitle(pathname);
  if (!sectionLabel) return null;

  return {
    title: `${BASE_TITLE} — Compte · ${sectionLabel}`,
    description: `Espace compte HARX — ${sectionLabel}.`,
    canonical: `${HARX_SITE_URL}${pathname}`,
  };
}

export function resolvePageMeta(rawPath: string): PageMeta {
  const full = rawPath || '/';
  const adminMeta = resolveAdminPageMeta(full);
  if (adminMeta) return adminMeta;

  const authMeta = resolveAuthPageMeta(full);
  if (authMeta) return authMeta;

  const match = ROUTE_META.find(({ test }) => test(full) || test(normalizeTrackingPath(full)));
  return (
    match?.meta ?? {
      title: BASE_TITLE,
      description: DEFAULT_PAGE_DESCRIPTION,
      canonical: `${HARX_SITE_URL}${normalizeTrackingPath(full) === '/' ? '' : normalizeTrackingPath(full)}`,
    }
  );
}

export function buildTrackingPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}
