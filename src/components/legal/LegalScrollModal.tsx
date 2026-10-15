import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LegalDocId } from '../../content/legal';
import { signupLegalPack, type SignupAudience } from '../../content/legal/pack';
import logoPink from '../LandingPage/assets/logo-pink.png';
import { LegalPackView } from './LegalPackView';

export type SignupLegalDocId = Extract<LegalDocId, 'terms' | 'privacy'>;

export function bothSignupDocsRead(readIds: SignupLegalDocId[]): boolean {
  return readIds.includes('terms') && readIds.includes('privacy');
}

/**
 * Popup used by company and rep signup. The document stays in a scroll area;
 * reaching the bottom marks it as read.
 */
export function LegalScrollModal({
  docId,
  audience,
  accepted,
  onAcceptedChange,
  onContinue,
  onClose,
  onReachedEnd,
}: {
  docId: SignupLegalDocId | null;
  audience: SignupAudience;
  accepted: boolean;
  onAcceptedChange: (checked: boolean) => void;
  onContinue: () => void;
  onClose: () => void;
  onReachedEnd: (id: SignupLegalDocId) => void;
}) {
  const { t, i18n } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reachedRef = useRef(false);
  const [reached, setReached] = useState(false);

  const pack = docId ? signupLegalPack(i18n.language, docId, audience) : null;

  const markReached = () => {
    if (!docId || reachedRef.current) return;
    reachedRef.current = true;
    setReached(true);
    onReachedEnd(docId);
  };

  useEffect(() => {
    if (!docId) return undefined;
    reachedRef.current = false;
    setReached(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    const frame = requestAnimationFrame(() => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTop = 0;
      if (el.scrollHeight <= el.clientHeight + 8) markReached();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [docId, audience, i18n.language]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) markReached();
  };

  if (!docId || !pack) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label={t('register.legalClose', 'Close')}
        className="absolute inset-0 bg-[#fff1f2]/80"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-scroll-title"
        className="relative w-full max-w-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-[#e11d48] hover:bg-white"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t('register.legalClose', 'Close')}</span>
        </button>
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="max-h-[min(860px,92vh)] overflow-y-auto overscroll-contain rounded-[22px] border border-[#fecdd3] bg-white [overflow-anchor:none]"
        >
          <img
            src={logoPink}
            alt="HARX"
            onLoad={() => {
              const el = scrollerRef.current;
              if (el) el.scrollTop = 0;
            }}
            className="block h-auto w-full"
          />
          <LegalPackView pack={pack} />
          <div className="px-5 pb-6 sm:px-8">
            <div className="border-t border-[#e5e7eb] pt-4">
              {reached ? (
                <div className="space-y-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(event) => onAcceptedChange(event.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-[#fecdd3] text-[#e11d48] focus:ring-[#e11d48]"
                    />
                    <span className="text-sm font-medium text-[#0f172a]">
                      {t('register.termsCheckbox', 'I agree to the Terms & Conditions')}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={onContinue}
                    disabled={!accepted}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#e11d48] px-4 py-3 text-sm font-semibold text-white hover:bg-[#be123c] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('register.btnContinue', 'Continue')}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[#9f1239]">
                  {t('register.legalMustRead', 'You must read this document.')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
