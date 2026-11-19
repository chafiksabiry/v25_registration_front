import { useMemo } from 'react';
import { resolveCurrency, type Currency } from '../lib/currency';

/** Pays choisi dans le parcours d'inscription Telephony (même clé que l'application Telephony), s'il existe. */
const CHOSEN_COUNTRY_KEY = 'harx_cc_pending_country';

function readChosenCountry(): string | null {
  try {
    return localStorage.getItem(CHOSEN_COUNTRY_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Devise d'affichage du visiteur, déduite de son pays (jamais choisie à la main) : pays choisi à l'inscription,
 * sinon région de la langue du navigateur, sinon EUR.
 */
export function useCurrency(): Currency {
  return useMemo(
    () =>
      resolveCurrency({
        chosenCountry: readChosenCountry(),
        languages: typeof navigator === 'undefined' ? null : navigator.languages?.length ? navigator.languages : [navigator.language],
      }),
    []
  );
}
