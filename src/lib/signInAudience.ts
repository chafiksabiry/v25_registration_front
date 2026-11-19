/**
 * Choix « Entreprise / Équipe » de l'écran de connexion Téléphonie : une entreprise ne peut pas être agent ni membre
 * d'une équipe, et inversement. Le choix est confronté au type réel du compte avant d'aller plus loin.
 */
export type Audience = 'company' | 'team';

const KEY = 'harx_signin_audience';

/** Entreprise : société ou centre. Équipe : agent (secrétaire) ou membre invité (responsable). Autres types : pas de contrôle. */
export function audienceOfUserType(userType: string | null | undefined): Audience | null {
  const t = String(userType ?? '');
  if (t === 'company' || t === 'call-center') return 'company';
  if (t === 'rep' || t === 'company-member') return 'team';
  return null;
}

/** Clé de traduction du refus quand le choix ne correspond pas au compte, null quand tout va bien (ou type inconnu). */
export function audienceMismatchKey(chosen: Audience, userType: string | null | undefined): 'accountIsCompany' | 'accountIsTeam' | null {
  const actual = audienceOfUserType(userType);
  if (!actual || actual === chosen) return null;
  return actual === 'company' ? 'accountIsCompany' : 'accountIsTeam';
}

/** `?audience=team` (lien d'une invitation par e-mail) : la personne invitée arrive sur « Équipe », sans devoir le deviner. */
export function audienceFromSearch(search: string): Audience | null {
  const v = new URLSearchParams(search).get('audience');
  return v === 'team' || v === 'company' ? v : null;
}

export function readAudience(): Audience {
  try {
    const fromLink = audienceFromSearch(window.location.search);
    if (fromLink) return fromLink;
    const v = localStorage.getItem(KEY);
    return v === 'team' ? 'team' : 'company';
  } catch {
    return 'company';
  }
}

export function saveAudience(a: Audience): void {
  try { localStorage.setItem(KEY, a); } catch { /* stockage indisponible */ }
}
