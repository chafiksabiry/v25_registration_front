import { describe, expect, it } from 'vitest';
import { countryOfLocale, currencyForCountry, formatMoney, normalizeCurrency, resolveCurrency } from './currency';

describe('currencyForCountry', () => {
  it('Royaume-Uni -> GBP, États-Unis -> USD', () => {
    expect(currencyForCountry('GB')).toBe('gbp');
    expect(currencyForCountry(' gb ')).toBe('gbp');
    expect(currencyForCountry('UK')).toBe('gbp');
    expect(currencyForCountry('US')).toBe('usd');
    expect(currencyForCountry('us')).toBe('usd');
  });
  it('tous les autres pays, inconnu ou absent -> EUR', () => {
    for (const c of ['FR', 'DE', 'ES', 'MA', 'CA', 'AE', 'IE', 'CH', 'XX', '', 'USA', null, undefined]) expect(currencyForCountry(c as string)).toBe('eur');
  });
});

describe('countryOfLocale / resolveCurrency', () => {
  it('lit la région de la langue', () => {
    expect(countryOfLocale('en-GB')).toBe('GB');
    expect(countryOfLocale('en_US')).toBe('US');
    expect(countryOfLocale('fr')).toBeNull();
    expect(countryOfLocale(undefined)).toBeNull();
  });
  it('pays choisi > langue du navigateur > EUR', () => {
    expect(resolveCurrency({ chosenCountry: 'US', languages: ['en-GB'] })).toBe('usd');
    expect(resolveCurrency({ chosenCountry: 'FR', languages: ['en-GB'] })).toBe('eur');
    expect(resolveCurrency({ languages: ['en-GB', 'fr'] })).toBe('gbp');
    expect(resolveCurrency({ languages: ['en-US'] })).toBe('usd');
    expect(resolveCurrency({ languages: ['en'] })).toBe('eur');
    expect(resolveCurrency({ languages: ['fr-FR', 'en-US'] })).toBe('eur');
    expect(resolveCurrency()).toBe('eur');
  });
});

describe('normalizeCurrency / formatMoney', () => {
  it('une devise inconnue retombe sur EUR', () => {
    expect(normalizeCurrency('GBP')).toBe('gbp');
    expect(normalizeCurrency('jpy')).toBe('eur');
    expect(normalizeCurrency(undefined)).toBe('eur');
  });
  it('même montant, symbole propre à la devise, centimes conservés', () => {
    expect(formatMoney(49, 'eur')).toBe('€49.00');
    expect(formatMoney(49, 'gbp')).toBe('£49.00');
    expect(formatMoney(49, 'usd')).toBe('$49.00');
    expect(formatMoney(29.99, 'eur')).toBe('€29.99');
    expect(formatMoney(Number.NaN, 'eur')).toBe('—');
  });
});
