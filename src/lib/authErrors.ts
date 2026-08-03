import type { TFunction } from 'i18next';

type SignInErrorContext = 'login' | 'sendCode' | 'verify' | 'resend' | 'sms';

function readAxiosPayload(err: unknown): {
  status?: number;
  raw: string;
} {
  const e = err as {
    message?: string;
    code?: string;
    response?: { status?: number; data?: { message?: string; error?: string } };
  };

  const data = e?.response?.data;
  const fromBody =
    (typeof data?.message === 'string' && data.message) ||
    (typeof data?.error === 'string' && data.error) ||
    '';
  const fromAxios =
    (typeof e?.message === 'string' && e.message) ||
    (typeof e?.code === 'string' && e.code) ||
    '';

  return {
    status: e?.response?.status,
    raw: (fromBody || fromAxios || '').trim(),
  };
}

function looksLikeHtml(text: string): boolean {
  return /<!DOCTYPE|<html/i.test(text);
}

/**
 * Map login / 2FA failures to clear i18n copy — never the vague
 * "Une erreur inattendue s'est produite".
 */
export function mapSignInError(
  err: unknown,
  t: TFunction,
  context: SignInErrorContext
): string {
  const { status, raw } = readAxiosPayload(err);
  const lower = raw.toLowerCase();

  if (
    !status &&
    (lower.includes('network error') ||
      lower.includes('timeout') ||
      lower === 'err_network' ||
      lower.includes('failed to fetch'))
  ) {
    return t(
      'signIn.errNetwork',
      'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.'
    );
  }

  if (status === 429) {
    return t(
      'signIn.errRateLimit',
      'Trop de tentatives. Attendez un moment puis réessayez.'
    );
  }

  if (
    lower.includes('invalid credentials') ||
    (context === 'login' && (status === 400 || status === 401 || status === 403))
  ) {
    return t(
      'signIn.errInvalidCredentials',
      'Email ou mot de passe incorrect.'
    );
  }

  if (
    context === 'sendCode' ||
    context === 'resend' ||
    lower.includes('verification email') ||
    lower.includes('failed to send') ||
    (context === 'login' && status != null && status >= 500)
  ) {
    if (context === 'sendCode' || context === 'resend' || lower.includes('email')) {
      return t(
        'signIn.errEmailSend',
        "Impossible d'envoyer le code de vérification par email. Réessayez dans un instant."
      );
    }
  }

  if (context === 'sms' || lower.includes('sms') || lower.includes('otp')) {
    if (lower.includes('region') || lower.includes('21408')) {
      return t(
        'signIn.errSmsUnavailable',
        'SMS indisponible pour cette région. Utilisez la vérification par email.'
      );
    }
    if (context === 'sms' || lower.includes('failed to send')) {
      return t(
        'signIn.errSmsSend',
        "Impossible d'envoyer le code SMS. Réessayez ou utilisez l'email."
      );
    }
  }

  if (
    context === 'verify' ||
    lower.includes('invalid or expired') ||
    lower.includes('invalid email') ||
    lower.includes('invalid otp') ||
    lower.includes('invalid code')
  ) {
    return t(
      'signIn.errInvalidEmailCode',
      'Code de vérification invalide ou expiré.'
    );
  }

  if (status != null && status >= 500) {
    return t(
      'signIn.errServer',
      'Le service de connexion est temporairement indisponible. Réessayez plus tard.'
    );
  }

  if (raw && raw.length < 180 && !looksLikeHtml(raw)) {
    if (lower.includes('invalid credentials')) {
      return t(
        'signIn.errInvalidCredentials',
        'Email ou mot de passe incorrect.'
      );
    }
  }

  switch (context) {
    case 'login':
      return t(
        'signIn.errInvalidCredentials',
        'Email ou mot de passe incorrect.'
      );
    case 'sendCode':
    case 'resend':
      return t(
        'signIn.errEmailSend',
        "Impossible d'envoyer le code de vérification par email. Réessayez dans un instant."
      );
    case 'sms':
      return t(
        'signIn.errSmsSend',
        "Impossible d'envoyer le code SMS. Réessayez ou utilisez l'email."
      );
    case 'verify':
      return t(
        'signIn.errInvalidEmailCode',
        'Code de vérification invalide ou expiré.'
      );
    default:
      return t(
        'signIn.errGeneric',
        'La connexion a échoué. Vérifiez vos informations et réessayez.'
      );
  }
}
