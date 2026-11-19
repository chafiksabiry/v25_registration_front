import { describe, expect, it } from 'vitest';
import { hubPageTitle } from './hubMeta';

describe('hubPageTitle', () => {
  it('aligne le titre d’onglet sur le titre de la page, par langue', () => {
    expect(hubPageTitle('fr')).toBe('HARX — Tous vos appels, où que vous soyez');
    expect(hubPageTitle('en')).toBe('HARX — All your calls, wherever you are');
    expect(hubPageTitle('es')).toBe('HARX — Todas sus llamadas, esté donde esté');
    expect(hubPageTitle('ar')).toBe('HARX — جميع مكالماتك، أينما كنت');
  });
});
