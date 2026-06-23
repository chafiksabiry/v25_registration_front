/** Stripe Pricing Table IDs — must match pk_live publishable key environment. */
export const COMPANY_PRICING_TABLE_ID =
  (import.meta.env.VITE_STRIPE_COMPANY_PRICING_TABLE_ID as string | undefined) ||
  (import.meta.env.VITE_STRIPE_PRICING_TABLE_ID as string | undefined) ||
  'prctbl_1TDNBOPJXYVCMk8pdPIA3s0k';

export const REP_PRICING_TABLE_ID =
  (import.meta.env.VITE_STRIPE_REP_PRICING_TABLE_ID as string | undefined) ||
  'prctbl_1Tik6uPJXYVCMk8p9YtkUCsb';

export const STRIPE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_STRIPE_PRICING_TABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_STRIPE_REP_PUBLISHABLE_KEY as string | undefined) ||
  'pk_live_51TCj3DPJXYVCMk8pTo20zxqkRKZSes7sCY6TJjSYdXqNEjCSvrsbtprRhy52KoggYnNpiJi0se31LuahqFLqN9Ex00kbTYXVSK';
