/**
 * Signale une inscription réussie au shell (v25_process_connections), qui la transmet
 * à GA4 et, selon la configuration, à Google Ads, Meta et LinkedIn.
 */
export function trackSignUpConversion(userType: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('harx:conversion', { detail: { name: 'sign_up', userType } }));
}
