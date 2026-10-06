import React, { useEffect, useRef, useState } from 'react';
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
    titleDefault: 'Pack juridique (français)',
  },
  {
    id: 'en',
    file: 'HARX_Legal_Pack_EN.pdf',
    titleKey: 'register.legalEnTitle',
    titleDefault: 'Legal pack (English)',
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
          const viewport = page.getViewport({ scale: 1.35 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.className = 'mb-3 bg-white shadow-sm';
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
          setError(t('register.legalLoadError', 'Unable to open this document.'));
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
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="mb-3 text-sm text-slate-300">
        {t('register.legalScrollHint', 'Scroll to the bottom of the document to mark it as read.')}
      </p>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-slate-800/80 p-3"
      >
        {loading && (
          <p className="py-8 text-center text-sm text-slate-300">
            {t('register.legalLoading', 'Loading the document…')}
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
}: {
  readIds: RepLegalPackId[];
  onRead: (id: RepLegalPackId) => void;
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
          'Open the document and scroll to the bottom before you accept.'
        )}
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-slate-950/40 px-4 py-3 text-left hover:bg-slate-800/50"
      >
        <span className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-harx-400" />
          <span className="font-medium text-slate-100">
            {t(pack.titleKey, pack.titleDefault)}
          </span>
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            read ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-300'
          }`}
        >
          {read
            ? t('register.legalRead', 'Read')
            : t('register.legalOpen', 'Open')}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="flex h-[min(90vh,820px)] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-white">
                {t(pack.titleKey, pack.titleDefault)}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label={t('register.legalClose', 'Close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <PdfScroller
              url={pdfUrl(pack.file)}
              onReachedEnd={() => onRead(pack.id)}
            />
            {read && (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-300">
                <Check className="h-4 w-4" />
                {t('register.legalReached', 'You reached the end of this document.')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
