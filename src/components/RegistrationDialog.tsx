import React, { useState } from 'react';
import { Check, Lock, Mail, Phone, User, CheckCircle,Linkedin } from 'lucide-react';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { sendVerificationEmail } from '../utils/aws';
import {handleLinkedInSignUp} from '../utils/Linkedin';
import Cookies from 'js-cookie';
type Step = 'name' | 'email' | 'password' | 'phone' | 'terms' | 'verification' | 'success';

interface RegistrationDialogProps {
  onSignIn: () => void;
}
const storedUserId = localStorage.getItem('userId');
console.log('Stored userId:', storedUserId);
export default function RegistrationDialog({ onSignIn }: RegistrationDialogProps) {
  const { setToken } = useAuth();
  const [step, setStep] = useState<Step>('name');
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
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

 
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  };

  const validatePhone = (phone: string) => {
    return /^\+?[\d\s-]{10,}$/.test(phone);
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
            
            // Register User
            const RegisterResult = await auth.register({
              fullName: formData.fullName,
              email: formData.email,
              password: formData.password,
              phone: formData.phone
            });
  
            if (RegisterResult && RegisterResult.data) {
              console.log("RegisterResult", RegisterResult);
              Cookies.set('userId', RegisterResult.data._id, { expires: 7, domain: 'harx.ai' }); // Expire dans 7 jours
              const storedUserId = Cookies.get('userId');
              console.log('Stored userId from cookie:', storedUserId);
              // Send verification email
              const verificationMail = await sendVerificationEmail(formData.email, RegisterResult.data.code);
              console.log("verification", verificationMail);
  
              // Send OTP
              const OtpSendResult = await auth.sendOTP(RegisterResult.data._id, formData.phone);
              console.log("OtpSendResult::", OtpSendResult);
  
              setStep('verification');
            } else {
              newErrors.general = 'Registration failed, please try again later';
            }
          }
          break;
  
        case 'verification':
          // Vérifier que l'utilisateur a entré un code de vérification pour l'email et l'OTP
          if (!formData.emailOTP || !formData.phoneOTP) {
            newErrors.verification = 'Please enter both the email verification code and the OTP code';
          } else {
            setIsLoading(true);
  
            // Vérifier l'email
            const emailVerificationResult = await auth.verifyEmail({
              email: formData.email,
              code: formData.emailOTP
            });
           console.log("emailVerificationResult",emailVerificationResult);
            if (emailVerificationResult.result.error) {
              newErrors.general = 'Invalid email verification code';
            } else {
              console.log("Email verification success");
  
              // Vérifier l'OTP
              const storedUserId = localStorage.getItem('userId');
              console.log('Stored userId:', storedUserId);

              if(!storedUserId){ newErrors.general = 'User ID not found in localStorage. Please try again.';}

              else{

              const otpVerificationResult = await auth.verifyOTP(storedUserId, formData.phoneOTP);
              console.log("otpVerificationResult.error",otpVerificationResult.error);

              if (otpVerificationResult.error) {
                newErrors.general = 'Invalid OTP. Please try again.';
              } else {
                console.log("OTP verification success");
  
                // Vérifier et activer le compte si tout est correct
                const accountVerificationResult = await auth.verifyAccount(storedUserId);
                if (accountVerificationResult.success) {
                  console.log("Account verification success");
  
                  // Tout est validé, envoyer le token et rediriger
                  setToken(emailVerificationResult.token);
                  setStep('success');
                  setShowProfilePrompt(true);
  
                  setTimeout(() => {
                    window.location.href = '/choicepage';
                  }, 1500);
                } else {
                  newErrors.general = accountVerificationResult.message;
                }
              }
              }
            }
          }
          break;
  
        default:
          break;
      }
    } catch (err) {
      newErrors.general = err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      setIsLoading(false);
      setErrors(newErrors);
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

          {step === 'name' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Welcome to HARX!</h2>
              <p className="text-gray-600">What is your first and last name?</p>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Thank you, {formData.fullName}!</h2>
              <p className="text-gray-600">What is your professional email address to create your account?</p>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@company.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Create a Password</h2>
              <p className="text-gray-600">Please create a secure password</p>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Phone Number</h2>
              <p className="text-gray-600">What is your phone number? (Mandatory for account security and notifications)</p>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
          )}

          {step === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Terms & Conditions</h2>
              <p className="text-gray-600">Please review and accept our Terms and Conditions and Privacy Policy to proceed.</p>
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-1"
                />
                <p className="text-sm text-gray-600">
                  I have read and agree to the{' '}
                  <a href="#" className="text-blue-500 hover:underline">Terms and Conditions</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
                </p>
              </div>
              {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
            </div>
          )}

          {step === 'verification' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Verify Your Account</h2>
              <p className="text-gray-600">We sent a verification code to {formData.email}. Please enter it below.</p>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={formData.emailOTP}
                  onChange={(e) => setFormData({ ...formData, emailOTP: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter 6-digit code"
                />
              </div>
              <div>
                  <p className="text-gray-600 mb-2">Enter the 6-digit code sent to your phone</p>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.phoneOTP}
                    onChange={(e) => setFormData({ ...formData, phoneOTP: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="000000"
                  />
                </div>
                {errors.verification && <p className="text-red-500 text-sm">{errors.verification}</p>}

            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Registration Successful!</h2>
                <p className="text-gray-600">Your account has been created successfully!</p>
                {showProfilePrompt && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 font-medium">Redirecting to dashboard...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {errors.general && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">
              <p className="text-sm">{errors.general}</p>
            </div>
          )}

          <div className="space-y-4">
            {step !== 'success' && (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <span>Continue</span>
                    <Check className="h-5 w-5" />
                  </>
                )}
              </button>
            )}
            
            {step === 'name' && (
                 <>
                       <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              <button
                onClick={handleLinkedInSignUp}
                className="w-full flex items-center justify-center space-x-2 bg-[#0077b5] text-white py-3 px-4 rounded-lg hover:bg-[#006396] transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>Sign up with LinkedIn</span>
              </button><p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={onSignIn}
                    className="text-blue-600 hover:underline"
                  >
                    Sign in
                  </button>
                </p></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}