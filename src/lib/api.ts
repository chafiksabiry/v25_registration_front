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
  changePassword: async (email: string, newPassword: string ) => {
    const response= await api.post('/auth/change-password',{ email,newPassword});
    console.log("responsechangePassword",response);
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
  }
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