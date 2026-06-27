import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: async (data: { fullName: string; email: string; password: string; phone: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verifyEmail: async (data: { email: string; code: string }) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  linkedInAuth: async (code: string) => {
    const response = await api.post('/auth/linkedin', { code });
    return response.data;
  },
  sendOTP: async (userId: string, phoneNumber: string) => {
    const response = await api.post('/auth/send-otp', {userId,phoneNumber});
    return response.data;
  },
  verifyOTP: async (userId: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', {userId,otp});
    return response.data;
  },
  verifyAccount: async (userId: string)=> {
    const response= await api.post('/auth/verify-account', {userId});
    return response.data;
  },
  generateVerificationCode: async (email: string) => {
    const response= await api.post('/auth/generate-verification-code',{ email });
    console.log("responseRecovery",response);
    return response.data;
  },
  changePassword: async (email: string, newPassword: string, recoveryToken?: string) => {
    const response = await api.post(
      '/auth/change-password',
      { email, newPassword },
      recoveryToken
        ? { headers: { Authorization: `Bearer ${recoveryToken}` } }
        : undefined
    );
    console.log("responsechangePassword", response);
    return response.data;
  },
  linkedinSignIn: async (code: string) => {
    const response= await api.post('/auth/signin/linkedin',{ code });
    console.log("responsSignInLinkedin",response);
    return response.data;
  },
  sendVerificationEmail: async (email: string, code: string) => {
    const response= await api.post('/auth/send-verification-email',{ email,code });
    console.log("responseSendVerificationEmail",response);
    return response.data;
  },
  checkFirstLogin: async (userId: string) => {
    const response = await api.post('/auth/check-first-login', { userId });
    return response.data;
  },
  checkUserType: async(userId: String) =>{
    const response = await api.post('/auth/check-user-type', { userId });
    return response.data;
  },
  changeUserType: async (userId: string, newType: 'company' | 'rep') => {
    const response = await api.post('/auth/change-user-type', { userId, newType });
    return response.data;
  }
};

export const adminApi = {
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/admin/login', data);
    return response.data;
  },
  stats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  users: async (params?: {
    page?: number;
    search?: string;
    limit?: number;
    typeUser?: string;
    verified?: string;
    onboardingStatus?: string;
    planName?: string;
  }) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  userDetail: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },
  updateFinancials: async (
    userId: string,
    payload: {
      target: 'company_minutes' | 'company_wallet' | 'rep_wallet';
      action: 'add' | 'set';
      amount: number;
      reason?: string;
    },
  ) => {
    const response = await api.patch(`/admin/users/${userId}/financials`, payload);
    return response.data;
  },
  walletOverview: async () => {
    const response = await api.get('/admin/wallet/overview');
    return response.data;
  },
  minutesPricing: async () => {
    const response = await api.get('/admin/pricing/minutes');
    return response.data;
  },
  updateMinutesPricing: async (payload: {
    minutePacks: Array<{
      label: string;
      minutes: number;
      priceCents: number;
      active?: boolean;
    }>;
    minutesCustomRateCents?: number;
  }) => {
    const response = await api.patch('/admin/pricing/minutes', payload);
    return response.data;
  },
  phoneLinePricing: async () => {
    const response = await api.get('/admin/pricing/phone-line');
    return response.data;
  },
  updatePhoneLinePricing: async (payload: {
    setupFeeEuros?: number;
    setupFeeCents?: number;
    currency?: string;
    trialDays?: number;
  }) => {
    const response = await api.patch('/admin/pricing/phone-line', payload);
    return response.data;
  },
  companyPlans: async () => {
    const response = await api.get('/admin/plans/company');
    return response.data;
  },
  updateCompanyPlan: async (
    planId: string,
    payload: {
      name?: string;
      price?: number;
      currency?: string;
      stripePriceId?: string;
      description?: string;
      features?: string[];
      isPopular?: boolean;
      maxGigs?: number;
      maxReps?: number;
    },
  ) => {
    const response = await api.patch(`/admin/plans/company/${planId}`, payload);
    return response.data;
  },
  repPlans: async () => {
    const response = await api.get('/admin/plans/rep');
    return response.data;
  },
  updateRepPlan: async (
    planId: string,
    payload: {
      name?: string;
      price?: number;
      currency?: string;
      stripePriceId?: string;
      description?: string;
      features?: string[];
      isActive?: boolean;
      sortOrder?: number;
    },
  ) => {
    const response = await api.patch(`/admin/plans/rep/${planId}`, payload);
    return response.data;
  },
};

export const publicPlansApi = {
  companyPlans: async () => {
    const response = await api.get('/plans/company');
    return response.data;
  },
  repPlans: async () => {
    const response = await api.get('/plans/rep');
    return response.data;
  },
};

export const files = {
  upload: async (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/files');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  togglePublic: async (id: string) => {
    const response = await api.patch(`/files/${id}/toggle-public`);
    return response.data;
  },
  
};