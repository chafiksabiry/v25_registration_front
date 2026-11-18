import { describe, expect, it } from 'vitest';
import { CALLCENTRE_PATH, companyWorkspacePath } from './product';

describe('companyWorkspacePath (arbitrage 12)', () => {
  it('envoie un compte Call Center vers /telephony, plus jamais vers /call-center', () => {
    expect(CALLCENTRE_PATH).toBe('/telephony');
    expect(companyWorkspacePath('call-center', false)).toBe('/telephony');
    expect(companyWorkspacePath('call-center', true)).toBe('/telephony');
  });

  it('garde /telephony pour un compte entreprise venu du produit Téléphonie', () => {
    expect(companyWorkspacePath('company', true)).toBe('/telephony');
  });

  it('garde /company pour un compte entreprise ordinaire', () => {
    expect(companyWorkspacePath('company', false)).toBe('/company');
    expect(companyWorkspacePath(undefined, false)).toBe('/company');
  });

  it('ne renvoie jamais /call-center', () => {
    for (const t of ['call-center', 'company', 'rep', null]) {
      for (const p of [true, false]) expect(companyWorkspacePath(t, p).startsWith('/call-center')).toBe(false);
    }
  });
});
