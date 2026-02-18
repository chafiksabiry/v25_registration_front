import React, { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, RefreshCw, Linkedin, Phone, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import { handleLinkedInSignIn } from '../utils/Linkedin';
import { jwtDecode } from "jwt-decode";
import { Link } from 'react-router-dom';

type SignInStep = 'credentials' | '2fa' | 'success';

interface SignInDialogProps {
  onRegister: () => void;
  onForgotPassword: () => void;
}

export default function SignInDialog({ onRegister, onForgotPassword }: SignInDialogProps) {
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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkExistingUser = async () => {
      const userId = Cookies.get('userId');
      const hasRedirected = localStorage.getItem('hasRedirected');

      if (userId && !hasRedirected) {
        try {
          const checkFirstLogin = await auth.checkFirstLogin(userId);
          const checkUserType = await auth.checkUserType(userId);
          let redirectTo;

          if (checkFirstLogin.isFirstLogin || checkUserType.userType == null) {
            redirectTo = '/app2';
          } else if (checkUserType.userType === 'company') {
            try {
              const { data: onboardingProgress } = await axios.get(`${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${userId}/onboardingProgress`);
              if (onboardingProgress.currentPhase !== 4 ||
                !onboardingProgress.phases.find((phase: any) => phase.id === 4)?.completed) {
                redirectTo = '/app11';
              } else {
                redirectTo = '/app7';
              }
            } catch (error: any) {
              if (error.response && error.response.status === 404) {
                redirectTo = '/app11';
              } else {
                throw error;
              }
            }
          } else {
            //user type is rep
            try {
              const token = localStorage.getItem('token');
              const { data: profileData } = await axios.get(
                `${import.meta.env.VITE_REP_API_URL}/profiles/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Cookies.set('agentId', profileData._id);

              if (!profileData.isBasicProfileCompleted) {
                redirectTo = `${import.meta.env.VITE_REP_CREATION_PROFILE_URL}`;
              } else {
                redirectTo = (
                  profileData.onboardingProgress.phases.phase1.status === "completed" &&
                  profileData.onboardingProgress.phases.phase2.status === "completed" &&
                  profileData.onboardingProgress.phases.phase3.status === "completed" &&
                  profileData.onboardingProgress.phases.phase4.status === "completed"
                )
                  ? `${import.meta.env.VITE_REP_DASHBOARD_URL}`
                  : `${import.meta.env.VITE_REP_ORCHESTRATOR_URL}`;
              }
            } catch (error) {
              console.error('Error fetching rep profile:', error);
              redirectTo = `${import.meta.env.VITE_REP_CREATION_PROFILE_URL}`;
            }
          }

          setIsAlreadyLoggedIn(true);
          setRedirectPath(redirectTo);
          localStorage.setItem('hasRedirected', 'true');

          setTimeout(() => {
            window.location.href = redirectTo;
          }, 2000);
        } catch (error) {
          console.error('Error checking user type:', error);
          localStorage.removeItem('hasRedirected');
        }
      }
    };

    checkExistingUser();
    return () => {
      localStorage.removeItem('hasRedirected');
    };
  }, []);

  useEffect(() => {
    let timer: number;
    if (resendTimeout > 0) {
      timer = window.setInterval(() => {
        setResendTimeout(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimeout]);

  const handleOtpChange = (index: number, value: string) => {
    const currentCode = formData.verificationCode || '';
    let newCodeArray = currentCode.padEnd(6, ' ').split('');

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).replace(/\D/g, '');
      setFormData(prev => ({ ...prev, verificationCode: pastedCode }));
      return;
    }

    newCodeArray[index] = value;
    const newCode = newCodeArray.join('').trim();
    setFormData(prev => ({ ...prev, verificationCode: newCode }));

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!formData.verificationCode[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleResendOTP = async () => {
    if (resendTimeout > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      await auth.resendVerification(formData.email);
      setResendTimeout(30);
      setFormData(prev => ({ ...prev, verificationCode: '' }));
    } catch (err) {
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
      setFormData(prev => ({ ...prev, verificationCode: '' }));
    } catch (err) {
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

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (step === 'credentials') {
        if (!formData.email || !formData.password) {
          setError('Please enter both email and password.');
          return;
        }

        try {
          const result = await auth.login({ email: formData.email, password: formData.password });
          setFormData(prev => ({
            ...prev,
            userId: result.data.userId,
            phone: result.data.phone
          }));
          await auth.sendVerificationEmail(formData.email, result.data.code);
          setStep('2fa');
          setVerificationMethod('email');
          setResendTimeout(30);
        } catch (err) {
          setError('Invalid email or password. Please try again.');
          return;
        }
      } else if (step === '2fa') {
        if (formData.verificationCode.length !== 6) {
          setError('Please enter a valid verification code.');
          return;
        }

        let resultData;
        if (verificationMethod === 'email') {
          const resultverificationEmail = await auth.verifyEmail({
            email: formData.email,
            code: formData.verificationCode
          });
          if (resultverificationEmail.result.error) {
            setError('Invalid email verification code');
            setIsLoading(false);
            return;
          }
          resultData = resultverificationEmail;
        } else {
          const resultOTP = await auth.verifyOTP(formData.userId, formData.verificationCode);
          if (resultOTP.error) {
            setError('Invalid SMS verification code');
            setIsLoading(false);
            return;
          }
          resultData = resultOTP;
        }

        const decoded: any = jwtDecode(resultData.token);
        const userId = decoded.userId;
        setToken(resultData.token);
        localStorage.setItem('token', resultData.token);
        Cookies.set('userId', userId);

        setStep('success');

        const checkFirstLogin = await auth.checkFirstLogin(userId);
        const checkUserType = await auth.checkUserType(userId);
        let redirectTo;

        if (checkFirstLogin.isFirstLogin || checkUserType.userType == null) {
          redirectTo = '/app2';
        } else if (checkUserType.userType === 'company') {
          try {
            const { data: onboardingProgress } = await axios.get(`${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${userId}/onboardingProgress`);
            if (onboardingProgress.currentPhase !== 4 ||
              !onboardingProgress.phases.find((phase: any) => phase.id === 4)?.completed) {
              redirectTo = '/app11';
            } else {
              redirectTo = '/app7';
            }
          } catch (error: any) {
            if (error.response && error.response.status === 404) {
              redirectTo = '/app11';
            } else {
              throw error;
            }
          }
        } else {
          try {
            const { data: profileData } = await axios.get(
              `${import.meta.env.VITE_REP_API_URL}/profiles/${userId}`,
              { headers: { Authorization: `Bearer ${resultData.token}` } }
            );
            Cookies.set('agentId', profileData._id);

            if (!profileData.isBasicProfileCompleted) {
              redirectTo = `${import.meta.env.VITE_REP_CREATION_PROFILE_URL}`;
            } else {
              redirectTo = (
                profileData.onboardingProgress.phases.phase1.status === "completed" &&
                profileData.onboardingProgress.phases.phase2.status === "completed" &&
                profileData.onboardingProgress.phases.phase3.status === "completed" &&
                profileData.onboardingProgress.phases.phase4.status === "completed"
              )
                ? `${import.meta.env.VITE_REP_DASHBOARD_URL}`
                : `${import.meta.env.VITE_REP_ORCHESTRATOR_URL}`;
            }
          } catch (error) {
            console.error('Error fetching rep profile:', error);
            redirectTo = `${import.meta.env.VITE_REP_CREATION_PROFILE_URL}`;
          }
        }
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-premium-gradient animate-fade-in relative overflow-hidden">

      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-float"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-indigo-600/20 blur-[130px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10 min-h-[700px]">

        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex lg:col-span-2 flex-col justify-between p-12 bg-gradient-to-b from-slate-900/80 to-slate-900/40 text-white relative">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:32px_32px]"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-12">
              <img
                src={`${import.meta.env.VITE_FRONT_URL}harx_ai_logo.jpeg`}
                alt="HARX Logo"
                className="h-10 w-10 rounded-lg shadow-lg border border-white/10"
              />
              <span className="text-xl font-bold tracking-tight">HARX<span className="text-blue-400">.AI</span></span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-6">
              Welcome to the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Professional Growth</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Join our ecosystem and unlock your potential with AI-driven tools designed for success.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                Operational Systems Online
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="lg:col-span-3 bg-white p-8 lg:p-16 flex flex-col justify-center relative">

          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-10 lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 'credentials' ? 'Sign in to your account' : step === '2fa' ? 'Verify Identity' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500">
                {step === 'credentials' ? 'Enter your details ensuring security.' : step === '2fa' ? 'We sent a code to your device.' : 'Logging you in...'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 animate-fade-in text-left">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {isAlreadyLoggedIn ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <>
                {step === 'credentials' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-4">
                      <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input-premium"
                          placeholder="Email address"
                        />
                      </div>

                      <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="input-premium pr-12"
                          placeholder="Password"
                        />
                        {formData.password.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 transition-all"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                      </label>

                      <button
                        onClick={onForgotPassword}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      onClick={handleSignIn}
                      disabled={isLoading}
                      className={`btn-primary flex items-center justify-center space-x-2 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
                      </div>
                    </div>

                    <button
                      onClick={handleLinkedInSignIn}
                      className="w-full py-3 px-6 bg-[#0077b5] hover:bg-[#006097] text-white font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span>Sign in with LinkedIn</span>
                    </button>
                  </div>
                )}

                {step === '2fa' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        {verificationMethod === 'email' ? <Mail className="h-8 w-8 text-blue-600" /> : <Phone className="h-8 w-8 text-blue-600" />}
                      </div>
                      <p className="text-center text-gray-600 max-w-xs mx-auto">
                        {verificationMethod === 'email'
                          ? `We sent a 6-digit code to ${formData.email}`
                          : `We sent a 6-digit code to your phone end with ${formData.phone.slice(-4)}`}
                      </p>
                    </div>

                    <div className="flex justify-between gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={6}
                          value={formData.verificationCode[index] || ''}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 border border-gray-200 rounded-xl text-center text-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm focus:shadow-md bg-gray-50"
                          placeholder="•"
                        />
                      ))}
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleSignIn}
                        disabled={isLoading}
                        className="btn-primary"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                        ) : (
                          'Verify & Continue'
                        )}
                      </button>

                      <button
                        onClick={handleResendOTP}
                        disabled={resendTimeout > 0 || isLoading}
                        className={`w-full flex items-center justify-center space-x-2 text-sm font-medium transition-colors ${resendTimeout > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{resendTimeout > 0 ? `Resend code in ${resendTimeout}s` : 'Resend verification code'}</span>
                      </button>

                      {verificationMethod === 'email' && formData.phone && (
                        <button onClick={handleSwitchToSMS} className="text-sm text-gray-500 hover:text-gray-800 w-full text-center underline decoration-gray-300">
                          Try SMS verification instead
                        </button>
                      )}
                      {verificationMethod === 'sms' && (
                        <button onClick={() => { setVerificationMethod('email'); setError(null); }} className="text-sm text-gray-500 hover:text-gray-800 w-full text-center underline decoration-gray-300">
                          Try Email verification instead
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {step === 'success' && (
                  <div className="flex flex-col items-center justify-center space-y-6 py-10 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Login Successful</h3>
                    <p className="text-gray-500">Redirecting to your dashboard...</p>
                    <div className="w-full max-w-xs bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-green-500 h-full w-full animate-[shimmer_1s_infinite]"></div>
                    </div>
                  </div>
                )}
              </>
            )}

            {!isAlreadyLoggedIn && step === 'credentials' && (
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  Don't have an account?{' '}
                  <button onClick={onRegister} className="text-blue-600 font-semibold hover:underline">
                    Sign up now
                  </button>
                </p>
              </div>
            )}

            <div className="mt-8 text-center lg:hidden">
              <p className="text-xs text-gray-400">© 2026 HARX Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}