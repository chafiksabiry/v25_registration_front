import axios, { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IDENTITY_REJECT_CODES,
  IDENTITY_STATUS_OPTIONS,
  IdentityApiError,
  adminLabelFromToken,
  approveBody,
  canDecide,
  checkLine,
  comparisonRows,
  filePages,
  identityErrorMessage,
  identityPagePath,
  identityReviewApi,
  initialCountryChoice,
  listMetaLine,
  verificationIdFromConversation,
  verifiedSummary,
  watermarkText,
  type IdentityDetail,
  type IdentityListItem,
} from './identityReviewApi';
import { ADMIN_NAV_GROUPS, ADMIN_SECTIONS, resolveAdminTabTitle } from '../components/admin/adminSections';

const jwt = (payload: object) => `x.${btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.y`;

const detail = (over: Partial<IdentityDetail> = {}): IdentityDetail => ({
  id: 'v1',
  companyId: 'c1',
  status: 'review',
  docType: 'passport',
  attempt: 2,
  createdAt: '2026-11-20T10:00:00.000Z',
  declared: { fullName: 'Exemple Test', residence: 'FR', nationality: 'MA' },
  extracted: null,
  checks: [],
  decision: null,
  verifiedCountries: null,
  pendingCountries: [],
  reviewRequestedAt: null,
  files: [],
  accessLog: [],
  ...over,
});

describe('navigation Inbox -> page Identité', () => {
  it('lit l’id du dossier dans la conversation identity:<id>', () => {
    expect(verificationIdFromConversation('identity:665f1c2a9b')).toBe('665f1c2a9b');
    expect(verificationIdFromConversation('web:abc')).toBeNull();
    expect(verificationIdFromConversation('identity:')).toBeNull();
    expect(verificationIdFromConversation('identity:../x?y')).toBeNull();
    expect(verificationIdFromConversation(null)).toBeNull();
  });
  it('chemin interne du portail, avec ou sans dossier', () => {
    expect(identityPagePath('665f1c2a9b')).toBe('/admin/identity?dossier=665f1c2a9b');
    expect(identityPagePath(null)).toBe('/admin/identity');
  });
});

describe('menu admin', () => {
  it('« Identité » juste après « Inbox support », dans le groupe Plateforme', () => {
    const i = ADMIN_SECTIONS.findIndex((s) => s.to === '/admin/inbox');
    expect(ADMIN_SECTIONS[i + 1]).toMatchObject({ to: '/admin/identity', label: 'Identité' });
    const platform = ADMIN_NAV_GROUPS[0].items.map((s) => s.to);
    expect(platform).toContain('/admin/identity');
    expect(platform).toContain('/admin/objectives');
    expect(ADMIN_NAV_GROUPS[1].items[0].to).toBe('/admin/pricing/minutes');
    expect(resolveAdminTabTitle('/admin/identity')).toBe('Identité');
  });
});

describe('parité avec la page de l’orchestrateur', () => {
  it('filtres de statut et motifs de refus', () => {
    expect(IDENTITY_STATUS_OPTIONS.map((o) => o.label)).toEqual(['À revoir', 'Validées, un pays à revoir', 'Refusées', 'Validées']);
    expect(IDENTITY_STATUS_OPTIONS.map((o) => o.value)).toEqual(['review', 'pending', 'rejected', 'approved']);
    expect(IDENTITY_REJECT_CODES).toHaveLength(10);
    expect(IDENTITY_REJECT_CODES).toContain('DOCUMENT_SUSPECTED');
  });

  it('ligne de liste', () => {
    const v: IdentityListItem = {
      id: 'v1', companyId: 'c1', name: 'A', docType: 'passport', status: 'review', createdAt: '', ageHours: 80,
      reasons: ['FILE_REUSED'], pendingCountries: ['nationality'], reviewRequested: true, overdue: true,
    };
    expect(listMetaLine(v)).toBe('il y a 80 h · passport · revue demandée · à revoir : nationality · plus de 72 h');
    expect(listMetaLine({ ...v, pendingCountries: [], reviewRequested: false, overdue: false, ageHours: 3 })).toBe('il y a 3 h · passport');
  });

  it('filigrane et nom de l’admin (sans afficher le jeton)', () => {
    expect(adminLabelFromToken(jwt({ email: 'admin@example.com', typeUser: 'admin' }))).toBe('admin@example.com');
    expect(adminLabelFromToken(jwt({ typeUser: 'admin' }))).toBe('admin');
    expect(adminLabelFromToken('pas-un-jwt')).toBe('admin');
    expect(adminLabelFromToken(null)).toBe('admin');
    expect(watermarkText('admin@example.com', new Date(2026, 10, 24))).toBe('HARX — revue — 24/11/2026 — admin@example.com');
  });

  it('décision possible : en revue, ou validé avec un pays en attente', () => {
    expect(canDecide(detail())).toBe(true);
    expect(canDecide(detail({ status: 'approved' }))).toBe(false);
    expect(canDecide(detail({ status: 'approved', pendingCountries: ['nationality'] }))).toBe(true);
    expect(canDecide(detail({ status: 'rejected', pendingCountries: ['nationality'] }))).toBe(false);
  });

  it('cases pays : cochées par défaut, titre de séjour = résidence seule, pays déjà validé bloqué', () => {
    expect(initialCountryChoice(detail())).toEqual({ residence: { checked: true, locked: false }, nationality: { checked: true, locked: false } });
    expect(initialCountryChoice(detail({ docType: 'residence_permit' })).nationality.checked).toBe(false);
    expect(initialCountryChoice(detail({ status: 'approved', pendingCountries: ['nationality'] }))).toEqual({
      residence: { checked: false, locked: true },
      nationality: { checked: true, locked: false },
    });
  });

  it('corps de validation : pays déclarés cochés seulement', () => {
    expect(approveBody(detail(), { residence: true, nationality: false })).toEqual({ outcome: 'approved', residence: 'FR', nationality: null });
    expect(approveBody(detail({ declared: null }), { residence: true, nationality: true })).toEqual({ outcome: 'approved', residence: null, nationality: null });
  });

  it('résumé « déjà validé »', () => {
    const d = detail({ status: 'approved', pendingCountries: ['nationality'], verifiedCountries: { residence: 'FR', nationality: null } });
    expect(verifiedSummary(d)).toBe('Déjà validé : résidence FR. À revoir : nationality (le pays déjà validé reste ouvert).');
    expect(verifiedSummary(detail())).toBe('');
  });

  it('pages d’un fichier découpé par le serveur', () => {
    expect(filePages({ meta: {} })).toEqual([null]);
    expect(filePages({ meta: { pageBytes: [10] } })).toEqual([null]);
    expect(filePages({ meta: { pageBytes: [10, 20, 5] } })).toEqual([0, 1, 2]);
  });

  it('tableau déclaré / lu et ligne de contrôle', () => {
    const rows = comparisonRows(
      detail({
        extracted: {
          id: { lastName: 'TEST', givenNames: 'Exemple', nationalityIso3: 'MAR', expiryDate: '2030-01-01', documentType: 'P' },
          proof: { holderName: 'Exemple Test', countryPrinted: 'FR', issueDate: '2026-10-01' },
        },
      }),
    );
    expect(rows[0]).toEqual(['Nom', 'Exemple Test', 'TEST Exemple', 'Exemple Test']);
    expect(rows[2]).toEqual(['Pays', 'Nat. MA · Rés. FR', 'MAR', 'FR']);
    expect(rows[3]).toEqual(['Date', '—', 'exp. 2030-01-01', '2026-10-01']);
    expect(checkLine({ code: 'NAME_MATCH', result: 'review', detail: 'écart', reason: 'NAME_MISMATCH' })).toBe('NAME_MATCH — écart [NAME_MISMATCH]');
  });
});

