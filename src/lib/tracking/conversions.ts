/**
 * Signale une inscription réussie au shell (v25_process_connections), qui la transmet
 * à GA4 et, selon la configuration, à Google Ads, Meta et LinkedIn.
 */
export function trackSignUpConversion(userType: string, eventId?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('harx:conversion', { detail: { name: 'sign_up', userType, eventId } }));
}

/** Données de mesure transmises avec l'inscription pour l'API de conversions Meta (consentement « marketing » uniquement). */
export function metaSignUpContext(): { metaEventId: string; marketingConsent: boolean; fbp?: string; fbc?: string; sourceUrl: string } {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let marketing = false;
  try {
    const raw = localStorage.getItem('harx_cookie_consent');
    const c = raw ? JSON.parse(raw) : null;
    marketing = Boolean(c && c.v === 1 && c.marketing === true);
  } catch {
    /* stockage indisponible : pas de consentement */
  }
  const cookie = (name: string) => document.cookie.split('; ').find((r) => r.startsWith(`${name}=`))?.slice(name.length + 1);
  return { metaEventId: id, marketingConsent: marketing, fbp: marketing ? cookie('_fbp') : undefined, fbc: marketing ? cookie('_fbc') : undefined, sourceUrl: window.location.href };
}
