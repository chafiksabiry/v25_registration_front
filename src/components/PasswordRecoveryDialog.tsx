import React, { useState } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import { auth } from '../lib/api';
//import { sendVerificationEmail } from '../utils/aws';

type RecoveryStep = 'email' | 'verification' | 'new-password' | 'success';

interface PasswordRecoveryDialogProps {
  onBack: () => void;
}

export default function PasswordRecoveryDialog({ onBack }: PasswordRecoveryDialogProps) {
  const [step, setStep] = useState<RecoveryStep>('email');
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);

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
          console.log("verificationCode", verificationCode);
          const verification = await auth.sendVerificationEmail(formData.email, verificationCode.verificationCode);
          console.log("verificationRECOVERY", verification);
          setStep('verification');
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
            code: formData.verificationCode
          });
          console.log("resultverificationEmail", resultverificationEmail);
          if (resultverificationEmail.result && resultverificationEmail.result.error) {
            setError('Invalid email verification code');
          } else if (resultverificationEmail.token) {
            // Store token to authorize changePassword
            localStorage.setItem('token', resultverificationEmail.token);
            setStep('new-password');
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
        try {
          const changepassword = await auth.changePassword(formData.email, formData.confirmPassword);
          console.log("changepassword", changepassword);
          setStep('success');
        } catch (err: any) {
          setError(err.message || 'Failed to reset password');
        }
        break;

      case 'success':
        onBack();
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-custom flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 md:p-8 relative shadow-2xl border border-gray-100 card-hover">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex flex-col items-center mb-4">
              <img
                src={`${import.meta.env.VITE_FRONT_URL}harx_ai_logo.jpeg`}
                alt="HARX Logo"
                className="h-14 w-14 rounded-2xl object-cover shadow-lg mb-3"
              />
              <h1 className="text-3xl font-bold text-gray-900">HARX</h1>
              <p className="text-gray-500 font-medium tracking-wide">We inspire growth</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 mb-4">
            {step === 'email' && (
              <div className="space-y-4">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
                  <p className="text-gray-600">Enter your registered email to reset your password.</p>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            {step === 'verification' && (
              <div className="space-y-4 text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
                <p className="text-gray-600 leading-relaxed">
                  We sent a 6-digit code to <span className="font-semibold text-blue-600">{formData.email}</span>. Please enter it below.
                </p>

                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.verificationCode}
                    onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all tracking-[0.5em] text-center font-bold text-lg"
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
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="New password"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Confirm new password"
                    />
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
                onClick={onBack}
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
