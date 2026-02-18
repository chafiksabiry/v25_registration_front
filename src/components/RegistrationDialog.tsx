import React, { useState } from 'react';
import { Check, Lock, Mail, Phone, User, CheckCircle, Linkedin, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { handleLinkedInSignUp } from '../utils/Linkedin';

type Step = 'name' | 'email' | 'password' | 'phone' | 'terms' | 'verification' | 'success';

interface RegistrationDialogProps {
  onSignIn: () => void;
}

export default function RegistrationDialog({ onSignIn }: RegistrationDialogProps) {
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

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const validatePhone = (phone: string) => /^\+?[\d\s-]{10,}$/.test(phone);

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

            // Send verification email
            await auth.sendVerificationEmail(formData.email, RegisterResult.data.code);

            // Send OTP
            await auth.sendOTP(RegisterResult.data._id, formData.phone);

            setStep('verification');
          }
          break;

        case 'verification':
          if (!formData.emailOTP || !formData.phoneOTP) {
            newErrors.verification = 'Please enter both the email verification code and the OTP code';
          } else {
            setIsLoading(true);

            const emailVerificationResult = await auth.verifyEmail({
              email: formData.email,
              code: formData.emailOTP
            });
            if (emailVerificationResult.result.error) {
              newErrors.general = 'Invalid email verification code';
            } else {
              const storedUserId = localStorage.getItem('userId');
              if (!storedUserId) { newErrors.general = 'User ID not found in localStorage. Please try again.'; }
              else {
                const otpVerificationResult = await auth.verifyOTP(storedUserId, formData.phoneOTP);
                if (otpVerificationResult.error) {
                  newErrors.general = 'Invalid OTP. Please try again.';
                } else {
                  const accountVerificationResult = await auth.verifyAccount(storedUserId);
                  if (accountVerificationResult.success) {
                    setToken(emailVerificationResult.token);
                    setStep('success');
                    setShowProfilePrompt(true);
                    setTimeout(() => {
                      window.location.href = '/auth';
                    }, 1500);
                  } else {
                    newErrors.general = accountVerificationResult.message;
                  }
                }
              }
            }
          }
          break;
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-premium-gradient animate-fade-in relative overflow-hidden">

      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
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
              Start Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Journey Today</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Create an account to access premium tools, real-time analytics, and a community of professionals.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              <p className="text-slate-300 italic text-sm">"The most comprehensive platform for growth I've ever used."</p>
              <div className="mt-3 flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                <span className="text-xs font-semibold text-slate-200">Sarah J., Senior Manager</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="lg:col-span-3 bg-white p-8 lg:p-16 flex flex-col justify-center relative">

          <div className="max-w-md mx-auto w-full">
            {step !== 'success' && step !== 'name' && (
              <button onClick={goBack} className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            )}

            <div className="text-center mb-10 lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 'name' ? 'Create Account' :
                  step === 'email' ? 'Contact Details' :
                    step === 'password' ? 'Secure Account' :
                      step === 'phone' ? 'Phone Verification' :
                        step === 'terms' ? 'Final Step' :
                          step === 'verification' ? 'Verify Account' : 'Success'}
              </h2>
              <p className="text-gray-500">
                {step === 'name' ? 'Let\'s get to know you.' :
                  step === 'email' ? 'Where should we send updates?' :
                    step === 'password' ? 'Protect your account.' :
                      step === 'phone' ? 'For account security.' :
                        step === 'terms' ? 'Review our policies.' :
                          step === 'verification' ? 'Check your devices for codes.' :
                            'Account created successfully!'}
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 text-left">
                <p className="text-sm text-red-600 font-medium">{errors.general}</p>
              </div>
            )}

            <div className="space-y-6 animate-fade-in relative min-h-[300px]">

              {step === 'name' && (
                <div className="space-y-6">
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="input-premium"
                      placeholder="Full Name"
                      autoFocus
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm pl-2">{errors.name}</p>}

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-400 font-medium">Or sign up with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLinkedInSignUp}
                    className="w-full py-3 px-6 bg-[#0077b5] hover:bg-[#006097] text-white font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span>Sign up with LinkedIn</span>
                  </button>
                </div>
              )}

              {step === 'email' && (
                <div className="space-y-6">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-premium"
                      placeholder="Work Email"
                      autoFocus
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm pl-2">{errors.email}</p>}
                </div>
              )}

              {step === 'password' && (
                <div className="space-y-6">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-premium pr-12"
                      placeholder="Choose a strong password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 pl-2">Must be at least 8 characters with letters and numbers.</p>
                  {errors.password && <p className="text-red-500 text-sm pl-2">{errors.password}</p>}
                </div>
              )}

              {step === 'phone' && (
                <div className="space-y-6">
                  <div className="relative group">
                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-premium"
                      placeholder="+1 (555) 000-0000"
                      autoFocus
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm pl-2">{errors.phone}</p>}
                </div>
              )}

              {step === 'terms' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex items-start space-x-3">
                      <ShieldCheck className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        By creating an account, you agree to comply with our{' '}
                        <a href="#" className="text-blue-600 font-medium hover:underline">Terms of Service</a>{' '}
                        and acknowledge our{' '}
                        <a href="#" className="text-blue-600 font-medium hover:underline">Privacy Policy</a>.
                        We prioritize your data security.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5 transition-all"
                    />
                    <span className="text-gray-700 font-medium">I agree to the Terms & Conditions</span>
                  </label>
                  {errors.terms && <p className="text-red-500 text-sm pl-2">{errors.terms}</p>}
                </div>
              )}

              {step === 'verification' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Email Code (sent to {formData.email})</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.emailOTP}
                      onChange={(e) => setFormData({ ...formData, emailOTP: e.target.value.replace(/\D/g, '') })}
                      className="input-premium text-center tracking-widest text-lg font-bold"
                      placeholder="000 000"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">SMS Code (sent to {formData.phone})</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.phoneOTP}
                      onChange={(e) => setFormData({ ...formData, phoneOTP: e.target.value })}
                      className="input-premium text-center tracking-widest text-lg font-bold"
                      placeholder="000 000"
                    />
                  </div>
                  {errors.verification && <p className="text-red-500 text-sm pl-2">{errors.verification}</p>}
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
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Registration Successful!</h3>
                  <p className="text-gray-500">Redirecting to login...</p>
                  <div className="w-full max-w-xs bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-500 h-full w-full animate-[shimmer_1s_infinite]"></div>
                  </div>
                </div>
              )}

              {!isLoading && step === 'name' && (
                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                  <p className="text-gray-500 text-sm">
                    Already have an account?{' '}
                    <button onClick={onSignIn} className="text-blue-600 font-semibold hover:underline">
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
  );
}