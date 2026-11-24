import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { identityAdminUrl } from './api';

/**
 * Revue des pièces d'identité (admin HARX), dans le portail admin. Mêmes routes JSON que la page de l'orchestrateur
 * (`/admin/identity/*`, jeton admin du tableau de bord en en-tête Authorization) : aucun changement côté serveur.
 * Le jeton vient de la session admin ouverte (localStorage `token`) : rien à saisir.
 */

export type IdentityStatusFilter = 'review' | 'pending' | 'rejected' | 'approved';

export const IDENTITY_STATUS_OPTIONS: Array<{ value: IdentityStatusFilter; label: string }> = [
  { value: 'review', label: 'À revoir' },
  { value: 'pending', label: 'Validées, un pays à revoir' },
  { value: 'rejected', label: 'Refusées' },
  { value: 'approved', label: 'Validées' },
];

/** Motifs de refus proposés à l'admin (liste du serveur, ADMIN_REJECT_CODES ; même ordre que la page de l'orchestrateur). */
export const IDENTITY_REJECT_CODES = [
  'NAME_MISMATCH',
  'COUNTRY_MISMATCH_NATIONALITY',
  'COUNTRY_MISMATCH_RESIDENCE',
  'PROOF_TOO_OLD',
  'ID_EXPIRED',
  'UNREADABLE',
  'DOCUMENT_TYPE_NOT_ACCEPTED',
  'UNDERAGE',
  'PROOF_HOLDER_OTHER',
  'DOCUMENT_SUSPECTED',
] as const;

export type CountryKey = 'residence' | 'nationality';

export type IdentityListItem = {
  id: string;
  companyId: string;
  name: string;
  docType: string;
  status: string;
  createdAt: string;
  ageHours: number;
  reasons: string[];
  pendingCountries: CountryKey[];
  reviewRequested: boolean;
  overdue: boolean;
};

export type IdentitySignal = { code: string; detail?: string };

export type IdentityFile = {
  fileId: string;
  kind: string;
  mime: string;
  size?: number;
  signals: IdentitySignal[];
  meta: { pageBytes?: number[]; pages?: number; [k: string]: unknown };
};

export type IdentityCheck = { code: string; result: 'pass' | 'review' | 'fail' | 'info' | string; detail?: string; reason?: string };

export type IdentityDeclared = { fullName?: string; residence?: string; nationality?: string; [k: string]: unknown } | null;

export type IdentityExtracted = {
  id?: {
    lastName?: string;
    givenNames?: string;
    lastNameNative?: string;
    givenNamesNative?: string;
    nationalityIso3?: string;
    issuingCountryIso3?: string;
    expiryDate?: string;
    documentType?: string;
  };
  proof?: {
    holderName?: string;
    holderNameNative?: string;
    countryPrinted?: string;
    countryInferred?: string;
    inferenceBasis?: string;
    issueDate?: string;
    documentType?: string;
  };
} | null;

export type IdentityDetail = {
  id: string;
  companyId: string;
  status: string;
  docType: string;
  attempt: number;
  createdAt: string;
  declared: IdentityDeclared;
  extracted: IdentityExtracted;
  checks: IdentityCheck[];
  decision: { outcome?: string; reasonCodes?: string[]; note?: string } | null;
  verifiedCountries: { residence?: string | null; nationality?: string | null } | null;
  pendingCountries: CountryKey[];
  reviewRequestedAt: string | null;
  files: IdentityFile[];
  accessLog: Array<{ at: string; adminId: string; action: string; fileId?: string | null }>;
};

export type IdentityDecisionBody =
  | { outcome: 'approved'; residence: string | null; nationality: string | null }
  | { outcome: 'rejected'; reasonCode: string; note: string }
  | { outcome: 'resubmit'; note: string };

/** Erreur lisible : 401 = session admin refusée, 404 sur la liste = module désactivé côté serveur, sinon le code renvoyé. */
export class IdentityApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

