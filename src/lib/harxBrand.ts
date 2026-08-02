export const HARX_BRAND = {
  orange: '#F7941E',
  red: '#ED1C24',
  magenta: '#E6188D',
  magentaDeep: '#C2186F',
  magentaDarker: '#8A1250',
} as const;

const RED = '#ED1C24';

export const HARX_NAVBAR_BG = `linear-gradient(135deg, ${RED} 0%, ${HARX_BRAND.magenta} 100%)`;
export const HARX_SIDEBAR_BG = `linear-gradient(180deg, ${RED} 0%, ${HARX_BRAND.magenta} 100%)`;
export const HARX_BAR_SHADOW = '0 10px 24px -10px rgba(230, 24, 141, 0.55)';
export const HARX_TEXT_SHADOW = '0 1px 2px rgba(122, 14, 80, 0.4)';
