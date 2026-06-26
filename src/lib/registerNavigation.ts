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

export const REGISTER_ROUTE_PATHS = [
  '/auth/register',
  '/auth/register-company',
  '/auth/register-rep',
] as const;

export type RegisterRoutePath = (typeof REGISTER_ROUTE_PATHS)[number];

export function resolveRegisterPath(pathname: string): RegisterRoutePath {
  if (REGISTER_ROUTE_PATHS.includes(pathname as RegisterRoutePath)) {
    return pathname as RegisterRoutePath;
  }
  return '/auth/register';
}
