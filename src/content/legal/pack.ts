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

export type SignupAudience = 'rep' | 'company' | 'callcenter';

const PACKS: Record<'fr' | 'en', LegalPack> = {
  fr: packFr as LegalPack,
  en: packEn as LegalPack,
};

const PART_TITLES = {
  fr: {
    general: "Conditions Générales d'Utilisation",
    rep: 'Conditions REP',
    company: 'Conditions Company',
    callcenter: "Conditions Centre d'appels",
    privacy: 'Politique de confidentialité',
    dpa: 'Accord de traitement des données',
  },
  en: {
    general: 'Terms of Use',
    rep: 'REP Terms',
    company: 'Company Terms',
    callcenter: 'Contact Center Terms',
    privacy: 'Privacy Policy',
    dpa: 'Data Processing Agreement',
  },
} as const;

export type SignupLanguage = 'fr' | 'en';

export function signupLanguage(language: string): SignupLanguage {
  return language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

/**
 * Single document shown at sign-up: the general terms, the terms of the audience's own role
 * (REP, Company or Contact Center), the privacy policy and, for the two business roles, the
 * data processing agreement.
 */
export function signupLegalPack(language: string, audience: SignupAudience): LegalPack {
  const lang = signupLanguage(language);
  const pack = PACKS[lang];
  const names = PART_TITLES[lang];
  const roleTitle = { rep: names.rep, company: names.company, callcenter: names.callcenter }[audience];
  const titles: string[] = [
    names.general,
    roleTitle,
    names.privacy,
    ...(audience === 'rep' ? [] : [names.dpa]),
  ];
  const parts = titles
    .map((title) => pack.parts.find((part) => part.title === title))
    .filter((part): part is PackPart => Boolean(part));
  return {
    cover: { ...pack.cover, documents: parts.map((part, index) => `${index + 1}. ${part.title}`) },
    parts,
  };
}
