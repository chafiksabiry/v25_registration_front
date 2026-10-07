import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ScrollText, X } from 'lucide-react';
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

type TextItem = { str: string; transform: number[] };

function pageItemsToText(items: TextItem[]): string {
  let line = '';
  let lastY: number | null = null;
  const lines: string[] = [];

  for (const item of items) {
    const y = item.transform?.[5];
    if (typeof y === 'number' && lastY !== null && Math.abs(y - lastY) > 4) {
      if (line.trim()) lines.push(line.trim());
      line = '';
    }
    const chunk = String(item.str || '');
    if (!chunk) continue;
    if (line && !line.endsWith(' ') && !chunk.startsWith(' ')) line += ' ';
    line += chunk;
    if (typeof y === 'number') lastY = y;
  }
  if (line.trim()) lines.push(line.trim());
  return lines.join('\n');
}

type LegalBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string };

function textToBlocks(text: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (/^(article|art\.?)\s*\d+/i.test(line) || /^#{1,3}\s/.test(line)) {
      blocks.push({ type: 'heading', text: line.replace(/^#+\s*/, '') });
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  }
  return blocks;
}

function IntegratedLegalScroller({
  url,
  onReachedEnd,
}: {
  url: string;
  onReachedEnd: () => void;
}) {
  const { t } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<LegalBlock[]>([]);
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
    setBlocks([]);

    (async () => {
      try {
        const pdf = await getDocument({ url }).promise;
        const allText: string[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const items = (content.items || []).filter(
            (item): item is TextItem =>
              Boolean(item) && typeof (item as TextItem).str === 'string'
          );
          const pageText = pageItemsToText(items);
          if (pageText.trim()) allText.push(pageText);
        }

        if (cancelled) return;
        const combined = allText.join('\n\n');
        setBlocks(textToBlocks(combined));
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
    <div
      ref={scrollerRef}
      onScroll={onScroll}
      className="min-h-0 flex-1 overflow-y-auto bg-slate-950"
    >
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {loading && (
          <p className="py-12 text-center text-sm text-slate-400">
            {t('register.legalLoading', 'Loading the Terms of Use…')}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-center text-sm text-red-300">
            {error}
          </p>
        )}
        {!loading && !error && blocks.length > 0 && (
          <article className="space-y-5 rounded-2xl border border-white/[0.08] bg-slate-900/70 p-5 sm:p-7">
            {blocks.map((block, idx) =>
              block.type === 'heading' ? (
                <h2
                  key={`h-${idx}`}
                  className="pt-2 text-base font-bold tracking-tight text-white first:pt-0 sm:text-lg"
                >
                  {block.text}
                </h2>
              ) : (
                <p
                  key={`p-${idx}`}
                  className="text-sm leading-relaxed text-slate-300 sm:text-[15px]"
                >
                  {block.text}
                </p>
              )
            )}
          </article>
        )}
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
          <ScrollText className={`h-5 w-5 ${hasError ? 'text-red-400' : 'text-harx-400'}`} />
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

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur-sm">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-harx-400">
                  {t('register.legalPackBadge', 'Legal')}
                </p>
                <h3 className="mt-1 text-lg font-bold text-white">
                  {t(pack.titleKey, pack.titleDefault)}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {t(
                    'register.legalScrollHint',
                    'Scroll to the bottom to confirm you have read the Terms of Use.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label={t('register.legalClose', 'Close')}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <IntegratedLegalScroller
              url={pdfUrl(pack.file)}
              onReachedEnd={() => onRead(pack.id)}
            />
            {read && (
              <p className="flex items-center justify-center gap-2 border-t border-white/10 bg-slate-950 px-5 py-3 text-sm font-medium text-emerald-300">
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
