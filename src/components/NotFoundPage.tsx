import React, { useEffect } from 'react';
import { ArrowRight, Compass, Home, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router-dom';
import { Logo } from './LandingPage/Logo';
import { hardNavigate } from '../lib/appNavigation';
import { langPrefixOf } from '../lib/publicRoutes';

/**
 * Page « introuvable » (route `*`) et page d'erreur d'affichage (`errorElement` de la racine), à la charte HARX :
 * fond bleu nuit, titre et bouton en dégradé orange → magenta. Remplace la page de développeur de React Router
 * (« Unexpected Application Error! 404 … Hey developer »). Aucun détail technique n'est montré au visiteur.
 * Volontairement autonome (ni bandeau ni contexte d'authentification) : elle s'affiche même quand la page a échoué.
 */
export default function NotFoundPage({ variant = 'notFound' }: { variant?: 'notFound' | 'error' }) {
  const { t } = useTranslation();
  const routeError = useRouteError();
  const error = variant === 'error' ? routeError : null;

  useEffect(() => {
    if (error) console.error('[HARX] Erreur d’affichage :', error);
  }, [error]);

  useEffect(() => {
    const previous = document.title;
    document.title = variant === 'error' ? t('notFound.docTitleError', 'HARX — Display error') : t('notFound.docTitle', 'HARX — Page not found');
    return () => {
      document.title = previous;
    };
  }, [t, variant]);

  const lang = typeof window === 'undefined' ? null : langPrefixOf(window.location.pathname);
  const home = lang ? `/${lang}` : '/';
  const go = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    hardNavigate(url);
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a18] text-white" data-testid={variant === 'error' ? 'error-page' : 'not-found-page'}>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-24 h-[30rem] w-[30rem] rounded-full bg-[#ff7a45]/20 blur-[140px]" />
        <div className="absolute -bottom-32 -right-24 h-[30rem] w-[30rem] rounded-full bg-[#ec4899]/20 blur-[140px]" />
      </div>

      <header className="relative z-10 px-6 py-5">
        <a href={home} onClick={go(home)} aria-label="HARX">
          <Logo className="h-9 w-auto" />
        </a>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff7a45] to-[#ec4899] shadow-lg shadow-[#ec4899]/30">
            <Compass className="h-7 w-7 text-white" aria-hidden="true" />
          </span>
          {variant === 'notFound' ? (
            <p className="mt-6 bg-gradient-to-r from-[#ff7a45] to-[#ec4899] bg-clip-text text-6xl font-black tracking-tight text-transparent">404</p>
          ) : null}
          <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            {variant === 'error' ? t('notFound.titleError', 'This page could not be displayed') : t('notFound.title', 'This page does not exist')}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            {variant === 'error'
              ? t('notFound.descError', 'Something went wrong on our side. Reload the page, or continue from one of the links below.')
              : t('notFound.desc', 'The link may be outdated or mistyped. Here is where you can continue.')}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={home}
              onClick={go(home)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ec4899] px-6 text-sm font-bold text-white shadow-lg shadow-[#ec4899]/30 transition hover:opacity-95"
              data-testid="not-found-home"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              {t('notFound.home', 'HARX home')}
            </a>
            <a
              href="/telephony"
              onClick={go('/telephony')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {t('notFound.telephony', 'HARX Telephony')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
