import { describe, expect, it } from 'vitest';
import fr from '../locales/fr/translation.json';
import en from '../locales/en/translation.json';
import es from '../locales/es/translation.json';
import ar from '../locales/ar/translation.json';

/**
 * Règle du fondateur (21/11/2026) : « English must be the native language and French only for French-speaking countries ».
 * Les traductions anglaise, espagnole et arabe sont complètes (chaque clé française existe) et ne contiennent aucun mot français.
 * Heuristique : accents propres au français (absents de l'espagnol) ou mots outils qui n'existent qu'en français ; adresses ignorées.
 */
const FRENCH_ACCENTS = /[àâçèêëîïôûùœ]/i;
const FRENCH_ONLY_WORDS = /(^|[^\p{L}])(vous|votre|vos|nous|notre|avec|sans|dans|aucun|aucune|êtes|être|été|cette|pour|une|des|aux|du|appel|appels|leur|leurs|très|déjà|où)(?=$|[^\p{L}])/iu;
const ALLOWED = [/Côte d[’']Ivoire/g];
/** « une » est aussi un verbe espagnol (« se une a ») : il n'est pas compté en espagnol. */
export function looksFrench(text: string, lang = 'en'): boolean {
  let t = String(text).replace(/https?:\/\/\S+/g, ' ').replace(/\{\{?[^{}]*\}?\}/g, ' ');
  for (const re of ALLOWED) t = t.replace(re, ' ');
  if (lang === 'es') t = t.replace(/(^|[^\p{L}])une(?=$|[^\p{L}])/giu, '$1');
  return FRENCH_ACCENTS.test(t) || FRENCH_ONLY_WORDS.test(t);
}

type Tree = Record<string, unknown>;
const flat = (o: unknown, p = ''): Record<string, string> =>
  Object.entries((o ?? {}) as Tree).reduce<Record<string, string>>((a, [k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(a, flat(v, `${p}${k}.`));
    else if (Array.isArray(v)) v.forEach((x, i) => { a[`${p}${k}.${i}`] = String(x); });
    else a[`${p}${k}`] = String(v);
    return a;
  }, {});
const PLURAL = /_(zero|one|two|few|many|other)$/;

describe('traductions du site : anglais par défaut, aucun français en en / es / ar', () => {
  it('détecteur', () => {
    expect(looksFrench('Veuillez saisir votre email.')).toBe(true);
    expect(looksFrench('Please enter your email.')).toBe(false);
    expect(looksFrench('Introduzca su correo electrónico.')).toBe(false);
  });
  for (const [name, dict] of [['en', en], ['es', es], ['ar', ar]] as const) {
    const d = flat(dict);
    const bases = new Set(Object.keys(d).map((k) => k.replace(PLURAL, '')));
    it(`${name} : chaque clé française existe`, () => {
      expect(Object.keys(flat(fr)).filter((k) => !(k in d) && !bases.has(k.replace(PLURAL, '')))).toEqual([]);
    });
    it(`${name} : aucun texte en français`, () => {
      expect(Object.entries(d).filter(([, v]) => looksFrench(v, name)).map(([k, v]) => `${k} = ${v}`)).toEqual([]);
    });
  }
});
