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

const AUTH_LABELS_EN: Record<string, string> = {
  'Choix du profil': 'Choose your profile',
  Connexion: 'Sign in',
  Inscription: 'Sign up',
  'Inscription entreprise': 'Company sign-up',
  'Inscription rep': 'Rep sign-up',
  'Récupération de compte': 'Account recovery',
};

export function buildAuthPageTitle(label: string, lang: 'fr' | 'en' = 'fr'): string {
  if (lang === 'en') return `HARX — Account · ${AUTH_LABELS_EN[label] ?? label}`;
  return `HARX — Compte · ${label}`;
}
