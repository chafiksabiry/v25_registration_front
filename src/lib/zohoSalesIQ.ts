import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

const ZOHO_WIDGET_SRC =
  'https://salesiq.zohopublic.com/widget?wc=siq1220e8ead391b873de364b43a6c31feaa7c8901cb0e74619ec1cf506af4b1e61';

declare global {
  interface Window {
    $zoho?: {
      salesiq?: { ready?: () => void };
    };
  }
}

/**
 * Load Zoho SalesIQ once, only in standalone mode.
 * When embedded in harx.ai, the host shell already loads SalesIQ — loading it
 * again from the auth MFE entry HTML causes qiankun to re-exec the widget script
 * and throw "Cannot redefine property: language".
 */
export function initZohoSalesIQ(): void {
  if (typeof document === 'undefined') return;
  if (qiankunWindow.__POWERED_BY_QIANKUN__) return;
  if (document.getElementById('zsiqscript')) return;

  window.$zoho = window.$zoho || {};
  window.$zoho.salesiq = window.$zoho.salesiq || { ready() {} };

  const script = document.createElement('script');
  script.id = 'zsiqscript';
  script.src = ZOHO_WIDGET_SRC;
  script.defer = true;
  document.head.appendChild(script);
}
