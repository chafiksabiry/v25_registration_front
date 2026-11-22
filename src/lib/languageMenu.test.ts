import { describe, expect, it } from 'vitest';
import { LANG_NAMES, MENU_LANGS, languageSwitchUrl, nextMenuIndex } from './languageMenu';

describe('menu de langue', () => {
  it('propose les quatre langues, écrites dans leur propre langue', () => {
    expect(MENU_LANGS).toEqual(['fr', 'en', 'es', 'ar']);
    expect(MENU_LANGS.map((l) => LANG_NAMES[l])).toEqual(['Français', 'English', 'Español', 'العربية']);
  });

  it('garde la navigation par préfixe /fr /en /es /ar sur les pages publiques', () => {
    expect(languageSwitchUrl({ pathname: '/en' }, 'fr')).toBe('/fr');
    expect(languageSwitchUrl({ pathname: '/' }, 'ar')).toBe('/ar');
    expect(languageSwitchUrl({ pathname: '/fr/taas' }, 'es')).toBe('/es/taas');
    expect(languageSwitchUrl({ pathname: '/ar/privacy', hash: '#cookies' }, 'en')).toBe('/en/privacy#cookies');
    expect(languageSwitchUrl({ pathname: '/en/auth/register-call-center', search: '?product=callcentre' }, 'fr')).toBe('/fr/auth/register-call-center?product=callcentre');
  });

  it('change la langue sans rechargement hors des pages publiques', () => {
    expect(languageSwitchUrl({ pathname: '/company/dashboard' }, 'fr')).toBeNull();
  });

  it('déplace le focus au clavier, en boucle', () => {
    expect(nextMenuIndex('ArrowDown', 3, 4)).toBe(0);
    expect(nextMenuIndex('ArrowUp', 0, 4)).toBe(3);
    expect(nextMenuIndex('Home', 2, 4)).toBe(0);
    expect(nextMenuIndex('End', 0, 4)).toBe(3);
    expect(nextMenuIndex('Enter', 1, 4)).toBeNull();
  });
});
