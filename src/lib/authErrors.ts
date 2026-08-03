import type { TFunction } from 'i18next';

type SignInErrorContext = 'login' | 'sendCode' | 'verify' | 'resend' | 'sms';

function readAxiosPayload(err: unknown): {
  status?: number;
  raw: string;
  code: string;
} {
  const e = err as {
    message?: string;
    code?: string;
    response?: {
      status?: number;
      data?: { message?: string; error?: string; code?: string };
    };
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
    code: (typeof data?.code === 'string' ? data.code : '').toUpperCase(),
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
  const { status, raw, code } = readAxiosPayload(err);
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

  // Login: email unknown vs wrong password (before generic / 2FA mappings)
  if (context === 'login') {
    if (
      code === 'INVALID_EMAIL' ||
      lower === 'invalid email' ||
      lower.includes('user not found') ||
      lower.includes('email not found')
    ) {
      return t('signIn.errInvalidEmail', 'Cet email ne correspond à aucun compte.');
    }
    if (
      code === 'INVALID_PASSWORD' ||
      lower === 'invalid password' ||
      lower.includes('wrong password') ||
      lower.includes('incorrect password')
    ) {
      return t('signIn.errInvalidPassword', 'Mot de passe incorrect.');
    }
    if (
      code === 'INVALID_CREDENTIALS' ||
      lower.includes('invalid credentials') ||
      status === 400 ||
      status === 401 ||
      status === 403
    ) {
      return t(
        'signIn.errInvalidCredentials',
        'Email ou mot de passe incorrect.'
      );
    }
  }

  if (
    context === 'sendCode' ||
    context === 'resend' ||
    lower.includes('verification email') ||
    lower.includes('failed to send verification')
  ) {
    return t(
      'signIn.errEmailSend',
      "Impossible d'envoyer le code de vérification par email. Réessayez dans un instant."
    );
  }

  if (context === 'sms' || (lower.includes('sms') && lower.includes('fail'))) {
    if (lower.includes('region') || lower.includes('21408')) {
      return t(
        'signIn.errSmsUnavailable',
        'SMS indisponible pour cette région. Utilisez la vérification par email.'
      );
    }
    return t(
      'signIn.errSmsSend',
      "Impossible d'envoyer le code SMS. Réessayez ou utilisez l'email."
    );
  }

  if (
    context === 'verify' ||
    lower.includes('invalid or expired') ||
    lower.includes('invalid email verification') ||
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
