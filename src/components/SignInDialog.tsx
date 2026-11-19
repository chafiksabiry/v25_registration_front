import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, RefreshCw, Linkedin, Phone, Eye, EyeOff, Building2, Users } from 'lucide-react';
import { auth } from '../lib/api';
import { getPostLoginRedirectUrl, isSessionActive, getSessionUserId, getSessionToken, syncSessionUserIdCookie, clearAuthSession } from '../lib/authRedirect';
import { hardNavigate } from '../lib/appNavigation';
import { useAuth } from '../contexts/AuthContext';
import { handleLinkedInSignIn } from '../utils/Linkedin';
import { jwtDecode } from 'jwt-decode';
import { AuthBackdrop } from './layout/AuthBackdrop';
import { AuthSidePanel } from './layout/AuthSidePanel';
import { Header } from './LandingPage/Header';
import { useTranslation } from 'react-i18next';
import { isCallcentreProduct } from '../lib/product';
import { mapSignInError } from '../lib/authErrors';
import { audienceMismatchKey, readAudience, saveAudience, type Audience } from '../lib/signInAudience';
import { readRememberedEmail, rememberLoginEmail } from '../lib/authSync';

type SignInStep = 'credentials' | '2fa' | 'success';

interface SignInDialogProps {
  onRegister: () => void;
  onForgotPassword: () => void;
  onSuccess?: () => void;
  onGetStarted?: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export default function SignInDialog({ onRegister, onForgotPassword, onSuccess, onGetStarted, onNavigateToSection }: SignInDialogProps) {
  const { setToken } = useAuth();
  const [step, setStep] = useState<SignInStep>('credentials');
  const [formData, setFormData] = useState(() => {
    const rememberedEmail = readRememberedEmail() ?? '';
    return {
      email: rememberedEmail,
      password: '',
      rememberMe: Boolean(rememberedEmail),
      verificationCode: '',
      userId: '',
      phone: '',
    };
  });
  const [audience, setAudience] = useState<Audience>(() => readAudience());
  const telephony = isCallcentreProduct();
  const [showPassword, setShowPassword] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const { t } = useTranslation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    if (!isSessionActive()) return;

    setIsAlreadyLoggedIn(true);
    const userId = syncSessionUserIdCookie() ?? getSessionUserId();
    if (!userId) {
      clearAuthSession();
      setIsAlreadyLoggedIn(false);
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      hardNavigate('/company');
    }, 3000);

