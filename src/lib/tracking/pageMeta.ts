import { resolveAdminTabTitle } from '../../components/admin/adminSections';
import { DEFAULT_PAGE_DESCRIPTION, HARX_SITE_URL } from './constants';
import { isAuthPortalPath, resolveAuthTabTitle } from './registrationSections';
import { getLangFromPath, stripLangPrefix, withLangPrefix, type SiteLang } from '../langRoutes';

export type PageMeta = {
  title: string;
  description: string;
  canonical?: string;
  /** Langue de la page (attribut <html lang>). */
  lang?: SiteLang;
  /** Versions linguistiques (balises hreflang). */
  alternates?: Array<{ hreflang: string; href: string }>;
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

const LEGAL_PATHS = ['/privacy', '/terms', '/cookies', '/gdpr'];

/** Pages publiques indexables, disponibles en /fr/… et /en/… */
function isLocalizedIndexablePath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/auth/choice' ||
    pathname === '/auth/register-company' ||
    pathname === '/auth/register-rep' ||
    LEGAL_PATHS.includes(pathname)
  );
}

const EN_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${BASE_TITLE} — Home`,
    description: 'HARX — Transaction as a Service. Marketplace of AI-certified reps for companies and independents.',
  },
  '/auth/choice': {
    title: `${BASE_TITLE} — Choose your profile`,
    description: 'Join HARX as a company or an independent rep.',
  },
  '/auth/register-company': {
    title: `${BASE_TITLE} — Company sign-up`,
    description: 'Create your HARX company account.',
  },
  '/auth/register-rep': {
    title: `${BASE_TITLE} — Rep sign-up`,
    description: 'Create your certified HARX rep profile with your CV.',
  },
};

export function resolvePageMeta(rawPath: string): PageMeta {
  const full = rawPath || '/';
  const [pathOnly, ...rest] = full.split('?');
  const urlLang = getLangFromPath(pathOnly.split('#')[0]);
  const stripped = stripLangPrefix(pathOnly.split('#')[0]);
  const suffix = rest.length ? `?${rest.join('?')}` : '';
  const meta = resolveUnprefixedPageMeta(`${stripped}${suffix}`);
  const pathname = normalizeTrackingPath(stripped);
  const lang: SiteLang = urlLang ?? 'fr';

  if (!isLocalizedIndexablePath(pathname)) {
    return urlLang ? { ...meta, lang, canonical: meta.canonical ? `${HARX_SITE_URL}${normalizeTrackingPath(pathOnly.split('#')[0])}` : undefined } : meta;
  }
  const localized = lang === 'en' ? EN_META[pathname] : undefined;
  return {
    ...meta,
    ...localized,
    lang,
    canonical: `${HARX_SITE_URL}${withLangPrefix(pathname, lang)}`,
    alternates: [
      { hreflang: 'fr', href: `${HARX_SITE_URL}${withLangPrefix(pathname, 'fr')}` },
      { hreflang: 'en', href: `${HARX_SITE_URL}${withLangPrefix(pathname, 'en')}` },
      ...(pathname === '/' ? [{ hreflang: 'x-default', href: `${HARX_SITE_URL}/` }] : []),
    ],
  };
}

function resolveUnprefixedPageMeta(full: string): PageMeta {
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
