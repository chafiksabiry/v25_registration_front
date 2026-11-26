import { describe, expect, it } from 'vitest';
import { prefillEmail, prefillLang, registerPrefill } from './registerPrefill';

describe('préremplissage de l’inscription NOMAD (lien de l’e-mail d’activation de l’app)', () => {
  it('lit e-mail et langue sur /nomad/inscription', () => {
    expect(registerPrefill({ pathname: '/nomad/inscription', search: '?email=Alex%40Example.com&lang=es&utm_source=nomad-app' })).toEqual({ email: 'alex@example.com', lang: 'es' });
    expect(registerPrefill({ pathname: '/nomad/inscription/', search: '?email=a%2Bb%40x.fr' })).toEqual({ email: 'a+b@x.fr', lang: null });
  });
  it('ignoré hors de l’inscription NOMAD', () => {
    expect(registerPrefill({ pathname: '/auth/register-call-center', search: '?email=a%40b.fr&lang=fr' })).toEqual({ email: null, lang: null });
    expect(registerPrefill({ pathname: '/nomad/connexion', search: '?email=a%40b.fr' })).toEqual({ email: null, lang: null });
  });
  it('e-mail validé : forme, longueur, aucun caractère HTML', () => {
    for (const bad of ['', 'nope', 'a@b', '<script>@x.fr', 'a@x.fr"><img', `${'a'.repeat(250)}@x.fr`, null, undefined]) expect(prefillEmail(bad as string)).toBeNull();
    expect(prefillEmail('  Alex@Example.COM ')).toBe('alex@example.com');
  });
  it('langue : en, fr, es, ar seulement', () => {
    expect(prefillLang('ar')).toBe('ar');
    expect(prefillLang('FR-fr')).toBe('fr');
    expect(prefillLang('de')).toBeNull();
    expect(prefillLang(null)).toBeNull();
  });
});
