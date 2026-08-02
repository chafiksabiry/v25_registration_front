import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Lock, Mail, Phone, User, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './LandingPage/Header';
import {
  REGISTER_FORM_STEPS,
  type RegisterFormStep,
  type RegisterNavState,
  registerStepSearch,
  resolveRegisterPath,
} from '../lib/registerNavigation';
import { clearSessionUserId, isSessionActive, syncSessionUserIdCookie } from '../lib/authRedirect';
import { useHistoryBack } from '../hooks/useHistoryBack';
import { useTranslation } from 'react-i18next';

type Step = RegisterFormStep | 'success';

const REG_STEPS: Step[] = [...REGISTER_FORM_STEPS, 'success'];

function stepFromSearch(param: string | null): Step {
  if (param && REG_STEPS.includes(param as Step)) return param as Step;
  return 'name';
}

interface RegistrationDialogProps {
  defaultUserType?: 'company' | 'rep';
  onSignIn: () => void;
  onGetStarted?: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export default function RegistrationDialog({
  defaultUserType,
  onSignIn,
  onGetStarted,
  onNavigateToSection,
}: RegistrationDialogProps) {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as RegisterNavState | null) ?? null;
  const registerPath = useMemo(() => resolveRegisterPath(location.pathname), [location.pathname]);
  const historyBack = useHistoryBack(navState?.returnTo ?? '/auth/choice');
  const [searchParams] = useSearchParams();
  const step = stepFromSearch(searchParams.get('step'));
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    termsAccepted: false,
    emailOTP: '',
    phoneOTP: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [smsOtpAvailable, setSmsOtpAvailable] = useState(false);
  const [smsNotice, setSmsNotice] = useState<string | null>(null);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (defaultUserType) {
      localStorage.setItem('pendingUserType', defaultUserType);
    }
  }, [defaultUserType]);

  useEffect(() => {
    if (!isSessionActive()) {
      clearSessionUserId();
      setRegisteredUserId(null);
    }
  }, []);

  /** Push a new history entry via React Router (not raw pushState). */
  const pushStep = (next: RegisterFormStep) => {
    navigate(
      { pathname: registerPath, search: registerStepSearch(next) },
      { state: navState }
    );
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const validatePhone = (phone: string) => /^\+?[\d\s-]{10,}$/.test(phone);

  const getFirstIncompleteStep = (): RegisterFormStep | null => {
    if (formData.fullName.trim().length < 3) return 'name';
    if (!validateEmail(formData.email)) return 'email';
    if (!validatePassword(formData.password)) return 'password';
    if (!validatePhone(formData.phone)) return 'phone';
    return null;
  };

  const completeRegistration = async (
    storedUserId: string,
    token: string,
    newErrors: Record<string, string>
  ): Promise<boolean> => {
    try {
      const accountVerificationResult = await auth.verifyAccount(storedUserId);
      if (!accountVerificationResult.success) {
        newErrors.general = accountVerificationResult.message || t('register.errGeneralFailed', 'Account verification failed');
        return false;
      }

      setToken(token);
      syncSessionUserIdCookie(token);

      const pendingUserType = localStorage.getItem('pendingUserType');
      if (pendingUserType) {
        try {
          await auth.changeUserType(storedUserId, pendingUserType as 'company' | 'rep');
          localStorage.removeItem('pendingUserType');
        } catch (err) {
          console.error('Failed to change user type:', err);
        }
      }

      navigate({ pathname: registerPath, search: '?step=success' });
      setShowProfilePrompt(true);
      setTimeout(() => onSignIn(), 1500);
      return true;
    } catch (err) {
      newErrors.general = err instanceof Error ? err.message : t('register.errGeneralFailed', 'Account verification failed');
      return false;
    }
  };

  const handleSendSmsOtp = async () => {
    if (!registeredUserId || !formData.phone) return;

    setIsLoading(true);
    setErrors({});
    setSmsNotice(null);
    try {
      await auth.sendOTP(registeredUserId, formData.phone);
      setSmsOtpAvailable(true);
      setSmsNotice(t('register.smsNoticeSent', 'SMS code sent. Check your phone.'));
    } catch {
      setSmsOtpAvailable(false);
      setSmsNotice(t('register.smsNoticeUnavailable', 'SMS unavailable. Continue with email verification only.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const newErrors: Record<string, string> = {};

    try {
      switch (step) {
        case 'name':
          if (formData.fullName.trim().length < 3) {
            newErrors.name = t('register.errName', 'Please enter your full name');
          } else {
            pushStep('email');
          }
          break;

        case 'email':
          if (!validateEmail(formData.email)) {
            newErrors.email = t('register.errEmail', 'Please enter a valid email address');
          } else {
            pushStep('password');
          }
          break;

        case 'password':
          if (!validatePassword(formData.password)) {
            newErrors.password = t('register.errPassword', 'Password must be at least 8 characters with letters and numbers');
          } else {
            pushStep('phone');
          }
          break;

        case 'phone':
          if (!validatePhone(formData.phone)) {
            newErrors.phone = t('register.errPhone', 'Please enter a valid phone number');
          } else {
            pushStep('terms');
          }
          break;

        case 'terms':
          if (!formData.termsAccepted) {
            newErrors.terms = t('register.errTerms', 'Please accept the terms and conditions');
          } else {
            const incompleteStep = getFirstIncompleteStep();
            if (incompleteStep) {
              newErrors.general = t('register.errGeneralMissing', 'Some registration details are missing. Please complete all steps.');
              pushStep(incompleteStep);
              break;
            }

            setIsLoading(true);

            let RegisterResult: any;
            try {
              RegisterResult = await auth.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
              });

              if (RegisterResult?.data?._id) {
                setRegisteredUserId(RegisterResult.data._id as string);
              }
            } catch (error) {
              if ((error as any).response?.data?.message === 'Email already registered') {
                newErrors.email = t('register.errEmailTaken', 'This email is already registered');
                pushStep('email');
                setErrors(newErrors);
                return;
              } else {
                newErrors.general =
                  (error as { response?: { data?: { message?: string } } }).response?.data?.message
                  || t('register.errGeneralFailed', 'Registration failed, please try again');
                setErrors(newErrors);
                return;
              }
            }

            // Persist the role chosen on ChoicePage immediately, BEFORE email/SMS
            // verification. This guarantees `typeUser` is set even if the user
            // abandons the flow before verifying — fixing accounts that ended
            // up with `typeUser: null` in DB.
            const pendingUserType = localStorage.getItem('pendingUserType');
            if (pendingUserType === 'company' || pendingUserType === 'rep') {
              try {
                await auth.changeUserType(RegisterResult.data._id, pendingUserType);
              } catch (err) {
                console.error('Failed to set typeUser right after register:', err);
              }
            }

            await auth.sendVerificationEmail(formData.email, RegisterResult.data.code);

            setSmsOtpAvailable(false);
            setSmsNotice(null);
            try {
              await auth.sendOTP(RegisterResult.data._id, formData.phone);
              setSmsOtpAvailable(true);
            } catch {
              setSmsNotice(t('register.smsNoticeTempUnavailable', 'SMS verification is temporarily unavailable. Use the email code to complete registration.'));
            }

            pushStep('verification');
          }
          break;

        case 'verification': {
          if (!formData.emailOTP || formData.emailOTP.length !== 6) {
            newErrors.verification = t('register.errEmailCode', 'Please enter the 6-digit email verification code');
            break;
          }
          if (smsOtpAvailable && (!formData.phoneOTP || formData.phoneOTP.length !== 6)) {
            newErrors.verification = t('register.errBothCodes', 'Please enter both the email code and the SMS code');
            break;
          }

          setIsLoading(true);

          if (!registeredUserId) {
            newErrors.general = t('register.errSessionExpired', 'Registration session expired. Please start again.');
            pushStep('terms');
            break;
          }

          if (smsOtpAvailable) {
            const otpVerificationResult = await auth.verifyOTP(registeredUserId, formData.phoneOTP);
            if (otpVerificationResult.error) {
              const otpMessage = otpVerificationResult.message || '';
              newErrors.general = otpMessage.toLowerCase().includes('expired')
                ? t('register.errSmsExpired', 'SMS code expired. Use "Try SMS verification" to request a new code.')
                : t('register.errInvalidSms', 'Invalid SMS code. Please try again.');
              break;
            }
          }

          const emailVerificationResult = await auth.verifyEmail({
            email: formData.email,
            code: formData.emailOTP
          });
          if (emailVerificationResult.result?.error) {
            newErrors.general = t('register.errInvalidEmail', 'Invalid email verification code');
            break;
          }

          await completeRegistration(registeredUserId, emailVerificationResult.token, newErrors);
          break;
        }
        default: break;
      }
    } catch (err) {
      newErrors.general = err instanceof Error ? err.message : t('register.errUnexpected', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setErrors(newErrors);
    }
  };

  const goBack = () => {
    if (step === 'name' && navState?.scrollTo && onNavigateToSection) {
      onNavigateToSection(navState.scrollTo);
      return;
    }
    historyBack();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-space-dark-950 text-white animate-fade-in relative overflow-auto">
      <Header
        onSignIn={onSignIn}
        onGetStarted={onGetStarted || (() => {})}
        onNavigateToSection={onNavigateToSection}
      />

      {/* Immersive background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-harx-400/10 blur-[120px] rounded-full animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-harx-alt-400/10 blur-[150px] rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-20 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative z-10">

          {/* Left Side - Brand Section */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-between p-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative border-r border-white/10">
            <div className="absolute inset-0 bg-[length:32px_32px] opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)' }}></div>
            <div className="relative z-10 text-center lg:text-left flex flex-col justify-center h-full">
              <div className="relative w-full max-w-[150px] mx-auto mb-8 animate-float">
                <img
                  src={`${import.meta.env.BASE_URL || '/'}mascotte.png`}
                  alt="HARX Mascotte"
                  className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(255,77,77,0.2)]"
                  loading="eager"
                />
                <div className="absolute -inset-3 bg-gradient-to-r from-harx-500/25 to-harx-alt-500/25 rounded-full blur-xl -z-10 animate-pulse-slow" />
              </div>
              <h1 className="text-3xl font-extrabold leading-tight mb-4">
                {t('signIn.brandTitle1', 'Start Your')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-harx-400 to-harx-alt-400">{t('signIn.brandTitle2', 'Journey Today')}</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t('signIn.brandDesc', 'Access premium AI tools, real-time customer support analytics, and join a global community of customer service professionals.')}
              </p>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="lg:col-span-3 bg-slate-900/40 p-8 lg:p-14 flex flex-col justify-center relative">
            <div className="max-w-md mx-auto w-full">
              {step !== 'success' && (
                <button onClick={goBack} className="flex items-center text-sm text-slate-450 hover:text-white mb-6 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  {t('register.back', 'Back')}
                </button>
              )}

              {/* Visual Step Progress Indicator */}
              {step !== 'success' && (
                <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
                  {['name', 'email', 'password', 'phone', 'terms', 'verification'].map((s, idx) => {
                    const stepsList = ['name', 'email', 'password', 'phone', 'terms', 'verification'];
                    const currentIdx = stepsList.indexOf(step);
                    const isCompleted = idx < currentIdx;
                    const isActive = step === s;
                    return (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-350 ${
                          isCompleted ? 'w-6 bg-gradient-harx' :
                          isActive ? 'w-8 bg-harx-500 shadow-md shadow-harx-500/30' : 'w-2 bg-white/10'
                        }`}
                      />
                    );
                  })}
                </div>
              )}

              <div className="text-center mb-8 lg:text-left">
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  {step === 'name' ? t('register.titleName', 'Create Account') :
                    step === 'email' ? t('register.titleEmail', 'Contact Details') :
                      step === 'password' ? t('register.titlePassword', 'Secure Account') :
                        step === 'phone' ? t('register.titlePhone', 'Phone Verification') :
                          step === 'terms' ? t('register.titleTerms', 'Final Step') :
                            step === 'verification' ? t('register.titleVerification', 'Verify Account') : t('register.titleSuccess', 'Success')}
                </h2>
                <p className="text-slate-400 text-sm">
                  {step === 'name' ? t('register.descName', "Let's get to know you.") :
                    step === 'email' ? t('register.descEmail', 'Where should we send updates?') :
                      step === 'password' ? t('register.descPassword', 'Protect your account.') :
                        step === 'phone' ? t('register.descPhone', 'For account security.') :
                          step === 'terms' ? t('register.descTerms', 'Review our policies.') :
                            step === 'verification'
                              ? (smsOtpAvailable ? t('register.descVerificationBoth', 'Check your email and phone for codes.') : t('register.descVerificationEmail', 'Check your email for the verification code.'))
                              :
                              t('register.descSuccess', 'Account created successfully!')}
                </p>
              </div>

              {errors.general && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start space-x-3 text-left">
                  <p className="text-sm text-red-400 font-medium">{errors.general}</p>
                </div>
              )}

              <div className="space-y-6 animate-fade-in relative min-h-[280px]">

                {step === 'name' && (
                  <div className="space-y-6">
                    <div className="relative group">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-harx-400 transition-colors" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input-premium-glow"
                        placeholder={t('register.placeholderName', 'Full Name')}
                        autoFocus
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-sm pl-2">{errors.name}</p>}
                  </div>
                )}

                {step === 'email' && (
                  <div className="space-y-6">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-harx-400 transition-colors" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-premium-glow"
                        placeholder={t('register.placeholderEmail', 'Work Email')}
                        autoFocus
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-sm pl-2">{errors.email}</p>}
                  </div>
                )}

                {step === 'password' && (
                  <div className="space-y-6">
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-harx-400 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input-premium-glow pr-12"
                        placeholder={t('register.placeholderPassword', 'Choose a strong password')}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 pl-2">{t('register.passwordHint', 'Must be at least 8 characters with letters and numbers.')}</p>
                    {errors.password && <p className="text-red-400 text-sm pl-2">{errors.password}</p>}
                  </div>
                )}

                {step === 'phone' && (
                  <div className="space-y-6">
                    <div className="relative group">
                      <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-harx-400 transition-colors" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-premium-glow"
                        placeholder={t('register.placeholderPhone', '+1 (555) 000-0000')}
                        autoFocus
                      />
                    </div>
                    {errors.phone && <p className="text-red-400 text-sm pl-2">{errors.phone}</p>}
                  </div>
                )}

                {step === 'terms' && (
                  <div className="space-y-6">
                    <div className="bg-slate-950/40 p-6 rounded-xl border border-white/[0.06]">
                      <div className="flex items-start space-x-3">
                        <ShieldCheck className="h-6 w-6 text-harx-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {t('register.termsAgreeText', 'By creating an account, you agree to comply with our')}{' '}
                          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-harx-400 font-medium hover:text-harx-300 transition-colors">{t('register.termsLink', 'Terms of Service')}</a>{' '}
                          {t('register.termsAnd', 'and acknowledge our')}{' '}
                          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-harx-400 font-medium hover:text-harx-300 transition-colors">{t('register.privacyLink', 'Privacy Policy')}</a>.
                          {t('register.termsSecurity', 'We prioritize your data security.')}
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border border-white/[0.08] hover:bg-slate-800/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-harx-500 focus:ring-harx-500 w-5 h-5 transition-all"
                      />
                      <span className="text-slate-200 font-medium">{t('register.termsCheckbox', 'I agree to the Terms & Conditions')}</span>
                    </label>
                    {errors.terms && <p className="text-red-400 text-sm pl-2">{errors.terms}</p>}
                  </div>
                )}

                {step === 'verification' && (
                  <div className="space-y-6">
                    {smsNotice && (
                      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 text-sm text-amber-400">
                        {smsNotice}
                      </div>
                    )}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-300">{t('register.emailCodeLabel', 'Email Code (sent to {{email}})', { email: formData.email })}</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.emailOTP}
                        onChange={(e) => setFormData({ ...formData, emailOTP: e.target.value.replace(/\D/g, '') })}
                        className="input-premium-glow text-center tracking-widest text-lg font-bold"
                        placeholder="000000"
                      />
                    </div>
                    {smsOtpAvailable ? (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-300">{t('register.smsCodeLabel', 'SMS Code (sent to {{phone}})', { phone: formData.phone })}</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={formData.phoneOTP}
                          onChange={(e) => setFormData({ ...formData, phoneOTP: e.target.value.replace(/\D/g, '') })}
                          className="input-premium-glow text-center tracking-widest text-lg font-bold"
                          placeholder="000000"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendSmsOtp}
                        disabled={isLoading}
                        className="w-full text-sm text-harx-400 hover:text-harx-300 font-medium hover:underline disabled:opacity-50 transition-colors"
                      >
                        {t('register.trySms', 'Try SMS verification (optional)')}
                      </button>
                    )}
                    {errors.verification && <p className="text-red-400 text-sm pl-2">{errors.verification}</p>}
                  </div>
                )}

                {step !== 'success' && (
                  <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className={`btn-primary flex items-center justify-center space-x-2 mt-8 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>{step === 'terms' ? t('register.btnCreateAccount', 'Create Account') : step === 'verification' ? t('register.btnVerifyComplete', 'Verify & Complete') : t('register.btnContinue', 'Continue')}</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                )}

                {step === 'success' && (
                  <div className="flex flex-col items-center justify-center space-y-6 py-10 animate-fade-in">
                    <div className="w-20 h-20 bg-green-950/30 border border-green-900/50 rounded-full flex items-center justify-center mb-4">
                      <Check className="h-10 w-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{t('register.successTitle', 'Registration Successful!')}</h3>
                    <p className="text-slate-400">{t('register.redirectingLogin', 'Redirecting to login...')}</p>
                    <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-green-500 h-full w-full animate-[shimmer_1s_infinite]"></div>
                    </div>
                  </div>
                )}

                {!isLoading && step === 'name' && (
                  <div className="mt-8 text-center border-t border-white/[0.06] pt-6">
                    <p className="text-slate-400 text-sm">
                      {t('register.alreadyHaveAccount', 'Already have an account?')} {' '}
                      <button onClick={onSignIn} className="text-harx-400 font-semibold hover:text-harx-300 hover:underline transition-colors">
                        {t('register.signIn', 'Sign in')}
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}