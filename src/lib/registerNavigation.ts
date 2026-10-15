export type RegisterNavState = {
  /** Route to open when leaving registration (e.g. `/auth/choice`). */
  returnTo?: string;
  /** Landing section id to scroll to after returning home (e.g. `pricing`). */
  scrollTo?: string;
};

export const REGISTER_FORM_STEPS = ['name', 'email', 'password', 'phone', 'terms', 'verification'] as const;

export type RegisterFormStep = (typeof REGISTER_FORM_STEPS)[number];

export function registerStepSearch(step: RegisterFormStep): string {
  return step === 'name' ? '' : `?step=${step}`;
}

/**
 * Step from the real browser URL. Inside qiankun the React Router location
 * can miss `window`/`document` search on a direct visit, so the address bar
 * says `?step=terms` while the form still shows the first step.
 */
export function readBrowserSearchStep(): string | null {
  const searches: string[] = [];
  try {
    searches.push(window.location.search);
  } catch {
    /* ignore */
  }
  try {
    if (window.top) searches.push(window.top.location.search);
  } catch {
    /* ignore cross-origin */
  }
  try {
    searches.push(new URL(document.URL).search);
  } catch {
    /* ignore */
  }
  for (const search of searches) {
    const step = new URLSearchParams(search).get('step');
    if (step) return step;
  }
  return null;
}

export const REGISTER_ROUTE_PATHS = [
  '/auth/register',
  '/auth/register-company',
  '/auth/register-rep',
  '/auth/register-call-center',
] as const;

export type RegisterRoutePath = (typeof REGISTER_ROUTE_PATHS)[number];

export function resolveRegisterPath(pathname: string): RegisterRoutePath {
  if (REGISTER_ROUTE_PATHS.includes(pathname as RegisterRoutePath)) {
    return pathname as RegisterRoutePath;
  }
  return '/auth/register';
}
