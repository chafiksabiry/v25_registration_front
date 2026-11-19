import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Décision du fondateur du 18/11/2026 sur l'enregistrement des appels : Nomad Solo jamais ; Company Full Scope,
 * Contact Centre Multi-clients et TaaS toujours ; Accueil / Secrétariat sur option, activée par le client, l'appelant étant
 * informé par un message en début d'appel. Les textes de l'inscription ne promettent rien d'autre.
 */
const LANGS = ['fr', 'en', 'es', 'ar'] as const;
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));

describe('enregistrement des appels : textes de l’inscription', () => {
  it('Nomad Solo : plus de promesse de transcription ni d’analyse des appels (seuls les messages du répondeur sont transcrits)', () => {
    const point3 = Object.fromEntries(LANGS.map((l) => [l, read(`src/locales/${l}/translation.json`).callcentreBrandSolo.point3 as string]));
    expect(point3.fr).toBe("Journal de vos appels, répondeur avec transcription et résumé des messages par l'IA");
    expect(point3.fr).not.toMatch(/analyse/);
    expect(point3.en).toMatch(/voicemail/);
    expect(point3.es).toMatch(/buzón de voz/);
    expect(point3.ar).toMatch(/البريد الصوتي/);
  });
  it('carte Téléphonie (toutes offres) : enregistrement et analyse « selon l’offre », dans les quatre langues', () => {
    const want = { fr: /selon l'offre/, en: /depending on the plan/, es: /según la oferta/, ar: /حسب العرض/ };
    for (const l of LANGS) expect(read(`src/locales/${l}/translation.json`).choicePage.ccFeat3, l).toMatch(want[l]);
  });
  it('conditions Centre d’appels (8.5) : la règle par offre, Accueil sur option du client avec message en début d’appel', () => {
    const fr = JSON.stringify(read('src/content/legal/pack.fr.json'));
    const en = JSON.stringify(read('src/content/legal/pack.en.json'));
    expect(fr).toMatch(/Nomad Solo, jamais ; Company Full Scope In & Out et Contact Centre Multi-clients, toujours/);
    expect(fr).toMatch(/Accueil \/ Secrétariat, sur option, activée par le Client ; l'appelant est informé par un message en début d'appel/);
    expect(en).toMatch(/Nomad Solo, never; Company Full Scope In & Out and Multi-client Contact Centre, always/);
    expect(en).toMatch(/Reception \/ Secretarial, optional, turned on by the Customer; the caller is informed by a message at the start of the call/);
  });
});