const call = async <T>(method: 'get' | 'post', path: string, opts: { data?: unknown; blob?: boolean; base?: string } = {}): Promise<T> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.request<T>({
      method,
      url: `${opts.base ?? identityAdminUrl()}${path}`,
      data: opts.data,
      timeout: 30000,
      responseType: opts.blob ? 'blob' : 'json',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      const body = e.response.data as { code?: string } | undefined;
      throw new IdentityApiError(e.response.status, (body && typeof body === 'object' && body.code) || String(e.response.status));
    }
    throw new IdentityApiError(0, 'NETWORK');
  }
};

export const identityReviewApi = {
  list: (status: IdentityStatusFilter) =>
    call<{ verifications: IdentityListItem[] }>('get', `/verifications?status=${encodeURIComponent(status)}`),
  detail: (id: string) => call<IdentityDetail>('get', `/verifications/${encodeURIComponent(id)}`),
  /** Image (ou page) déchiffrée à la volée ; chaque lecture est journalisée par le serveur. */
  file: (id: string, fileId: string, page: number | null = null) =>
    call<Blob>('get', `/verifications/${encodeURIComponent(id)}/files/${encodeURIComponent(fileId)}${page == null ? '' : `?page=${page}`}`, { blob: true }),
  decide: (id: string, body: IdentityDecisionBody) =>
    call<{ status: string }>('post', `/verifications/${encodeURIComponent(id)}/decision`, { data: body }),
};

/** Message d'erreur en français simple. */
export function identityErrorMessage(e: unknown): string {
  if (e instanceof IdentityApiError) {
    if (e.status === 401) return 'Session admin refusée : reconnectez-vous.';
    if (e.status === 404 && e.code === '404') return 'Vérification d’identité indisponible sur le serveur.';
    if (e.status === 0) return 'Serveur injoignable. Réessayez.';
    return `Erreur : ${e.code}`;
  }
  return 'Erreur inattendue.';
}

// ---------- Navigation depuis l'Inbox ----------

export const IDENTITY_PAGE_PATH = '/admin/identity';
const CONVERSATION_PREFIX = 'identity:';