    getPostLoginRedirectUrl(userId, getSessionToken())
      .then((dest) => {
        clearTimeout(fallbackTimer);
        hardNavigate(dest || '/company');
      })
      .catch(() => {
        clearTimeout(fallbackTimer);
        hardNavigate('/company');
      });

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    let timer: number;
    if (resendTimeout > 0) {
      timer = window.setInterval(() => setResendTimeout((prev) => prev - 1), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [resendTimeout]);

  const handleResendOTP = async () => {
    if (resendTimeout > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      await auth.resendVerification(formData.email);
      setResendTimeout(30);
      setFormData((prev) => ({ ...prev, verificationCode: '' }));
    } catch (err) {
      setError(mapSignInError(err, t, 'resend'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!formData.userId || !formData.phone) {
      setError(t('signIn.errPhoneMissing', 'Numéro de téléphone indisponible pour le SMS.'));
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await auth.sendOTP(formData.userId, formData.phone);
      setResendTimeout(30);
      setFormData((prev) => ({ ...prev, verificationCode: '' }));
    } catch (err) {
      setError(mapSignInError(err, t, 'sms'));
      setVerificationMethod('email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSMS = async () => {
    setVerificationMethod('sms');
    await handleSendSMS();
  };

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (step === 'credentials') {
        if (!formData.email?.trim() && !formData.password) {
          setError(t('signIn.errMissingFields', 'Please enter both email and password.'));
          return;
        }
        if (!formData.email?.trim()) {
          setError(t('signIn.errMissingEmail', 'Veuillez saisir votre email.'));
          return;
        }
        if (!formData.password) {
          setError(t('signIn.errMissingPassword', 'Veuillez saisir votre mot de passe.'));
          return;
        }

        let result: { data: { userId: string; phone?: string } };
        try {
          result = await auth.login({ email: formData.email, password: formData.password });
        } catch (err) {
          setError(mapSignInError(err, t, 'login'));
          return;
        }

        if (!result?.data?.userId) {
          setError(
            t(
              'signIn.errServer',
              'Le service de connexion est temporairement indisponible. Réessayez plus tard.'
            )
          );
          return;
        }

        // Téléphonie : une entreprise n'est pas une équipe. Le choix de l'écran doit correspondre au compte, sinon on s'arrête ici avec un message clair.
        if (telephony) {
          try {
            const info = await auth.checkUserType(result.data.userId);
            const mismatch = audienceMismatchKey(audience, info?.userType);
            if (mismatch) {
              setError(
                mismatch === 'accountIsCompany'
                  ? t('signIn.accountIsCompany', 'Ce compte est un compte entreprise. Choisissez « Entreprise » pour vous connecter.')
                  : t('signIn.accountIsTeam', 'Ce compte appartient à une équipe (secrétaire ou responsable). Choisissez « Équipe » pour vous connecter.')
              );
              return;
            }
          } catch {
            /* type de compte illisible : on laisse la connexion suivre son cours */
          }
        }

        // login() already emails the 2FA code server-side (AUTH-07: the code
        // is never returned in the response, so it can't be re-sent from
        // here) — just move on to the 2FA step.
        setFormData((prev) => ({
          ...prev,
          userId: result.data.userId,
          phone: result.data.phone || '',
        }));

        setStep('2fa');
        setVerificationMethod('email');
        setResendTimeout(30);
        return;
      }

      if (step === '2fa') {
        if (formData.verificationCode.length !== 6) {
          setError(t('signIn.errInvalidCode', 'Please enter a valid 6-digit code.'));
          return;
        }
        let resultData: { token: string };
        if (verificationMethod === 'email') {
          const res = await auth.verifyEmail({ email: formData.email, code: formData.verificationCode });
          if (res.result?.error) {
            setError(t('signIn.errInvalidEmailCode', 'Invalid email verification code'));
            return;
          }
          resultData = res;
        } else {
          const res = await auth.verifyOTP(formData.userId, formData.verificationCode);
          if (res.error) {
            setError(
              res.message
                ? String(res.message)
                : t('signIn.errInvalidSmsCode', 'Invalid SMS verification code')
            );
            return;
          }
          resultData = res;
        }
        if (!resultData?.token) {
          setError(mapSignInError(new Error('missing token'), t, 'verify'));
          return;
        }
        const decoded: any = jwtDecode(resultData.token);
        const userId = decoded.userId;
        setToken(resultData.token, formData.rememberMe);
        rememberLoginEmail(formData.rememberMe ? formData.email : null);
        syncSessionUserIdCookie(resultData.token);
        setStep('success');
        const redirectTo = await getPostLoginRedirectUrl(userId, resultData.token);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
            return;
          }
          if (redirectTo) {
            hardNavigate(redirectTo);
          }
        }, 1500);
      }
    } catch (err: unknown) {
      setError(mapSignInError(err, t, step === '2fa' ? 'verify' : 'login'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-space-dark-950 text-white animate-fade-in relative overflow-auto">
      <Header
        onSignIn={() => {}}
        onGetStarted={onGetStarted || (() => {})}
        onNavigateToSection={onNavigateToSection}
        telephony={isCallcentreProduct()}
      />
      
      <AuthBackdrop />

      <div className="flex-1 flex items-center justify-center p-4 py-20 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 auth-card bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10">
          {/* Left Side - Brand Section */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-between p-10 xl:p-12 bg-gradient-to-b from-[#0a0a18] via-[#0d0d1f] to-[#0a0a18] text-white relative border-r border-white/10">
            <div className="absolute inset-0 bg-[length:32px_32px] opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)' }} />
            <AuthSidePanel kind={isCallcentreProduct() ? 'telephony' : 'neutral'} />
          </div>

          {/* Right Side - Form Section */}
          <div className="lg:col-span-3 bg-slate-900/40 p-8 lg:p-14 flex flex-col justify-center relative">
            <div className="max-w-md mx-auto w-full">
              {isAlreadyLoggedIn ? (
                <div className="space-y-4 text-center">
                  <h2 className="text-xl font-bold text-white">{t('signIn.alreadyLoggedIn', 'Already Logged In')}</h2>
                  <p className="text-slate-400">{t('signIn.redirecting', 'Redirecting you to your dashboard...')}</p>
                  <div className="animate-spin h-8 w-8 border-4 border-harx-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : (
                <>
                  <div className="text-center mb-8 lg:text-left">
                    <h2 className="text-3xl font-extrabold text-white mb-2">{t('signIn.welcomeBack', 'Welcome Back')}</h2>
                    <p className="text-slate-400 text-sm">{t('signIn.signInToContinue', 'Sign in to your account to continue.')}</p>
                  </div>

                  {step === 'credentials' && telephony && (
                    <div className="mb-6" data-testid="signin-audience">
                      <div role="tablist" aria-label={t('signIn.audienceLabel', 'Type de compte')} className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-800/70 p-1 border border-white/10">
                        {([
                          { id: 'company' as const, icon: Building2, label: t('signIn.audienceCompany', 'Entreprise'), hint: t('signIn.audienceCompanyHint', 'Je gère une entreprise') },
                          { id: 'team' as const, icon: Users, label: t('signIn.audienceTeam', 'Équipe'), hint: t('signIn.audienceTeamHint', 'Secrétaire, responsable') },
                        ]).map(({ id, icon: Icon, label, hint }) => (
                          <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={audience === id}
                            data-testid={`signin-audience-${id}`}
                            onClick={() => { setAudience(id); saveAudience(id); setError(null); }}
                            className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2.5 text-center transition ${audience === id ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-white/10'}`}
                          >
                            <span className="flex items-center gap-2 text-sm font-black"><Icon className="h-4 w-4" aria-hidden /> {label}</span>
                            <span className={`text-[11px] font-medium ${audience === id ? 'text-slate-600' : 'text-slate-400'}`}>{hint}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 'credentials' && (
                    <div className="space-y-4">
                      <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-harx-400 transition-colors" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) { e.preventDefault(); handleSignIn(); } }}
                          className="input-premium-glow"
                          placeholder={t('signIn.emailPlaceholder', 'Enter your email')}
                        />
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-harx-400 transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) { e.preventDefault(); handleSignIn(); } }}
                          className="input-premium-glow pr-12"
                          placeholder={t('signIn.passwordPlaceholder', 'Enter your password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-4 top-3.5 text-slate-400 hover:text-harx-400 transition-colors focus:outline-none"
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            className="rounded border-slate-700 bg-slate-800 text-harx-500 focus:ring-harx-500 focus:ring-offset-slate-900 w-4 h-4"
                          />
                          <span className="text-sm text-slate-300">{t('signIn.rememberMe', 'Remember me')}</span>
                        </label>
                        <button type="button" onClick={onForgotPassword} className="text-sm text-harx-400 font-medium hover:text-harx-300 transition-colors">
                          {t('signIn.forgotPassword', 'Forgot password?')}
                        </button>
                      </div>
                    </div>
                  )}

                  {step === '2fa' && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {verificationMethod === 'email' ? t('signIn.emailVerification', 'Email Verification') : t('signIn.smsVerification', 'SMS Verification')}
                      </h2>
                      <p className="text-slate-400 text-sm mb-6">
                        {verificationMethod === 'email'
                          ? t('signIn.emailSentCode', 'We sent a 6-digit code to {{email}}. Enter it below.', { email: formData.email })
                          : t('signIn.smsSentCode', 'We sent a 6-digit code to your phone. Enter it below.')}
                      </p>
                      <div className="relative group mb-4">
                        <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-harx-500 transition-colors" />
                        <input
                          type="text"
                          maxLength={6}
                          value={formData.verificationCode}
                          onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '') })}
                          className="input-premium-glow text-center tracking-widest text-lg font-bold"
                          placeholder="000000"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendTimeout > 0 || isLoading}
                        className={`w-full flex items-center justify-center gap-2 text-sm mb-4 transition-colors ${resendTimeout > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-harx-400 hover:text-harx-300'}`}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {resendTimeout > 0 ? t('signIn.resendCodeIn', 'Resend code in {{seconds}}s', { seconds: resendTimeout }) : t('signIn.resendVerification', 'Resend verification code')}
                      </button>
                      {verificationMethod === 'email' && formData.phone && (
                        <button
                          type="button"
                          onClick={handleSwitchToSMS}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 text-sm text-harx-alt-450 hover:text-harx-alt-300 transition-colors"
                        >
                          <Phone className="h-4 w-4" /> {t('signIn.trySmsInstead', 'Try SMS verification instead')}
                        </button>
                      )}
                      {verificationMethod === 'sms' && (
                        <button
                          type="button"
                          onClick={() => { setVerificationMethod('email'); setError(null); }}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 text-sm text-harx-alt-450 hover:text-harx-alt-300 mt-2 transition-colors"
                        >
                          <Mail className="h-4 w-4" /> {t('signIn.tryEmailInstead', 'Try Email verification instead')}
                        </button>
                      )}
                    </>
                  )}

                  {step === 'success' && (
                    <div className="space-y-4 text-center py-4">
                      <h2 className="text-2xl font-bold text-green-450">{t('signIn.successTitle', 'Login Successful!')}</h2>
                      <p className="text-slate-350">{t('signIn.successRedirect', 'Redirecting to your dashboard...')}</p>
                      <div className="animate-spin h-8 w-8 border-4 border-harx-500 border-t-transparent rounded-full mx-auto" />
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 text-red-400 bg-red-950/30 border border-red-900/50 p-3.5 rounded-xl mt-4 text-left">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  {step === 'credentials' && (
                    <div className="mt-6 space-y-4">
                      <button
                        type="button"
                        onClick={handleSignIn}
                        disabled={isLoading}
                        className="btn-primary"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          t('signIn.signInBtn', 'Sign In')
                        )}
                      </button>
                    </div>
                  )}

                  {step === '2fa' && (
                    <button
                      type="button"
                      onClick={handleSignIn}
                      disabled={isLoading}
                      className="btn-primary mt-6"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        t('signIn.verifyBtn', 'Verify')
                      )}
                    </button>
                  )}

                  {step === 'credentials' && (
                    <p className="text-center text-sm text-slate-400 mt-6 pt-4 border-t border-white/[0.06]">
                      {t('signIn.noAccount', "Don't have an account?")}{' '}
                      <button type="button" onClick={onRegister} className="text-harx-400 font-semibold hover:text-harx-300 transition-colors">
                        {t('signIn.signUp', 'Sign up')}
                      </button>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
