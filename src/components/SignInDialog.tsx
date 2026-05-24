import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, RefreshCw, Linkedin, Phone } from 'lucide-react';
import axios from 'axios';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import { handleLinkedInSignIn } from '../utils/Linkedin';
import { jwtDecode } from 'jwt-decode';
import { Header } from './LandingPage/Header';

type SignInStep = 'credentials' | '2fa' | 'success';

interface SignInDialogProps {
  onRegister: () => void;
  onForgotPassword: () => void;
  onSuccess?: () => void;
  onGetStarted?: () => void;
}

export default function SignInDialog({ onRegister, onForgotPassword, onSuccess, onGetStarted }: SignInDialogProps) {
  const { setToken } = useAuth();
  const [step, setStep] = useState<SignInStep>('credentials');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    verificationCode: '',
    userId: '',
    phone: '',
  });
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

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
    } catch {
      setError('Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!formData.userId || !formData.phone) {
      setError('Phone number not available. Cannot send SMS.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await auth.sendOTP(formData.userId, formData.phone);
      setResendTimeout(30);
      setFormData((prev) => ({ ...prev, verificationCode: '' }));
    } catch {
      setError('Failed to send SMS code');
      setVerificationMethod('email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSMS = async () => {
    setVerificationMethod('sms');
    await handleSendSMS();
  };

  const getRedirectUrl = async (userId: string, token: string): Promise<string> => {
    try {
      const checkUserType = await auth.checkUserType(userId);
      if (checkUserType.userType == null) return '/app2';
      if (checkUserType.userType === 'company') {
        try {
          const { data: onboardingProgress } = await axios.get(
            `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${userId}/onboardingProgress`
          );
          if (onboardingProgress.currentPhase !== 4 ||
            !onboardingProgress.phases?.find((p: any) => p.id === 4)?.completed) {
            return '/company';
          }
          return '/app7';
        } catch (e: any) {
          if (e.response?.status === 404) return '/company';
          throw e;
        }
      }
      try {
        const { data: profileData } = await axios.get(
          `${import.meta.env.VITE_REP_API_URL}/profiles/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!profileData.isBasicProfileCompleted) return import.meta.env.VITE_REP_CREATION_PROFILE_URL || '/app2';
        const p = profileData.onboardingProgress?.phases;
        const allDone = p?.phase1?.status === 'completed' && p?.phase2?.status === 'completed' &&
          p?.phase3?.status === 'completed' && p?.phase4?.status === 'completed';
        return allDone ? (import.meta.env.VITE_REP_DASHBOARD_URL || '/repdashboard') : (import.meta.env.VITE_REP_ORCHESTRATOR_URL || '/app2');
      } catch {
        return import.meta.env.VITE_REP_CREATION_PROFILE_URL || '/app2';
      }
    } catch {
      return '/app2';
    }
  };

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (step === 'credentials') {
        if (!formData.email || !formData.password) {
          setError('Please enter both email and password.');
          return;
        }
        const result = await auth.login({ email: formData.email, password: formData.password });
        setFormData((prev) => ({ ...prev, userId: result.data.userId, phone: result.data.phone || '' }));
        await auth.sendVerificationEmail(formData.email, result.data.code);
        setStep('2fa');
        setVerificationMethod('email');
        setResendTimeout(30);
        return;
      }
      if (step === '2fa') {
        if (formData.verificationCode.length !== 6) {
          setError('Please enter a valid 6-digit code.');
          return;
        }
        let resultData: { token: string };
        if (verificationMethod === 'email') {
          const res = await auth.verifyEmail({ email: formData.email, code: formData.verificationCode });
          if (res.result?.error) {
            setError('Invalid email verification code');
            return;
          }
          resultData = res;
        } else {
          const res = await auth.verifyOTP(formData.userId, formData.verificationCode);
          if (res.error) {
            setError('Invalid SMS verification code');
            return;
          }
          resultData = res;
        }
        const decoded: any = jwtDecode(resultData.token);
        const userId = decoded.userId;
        setToken(resultData.token);
        localStorage.setItem('token', resultData.token);
        Cookies.set('userId', userId);
        setStep('success');
        const redirectTo = await getRedirectUrl(userId, resultData.token);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else window.location.href = redirectTo;
        }, 1500);
      }
    } catch (err: any) {
      if (step === 'credentials') {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-space-dark-950 text-white animate-fade-in relative overflow-auto">
      <Header onSignIn={() => {}} onGetStarted={onGetStarted || (() => {})} />
      
      {/* Immersive background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-harx-400/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-harx-alt-400/10 blur-[150px] rounded-full animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-20 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative z-10">
          {/* Left Side - Brand Section */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-between p-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative border-r border-white/10">
            <div className="absolute inset-0 bg-[length:32px_32px] opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)' }} />
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
              {isAlreadyLoggedIn ? (
                <div className="space-y-4 text-center">
                  <h2 className="text-xl font-bold text-white">Already Logged In</h2>
                  <p className="text-slate-400">Redirecting you to your dashboard...</p>
                  <div className="animate-spin h-8 w-8 border-4 border-harx-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : (
                <>
                  <div className="text-center mb-8 lg:text-left">
                    <h2 className="text-3xl font-extrabold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400 text-sm">Sign in to your account to continue.</p>
                  </div>

                  {step === 'credentials' && (
                    <div className="space-y-4">
                      <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-harx-400 transition-colors" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input-premium-glow"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-harx-400 transition-colors" />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="input-premium-glow"
                          placeholder="Enter your password"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            className="rounded border-slate-700 bg-slate-800 text-harx-500 focus:ring-harx-500 focus:ring-offset-slate-900 w-4 h-4"
                          />
                          <span className="text-sm text-slate-300">Remember me</span>
                        </label>
                        <button type="button" onClick={onForgotPassword} className="text-sm text-harx-400 font-medium hover:text-harx-300 transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    </div>
                  )}

                  {step === '2fa' && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {verificationMethod === 'email' ? 'Email Verification' : 'SMS Verification'}
                      </h2>
                      <p className="text-slate-400 text-sm mb-6">
                        {verificationMethod === 'email'
                          ? `We sent a 6-digit code to ${formData.email}. Enter it below.`
                          : 'We sent a 6-digit code to your phone. Enter it below.'}
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
                        {resendTimeout > 0 ? `Resend code in ${resendTimeout}s` : 'Resend verification code'}
                      </button>
                      {verificationMethod === 'email' && formData.phone && (
                        <button
                          type="button"
                          onClick={handleSwitchToSMS}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 text-sm text-harx-alt-450 hover:text-harx-alt-300 transition-colors"
                        >
                          <Phone className="h-4 w-4" /> Try SMS verification instead
                        </button>
                      )}
                      {verificationMethod === 'sms' && (
                        <button
                          type="button"
                          onClick={() => { setVerificationMethod('email'); setError(null); }}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 text-sm text-harx-alt-450 hover:text-harx-alt-300 mt-2 transition-colors"
                        >
                          <Mail className="h-4 w-4" /> Try Email verification instead
                        </button>
                      )}
                    </>
                  )}

                  {step === 'success' && (
                    <div className="space-y-4 text-center py-4">
                      <h2 className="text-2xl font-bold text-green-450">Login Successful!</h2>
                      <p className="text-slate-350">Redirecting to your dashboard...</p>
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
                          'Sign In'
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
                        'Verify'
                      )}
                    </button>
                  )}

                  {step === 'credentials' && (
                    <p className="text-center text-sm text-slate-400 mt-6 pt-4 border-t border-white/[0.06]">
                      Don&apos;t have an account?{' '}
                      <button type="button" onClick={onRegister} className="text-harx-400 font-semibold hover:text-harx-300 transition-colors">
                        Sign up
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
