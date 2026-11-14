import React from 'react';
import { LanguageSelector } from '../LanguageSelector';
import { HARX_BRAND, HARX_NAVBAR_BG, HARX_BAR_SHADOW } from '../../lib/harxBrand';
import logoHarx from '../../assets/logo-harx.png';
import { REACTIVATE_COPY, type ReactivateLang } from './reactivateCopy';

/** Bandeau HARX (logo blanc + « We inspire growth » sur dégradé orange → rouge → magenta, comme l'e-mail) et fond de page. */
export function ReactivateShell({ lang, children }: { lang: ReactivateLang; children: React.ReactNode }) {
  const copy = REACTIVATE_COPY[lang];
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" data-testid="reactivate-page">
      <header
        data-testid="reactivate-banner"
        className="w-full"
        style={{
          backgroundImage: `linear-gradient(120deg, ${HARX_BRAND.orange} 0%, ${HARX_BRAND.red} 45%, ${HARX_BRAND.magenta} 100%)`,
          boxShadow: HARX_BAR_SHADOW,
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logoHarx} alt="HARX" data-testid="harx-logo" className="h-11 w-auto sm:h-14" />
            <span className="hidden text-sm font-semibold tracking-wide text-white/90 sm:inline">{copy.tagline}</span>
          </div>
          <LanguageSelector />
        </div>
      </header>
      <div className="h-1" style={{ backgroundImage: HARX_NAVBAR_BG }} aria-hidden="true" />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
