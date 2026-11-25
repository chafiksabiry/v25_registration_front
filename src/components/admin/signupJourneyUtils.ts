/**
 * Parcours d'inscription d'un compte, résumé par le serveur (`signupJourney` des réponses /admin/users et /admin/users/:id ;
 * v25_registration_backend src/utils/signupJourney.js summarizeJourney). Noms d'offres figés (NON-REGRESSION) : NOMAD, CLOUD, TAAS ;
 * produits Receptionist, Entreprise, Contact Centre. Jamais traduits.
 */
export type JourneyStepId =
  | 'account_created'
  | 'email_verified'
  | 'phone_verified'
  | 'identity_submitted'
  | 'identity_verified'
  | 'offer_chosen'
  | 'trial_call'
  | 'number_chosen'
  | 'payment_succeeded'
  | 'onboarding_finished'
  | 'first_login_app';

export type JourneyStep = { id: JourneyStepId | string; reached: boolean; at: string | null; outcome?: 'done' | 'skipped' | 'used' };

export type SignupJourneySummary = {
  recorded: boolean;
  signup: {
    offer: 'nomad' | 'cloud' | 'taas' | null;
    product: 'receptionist' | 'entreprise' | 'contact_centre' | null;
    entry: string | null;
    lang?: string | null;
    country?: string | null;
    at?: string | null;
  } | null;
  steps: JourneyStep[];
  lastReached: string | null;
  finished: boolean;
  totalMs: number | null;
  status: 'unrecorded' | 'finished' | 'in_progress';
};

/** Résumé de la liste : statut et dernière étape seulement. */
export type SignupJourneyRow = { status: SignupJourneySummary['status']; lastReached: string | null };

export const JOURNEY_STEP_LABELS: Record<JourneyStepId, string> = {
  account_created: 'Compte créé',
  email_verified: 'E-mail vérifié',
  phone_verified: 'Téléphone vérifié',
  identity_submitted: 'Identité envoyée',
  identity_verified: 'Identité vérifiée',
  offer_chosen: 'Offre choisie',
  trial_call: 'Appel d’essai',
  number_chosen: 'Numéro choisi',
  payment_succeeded: 'Paiement réussi',
  onboarding_finished: 'Mise en route terminée',
  first_login_app: 'Première connexion à l’application',
};

export const TRIAL_OUTCOME_LABELS: Record<NonNullable<JourneyStep['outcome']>, string> = {
  done: 'passé',
  skipped: 'sauté',
  used: 'déjà utilisé',
};

export const UNRECORDED_LABEL = 'Parcours non enregistré (compte antérieur)';

export function journeyStepLabel(id: string | null | undefined): string {
  if (!id) return '—';
  return (JOURNEY_STEP_LABELS as Record<string, string>)[id] || id;
}

/** Durée lisible : « 45 min », « 2 h 05 », « 3 j 4 h ». */
export function formatJourneyDuration(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return '—';
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ${String(minutes % 60).padStart(2, '0')}`;
  return `${Math.floor(hours / 24)} j ${hours % 24} h`;
}

/** Libellé de la liste : « Parcours : terminé », « Parcours : bloqué à Offre choisie », ou null (compte antérieur). */
export function journeyRowLabel(row: SignupJourneyRow | null | undefined): string | null {
  if (!row || row.status === 'unrecorded') return null;
  if (row.status === 'finished') return 'Parcours : terminé';
  return `Parcours : bloqué à ${journeyStepLabel(row.lastReached)}`;
}

export type JourneyFilter = 'all' | 'finished' | 'unrecorded' | `stuck:${JourneyStepId}`;

export const JOURNEY_FILTERS: { value: JourneyFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'finished', label: 'Terminé' },
  ...(Object.keys(JOURNEY_STEP_LABELS) as JourneyStepId[])
    .filter((id) => id !== 'onboarding_finished')
    .map((id) => ({ value: `stuck:${id}` as JourneyFilter, label: `Bloqué à ${JOURNEY_STEP_LABELS[id]}` })),
  { value: 'unrecorded', label: 'Non enregistré' },
];
