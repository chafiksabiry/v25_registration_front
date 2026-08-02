import { legalEn } from './en';
import { legalFr } from './fr';
import type { LegalDocId, LegalDocument } from './types';

export type { LegalDocId, LegalDocument, LegalSection } from './types';

export function getLegalDocument(id: LegalDocId, language: string): LegalDocument {
  const lang = (language || 'en').toLowerCase().split('-')[0];
  const pack = lang === 'fr' ? legalFr : legalEn;
  const doc = pack[id];
  if (!doc) {
    return legalEn.privacy;
  }
  return doc;
}

export const LEGAL_DOC_IDS: LegalDocId[] = ['privacy', 'terms', 'cookies', 'gdpr'];
