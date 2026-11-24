import axios from 'axios';

/**
 * Désactivation et suppression d'un compte depuis le portail admin (maquettes A1, A2, A2b, A3) : fonctions pures, testées.
 */

export type AccountStatusFilter = 'all' | 'active' | 'disabled';

export const ACCOUNT_STATUS_FILTERS: { value: AccountStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'disabled', label: 'Désactivés' },
];

export type AccountStatusFields = {
  disabled?: boolean | null;
  disabledAt?: string | null;
  disabledReason?: string | null;
  disabledBy?: { name?: string | null } | null;
};

export const isAccountDisabled = (user?: AccountStatusFields | null): boolean => user?.disabled === true;

const pad = (n: number) => String(n).padStart(2, '0');

/** « 24/11/2026 » (heure de Paris, comme le reste du portail admin en français). */
export function formatDay(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
}

/** « 10:42 » (heure de Paris). */
export function formatTime(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const h = parts.find((p) => p.type === 'hour')?.value ?? pad(d.getHours());
  const m = parts.find((p) => p.type === 'minute')?.value ?? pad(d.getMinutes());
  return `${h}:${m}`;
}

/** Bandeau A2b : « Compte désactivé le 24/11/2026 à 10:42 par Admin HARX ». */
export function disabledTitle(user: AccountStatusFields): string {
  const day = formatDay(user.disabledAt);
  const time = formatTime(user.disabledAt);
  const who = user.disabledBy?.name ? ` par ${user.disabledBy.name}` : '';
  return `Compte désactivé${day ? ` le ${day}` : ''}${time ? ` à ${time}` : ''}${who}`;
}

/** Bandeau A2b, seconde ligne : motif puis conséquences. */
export function disabledDetail(user: AccountStatusFields): string {
  const reason = user.disabledReason?.trim();
  const motif = reason ? `Motif : « ${reason} ». ` : '';
  return `${motif}La connexion au portail et à l’app NOMAD est refusée. L’abonnement et le numéro n’ont pas été modifiés.`;
}

/** L'email retapé correspond-il au compte ? Casse et espaces autour ignorés, comme côté serveur. */
export function confirmEmailMatches(typed: string, email: string): boolean {
  const a = String(typed || '').trim().toLowerCase();
  return a !== '' && a === String(email || '').trim().toLowerCase();
}

/** Numéro lisible : un numéro français +33XXXXXXXXX devient « 01 42 00 00 07 » ; les autres restent au format international. */
export function displayNumber(e164?: string | null): string {
  const s = String(e164 || '').replace(/\s+/g, '');
  const fr = /^\+33(\d{9})$/.exec(s);
  if (fr) return `0${fr[1]}`.replace(/(\d{2})(?=\d)/g, '$1 ');
  return s;
}

/** Numéros des lignes actives d'une société (détail admin : `financials.phoneNumbers`). */
export function companyNumbers(financials: unknown): string[] {
  const list = (financials as { phoneNumbers?: Array<{ phoneNumber?: string; status?: string }> } | null)?.phoneNumbers;
  if (!Array.isArray(list)) return [];
  return list.map((n) => String(n?.phoneNumber || '')).filter(Boolean);
}

const ERROR_TEXT: Record<string, string> = {
  PROTECTED_ACCOUNT: 'Ce compte est protégé : il ne peut être ni désactivé, ni supprimé, ni résilié.',
  ADMIN_ACCOUNT: 'Un compte administrateur ne peut pas être désactivé ni supprimé ici.',
  CONFIRMATION_MISMATCH: 'L’email tapé ne correspond pas au compte.',
  COMPANY_HAS_MEMBERS: 'Ce compte possède une entreprise avec d’autres membres : suppression impossible ici.',
  ACCOUNT_PURGE_NOT_CONFIGURED: 'Suppression indisponible : le serveur n’est pas configuré.',
  ACCOUNT_PURGE_FAILED: 'La résiliation de l’abonnement ou la remise en stock du numéro a échoué. Rien n’a été supprimé : réessayez.',
  USER_NOT_FOUND: 'Ce compte n’existe plus.',
};

/** Message en français simple pour une erreur des routes de désactivation et de suppression. */
export function closureErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Serveur injoignable. Réessayez.';
    if (error.response.status === 401) return 'Session admin refusée : reconnectez-vous.';
    const code = (error.response.data as { code?: string } | undefined)?.code;
    if (code && ERROR_TEXT[code]) return ERROR_TEXT[code];
  }
  return 'L’opération a échoué. Réessayez.';
}
