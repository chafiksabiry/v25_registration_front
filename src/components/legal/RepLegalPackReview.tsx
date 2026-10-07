import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, FileText, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const REP_LEGAL_PACKS = [
  {
    id: 'fr',
    file: 'HARX_Pack_Juridique_FR.pdf',
    titleKey: 'register.legalFrTitle',
    titleDefault: 'Conditions générales',
  },
  {
    id: 'en',
    file: 'HARX_Legal_Pack_EN.pdf',
    titleKey: 'register.legalEnTitle',
    titleDefault: 'Terms of Use',
  },
] as const;

export type RepLegalPackId = (typeof REP_LEGAL_PACKS)[number]['id'];

export function legalPackForLanguage(language: string) {
  const id: RepLegalPackId = language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  return REP_LEGAL_PACKS.find((pack) => pack.id === id) ?? REP_LEGAL_PACKS[1];
}

function pdfUrl(file: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${file}`;
}

function PdfScroller({
  url,
  onReachedEnd,
}: {
  url: string;
  onReachedEnd: () => void;
}) {
  const { t } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reachedRef = useRef(false);

  const markReached = () => {
    if (reachedRef.current) return;
    reachedRef.current = true;
    onReachedEnd();
  };

  useEffect(() => {
    let cancelled = false;
    reachedRef.current = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const pdf = await getDocument({ url }).promise;
        const host = pagesRef.current;
        if (!host || cancelled) return;
        host.replaceChildren();

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNumber);
          const base = page.getViewport({ scale: 1 });
          const displayWidth = Math.min(980, Math.max(320, window.innerWidth - 48));
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
          const viewport = page.getViewport({ scale: (displayWidth / base.width) * pixelRatio });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = 'auto';
          canvas.className = 'mx-auto mb-4 bg-white shadow-md';
          if (context) {
            await page.render({ canvasContext: context, viewport, canvas }).promise;
          }
          host.appendChild(canvas);
        }

        if (cancelled) return;
        setLoading(false);
        requestAnimationFrame(() => {
          const scroller = scrollerRef.current;
          if (scroller && scroller.scrollHeight <= scroller.clientHeight + 8) {
            markReached();
          }
        });
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError(t('register.legalLoadError', 'Unable to open the Terms of Use.'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, t]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el || loading) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
      markReached();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-900">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-6"
      >
        {loading && (
          <p className="py-8 text-center text-sm text-slate-300">
            {t('register.legalLoading', 'Loading the Terms of Use…')}
          </p>
        )}
        {error && <p className="py-8 text-center text-sm text-red-400">{error}</p>}
        <div ref={pagesRef} />
      </div>
    </div>
  );
}

export function RepLegalPackReview({
  readIds,
  onRead,
  hasError = false,
}: {
  readIds: RepLegalPackId[];
  onRead: (id: RepLegalPackId) => void;
  hasError?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const pack = legalPackForLanguage(i18n.language);
  const [open, setOpen] = useState(false);
  const read = readIds.includes(pack.id);

  useEffect(() => {
    setOpen(false);
  }, [pack.id]);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-slate-300">
        {t(
          'register.legalIntro',
          'Open the Terms of Use and scroll to the bottom before you accept.'
        )}
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-slate-950/40 px-4 py-3 text-left transition-colors ${
          hasError
            ? 'border-red-500 ring-1 ring-red-500/40 hover:bg-red-950/20'
            : 'border-white/[0.08] hover:bg-slate-800/50'
        }`}
      >
        <span className="flex items-center gap-3">
          <FileText className={`h-5 w-5 ${hasError ? 'text-red-400' : 'text-harx-400'}`} />
          <span className={`font-medium ${hasError ? 'text-red-200' : 'text-slate-100'}`}>
            {t(pack.titleKey, pack.titleDefault)}
          </span>
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            read
              ? 'bg-emerald-500/20 text-emerald-300'
              : hasError
                ? 'bg-red-500/20 text-red-300'
                : 'bg-white/10 text-slate-300'
          }`}
        >
          {read
            ? t('register.legalRead', 'Read')
            : t('register.legalOpen', 'Open')}
        </span>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {t(pack.titleKey, pack.titleDefault)}
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                {t('register.legalScrollHint', 'Scroll to the bottom to confirm you have read the Terms of Use.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label={t('register.legalClose', 'Close')}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <PdfScroller
            url={pdfUrl(pack.file)}
            onReachedEnd={() => onRead(pack.id)}
          />
          {read && (
            <p className="flex items-center justify-center gap-2 border-t border-white/10 px-5 py-3 text-sm font-medium text-emerald-300">
              <Check className="h-4 w-4" />
              {t('register.legalReached', 'You reached the end of the Terms of Use.')}
            </p>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
