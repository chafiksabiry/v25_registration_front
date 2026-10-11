import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ScrollText } from 'lucide-react';
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

/** Preferred pack first (UI language), then the other — both must be read. */
export function orderedLegalPacks(language: string) {
  const preferred: RepLegalPackId = language.toLowerCase().startsWith('fr')
    ? 'fr'
    : 'en';
  return [...REP_LEGAL_PACKS].sort((a, b) => {
    if (a.id === preferred) return -1;
    if (b.id === preferred) return 1;
    return 0;
  });
}

export function allLegalPacksRead(readIds: RepLegalPackId[]): boolean {
  return REP_LEGAL_PACKS.every((pack) => readIds.includes(pack.id));
}

function pdfUrl(file: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${file}`;
}

/** Renders the PDF pages with original layout/styles inside a compact scroll area. */
function InlinePdfScroller({
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

        const scrollerWidth = scrollerRef.current?.clientWidth || 360;
        const displayWidth = Math.max(280, scrollerWidth - 16);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNumber);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({
            scale: (displayWidth / base.width) * pixelRatio,
          });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = 'auto';
          canvas.className = 'mx-auto mb-3 block rounded-md bg-white shadow-sm';
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
          setError(
            t('register.legalLoadError', 'Unable to open the Terms of Use.')
          );
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
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      markReached();
    }
  };

  return (
    <div
      ref={scrollerRef}
      onScroll={onScroll}
      className="max-h-56 overflow-y-auto rounded-xl border border-white/[0.08] bg-slate-900/80 px-2 py-2 sm:max-h-64"
    >
      {loading && (
        <p className="py-6 text-center text-xs text-slate-400">
          {t('register.legalLoading', 'Loading the Terms of Use…')}
        </p>
      )}
      {error && (
        <p className="py-4 text-center text-xs text-red-300">{error}</p>
      )}
      <div ref={pagesRef} />
    </div>
  );
}

function LegalPackAccordion({
  pack,
  read,
  expanded,
  onToggle,
  onRead,
  hasError,
}: {
  pack: (typeof REP_LEGAL_PACKS)[number];
  read: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRead: () => void;
  hasError: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-xl border ${
        hasError && !read
          ? 'border-red-500/60 bg-red-950/15'
          : read
            ? 'border-emerald-500/30 bg-emerald-950/10'
            : 'border-white/[0.08] bg-slate-950/40'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <ScrollText
            className={`h-4 w-4 shrink-0 ${
              read ? 'text-emerald-400' : hasError ? 'text-red-400' : 'text-harx-400'
            }`}
          />
          <span className="min-w-0">
            <span
              className={`block text-sm font-semibold ${
                read ? 'text-emerald-100' : hasError && !read ? 'text-red-200' : 'text-slate-100'
              }`}
            >
              {t(pack.titleKey, pack.titleDefault)}
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-400">
              {t(
                'register.legalScrollHint',
                'Scroll to the bottom to confirm you have read this document.'
              )}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              read
                ? 'bg-emerald-500/20 text-emerald-300'
                : hasError
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-white/10 text-slate-300'
            }`}
          >
            {read
              ? t('register.legalRead', 'Read')
              : expanded
                ? t('register.legalScroll', 'Scroll')
                : t('register.legalOpen', 'Open')}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-white/[0.06] px-3 pb-3 pt-2">
          <InlinePdfScroller url={pdfUrl(pack.file)} onReachedEnd={onRead} />
          {read ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
              <Check className="h-3.5 w-3.5" />
              {t('register.legalReached', 'You reached the end of this document.')}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">
              {t(
                'register.legalDocHint',
                'Scroll to the bottom of this document to mark it as read.'
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * REP signup: both legal PDFs (FR + EN) must be opened and scrolled to the end
 * before the accept checkbox unlocks.
 */
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
  const packs = useMemo(
    () => orderedLegalPacks(i18n.language),
    [i18n.language]
  );
  const [expandedId, setExpandedId] = useState<RepLegalPackId | null>(
    () => packs[0]?.id ?? null
  );
  const allRead = allLegalPacksRead(readIds);
  const readCount = packs.filter((p) => readIds.includes(p.id)).length;

  useEffect(() => {
    // Prefer expanding the first unread pack when language changes.
    const firstUnread = packs.find((p) => !readIds.includes(p.id));
    setExpandedId(firstUnread?.id ?? packs[0]?.id ?? null);
  }, [packs]);

  // Auto-expand next unread when current pack is completed.
  useEffect(() => {
    if (!expandedId) return;
    if (!readIds.includes(expandedId)) return;
    const next = packs.find((p) => !readIds.includes(p.id));
    if (next) setExpandedId(next.id);
  }, [readIds, expandedId, packs]);

  return (
    <div
      className={`space-y-3 rounded-xl border p-4 ${
        hasError && !allRead
          ? 'border-red-500 bg-red-950/20 ring-1 ring-red-500/30'
          : 'border-white/[0.08] bg-slate-950/40'
      }`}
    >
      <div className="space-y-1">
        <p
          className={`text-sm font-semibold ${
            hasError && !allRead ? 'text-red-200' : 'text-slate-100'
          }`}
        >
          {t('register.legalBothTitle', 'Legal documents')}
        </p>
        <p className="text-[11px] text-slate-400">
          {t(
            'register.legalIntro',
            'Open both documents and scroll each to the bottom before you accept.'
          )}{' '}
          <span className="font-semibold text-slate-300">
            ({readCount}/{packs.length})
          </span>
        </p>
      </div>

      <div className="space-y-2">
        {packs.map((pack) => {
          const read = readIds.includes(pack.id);
          return (
            <LegalPackAccordion
              key={pack.id}
              pack={pack}
              read={read}
              expanded={expandedId === pack.id}
              hasError={hasError}
              onToggle={() =>
                setExpandedId((current) =>
                  current === pack.id ? null : pack.id
                )
              }
              onRead={() => onRead(pack.id)}
            />
          );
        })}
      </div>

      {allRead ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
          <Check className="h-3.5 w-3.5" />
          {t(
            'register.legalBothReached',
            'Both documents have been read. You can accept the terms.'
          )}
        </p>
      ) : null}
    </div>
  );
}
