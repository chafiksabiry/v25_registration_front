import { describe, expect, it } from 'vitest';
import { getPlanPriceLabel, mapApiPlanToPricingPlan } from './pricingPlansConfig';

describe('forfaits : devise réellement renvoyée par l’API', () => {
  it('affiche la devise de l’API avec le même montant', () => {
    const gbp = mapApiPlanToPricingPlan({ id: 'p', name: 'Starter', priceCents: 4900, currency: 'gbp' });
    const usd = mapApiPlanToPricingPlan({ id: 'p', name: 'Starter', priceCents: 4900, currency: 'usd' });
    expect(getPlanPriceLabel(gbp)).toBe('£49.00');
    expect(getPlanPriceLabel(usd)).toBe('$49.00');
  });
  it('prix sans option de devise (TAAS USD/GBP non créés) : l’API renvoie EUR et c’est EUR qui est affiché', () => {
    const eur = mapApiPlanToPricingPlan({ id: 'p', name: 'Starter', priceCents: 4900, currency: 'eur' });
    expect(getPlanPriceLabel(eur)).toBe('€49.00');
  });
  it('devise absente ou inconnue : EUR, jamais une devise fausse', () => {
    expect(mapApiPlanToPricingPlan({ id: 'p', price: 10 }).currency).toBe('eur');
    expect(mapApiPlanToPricingPlan({ id: 'p', price: 10, currency: 'jpy' }).currency).toBe('eur');
  });
});
