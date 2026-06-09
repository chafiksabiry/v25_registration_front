import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { auth } from '../lib/api';

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

function stepFromSearch(param: string | null, session: RecoverySession | null): RecoveryStep {
  if (param && RECOVERY_STEPS.includes(param as RecoveryStep)) return param as RecoveryStep;
  if (session?.step) return session.step;
  return 'email';
}

interface PasswordRecoveryDialogProps {
  onBack: () => void;
}

export default function PasswordRecoveryDialog({ onBack }: PasswordRecoveryDialogProps) {
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

  const pushStep = (next: RecoveryStep, patch?: Partial<RecoverySession>) => {
    setStep(next);
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
      localStorage.removeItem('token');
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
          setError('Please enter your email address');
          return;
        }
        try {
          const verificationCode = await auth.generateVerificationCode(formData.email);
          await auth.sendVerificationEmail(formData.email, verificationCode.verificationCode);
          pushStep('verification', { email: formData.email });
        } catch (err: any) {
          setError(err.message || 'Failed to send verification code');
        }
        break;

      case 'verification':
        if (formData.verificationCode.length !== 6) {
          setError('Please enter a valid 6-digit code');
          return;
        }
        try {
          const resultverificationEmail = await auth.verifyEmail({
            email: formData.email,
            code: formData.verificationCode,
          });
          if (resultverificationEmail.result && resultverificationEmail.result.error) {
            setError('Invalid email verification code');
          } else if (resultverificationEmail.token) {
            // Keep recovery token in session only — NOT localStorage.token.
            // Writing to localStorage triggers GuestOnly → /company redirect loop.
            setRecoveryToken(resultverificationEmail.token);
            pushStep('new-password', { recoveryToken: resultverificationEmail.token });
          } else {
            setError('Verification failed: No token received');
          }
        } catch (err: any) {
          setError(err.message || 'Verification failed');
        }
        break;

      case 'new-password':
        if (formData.newPassword.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (!recoveryToken) {
          setError('Session expired. Please start the recovery process again.');
          pushStep('email');
          return;
        }
        try {
          await auth.changePassword(formData.email, formData.confirmPassword, recoveryToken);
          clearRecoveryFlow();
          pushStep('success');
        } catch (err: any) {
          setError(err.message || 'Failed to reset password');
        }
        break;

      case 'success':
        handleBackToSignIn();
        break;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-premium-gradient">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 md:p-8 relative shadow-2xl border border-harx-100">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-full max-w-[140px] mx-auto mb-3">
                <img
                  src={`${import.meta.env.BASE_URL || '/'}mascotte.png`}
                  alt="HARX Mascotte"
                  className="w-full h-auto object-contain"
                  loading="eager"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-harx-400/15 to-harx-alt-400/15 rounded-lg blur-lg -z-10" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-harx bg-clip-text text-transparent">HARX</h1>
              <p className="text-gray-500 font-medium tracking-wide">We inspire growth</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-harx-50 to-harx-100/80 border border-harx-200 rounded-2xl p-6 mb-4">
            {step === 'email' && (
              <div className="space-y-4">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
                  <p className="text-gray-600">Enter your registered email to reset your password.</p>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-harx-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-harx-200 rounded-xl focus:ring-2 focus:ring-harx-500 focus:border-harx-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            {step === 'verification' && (
              <div className="space-y-4 text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
                <p className="text-gray-600 leading-relaxed">
                  We sent a 6-digit code to <span className="font-semibold text-harx-600">{formData.email}</span>. Please enter it below.
                </p>

                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-harx-500" />
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.verificationCode}
                    onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-harx-200 rounded-xl focus:ring-2 focus:ring-harx-500 focus:border-harx-400 outline-none transition-all tracking-[0.5em] text-center font-bold text-lg"
                    placeholder="000000"
                  />
                </div>
              </div>
            )}

            {step === 'new-password' && (
              <div className="space-y-4 text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h2>
                <p className="text-gray-600 mb-4">Set a strong password for your account.</p>
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-harx-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-white border border-harx-200 rounded-xl focus:ring-2 focus:ring-harx-500 focus:border-harx-400 outline-none transition-all"
                      placeholder="New password"
                    />
                    {formData.newPassword.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-harx-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-white border border-harx-200 rounded-xl focus:ring-2 focus:ring-harx-500 focus:border-harx-400 outline-none transition-all"
                      placeholder="Confirm new password"
                    />
                    {formData.confirmPassword.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
                  <p className="text-gray-600">Your password has been reset. You can now log in.</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col space-y-3 pt-2">
            <button
              onClick={handleContinue}
              className="btn-primary w-full group"
            >
              {step === 'success' ? 'Back to Sign In' : 'Continue'}
              {step !== 'success' && <KeyRound className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
            </button>

            {step === 'email' && (
              <button
                onClick={handleBackToSignIn}
                className="w-full text-gray-500 py-2 font-medium hover:text-gray-700 transition-colors"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