describe('appels aux routes /admin/identity/* avec la session admin', () => {
  const store = new Map<string, string>();
  let request: ReturnType<typeof spyRequest>;
  const spyRequest = () => vi.spyOn(axios, 'request');
  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) });
    request = spyRequest();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('jeton de la session en en-tête, jamais dans l’URL ; image en blob', async () => {
    store.set('token', 'jeton-de-test');
    request.mockResolvedValue({ data: { verifications: [] } } as AxiosResponse);
    await identityReviewApi.list('pending');
    const cfg = request.mock.calls[0][0] as { url: string; headers: Record<string, string>; method: string };
    expect(cfg.method).toBe('get');
    expect(cfg.url).toMatch(/\/admin\/identity\/verifications\?status=pending$/);
    expect(cfg.url).not.toContain('jeton-de-test');
    expect(cfg.headers.Authorization).toBe('Bearer jeton-de-test');

    request.mockResolvedValue({ data: new Blob(['x']) } as AxiosResponse);
    await identityReviewApi.file('v1', 'f1', 2);
    const f = request.mock.calls[1][0] as { url: string; responseType: string };
    expect(f.url).toMatch(/\/admin\/identity\/verifications\/v1\/files\/f1\?page=2$/);
    expect(f.responseType).toBe('blob');
  });

  it('décision en POST JSON', async () => {
    request.mockResolvedValue({ data: { status: 'rejected' } } as AxiosResponse);
    await identityReviewApi.decide('v1', { outcome: 'rejected', reasonCode: 'UNREADABLE', note: '' });
    const cfg = request.mock.calls[0][0] as { url: string; method: string; data: unknown; headers?: unknown };
    expect(cfg.method).toBe('post');
    expect(cfg.url).toMatch(/\/admin\/identity\/verifications\/v1\/decision$/);
    expect(cfg.data).toEqual({ outcome: 'rejected', reasonCode: 'UNREADABLE', note: '' });
    expect(cfg.headers).toBeUndefined();
  });

  it('erreurs serveur traduites en messages simples', async () => {
    const fail = (status: number, data: unknown) =>
      new AxiosError('x', 'ERR', undefined, undefined, { status, data, statusText: '', headers: {}, config: {} } as AxiosResponse);
    request.mockRejectedValueOnce(fail(409, { code: 'NOT_IN_REVIEW' }));
    await expect(identityReviewApi.detail('v1')).rejects.toMatchObject({ status: 409, code: 'NOT_IN_REVIEW' });
    request.mockRejectedValueOnce(new Error('down'));
    await expect(identityReviewApi.detail('v1')).rejects.toMatchObject({ status: 0, code: 'NETWORK' });

    expect(identityErrorMessage(new IdentityApiError(401, '401'))).toBe('Session admin refusée : reconnectez-vous.');
    expect(identityErrorMessage(new IdentityApiError(404, '404'))).toBe('Vérification d’identité indisponible sur le serveur.');
    expect(identityErrorMessage(new IdentityApiError(404, 'NOT_FOUND'))).toBe('Erreur : NOT_FOUND');
    expect(identityErrorMessage(new IdentityApiError(0, 'NETWORK'))).toBe('Serveur injoignable. Réessayez.');
    expect(identityErrorMessage(new Error('x'))).toBe('Erreur inattendue.');
  });
});
