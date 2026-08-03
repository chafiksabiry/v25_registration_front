import type { TFunction } from 'i18next';

/** Extract status + human message from axios / fetch-style errors. */
export function extractAuthError(err: unknown): {
  status?: number;
  message: string;
  network: boolean;
} {
  const ax = err as {
    message?: string;
    code?: string;
    response?: { status?: number; data?: unknown };
  };

  const status = ax?.response?.status;
  const data = ax?.response?.data;
  let message = '';

  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const candidate = d.message ?? d.error ?? d.msg ?? d.detail;
    if (typeof candidate === 'string') message = candidate;
    else if (Array.isArray(candidate) && typeof candidate[0] === 'string') {
      message = candidate[0];
    }
  } else if (typeof data === 'string' && data.trim() && !data.trim().startsWith('<')) {
    message = data;
  }

  if (!message && typeof ax?.message === 'string') {
    message = ax.message;
  }

  const network =
    ax?.code === 'ERR_NETWORK' ||
    /network error|failed to fetch|timeout/i.test(message) ||
    (!status && /Network Error/i.test(message));

  return { status, message: message.trim(), network };
}

const isGenericAxiosMessage = (msg: string) =>
  /^request failed with status code \d+$/i.test(msg) ||
  /^network error$/i.test(msg) ||
  msg.length === 0;

/**
 * Map login / 2FA failures to clear i18n copy — never the vague
 * "Une erreur inattendue…" for known auth cases.
 */
export function mapSignInError(
  err: unknown,
  t: TFunction,
  step: 'credentials' | '2fa' | 'email' | 'sms'
): string {
  const { status, message, network } = extractAuthError(err);
  const lower = message.toLowerCase();

  if (network || status === 502 || status === 503 || status === 504) {
    return t(
      'signIn.errNetwork',
      'Unable to reach the server. Check your connection and try again.'
    );
  }

  if (status === 429) {
    return t(
      'signIn.errTooMany',
      'Too many attempts. Please wait a moment and try again.'
    );
  }

  // Email delivery failure (after valid login)
  if (
    step === 'email' &&
    (status === 500 ||
      status === 502 ||
      /mail|smtp|send.*email|email.*send|nodemailer/i.test(lower))
  ) {
    return t(
      'signIn.errEmailSendFailed',
      'We could not send the verification email. Please try resending the code.'
    );
  }

  if (
    step === 'credentials' &&
    (/invalid credentials|user not found|incorrect password|wrong password|invalid email or password/i.test(
      lower
    ) ||
      status === 400 ||
      status === 401 ||
      status === 403)
  ) {
    return t(
      'signIn.errInvalidCredentials',
      'Incorrect email or password. Please try again.'
    );
  }

  if (/expired/i.test(lower)) {
    return t(
      'signIn.errCodeExpired',
      'This verification code has expired. Please request a new one.'
    );
  }

  if (step === 'sms' || (step === '2fa' && /sms|otp/i.test(lower))) {
    return t('signIn.errInvalidSmsCode', 'Invalid SMS verification code');
  }

  if (
    step === '2fa' ||
    step === 'email' ||
    /invalid.*code|code.*invalid|verification/i.test(lower)
  ) {
    if (status === 400 || status === 401 || /invalid|expired|code|verification/i.test(lower)) {
      return t('signIn.errInvalidEmailCode', 'Invalid email verification code');
    }
    return t(
      'signIn.errVerifyFailed',
      'Verification failed. Please check the code and try again.'
    );
  }

  if (message && !isGenericAxiosMessage(message)) {
    return message;
  }

  if (step === 'credentials') {
    return t(
      'signIn.errInvalidCredentials',
      'Incorrect email or password. Please try again.'
    );
  }

  return t(
    'signIn.errVerifyFailed',
    'Verification failed. Please check the code and try again.'
  );
}
