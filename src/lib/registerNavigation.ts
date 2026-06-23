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
