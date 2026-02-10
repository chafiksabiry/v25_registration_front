import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, RefreshCw, Linkedin, Phone, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
//import { sendVerificationEmail } from '../utils/aws';
import Cookies from 'js-cookie';
import { handleLinkedInSignIn } from '../utils/Linkedin';
import { jwtDecode } from "jwt-decode";

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
  const [isRedirecting, setIsRedirecting] = useState(false);
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
              console.log("onboardingProgress", onboardingProgress);
              if (onboardingProgress.currentPhase !== 4 ||
                !onboardingProgress.phases.find((phase: any) => phase.id === 4)?.completed) {
                console.log("we are here to redirect to orchestrator");
                redirectTo = '/app11';
              } else {
                redirectTo = '/app7';
              }
            } catch (error: any) {
              // If 404 (No progress found), redirect to start of onboarding
              if (error.response && error.response.status === 404) {
                console.log("No onboarding progress found (New User) -> Redirecting to Wizard Start");
                redirectTo = '/app11';
              } else {
                throw error;
              }
            }
          } else {
            //user type is rep
            try {
              const token = localStorage.getItem('token'); // Get token from localStorage
              console.log('Rep API URL:', import.meta.env.VITE_REP_API_URL);
              console.log('Rep Orchestrator URL:', import.meta.env.VITE_REP_ORCHESTRATOR_URL);
              console.log('Rep Creation Profile URL:', import.meta.env.VITE_REP_CREATION_PROFILE_URL);
              console.log('Rep Dashboard URL:', import.meta.env.VITE_REP_DASHBOARD_URL);

              const { data: profileData } = await axios.get(
                `${import.meta.env.VITE_REP_API_URL}/profiles/${userId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              console.log('profileData', profileData);
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
              console.log('Selected redirect URL:', redirectTo);
            } catch (error) {
              console.error('Error fetching rep profile:', error);
              // If there's an error fetching the profile, default to profile creation
              redirectTo = `${import.meta.env.VITE_REP_CREATION_PROFILE_URL}`;
            }
          }

          setIsAlreadyLoggedIn(true);
          setRedirectPath(redirectTo);
          localStorage.setItem('hasRedirected', 'true');

          // Redirect after showing the message for 2 seconds
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

    // Cleanup function to remove the redirect flag when component unmounts
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

  const handleResendOTP = async () => {
    if (resendTimeout > 0) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await auth.resendVerification(formData.email);
      console.log("Resend response:", response);
      console.log("RESENT VERIFICATION CODE:", response.data?.code);
      setResendTimeout(30); // 30 seconds cooldown
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
      setVerificationMethod('email'); // Revert if failed
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
          console.log("result", result);

          // Store userId and phone from response
          setFormData(prev => ({
            ...prev,
            userId: result.data.userId,
            phone: result.data.phone
          }));

          console.log("LOGIN VERIFICATION CODE:", result.data?.code);
          const verification = await auth.sendVerificationEmail(formData.email, result.data.code);
          console.log("verification", verification);
          setStep('2fa');
          setVerificationMethod('email'); // Reset to email default
          setResendTimeout(30); // Set initial cooldown
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
          // SMS Verification
          const resultOTP = await auth.verifyOTP(formData.userId, formData.verificationCode);
          if (resultOTP.error) {
            setError('Invalid SMS verification code');
            setIsLoading(false);
            return;
          }
          resultData = resultOTP;
        }

        // Decode the token to get the payload
        const decoded: any = jwtDecode(resultData.token);
        // Assuming userId is in the payload, like: { userId: "12345", ... }
        const userId = decoded.userId;
        setToken(resultData.token);
        localStorage.setItem('token', resultData.token); // Store token in localStorage
        Cookies.set('userId', userId); // Save only the userId
        console.log("userId", Cookies.get('userId'));
        setStep('success');
        const checkFirstLogin = await auth.checkFirstLogin(userId);
        console.log("checkFirstLogin", checkFirstLogin);
        const checkUserType = await auth.checkUserType(userId);
        console.log("checkUserType", checkUserType);
        let redirectTo;
        if (checkFirstLogin.isFirstLogin || checkUserType.userType == null) {
          redirectTo = '/app2';
        } else if (checkUserType.userType === 'company') {
          try {
            const { data: onboardingProgress } = await axios.get(`${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${userId}/onboardingProgress`);
            console.log("onboardingProgress", onboardingProgress);
            if (onboardingProgress.currentPhase !== 4 ||
              !onboardingProgress.phases.find((phase: any) => phase.id === 4)?.completed) {
              console.log("we are here to redirect to orchestrator");
              redirectTo = '/app11';

            } else {
              redirectTo = '/app7';
            }
          } catch (error: any) {
            // If 404, it means onboarding hasn't started -> redirect to orchestrator
            if (error.response && error.response.status === 404) {
              console.log("Onboarding progress not found, redirecting to orchestrator");
              redirectTo = '/app11';
            } else {
              throw error;
            }
          }
        } else {
          // User type is rep
          try {
            console.log('Rep API URL:', import.meta.env.VITE_REP_API_URL);
            console.log('Rep Orchestrator URL:', import.meta.env.VITE_REP_ORCHESTRATOR_URL);
            console.log('Rep Creation Profile URL:', import.meta.env.VITE_REP_CREATION_PROFILE_URL);
            console.log('Rep Dashboard URL:', import.meta.env.VITE_REP_DASHBOARD_URL);

            const { data: profileData } = await axios.get(
              `${import.meta.env.VITE_REP_API_URL}/profiles/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${resultData.token}`
                }
              }
            );
            console.log('profileData', profileData);
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
            console.log('Selected redirect URL:', redirectTo);
          } catch (error) {
            console.error('Error fetching rep profile:', error);
            // If there's an error fetching the profile, default to profile creation
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <img
                src={`${import.meta.env.VITE_FRONT_URL}harx_ai_logo.jpeg`}
                alt="HARX Logo"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <h1 className="text-2xl font-bold text-gray-800">HARX</h1>
              <p className="text-sm text-gray-600">We inspire growth</p>
            </div>
          </div>

          {isAlreadyLoggedIn ? (
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Already Logged In</h2>
              <p className="text-gray-600">You are already logged in. Redirecting you to your dashboard...</p>
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <>
              {step === 'credentials' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>

                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Remember me</span>
                      </label>

                      <button
                        onClick={onForgotPassword}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === '2fa' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {verificationMethod === 'email' ? 'Email Verification' : 'SMS Verification'}
                  </h2>
                  <p className="text-gray-600">
                    {verificationMethod === 'email'
                      ? `We sent a 6-digit code to ${formData.email}. Please enter it to complete the login process.`
                      : `We sent a 6-digit code to your phone. Please enter it to complete the login process.`}
                  </p>

                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.verificationCode}
                      onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter 6-digit code"
                    />
                  </div>

                  <button
                    onClick={handleResendOTP}
                    disabled={resendTimeout > 0 || isLoading}
                    className={`w-full flex items-center justify-center space-x-2 text-sm ${resendTimeout > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                      }`}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>
                      {resendTimeout > 0
                        ? `Resend code in ${resendTimeout}s`
                        : 'Resend verification code'}
                    </span>
                  </button>

                  {verificationMethod === 'email' && formData.phone && (
                    <div className="text-center mt-2">
                      <button
                        onClick={handleSwitchToSMS}
                        disabled={isLoading}
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center w-full gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Try SMS verification instead</span>
                      </button>
                    </div>
                  )}
                  {verificationMethod === 'sms' && (
                    <button
                      onClick={() => { setVerificationMethod('email'); setError(null); }}
                      disabled={isLoading}
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center w-full gap-2 mt-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Try Email verification instead</span>
                    </button>
                  )}
                </div>
              )}

              {step === 'success' && (
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">Login Successful!</h2>
                  <p className="text-gray-600">Redirecting to dashboard...</p>
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {step === 'credentials' && (
                <div className="space-y-4">
                  <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                  >
                    {isLoading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLinkedInSignIn}
                    className="w-full flex items-center justify-center space-x-2 bg-[#0077b5] text-white py-3 px-4 rounded-lg hover:bg-[#006396] transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span>Sign in with LinkedIn</span>
                  </button>
                </div>
              )}

              {step === '2fa' && (
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    'Verify'
                  )}
                </button>
              )}

              {step === 'credentials' && (
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={onRegister}
                    className="text-blue-600 hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}