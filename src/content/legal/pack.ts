import packEn from './pack.en.json';
import packFr from './pack.fr.json';

export type PackBlock =
  | { type: 'meta'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'definitions'; rows: { term: string; definition: string }[] }
  | { type: 'table'; headers: string[]; rows: string[][] };

export type PackPart = { title: string; blocks: PackBlock[] };

export type LegalPack = {
  cover: {
    company: string;
    title: string;
    subtitle: string;
    documentsLabel: string;
    documents: string[];
    version: string;
    address: string;
  };
  parts: PackPart[];
};

export type SignupAudience = 'rep' | 'company';

const PACKS: Record<'fr' | 'en', LegalPack> = {
  fr: packFr as LegalPack,
  en: packEn as LegalPack,
};

const PART_TITLES = {
  fr: {
    general: "Conditions Générales d'Utilisation",
    rep: 'Conditions REP',
    company: 'Conditions Company',
    privacy: 'Politique de confidentialité',
    dpa: 'Accord de traitement des données',
  },
  en: {
    general: 'Terms of Use',
    rep: 'REP Terms',
    company: 'Company Terms',
    privacy: 'Privacy Policy',
    dpa: 'Data Processing Agreement',
  },
} as const;

export function signupLegalPack(
  language: string,
  docId: 'terms' | 'privacy',
  audience: SignupAudience
): LegalPack {
  const lang = language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  const pack = PACKS[lang];
  const names = PART_TITLES[lang];
  const titles: string[] =
    docId === 'terms'
      ? [names.general, audience === 'rep' ? names.rep : names.company]
      : [names.privacy, ...(audience === 'company' ? [names.dpa] : [])];
  return {
    cover: {
      ...pack.cover,
      documents: pack.cover.documents.filter((line) =>
        titles.some((title) => line.replace(/^\d+\.\s*/, '') === title)
      ),
    },
    parts: pack.parts.filter((part) => titles.includes(part.title)),
  };
}
