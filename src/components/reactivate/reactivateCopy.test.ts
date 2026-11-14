import { describe, expect, it } from 'vitest';
import { REACTIVATE_COPY, reactivateLangFor } from './reactivateCopy';

describe('reactivateCopy', () => {
  it('has the same keys and the same number of steps in French and English', () => {
    expect(Object.keys(REACTIVATE_COPY.fr).sort()).toEqual(Object.keys(REACTIVATE_COPY.en).sort());
    expect(REACTIVATE_COPY.fr.steps).toHaveLength(5);
    expect(REACTIVATE_COPY.en.steps).toHaveLength(5);
  });

  it('keeps the offer of the e-mail: 6 months free, code REPS2027, valid until 31 December 2026', () => {
    for (const lang of ['fr', 'en'] as const) {
      const c = REACTIVATE_COPY[lang];
      expect(c.offerCode).toContain('REPS2027');
      expect(c.steps[4]).toContain('REPS2027');
      expect(c.offerHeadline).toMatch(/6/);
      expect(c.offerValid).toMatch(/2026/);
    }
  });

  it('shows French for a French interface and English otherwise', () => {
    expect(reactivateLangFor('fr')).toBe('fr');
    expect(reactivateLangFor('fr-FR')).toBe('fr');
    expect(reactivateLangFor('en-GB')).toBe('en');
    expect(reactivateLangFor('ar')).toBe('en');
    expect(reactivateLangFor(undefined)).toBe('en');
  });
});
