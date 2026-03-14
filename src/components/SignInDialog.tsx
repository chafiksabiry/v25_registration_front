import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, RefreshCw, Linkedin, Phone } from 'lucide-react';
import axios from 'axios';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import { handleLinkedInSignIn } from '../utils/Linkedin';
import { jwtDecode } from 'jwt-decode';

type SignInStep = 'credentials' | '2fa' | 'success';

interface SignInDialogProps {
  onRegister: () => void;
  onForgotPassword: () => void;
  onSuccess?: () => void;
}

export default function SignInDialog({ onRegister, onForgotPassword, onSuccess }: SignInDialogProps) {
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
      const checkFirstLogin = await auth.checkFirstLogin(userId);
      const checkUserType = await auth.checkUserType(userId);
      if (checkFirstLogin.isFirstLogin || checkUserType.userType == null) return '/app2';
      if (checkUserType.userType === 'company') {
        try {
          const { data: onboardingProgress } = await axios.get(
            `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${userId}/onboardingProgress`
          );
          if (onboardingProgress.currentPhase !== 4 ||
            !onboardingProgress.phases?.find((p: any) => p.id === 4)?.completed) {
            return '/app11';
          }
          return '/app7';
        } catch (e: any) {
          if (e.response?.status === 404) return '/app11';
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-premium-gradient animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-harx-400/20 blur-[100px] rounded-full animate-float" />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-harx-alt-400/20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-harx-100 p-8 lg:p-10 relative z-10">
        <div className="text-center mb-8">
          <div className="relative w-full max-w-[200px] mx-auto mb-4">
            <img
              src="/mascotte.png"
              alt="HARX Mascotte"
              className="w-full h-auto object-contain"
              loading="eager"
            />
            <div className="absolute -inset-2 bg-gradient-to-r from-harx-400/15 to-harx-alt-400/15 rounded-lg blur-lg -z-10" />
          </div>
          <img
            src={`${import.meta.env.VITE_FRONT_URL || ''}harx_ai_logo.jpeg`}
            alt="HARX Logo"
            className="h-10 w-10 rounded-xl object-cover mx-auto mb-2 border border-harx-100"
          />
          <h1 className="text-2xl font-bold bg-gradient-harx bg-clip-text text-transparent">HARX</h1>
          <p className="text-sm text-gray-500 mt-1">We inspire growth</p>
        </div>

        {isAlreadyLoggedIn ? (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold text-gray-800">Already Logged In</h2>
            <p className="text-gray-600">Redirecting you to your dashboard...</p>
            <div className="animate-spin h-8 w-8 border-4 border-harx-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <>
            {step === 'credentials' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Welcome Back</h2>
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-harx-500 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-premium"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-harx-500 transition-colors" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-premium"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                        className="rounded border-gray-300 text-harx-500 focus:ring-harx-500"
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button type="button" onClick={onForgotPassword} className="text-sm text-harx-600 font-medium hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === '2fa' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {verificationMethod === 'email' ? 'Email Verification' : 'SMS Verification'}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {verificationMethod === 'email'
                    ? `We sent a 6-digit code to ${formData.email}. Enter it below.`
                    : 'We sent a 6-digit code to your phone. Enter it below.'}
                </p>
                <div className="relative group mb-4">
                  <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-harx-500 transition-colors" />
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.verificationCode}
                    onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '') })}
                    className="input-premium text-center tracking-widest text-lg font-semibold"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimeout > 0 || isLoading}
                  className={`w-full flex items-center justify-center gap-2 text-sm mb-4 ${resendTimeout > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-harx-600 hover:text-harx-700'}`}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {resendTimeout > 0 ? `Resend code in ${resendTimeout}s` : 'Resend verification code'}
                </button>
                {verificationMethod === 'email' && formData.phone && (
                  <button
                    type="button"
                    onClick={handleSwitchToSMS}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 text-sm text-harx-alt-600 hover:text-harx-alt-700"
                  >
                    <Phone className="h-4 w-4" /> Try SMS verification instead
                  </button>
                )}
                {verificationMethod === 'sms' && (
                  <button
                    type="button"
                    onClick={() => { setVerificationMethod('email'); setError(null); }}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 text-sm text-harx-alt-600 hover:text-harx-alt-700 mt-2"
                  >
                    <Mail className="h-4 w-4" /> Try Email verification instead
                  </button>
                )}
              </>
            )}

            {step === 'success' && (
              <div className="space-y-4 text-center py-4">
                <h2 className="text-xl font-bold text-gray-800">Login Successful!</h2>
                <p className="text-gray-600">Redirecting to your dashboard...</p>
                <div className="animate-spin h-8 w-8 border-4 border-harx-500 border-t-transparent rounded-full mx-auto" />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mt-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {step === 'credentials' && (
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="btn-primary flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLinkedInSignIn}
                  className="w-full flex items-center justify-center gap-2 bg-[#0077b5] text-white py-3 px-4 rounded-xl hover:bg-[#006396] transition-colors shadow-sm"
                >
                  <Linkedin className="h-5 w-5" />
                  Sign in with LinkedIn
                </button>
              </div>
            )}

            {step === '2fa' && (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="btn-primary flex items-center justify-center mt-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Verify'
                )}
              </button>
            )}

            {step === 'credentials' && (
              <p className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={onRegister} className="text-harx-600 font-semibold hover:underline">
                  Sign up
                </button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
