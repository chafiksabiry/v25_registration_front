/**
 * Wordmarks en trait des offres (TAAS, CLOUD, NOMAD) : même typographie que le mot NOMAD de l'application HARX Nomad
 * (lettres larges et basses, trait fin). Hauteur de lettres 40 unités, trait de 4,2 unités, identique pour les trois.
 * Dessins fournis par le CTO ; ne pas retoucher sans accord.
 */
export const WORDMARK_STROKE_WIDTH = 4.2;

export interface WordmarkPath {
  d: string;
  transform?: string;
}
export interface Wordmark {
  viewBox: string;
  paths: WordmarkPath[];
}

const A = 'M2 40L24 8Q29 2 36 2H46Q53 2 58 8L80 40';
const O = 'M22 2H46A20 20 0 0 1 46 40H22A20 20 0 0 1 22 2Z';
const D = 'M2 2V40H40A19 19 0 0 0 40 2Z';

export const WORDMARKS: Record<'taas' | 'cloud' | 'nomad', Wordmark> = {
  nomad: {
    viewBox: '-6 -6 482 52',
    paths: [
      { d: 'M2 40V2L66 40V2' },
      { transform: 'translate(96 0)', d: O },
      { transform: 'translate(190 0)', d: 'M2 40V2L38 28L74 2V40' },
      { transform: 'translate(290 0)', d: A },
      { transform: 'translate(392 0)', d: D },
    ],
  },
  taas: {
    viewBox: '-6 -6 420 52',
    paths: [
      { d: 'M2 2H66M34 2V40' },
      { transform: 'translate(102 0)', d: A },
      { transform: 'translate(218 0)', d: A },
      { transform: 'translate(330 0)', d: 'M64 2H24A9.5 9.5 0 0 0 24 21H44A9.5 9.5 0 0 1 44 40H4' },
    ],
  },
  cloud: {
    viewBox: '-6 -6 480 52',
    paths: [
      { transform: 'translate(-5 0)', d: 'M64 2H26A19 19 0 0 0 26 40H64' },
      { transform: 'translate(98 0)', d: 'M2 2V40H56' },
      { transform: 'translate(190 0)', d: O },
      { transform: 'translate(290 0)', d: 'M2 2V24Q2 40 24 40H56Q78 40 78 24V2' },
      { transform: 'translate(400 0)', d: D },
    ],
  },
};
