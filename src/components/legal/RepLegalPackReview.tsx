import React, { useEffect, useRef, useState } from 'react';
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

function InlineLegalScroller({
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
        setBlocks(textToBlocks(allText.join('\n\n')));
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
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      markReached();
    }
  };

  return (
    <div
      ref={scrollerRef}
      onScroll={onScroll}
      className="max-h-56 overflow-y-auto rounded-xl border border-white/[0.08] bg-slate-950/50 px-3.5 py-3 sm:max-h-64"
    >
      {loading && (
        <p className="py-6 text-center text-xs text-slate-400">
          {t('register.legalLoading', 'Loading the Terms of Use…')}
        </p>
      )}
      {error && (
        <p className="py-4 text-center text-xs text-red-300">{error}</p>
      )}
      {!loading && !error && blocks.length > 0 && (
        <div className="space-y-3">
          {blocks.map((block, idx) =>
            block.type === 'heading' ? (
              <h4
                key={`h-${idx}`}
                className="pt-1 text-sm font-bold text-white first:pt-0"
              >
                {block.text}
              </h4>
            ) : (
              <p key={`p-${idx}`} className="text-xs leading-relaxed text-slate-300">
                {block.text}
              </p>
            )
          )}
        </div>
      )}
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
  const [expanded, setExpanded] = useState(true);
  const read = readIds.includes(pack.id);

  useEffect(() => {
    setExpanded(true);
  }, [pack.id]);

  return (
    <div
      className={`space-y-3 rounded-xl border p-4 ${
        hasError
          ? 'border-red-500 bg-red-950/20 ring-1 ring-red-500/30'
          : 'border-white/[0.08] bg-slate-950/40'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <ScrollText className={`h-4 w-4 shrink-0 ${hasError ? 'text-red-400' : 'text-harx-400'}`} />
          <span className="min-w-0">
            <span className={`block text-sm font-semibold ${hasError ? 'text-red-200' : 'text-slate-100'}`}>
              {t(pack.titleKey, pack.titleDefault)}
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-400">
              {t(
                'register.legalScrollHint',
                'Scroll to the bottom to confirm you have read the Terms of Use.'
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
              : t('register.legalOpen', 'Open')}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {expanded && (
        <div className="space-y-2">
          <InlineLegalScroller
            url={pdfUrl(pack.file)}
            onReachedEnd={() => onRead(pack.id)}
          />
          {read ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
              <Check className="h-3.5 w-3.5" />
              {t('register.legalReached', 'You reached the end of the Terms of Use.')}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">
              {t(
                'register.legalIntro',
                'Open the Terms of Use and scroll to the bottom before you accept.'
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
