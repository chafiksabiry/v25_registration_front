import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  ACCOUNT_STATUS_FILTERS,
  closureErrorMessage,
  companyNumbers,
  confirmEmailMatches,
  disabledDetail,
  disabledTitle,
  displayNumber,
  formatDay,
  isAccountDisabled,
} from './accountClosureUtils';
import { mapSignInError } from '../../lib/authErrors';

const axiosError = (status: number, data: unknown) =>
  new AxiosError('x', 'ERR', undefined, undefined, { status, data, statusText: '', headers: {}, config: {} as never } as AxiosResponse);

describe('A1 : filtre et colonne « Statut »', () => {
  it('trois choix : Tous, Actifs, Désactivés', () => {
    expect(ACCOUNT_STATUS_FILTERS.map((f) => f.label)).toEqual(['Tous', 'Actifs', 'Désactivés']);
    expect(ACCOUNT_STATUS_FILTERS.map((f) => f.value)).toEqual(['all', 'active', 'disabled']);
  });
  it('désactivé seulement si le champ vaut true', () => {
    expect(isAccountDisabled({ disabled: true })).toBe(true);
    expect(isAccountDisabled({ disabled: false })).toBe(false);
    expect(isAccountDisabled({})).toBe(false);
    expect(isAccountDisabled(null)).toBe(false);
  });
  it('date de désactivation au format français', () => {
    expect(formatDay('2026-11-20T09:00:00.000Z')).toBe('20/11/2026');
    expect(formatDay(null)).toBe('');
  });
});

describe('A2b : bandeau du compte désactivé', () => {
  const user = { disabled: true, disabledAt: '2026-11-24T09:42:00.000Z', disabledReason: 'Usage frauduleux signalé par l’opérateur', disabledBy: { name: 'Admin HARX' } };
  it('date, heure (Paris) et auteur', () => {
    expect(disabledTitle(user)).toBe('Compte désactivé le 24/11/2026 à 10:42 par Admin HARX');
  });
  it('motif puis conséquences ; sans motif, seulement les conséquences', () => {
    expect(disabledDetail(user)).toBe('Motif : « Usage frauduleux signalé par l’opérateur ». La connexion au portail et à l’app NOMAD est refusée. L’abonnement et le numéro n’ont pas été modifiés.');
    expect(disabledDetail({ ...user, disabledReason: null })).toBe('La connexion au portail et à l’app NOMAD est refusée. L’abonnement et le numéro n’ont pas été modifiés.');
  });
});

describe('A3 : confirmation de la suppression', () => {
  it('l’email retapé doit être celui du compte (casse et espaces ignorés)', () => {
    expect(confirmEmailMatches(' Marie.Dupont@exemple.fr ', 'marie.dupont@exemple.fr')).toBe(true);
    expect(confirmEmailMatches('marie@exemple.fr', 'marie.dupont@exemple.fr')).toBe(false);
    expect(confirmEmailMatches('', '')).toBe(false);
  });
  it('numéro français lisible, numéros des lignes de la société', () => {
    expect(displayNumber('+33142000007')).toBe('01 42 00 00 07');
    expect(displayNumber('+14314507791')).toBe('+14314507791');
    expect(companyNumbers({ phoneNumbers: [{ phoneNumber: '+33142000007' }, {}] })).toEqual(['+33142000007']);
    expect(companyNumbers(null)).toEqual([]);
  });
  it('erreurs du serveur en français simple', () => {
    expect(closureErrorMessage(axiosError(403, { code: 'PROTECTED_ACCOUNT' }))).toMatch(/protégé/);
    expect(closureErrorMessage(axiosError(400, { code: 'CONFIRMATION_MISMATCH' }))).toBe('L’email tapé ne correspond pas au compte.');
    expect(closureErrorMessage(axiosError(502, { code: 'ACCOUNT_PURGE_FAILED' }))).toMatch(/Rien n’a été supprimé/);
    expect(closureErrorMessage(axiosError(409, { code: 'COMPANY_HAS_MEMBERS' }))).toMatch(/autres membres/);
    expect(closureErrorMessage(axiosError(401, {}))).toMatch(/reconnectez-vous/);
    expect(closureErrorMessage(new AxiosError('Network Error'))).toBe('Serveur injoignable. Réessayez.');
    expect(closureErrorMessage(new Error('x'))).toBe('L’opération a échoué. Réessayez.');
  });
});

describe('connexion : compte désactivé', () => {
  const t = ((_k: string, fallback: string) => fallback) as never;
  it('message clair (jamais « mot de passe incorrect »), à la connexion comme au code', () => {
    const e = axiosError(403, { code: 'ACCOUNT_DISABLED', message: 'Account disabled' });
    expect(mapSignInError(e, t, 'login')).toMatch(/désactivé/);
    expect(mapSignInError(e, t, 'verify')).toMatch(/désactivé/);
  });
});
