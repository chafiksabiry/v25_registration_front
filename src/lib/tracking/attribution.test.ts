import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signUpAttribution, utmFromSearch } from './attribution';

describe('origine de l’inscription (utm_)', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); }, removeItem: (k: string) => { store.delete(k); }, clear: () => store.clear() });
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('lit les cinq paramètres standard et filtre le reste', () => {
    expect(utmFromSearch('?product=callcentre&utm_source=linkedin&utm_medium=organic_social&utm_campaign=lot-1&utm_content=post_12&utm_term=nomad&x=1')).toEqual({
      utm_source: 'linkedin', utm_medium: 'organic_social', utm_campaign: 'lot-1', utm_content: 'post_12', utm_term: 'nomad',
    });
    expect(utmFromSearch('?utm_source=<script>&utm_medium=' + 'a'.repeat(101))).toEqual({});
  });

  it('n’est jointe à l’inscription qu’avec le consentement « mesure d’audience »', () => {
    const captured = { utm_source: 'linkedin' };
    expect(signUpAttribution(captured)).toBeUndefined();
    localStorage.setItem('harx_cookie_consent', JSON.stringify({ v: 1, analytics: false, marketing: true }));
    expect(signUpAttribution(captured)).toBeUndefined();
    localStorage.setItem('harx_cookie_consent', JSON.stringify({ v: 1, analytics: true, marketing: false }));
    expect(signUpAttribution(captured)).toEqual(captured);
    expect(signUpAttribution({})).toBeUndefined();
  });
});
