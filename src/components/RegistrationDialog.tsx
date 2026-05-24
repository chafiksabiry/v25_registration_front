import React, { useState } from 'react';
import { Check, Lock, Mail, Phone, User, CheckCircle, Linkedin, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import { Header } from './LandingPage/Header';

type Step = 'name' | 'email' | 'password' | 'phone' | 'terms' | 'verification' | 'success';

interface RegistrationDialogProps {
  onSignIn: () => void;
  onGetStarted?: () => void;
}

export default function RegistrationDialog({ onSignIn, onGetStarted }: RegistrationDialogProps) {
  const { setToken } = useAuth();
  const [step, setStep] = useState<Step>('name');
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

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const validatePhone = (phone: string) => /^\+?[\d\s-]{10,}$/.test(phone);

  const completeRegistration = async (
    storedUserId: string,
    token: string,
    newErrors: Record<string, string>
  ): Promise<boolean> => {
    try {
      const accountVerificationResult = await auth.verifyAccount(storedUserId);
      if (!accountVerificationResult.success) {
        newErrors.general = accountVerificationResult.message || 'Account verification failed';
        return false;
      }

      setToken(token);
      localStorage.setItem('token', token);
      Cookies.set('userId', storedUserId);

      const pendingUserType = localStorage.getItem('pendingUserType');
      if (pendingUserType) {
        try {
          await auth.changeUserType(storedUserId, pendingUserType as 'company' | 'rep');
          localStorage.removeItem('pendingUserType');
        } catch (err) {
          console.error('Failed to change user type:', err);
        }
      }

      setStep('success');
      setShowProfilePrompt(true);
      setTimeout(() => onSignIn(), 1500);
      return true;
    } catch (err) {
      newErrors.general = err instanceof Error ? err.message : 'Account verification failed';
      return false;
    }
  };

  const handleSendSmsOtp = async () => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId || !formData.phone) return;

    setIsLoading(true);
    setErrors({});
    setSmsNotice(null);
    try {
      await auth.sendOTP(storedUserId, formData.phone);
      setSmsOtpAvailable(true);
      setSmsNotice('SMS code sent. Check your phone.');
    } catch {
      setSmsOtpAvailable(false);
      setSmsNotice('SMS unavailable. Continue with email verification only.');
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
            newErrors.name = 'Please enter your full name';
          } else {
            setStep('email');
          }
          break;

        case 'email':
          if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
          } else {
            setStep('password');
          }
          break;

        case 'password':
          if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters with letters and numbers';
          } else {
            setStep('phone');
          }
          break;

        case 'phone':
          if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
          } else {
            setStep('terms');
          }
          break;

        case 'terms':
          if (!formData.termsAccepted) {
            newErrors.terms = 'Please accept the terms and conditions';
          } else {
            setIsLoading(true);

            let RegisterResult: any;
            try {
              RegisterResult = await auth.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
              });

              if (RegisterResult && RegisterResult.data) {
                localStorage.setItem('userId', RegisterResult.data._id);
              }
            } catch (error) {
              if ((error as any).response?.data?.message === 'Email already registered') {
                newErrors.email = 'This email is already registered';
                setStep('email');
                setErrors(newErrors);
                return;
              } else {
                newErrors.general = 'Registration failed, please try again';
                setErrors(newErrors);
                return;
              }
            }

            await auth.sendVerificationEmail(formData.email, RegisterResult.data.code);

            setSmsOtpAvailable(false);
            setSmsNotice(null);
            try {
              await auth.sendOTP(RegisterResult.data._id, formData.phone);
              setSmsOtpAvailable(true);
            } catch {
              setSmsNotice('SMS verification is temporarily unavailable. Use the email code to complete registration.');
            }

            setStep('verification');
          }
          break;

        case 'verification': {
          if (!formData.emailOTP || formData.emailOTP.length !== 6) {
            newErrors.verification = 'Please enter the 6-digit email verification code';
            break;
          }
          if (smsOtpAvailable && (!formData.phoneOTP || formData.phoneOTP.length !== 6)) {
            newErrors.verification = 'Please enter both the email code and the SMS code';
            break;
          }

          setIsLoading(true);

          const emailVerificationResult = await auth.verifyEmail({
            email: formData.email,
            code: formData.emailOTP
          });
          if (emailVerificationResult.result?.error) {
            newErrors.general = 'Invalid email verification code';
            break;
          }

          const storedUserId = localStorage.getItem('userId');
          if (!storedUserId) {
            newErrors.general = 'User ID not found. Please try again.';
            break;
          }

          if (smsOtpAvailable) {
            const otpVerificationResult = await auth.verifyOTP(storedUserId, formData.phoneOTP);
            if (otpVerificationResult.error) {
              newErrors.general = 'Invalid SMS code. Please try again.';
              break;
            }
          }

          await completeRegistration(storedUserId, emailVerificationResult.token, newErrors);
          break;
        }
        default: break;
      }
    } catch (err) {
      newErrors.general = err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      setIsLoading(false);
      setErrors(newErrors);
    }
  };

  const goBack = () => {
    switch (step) {
      case 'email': setStep('name'); break;
      case 'password': setStep('email'); break;
      case 'phone': setStep('password'); break;
      case 'terms': setStep('phone'); break;
      case 'verification': setStep('terms'); break;
      default: break;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-space-dark-950 text-white animate-fade-in relative overflow-auto">
      <Header onSignIn={onSignIn} onGetStarted={onGetStarted || (() => {})} />

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
                Start Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-harx-400 to-harx-alt-400">Journey Today</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Access premium AI tools, real-time customer support analytics, and join a global community of customer service professionals.
              </p>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="lg:col-span-3 bg-slate-900/40 p-8 lg:p-14 flex flex-col justify-center relative">
            <div className="max-w-md mx-auto w-full">
              {step !== 'success' && step !== 'name' && (
                <button onClick={goBack} className="flex items-center text-sm text-slate-450 hover:text-white mb-6 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back
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
                  {step === 'name' ? 'Create Account' :
                    step === 'email' ? 'Contact Details' :
                      step === 'password' ? 'Secure Account' :
                        step === 'phone' ? 'Phone Verification' :
                          step === 'terms' ? 'Final Step' :
                            step === 'verification' ? 'Verify Account' : 'Success'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {step === 'name' ? 'Let\'s get to know you.' :
                    step === 'email' ? 'Where should we send updates?' :
                      step === 'password' ? 'Protect your account.' :
                        step === 'phone' ? 'For account security.' :
                          step === 'terms' ? 'Review our policies.' :
                            step === 'verification'
                              ? (smsOtpAvailable ? 'Check your email and phone for codes.' : 'Check your email for the verification code.')
                              :
                              'Account created successfully!'}
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
                        placeholder="Full Name"
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
                        placeholder="Work Email"
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
                        placeholder="Choose a strong password"
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
                    <p className="text-xs text-slate-500 pl-2">Must be at least 8 characters with letters and numbers.</p>
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
                        placeholder="+1 (555) 000-0000"
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
                          By creating an account, you agree to comply with our{' '}
                          <a href="#" className="text-harx-400 font-medium hover:text-harx-300 transition-colors">Terms of Service</a>{' '}
                          and acknowledge our{' '}
                          <a href="#" className="text-harx-400 font-medium hover:text-harx-300 transition-colors">Privacy Policy</a>.
                          We prioritize your data security.
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
                      <span className="text-slate-200 font-medium">I agree to the Terms & Conditions</span>
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
                      <label className="block text-sm font-medium text-slate-300">Email Code (sent to {formData.email})</label>
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
                        <label className="block text-sm font-medium text-slate-300">SMS Code (sent to {formData.phone})</label>
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
                        Try SMS verification (optional)
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
                        <span>{step === 'terms' ? 'Create Account' : step === 'verification' ? 'Verify & Complete' : 'Continue'}</span>
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
                    <h3 className="text-2xl font-bold text-white">Registration Successful!</h3>
                    <p className="text-slate-400">Redirecting to login...</p>
                    <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-green-500 h-full w-full animate-[shimmer_1s_infinite]"></div>
                    </div>
                  </div>
                )}

                {!isLoading && step === 'name' && (
                  <div className="mt-8 text-center border-t border-white/[0.06] pt-6">
                    <p className="text-slate-400 text-sm">
                      Already have an account?{' '}
                      <button onClick={onSignIn} className="text-harx-400 font-semibold hover:text-harx-300 hover:underline transition-colors">
                        Sign in
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