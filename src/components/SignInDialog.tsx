import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, RefreshCw, Linkedin } from 'lucide-react';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
//import { sendVerificationEmail } from '../utils/aws';
import {handleLinkedInSignIn} from '../utils/Linkedin';
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
    verificationCode: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);

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
      await auth.resendVerification(formData.email);
      setResendTimeout(30); // 30 seconds cooldown
      setFormData(prev => ({ ...prev, verificationCode: '' }));
    } catch (err) {
      setError('Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
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
          console.log("result",result);
          const verification = await auth.sendVerificationEmail(formData.email, result.data.code);
          console.log("verification",verification);
          setStep('2fa');
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

        const resultverificationEmail = await auth.verifyEmail({
          email: formData.email,
          code: formData.verificationCode
        });
        if(resultverificationEmail.result.error) {
          setError('Invalid email verification code');
        } else {
          setToken(resultverificationEmail.token);
          setStep('success');
          setTimeout(() => {
            window.location.href = '/app2';
          }, 1500);
        }
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
                src="https://scontent.frba3-2.fna.fbcdn.net/v/t39.30808-1/467741355_452110527907673_4983439529100518747_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=110&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=-YE5FaXH0hcQ7kNvgE2nDHx&_nc_zt=24&_nc_ht=scontent.frba3-2.fna&_nc_gid=Ax-CIxXnWM_QdtmKEUcxH88&oh=00_AYAUcOFMQeSbLOljzwEKsJUhX6eN60ArhQthk2trelP6Uw&oe=6792D8A3"
                alt="HARX Logo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <h1 className="text-2xl font-bold text-gray-800">HARX</h1>
              <p className="text-sm text-gray-600">We inspire growth</p>
            </div>
          </div>

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
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
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
              <h2 className="text-2xl font-bold text-gray-800">Email Verification</h2>
              <p className="text-gray-600">We sent a 6-digit code to {formData.email}. Please enter it to complete the login process.</p>
              
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
                className={`w-full flex items-center justify-center space-x-2 text-sm ${
                  resendTimeout > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {resendTimeout > 0
                    ? `Resend code in ${resendTimeout}s`
                    : 'Resend verification code'}
                </span>
              </button>
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
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
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
              className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
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
        </div>
      </div>
    </div>
  );
}