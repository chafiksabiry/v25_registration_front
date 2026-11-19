/**
 * Devise affichée selon le PAYS du client (décision produit : aucun sélecteur manuel).
 * Royaume-Uni -> GBP (£), États-Unis -> USD ($), tous les autres pays -> EUR (€).
 * Les montants sont identiques dans les trois devises : seule la devise change.
 * Même règle que `currencyForCountry` de l'orchestrateur (src/services/currency.js).
 */
export type Currency = 'eur' | 'usd' | 'gbp';

export const SUPPORTED_CURRENCIES: readonly Currency[] = ['eur', 'usd', 'gbp'];
export const DEFAULT_CURRENCY: Currency = 'eur';

/** Devise du pays (ISO 3166-1 alpha-2 ; « UK » accepté comme alias de GB). Inconnu ou absent : EUR. */
export function currencyForCountry(iso2: string | null | undefined): Currency {
  const code = String(iso2 ?? '').trim().toUpperCase();
  if (code === 'GB' || code === 'UK') return 'gbp';
  if (code === 'US') return 'usd';
  return 'eur';
}

/** Devise prise en charge lue dans une réponse d'API, sinon EUR (jamais une devise inconnue). */
export function normalizeCurrency(value: unknown): Currency {
  const code = String(value ?? '').trim().toLowerCase();
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(code) ? (code as Currency) : DEFAULT_CURRENCY;
}

/** Région d'une préférence de langue du navigateur (« en-GB » -> GB, « fr » -> null). */
export function countryOfLocale(tag: string | null | undefined): string | null {
  const m = /^[A-Za-z]{2,3}(?:[-_][A-Za-z]{4})?[-_]([A-Za-z]{2})$/.exec(String(tag ?? '').trim());
  return m ? m[1].toUpperCase() : null;
}

export interface CurrencyHints {
  /** Pays choisi par le visiteur dans un parcours d'inscription (s'il existe). */
  chosenCountry?: string | null;
  /** Préférences de langue du navigateur (`navigator.languages`) : seule la première, la préférée, est lue. */
  languages?: ReadonlyArray<string> | null;
}

/**
 * Devise à afficher : pays choisi à l'inscription, sinon région de la langue préférée du navigateur (visiteur non
 * connecté), sinon EUR. Aucun service de géolocalisation n'est appelé.
 */
export function resolveCurrency(hints: CurrencyHints = {}): Currency {
  if (hints.chosenCountry) return currencyForCountry(hints.chosenCountry);
  const fromLocale = countryOfLocale(hints.languages?.[0]);
  return fromLocale ? currencyForCountry(fromLocale) : DEFAULT_CURRENCY;
}

/** Montant formaté avec le symbole de la devise (€, £, $) ; deux décimales, centimes jamais arrondis. */
export function formatMoney(amount: number, currency: Currency | string): string {
  if (!Number.isFinite(amount)) return '—';
  const code = normalizeCurrency(currency).toUpperCase();
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: code,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(Number(amount).toFixed(2)));
}
