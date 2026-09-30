import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { auth } from '../lib/api';
import { clearAuthSession } from '../lib/authRedirect';
import { useTranslation } from 'react-i18next';
import { Header } from './LandingPage/Header';

type RecoveryStep = 'email' | 'verification' | 'new-password' | 'success';

const RECOVERY_STEPS: RecoveryStep[] = ['email', 'verification', 'new-password', 'success'];
const RECOVERY_SESSION_KEY = 'passwordRecoveryFlow';

interface RecoverySession {
  email: string;
  step: RecoveryStep;
  recoveryToken?: string;
}

function readRecoverySession(): RecoverySession | null {
  try {
    const raw = sessionStorage.getItem(RECOVERY_SESSION_KEY);
    return raw ? (JSON.parse(raw) as RecoverySession) : null;
  } catch {
    return null;
  }
}

function writeRecoverySession(data: RecoverySession | null) {
  try {
    if (data) {
      sessionStorage.setItem(RECOVERY_SESSION_KEY, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(RECOVERY_SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

function recoveryErrorText(
  err: unknown,
  t: (key: string, fallback: string) => string,
  fallback: string
) {
  const axiosErr = err as {
    message?: string;
    response?: { status?: number; data?: { error?: string; message?: string } };
  };
  const status = axiosErr.response?.status;
  const code = axiosErr.response?.data?.error || '';

  if (code === 'EMAIL_NOT_REGISTERED' || status === 404) {
    return t('recovery.errUnknownEmail', "Aucun compte n'est associé à cet email.");
  }
  if (code === 'EMAIL_REQUIRED') {
    return t('recovery.errEmail', 'Veuillez entrer votre adresse email');
  }
  if (code === 'EMAIL_SEND_FAILED') {
    return t('recovery.errSend', "Impossible d'envoyer le code pour le moment. Réessayez dans un instant.");
  }
  if (!axiosErr.response || axiosErr.message === 'Network Error' || (status != null && status >= 500)) {
    return t('recovery.errServer', 'La réinitialisation a échoué. Réessayez dans un instant.');
  }
  return fallback;
}

function stepFromSearch(param: string | null, session: RecoverySession | null): RecoveryStep {
  if (param && RECOVERY_STEPS.includes(param as RecoveryStep)) return param as RecoveryStep;
  if (session?.step) return session.step;
  return 'email';
}

interface PasswordRecoveryDialogProps {
  onBack: () => void;
  onGetStarted?: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export default function PasswordRecoveryDialog({ onBack, onGetStarted, onNavigateToSection }: PasswordRecoveryDialogProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const saved = readRecoverySession();

  const [step, setStep] = useState<RecoveryStep>(() =>
    stepFromSearch(searchParams.get('step'), saved)
  );
  const [recoveryToken, setRecoveryToken] = useState<string | null>(
    () => saved?.recoveryToken ?? null
  );
  const [formData, setFormData] = useState({
    email: saved?.email ?? '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const pushStep = (next: RecoveryStep, patch?: Partial<RecoverySession>) => {
    setStep(next);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    navigate({ pathname: '/auth/recovery', search: `?step=${next}` });
    writeRecoverySession({
      email: patch?.email ?? formData.email,
      step: next,
      recoveryToken: patch?.recoveryToken ?? recoveryToken ?? undefined,
    });
  };

  useEffect(() => {
    // Sync URL step on first load (e.g. refresh mid-flow).
    const urlStep = searchParams.get('step') as RecoveryStep | null;
    if (!urlStep && step !== 'email') {
      navigate({ pathname: '/auth/recovery', search: `?step=${step}` }, { replace: true });
    }

    // Old recovery flow wrote JWT to localStorage.token — clear it to stop /auth ↔ /company loops.
    if (saved || step !== 'email') {
      clearAuthSession();
    }
  }, []);

  const clearRecoveryFlow = () => {
    writeRecoverySession(null);
    setRecoveryToken(null);
  };

  const handleBackToSignIn = () => {
    clearRecoveryFlow();
    onBack();
  };

  const handleContinue = async () => {
    setError(null);

    switch (step) {
      case 'email':
        if (!formData.email) {
          setError(t('recovery.errEmail', 'Please enter your email address'));
          return;
        }
        try {
          const verificationCode = await auth.generateVerificationCode(formData.email);
          await auth.sendVerificationEmail(formData.email, verificationCode.verificationCode);
          pushStep('verification', { email: formData.email });
        } catch (err: unknown) {
          setError(recoveryErrorText(err, t, t('recovery.errServer', 'La réinitialisation a échoué. Réessayez dans un instant.')));
        }
        break;

      case 'verification':
        if (formData.verificationCode.length !== 6) {
          setError(t('recovery.errCode', 'Please enter a valid 6-digit code'));
          return;
        }
        try {
          const resultverificationEmail = await auth.verifyEmail({
            email: formData.email,
            code: formData.verificationCode,
          });
          if (resultverificationEmail.result && resultverificationEmail.result.error) {
            setError(t('recovery.errInvalidCode', 'Invalid email verification code'));
          } else if (resultverificationEmail.token) {
            // Keep recovery token in session only — NOT localStorage.token.
            // Writing to localStorage triggers GuestOnly → /company redirect loop.
            setRecoveryToken(resultverificationEmail.token);
            pushStep('new-password', { recoveryToken: resultverificationEmail.token });
          } else {
            setError(t('recovery.errNoToken', 'Verification failed: No token received'));
          }
        } catch (err: unknown) {
          setError(recoveryErrorText(err, t, t('recovery.errUnexpected', 'Verification failed')));
        }
        break;

      case 'new-password':
        if (formData.newPassword.length < 8) {
          setError(t('recovery.errPasswordLength', 'Password must be at least 8 characters long'));
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError(t('recovery.errPasswordMatch', 'Passwords do not match'));
          return;
        }
        if (!recoveryToken) {
          setError(t('recovery.errSession', 'Session expired. Please start the recovery process again.'));
          pushStep('email');
          return;
        }
        try {
          await auth.changePassword(formData.email, formData.confirmPassword, recoveryToken);
          clearRecoveryFlow();
          pushStep('success');
        } catch (err: unknown) {
          setError(recoveryErrorText(err, t, t('recovery.errServer', 'La réinitialisation a échoué. Réessayez dans un instant.')));
        }
        break;

      case 'success':
        handleBackToSignIn();
        break;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-space-dark-950 text-white animate-fade-in relative overflow-auto">
      <Header
        onSignIn={onBack}
        onGetStarted={onGetStarted || onBack}
        onNavigateToSection={onNavigateToSection}
      />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[15%] w-[42%] h-[42%] bg-rose-500/30 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[8%] right-[8%] w-[48%] h-[48%] bg-fuchsia-600/25 blur-[140px] rounded-full animate-float" style={{ animationDelay: '3s' }} />
      </div>
      <div className="flex min-h-screen items-center justify-center px-4 pb-10 pt-24 relative z-10">
        <div className="w-full max-w-md glass-card-premium rounded-3xl p-8 text-center relative z-10">
          {step !== 'success' && (
            <button
              type="button"
              onClick={step === 'email' ? handleBackToSignIn : () => pushStep(step === 'new-password' ? 'verification' : 'email')}
              className="mb-6 mx-auto flex items-center text-sm text-rose-200 transition-colors hover:text-white"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {step === 'email' ? t('recovery.btnBack', 'Back to Sign In') : t('recovery.btnPrevious', 'Back')}
            </button>
          )}

          {step === 'email' && (
            <>
              <h2 className="text-3xl font-extrabold text-gradient-harx mb-2 text-balance">{t('recovery.resetTitle', 'Reset Your Password')}</h2>
              <p className="text-rose-100/80 text-sm mb-8">{t('recovery.resetDesc', 'Enter your registered email to reset your password.')}</p>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-rose-200 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-rose-200/30 rounded-xl text-white placeholder:text-rose-100/45 outline-none focus:ring-2 focus:ring-rose-300/40 focus:border-rose-200 transition-all"
                  placeholder={t('recovery.emailPlaceholder', 'Enter your email')}
                />
              </div>
            </>
          )}

          {step === 'verification' && (
            <>
              <h2 className="text-3xl font-extrabold text-gradient-harx mb-2 text-balance">{t('recovery.verifyTitle', 'Verify Your Identity')}</h2>
              <p className="text-rose-100/80 text-sm mb-8">
                {t('recovery.verifyDesc', 'We sent a 6-digit code to {{email}}. Please enter it below.', { email: formData.email })}
              </p>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-rose-200 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-rose-200/30 rounded-xl text-white placeholder:text-rose-100/45 outline-none focus:ring-2 focus:ring-rose-300/40 focus:border-rose-200 transition-all text-center tracking-[0.4em] text-lg font-bold"
                  placeholder="000000"
                />
              </div>
            </>
          )}

          {step === 'new-password' && (
            <>
              <h2 className="text-3xl font-extrabold text-gradient-harx mb-2 text-balance">{t('recovery.newPasswordTitle', 'Create New Password')}</h2>
              <p className="text-rose-100/80 text-sm mb-8">{t('recovery.newPasswordDesc', 'Set a strong password for your account.')}</p>
              <div className="space-y-4">
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-rose-200 group-focus-within:text-white transition-colors" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-rose-200/30 rounded-xl text-white placeholder:text-rose-100/45 outline-none focus:ring-2 focus:ring-rose-300/40 focus:border-rose-200 transition-all"
                    placeholder={t('recovery.newPasswordPlaceholder', 'New password')}
                  />
                  {formData.newPassword.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-3.5 text-rose-200 hover:text-white transition-colors focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-rose-200 group-focus-within:text-white transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-rose-200/30 rounded-xl text-white placeholder:text-rose-100/45 outline-none focus:ring-2 focus:ring-rose-300/40 focus:border-rose-200 transition-all"
                    placeholder={t('recovery.confirmPasswordPlaceholder', 'Confirm new password')}
                  />
                  {formData.confirmPassword.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3.5 text-rose-200 hover:text-white transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-rose-400/20 rounded-full">
                  <CheckCircle className="h-12 w-12 text-rose-200" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gradient-harx mb-2">{t('recovery.successTitle', 'Success!')}</h2>
              <p className="text-rose-100/80 text-sm">{t('recovery.successDesc', 'Your password has been reset. You can now log in.')}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-3 text-rose-50 bg-rose-950/50 border border-rose-300/40 p-3.5 rounded-xl mt-4">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button type="button" onClick={handleContinue} className="btn-primary mt-6">
            {step === 'success' ? t('recovery.btnBack', 'Back to Sign In') : t('recovery.btnContinue', 'Continue')}
          </button>
        </div>
      </div>
    </div>
  );
}
