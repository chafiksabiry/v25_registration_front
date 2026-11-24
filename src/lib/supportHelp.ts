/**
 * « Besoin d'aide ? » sur harx.ai (maquette validée le 24/11/2026) : WhatsApp support (même numéro que le bouton vert du site :
 * VITE_WHATSAPP_SUPPORT_NUMBER, 212711311388 par défaut) et support@harx.ai, message pré-rempli avec le CODE de l'erreur.
 * La personne n'est pas connectée : aucune référence de compte, et jamais son e-mail, son nom, son téléphone ni un montant.
 * Liste unique des codes : v25_callcenter_front, src/domain/supportCodes.ts (codes PWD-* : « harx.ai »).
 */
export const SUPPORT_EMAIL = 'support@harx.ai';
export const SUPPORT_WHATSAPP_DEFAULT = '212711311388';

export type RecoveryHelpCode = 'PWD-UNKNOWN-EMAIL' | 'PWD-SEND' | 'PWD-CODE' | 'PWD-SERVER';

export function supportWhatsAppNumber(raw: unknown = import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER): string {
  return String(raw || '').replace(/\D/g, '') || SUPPORT_WHATSAPP_DEFAULT;
}

/** Texte du message : salutation et code, dans la langue de l'écran (textes passés par l'appelant). */
export function supportMessage(code: string, texts: { hello: string; codeLabel: string }): string {
  return `${texts.hello}\n${texts.codeLabel} : ${code}`;
}

export function supportWhatsAppUrl(message: string, number: string = supportWhatsAppNumber()): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function supportMailto(code: string, message: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Support HARX – ${code}`)}&body=${encodeURIComponent(`${message}\n\n`)}`;
}

/**
 * Code de l'erreur de « Mot de passe oublié » renvoyée par le serveur, selon l'étape. Null pour une erreur de saisie que la personne
 * corrige seule (e-mail vide, code de moins de 6 chiffres, mots de passe différents) : pas d'encadré d'aide dans ce cas.
 */
export function recoveryErrorCode(err: unknown, step: 'email' | 'verification' | 'new-password'): RecoveryHelpCode {
  const e = err as { message?: string; response?: { status?: number; data?: { error?: string } } };
  const status = e.response?.status;
  const code = e.response?.data?.error || '';
  if (code === 'EMAIL_NOT_REGISTERED' || status === 404) return 'PWD-UNKNOWN-EMAIL';
  if (code === 'EMAIL_SEND_FAILED') return 'PWD-SEND';
  if (!e.response || e.message === 'Network Error' || (status != null && status >= 500)) return 'PWD-SERVER';
  return step === 'verification' ? 'PWD-CODE' : 'PWD-SERVER';
}
