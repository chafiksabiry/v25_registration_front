const AUTH_ROUTE_TITLES: Array<{ test: (path: string) => boolean; label: string }> = [
  { test: (p) => p.startsWith('/auth/choice'), label: 'Choix du profil' },
  { test: (p) => p.startsWith('/auth/signin'), label: 'Connexion' },
  { test: (p) => p.startsWith('/auth/register-company'), label: 'Inscription entreprise' },
  { test: (p) => p.startsWith('/auth/register-rep'), label: 'Inscription rep' },
  { test: (p) => p.startsWith('/auth/register'), label: 'Inscription' },
  { test: (p) => p.startsWith('/auth/recovery'), label: 'Récupération de compte' },
  { test: (p) => p.startsWith('/auth'), label: 'Authentification' },
  { test: (p) => p.startsWith('/linkedin/signin/callback'), label: 'Connexion LinkedIn' },
  { test: (p) => p.startsWith('/linkedin/callback'), label: 'Inscription LinkedIn' },
  { test: (p) => p.startsWith('/linkedin'), label: 'LinkedIn' },
  { test: (p) => p.startsWith('/profile-completion'), label: 'Complétion du profil' },
];

export function resolveAuthTabTitle(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  const match = AUTH_ROUTE_TITLES.find(({ test }) => test(path));
  return match?.label ?? null;
}

export function isAuthPortalPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  return AUTH_ROUTE_TITLES.some(({ test }) => test(path));
}

export function buildAuthPageTitle(label: string): string {
  return `HARX — Compte · ${label}`;
}