/** Conversation `identity:<id du dossier>` de l'Inbox -> id du dossier (champ structuré posé par le serveur). */
export function verificationIdFromConversation(waId: string | null | undefined): string | null {
  const s = String(waId || '');
  if (!s.startsWith(CONVERSATION_PREFIX)) return null;
  const id = s.slice(CONVERSATION_PREFIX.length).trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

/** Chemin interne de la page Identité, ouverte sur le dossier quand on le connaît. */
export function identityPagePath(verificationId?: string | null): string {
  return verificationId ? `${IDENTITY_PAGE_PATH}?dossier=${encodeURIComponent(verificationId)}` : IDENTITY_PAGE_PATH;
}

// ---------- Affichage ----------

/** Nom affiché dans le filigrane : e-mail de la session admin, sinon « admin » (le jeton n'est jamais affiché). */
export function adminLabelFromToken(token: string | null | undefined): string {
  if (!token) return 'admin';
  try {
    const d = jwtDecode<{ email?: string }>(token);
    return typeof d.email === 'string' && d.email ? d.email : 'admin';
  } catch {
    return 'admin';
  }
}

export function watermarkText(admin: string, date: Date = new Date()): string {
  return `HARX — revue — ${date.toLocaleDateString('fr-FR')} — ${admin}`;
}

/** Ligne sous le nom dans la liste (même contenu que la page de l'orchestrateur). */
export function listMetaLine(v: IdentityListItem): string {
  return [
    `il y a ${v.ageHours} h`,
    v.docType,
    v.reviewRequested ? 'revue demandée' : '',
    v.pendingCountries?.length ? `à revoir : ${v.pendingCountries.join(', ')}` : '',
    v.overdue ? 'plus de 72 h' : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Pays encore à décider sur un dossier validé (cas « un pays à revoir »). */
export function pendingOf(d: Pick<IdentityDetail, 'status' | 'pendingCountries'>): CountryKey[] {
  return (d.status === 'approved' && d.pendingCountries) || [];
}

/** Le dossier attend-il une décision ? */
export function canDecide(d: Pick<IdentityDetail, 'status' | 'pendingCountries'>): boolean {
  return d.status === 'review' || pendingOf(d).length > 0;
}

/** Cases cochées / bloquées au départ (même règle que la page de l'orchestrateur). */
export function initialCountryChoice(d: Pick<IdentityDetail, 'status' | 'pendingCountries' | 'docType'>): Record<CountryKey, { checked: boolean; locked: boolean }> {
  const pend = pendingOf(d);
  if (pend.length) {
    return {
      residence: { checked: pend.includes('residence'), locked: !pend.includes('residence') },
      nationality: { checked: pend.includes('nationality'), locked: !pend.includes('nationality') },
    };
  }
  return { residence: { checked: true, locked: false }, nationality: { checked: d.docType !== 'residence_permit', locked: false } };
}

export function approveBody(d: Pick<IdentityDetail, 'declared'>, choice: Record<CountryKey, boolean>): IdentityDecisionBody {
  return {
    outcome: 'approved',
    residence: choice.residence ? d.declared?.residence ?? null : null,
    nationality: choice.nationality ? d.declared?.nationality ?? null : null,
  };
}

/** Pages à afficher pour un fichier : `null` = fichier entier, sinon un index par page (fichier découpé par le serveur). */
export function filePages(f: Pick<IdentityFile, 'meta'>): Array<number | null> {
  const n = Array.isArray(f.meta?.pageBytes) ? f.meta.pageBytes.length : 0;
  return n > 1 ? Array.from({ length: n }, (_, i) => i) : [null];
}

export function verifiedSummary(d: Pick<IdentityDetail, 'verifiedCountries' | 'status' | 'pendingCountries'>): string {
  const pend = pendingOf(d);
  if (!pend.length) return '';
  const vc = d.verifiedCountries || {};
  const done = [vc.residence ? `résidence ${vc.residence}` : '', vc.nationality ? `nationalité ${vc.nationality}` : ''].filter(Boolean).join(', ');
  return `Déjà validé : ${done}. À revoir : ${pend.join(', ')} (le pays déjà validé reste ouvert).`;
}

/** Tableau « Déclaré / lu » (lignes identiques à la page de l'orchestrateur). */
export function comparisonRows(d: Pick<IdentityDetail, 'declared' | 'extracted' | 'docType'>): string[][] {
  const x = d.extracted || {};
  const i = x.id || {};
  const pr = x.proof || {};
  const de = d.declared || {};
  const s = (v: unknown) => (v == null ? '' : String(v));
  return [
    ['Nom', s(de.fullName), [i.lastName, i.givenNames].filter(Boolean).join(' '), s(pr.holderName)],
    ['Nom (écriture d’origine)', '—', [i.lastNameNative, i.givenNamesNative].filter(Boolean).join(' '), s(pr.holderNameNative)],
    [
      'Pays',
      `Nat. ${de.nationality || '?'} · Rés. ${de.residence || '?'}`,
      s(i.nationalityIso3 || i.issuingCountryIso3),
      `${pr.countryPrinted || ''}${pr.countryInferred ? ` (déduit ${pr.countryInferred}, ${pr.inferenceBasis})` : ''}`,
    ],
    ['Date', '—', i.expiryDate ? `exp. ${i.expiryDate}` : '', s(pr.issueDate)],
    ['Type', s(d.docType), s(i.documentType), s(pr.documentType)],
  ];
}

export const isRtl = (v: string): boolean => /[؀-ۿ]/.test(v);

export const CHECK_ICON: Record<string, string> = { pass: '✓', review: '!', fail: '✕', info: '·' };

export function checkLine(c: IdentityCheck): string {
  return `${c.code} — ${c.detail || ''}${c.reason ? ` [${c.reason}]` : ''}`;
}
