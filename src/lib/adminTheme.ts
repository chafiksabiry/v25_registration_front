import { HARX_BRAND } from './harxBrand';

export const ADMIN_THEME = {
  pageBg: '#F4F6FA',
  surface: '#FFFFFF',
  sidebar: '#0F172A',
  sidebarHover: '#1E293B',
  sidebarBorder: 'rgba(255,255,255,0.08)',
  accent: HARX_BRAND.magenta,
  accentSoft: 'rgba(230, 24, 141, 0.08)',
  accentBorder: 'rgba(230, 24, 141, 0.2)',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  shadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04)',
  shadowLg: '0 4px 6px rgba(15, 23, 42, 0.05), 0 20px 40px rgba(15, 23, 42, 0.08)',
  radius: '1rem',
  radiusLg: '1.25rem',
} as const;

export const ADMIN_GRADIENT = `linear-gradient(135deg, ${HARX_BRAND.orange} 0%, ${HARX_BRAND.magenta} 100%)`;
