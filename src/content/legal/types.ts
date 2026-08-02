export type LegalDocId = 'privacy' | 'terms' | 'cookies' | 'gdpr';

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  id: LegalDocId;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  contactNote: string;
};
