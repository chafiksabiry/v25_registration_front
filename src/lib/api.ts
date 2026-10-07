import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

if (!API_URL) {
  console.error(
    '[registration] VITE_API_URL is missing — API calls will hit the Netlify SPA and silently fail'
  );
}

const api = axios.create({
  baseURL: API_URL || undefined,
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

  checkEmail: async (email: string) => {
    const response = await api.post('/auth/check-email', { email });
    return response.data as { available: boolean; message?: string };
  },

  checkPhone: async (phone: string) => {
    const response = await api.post('/auth/check-phone', { phone });
    return response.data as { available: boolean; message?: string };
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
    try {
      const response = await api.post('/auth/verify-otp', { userId, otp });
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error
        || 'Failed to verify OTP';
      return { error: true, message };
    }
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
  changeUserType: async (
    userId: string,
    newType: 'company' | 'rep' | 'call-center'
  ) => {
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
      target:
        | 'company_minutes'
        | 'company_wallet'
        | 'company_ai_tokens'
        | 'company_ai_providers'
        | 'rep_wallet';
      action?: 'add' | 'set';
      amount?: number;
      reason?: string;
      providers?: {
        openai?: boolean;
        anthropic?: boolean;
        gemini?: boolean;
      };
      aiProviders?: {
        openai?: boolean;
        anthropic?: boolean;
        gemini?: boolean;
      };
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
  objectives: async () => {
    const response = await api.get('/admin/objectives');
    return response.data;
  },
  updateObjectives: async (payload: {
    year?: number;
    companies?: number | null;
    repsOnboarded?: number | null;
    repsWithActiveSubscription?: number | null;
    annualRevenue?: number | null;
    annualProfit?: number | null;
    notes?: string;
  }) => {
    const response = await api.patch('/admin/objectives', payload);
    return response.data;
  },
  onboardingSatisfaction: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    scoredOnly?: boolean;
  }) => {
    const response = await api.get('/admin/onboarding-satisfaction', { params });
    return response.data;
  },
};

function metaLookup(meta: Record<string, unknown>, ...candidates: string[]): unknown {
  const normalize = (s: string) => s.toLowerCase().replace(/[_\s-]+/g, '');
  const wanted = candidates.map(normalize);
  const entries = Object.entries(meta).map(([k, v]) => [normalize(k), v] as const);
  for (const w of wanted) {
    for (const [nk, value] of entries) {
      if (nk === w) return value;
    }
  }
  for (const w of wanted) {
    for (const [nk, value] of entries) {
      if (nk.startsWith(w) || w.startsWith(nk)) return value;
    }
  }
  return undefined;
}

/** Prefers Stripe Catalog features; prepends quota bullets from product metadata when missing. */
function mapStripeCompanyPlan(p: Record<string, unknown>) {
  const meta =
    p.metadata && typeof p.metadata === 'object'
      ? (p.metadata as Record<string, unknown>)
      : {};
  const features = Array.isArray(p.features) ? p.features.map(String) : [];
  const hasActiveGigs = features.some((f) => /^active\s+gigs?\b/i.test(f));
  const hasActiveReps = features.some((f) => /^active\s+reps?\b/i.test(f));

  const maxGigs = Number(
    p.maxGigs ?? metaLookup(meta, 'ACTIVE GIGS', 'active_gigs', 'max_gigs')
  );
  const maxReps = Number(
    p.maxReps ?? metaLookup(meta, 'ACTIVE REPS', 'active_reps', 'max_reps')
  );
  const minutes = Number(
    p.communicationMinutes ??
      metaLookup(meta, 'COMMUNICATION MINUTES', 'communication_minutes')
  );
  const localNumbers = Number(
    p.activeLocalNumbers ??
      metaLookup(meta, 'ACTIVE LOCAL NUMBER', 'ACTIVE LOCAL NUMBERS')
  );
  const aiToken = String(
    p.aiToken ?? metaLookup(meta, 'AI TOKEN', 'ai_token') ?? ''
  ).trim();

  const quotas: string[] = [];
  if (!hasActiveGigs && Number.isFinite(maxGigs) && maxGigs >= 0) {
    quotas.push(`Active GIGs: ${maxGigs}`);
  }
  if (!hasActiveReps && Number.isFinite(maxReps) && maxReps >= 0) {
    quotas.push(`Active REPs: ${maxReps}`);
  }
  if (
    Number.isFinite(minutes) &&
    minutes >= 0 &&
    !features.some((f) => /communication\s+minutes/i.test(f))
  ) {
    quotas.push(`Communication minutes: ${minutes}`);
  }
  if (
    Number.isFinite(localNumbers) &&
    localNumbers >= 0 &&
    !features.some((f) => /local\s+number/i.test(f))
  ) {
    quotas.push(`Active local numbers: ${localNumbers}`);
  }
  if (aiToken && !features.some((f) => /ai\s+token/i.test(f))) {
    quotas.push(`AI tokens: ${aiToken}`);
  }

  return {
    id: String(p._id ?? p.id ?? ''),
    name: String(p.name ?? ''),
    description: String(p.description ?? ''),
    price: Number(p.price),
    priceCents: p.priceCents,
    currency: String(p.currency || 'eur').toLowerCase(),
    features: [...quotas, ...features],
    popular: Boolean(p.isPopular ?? p.popular),
    maxGigs: Number.isFinite(maxGigs) ? maxGigs : undefined,
    maxReps: Number.isFinite(maxReps) ? maxReps : undefined,
    metadata: meta,
  };
}

export const publicPlansApi = {
  companyPlans: async () => {
    // Prefer company orchestrator — live Stripe Catalog (marketing_features + description).
    const companyBack = (
      import.meta.env.VITE_COMPORCHESTRATOR_BACK_URL ||
      import.meta.env.VITE_COMPANY_ORCHESTRATOR_URL ||
      'https://v25comporchestratorback-production.up.railway.app'
    ).replace(/\/$/, '');
    try {
      const response = await axios.get(`${companyBack}/api/subscriptions/plans`, {
        timeout: 15000,
      });
      const plans = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.plans)
          ? response.data.plans
          : [];
      if (plans.length) {
        return {
          success: true,
          data: {
            plans: plans.map((p: Record<string, unknown>) => mapStripeCompanyPlan(p)),
          },
        };
      }
    } catch (err) {
      console.warn('[pricing] company Stripe plans fetch failed, falling back to registration API', err);
    }
    const response = await api.get('/plans/company');
    return response.data;
  },
  repPlans: async () => {
    const response = await api.get('/plans/rep');
    return response.data;
  },
};

export const newsletter = {
  subscribe: async (data: { email: string; locale?: string }) => {
    if (!API_URL) {
      throw new Error('VITE_API_URL is not configured');
    }
    const response = await api.post('/newsletter/subscribe', data);
    const payload = response.data;
    // Guard against Netlify SPA fallback (HTML 200) or unexpected payloads
    if (
      !payload ||
      typeof payload !== 'object' ||
      payload.success !== true ||
      !payload.data?.email
    ) {
      throw new Error('Invalid newsletter subscribe response');
    }
    return payload as {
      success: boolean;
      message?: string;
      data: { email: string; created: boolean };
    };
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