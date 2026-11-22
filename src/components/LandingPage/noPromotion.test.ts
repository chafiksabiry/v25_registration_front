import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Décision du fondateur (22/11/2026) : tarification simple, plus aucune notion de promotion (les prix ont été baissés à la place).
const root = join(__dirname, '..', '..', '..');
const read = (f: string) => readFileSync(join(root, f), 'utf8');

describe('page Tarifs : aucune promotion', () => {
  it('ni pastille de remise, ni offre à durée limitée, ni pourcentage de remise dans les composants', () => {
    for (const f of ['src/components/LandingPage/Pricing.tsx', 'src/components/LandingPage/PricingPlansGrid.tsx']) {
      const src = read(f);
      expect(src, f).not.toMatch(/promoLabel|promoPill|plan-promo|limitedTime|pricing\.discount|pricing\.validity/);
      expect(src, f).not.toMatch(/[−-]\s?\d+\s?%|\d+\s?% off/i);
    }
  });

  it('les traductions ne contiennent plus les textes de promotion (fr, en, es, ar)', () => {
    for (const lang of ['fr', 'en', 'es', 'ar']) {
      const pricing = JSON.parse(read(`src/locales/${lang}/translation.json`)).pricing as Record<string, unknown>;
      for (const key of ['promoPill', 'limitedTime', 'discount', 'validity']) expect(pricing[key], `${lang}.pricing.${key}`).toBeUndefined();
    }
  });
});
