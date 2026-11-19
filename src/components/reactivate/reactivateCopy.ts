/**
 * Textes de la page /auth/reactivate : repris de l'e-mail de réactivation des REPS importés de la V1
 * (même ordre, mêmes mots) pour que le REP reconnaisse le parcours. Français et anglais, comme l'e-mail.
 */
export type ReactivateLang = 'fr' | 'en';

export interface ReactivateCopy {
  eyebrow: string;
  title: string;
  hello: string;
  intro: string;
  heroLine: string;
  whyTitle: string;
  why: string;
  offerLabel: string;
  offerHeadline: string;
  offerPlan: string;
  offerCode: string;
  offerValid: string;
  stepsTitle: string;
  steps: string[];
  noCard: string;
  formTitle: string;
  formIntro: string;
  emailLabel: string;
  emailPlaceholder: string;
  send: string;
  sending: string;
  requestError: string;
  sentTitle: string;
  sentText: string;
  sendAgain: string;
  loading: string;
  expiredTitle: string;
  invalidTitle: string;
  help: string;
  signIn: string;
  forgot: string;
}

export const REACTIVATE_COPY: Record<ReactivateLang, ReactivateCopy> = {
  fr: {
    eyebrow: 'VOTRE ESPACE REP',
    title: 'Votre espace HARX vous attend',
    hello: 'Bonjour,',
    intro:
      'Vous vous étiez inscrit(e) sur HARX, la plateforme qui met en relation des professionnels de la relation client à distance avec des entreprises.',
    heroLine: 'Votre compte a été transféré sur la nouvelle plateforme.',
    whyTitle: 'Pourquoi HARX ?',
    why:
      'Pour gagner de l’argent en travaillant à distance sur des missions de relation client : en complément de vos revenus actuels ou comme activité principale, à votre rythme, selon les créneaux que vous indiquez.',
    offerLabel: 'OFFRE REPS',
    offerHeadline: '6 mois offerts',
    offerPlan: 'avec la formule « IN THE RICH MAN’S WORLD »',
    offerCode: 'Code REPS2027',
    offerValid: 'Valable jusqu’au 31 décembre 2026',
    stepsTitle: 'En 5 étapes',
    steps: [
      'Importer votre CV',
      'Valider votre profil',
      'Prendre une photo en direct',
      'Indiquer vos créneaux de travail',
      'Choisir la formule « IN THE RICH MAN’S WORLD » et saisir le code REPS2027',
    ],
    noCard: 'Aucune carte bancaire n’est demandée à l’activation.',
    formTitle: 'Reprendre mon compte',
    formIntro: 'Saisissez l’adresse e-mail à laquelle vous avez reçu notre message : nous vous envoyons votre lien personnel, sans mot de passe.',
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'vous@exemple.com',
    send: 'Reprendre mon compte',
    sending: 'Envoi…',
    requestError: 'Cela n’a pas fonctionné. Vérifiez l’adresse et réessayez.',
    sentTitle: 'Consultez votre boîte mail',
    sentText:
      'Si cette adresse est enregistrée, vous recevrez votre lien personnel dans quelques minutes. Pensez à regarder dans vos courriers indésirables.',
    sendAgain: 'Utiliser une autre adresse',
    loading: 'Ouverture de votre espace HARX…',
    expiredTitle: 'Ce lien a expiré',
    invalidTitle: 'Ce lien n’est pas valide',
    help: 'Demandez un nouveau lien avec votre e-mail, ou connectez-vous. Si vous n’avez pas encore de mot de passe, utilisez « Mot de passe oublié ».',
    signIn: 'Se connecter',
    forgot: 'Mot de passe oublié',
  },
  en: {
    eyebrow: 'YOUR REP SPACE',
    title: 'Your HARX space is waiting for you',
    hello: 'Hello,',
    intro:
      'You signed up on HARX, the platform that connects remote customer-service professionals with companies.',
    heroLine: 'Your account has been moved to our new platform.',
    whyTitle: 'Why HARX?',
    why:
      'To earn money by working remotely on customer-service missions: on top of your current income or as your main activity, at your own pace, based on the availability you set.',
    offerLabel: 'REPS OFFER',
    offerHeadline: '6 months free',
    offerPlan: 'with the “IN THE RICH MAN’S WORLD” plan',
    offerCode: 'Code REPS2027',
    offerValid: 'Valid until 31 December 2026',
    stepsTitle: 'In 5 steps',
    steps: [
      'Upload your CV',
      'Validate your profile',
      'Take a live photo',
      'Set your availability',
      'Choose the “IN THE RICH MAN’S WORLD” plan and enter the code REPS2027',
    ],
    noCard: 'No credit card is required at activation.',
    formTitle: 'Get my account back',
    formIntro: 'Enter the email address where you received our message: we send you your personal link, no password.',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    send: 'Get my account back',
    sending: 'Sending…',
    requestError: 'This did not work. Please check the address and try again.',
    sentTitle: 'Check your mailbox',
    sentText:
      'If this address is registered, you will receive your personal link in a few minutes. Look in your spam folder if you do not see it.',
    sendAgain: 'Use another address',
    loading: 'Opening your HARX space…',
    expiredTitle: 'This link has expired',
    invalidTitle: 'This link is not valid',
    help: 'Request a new link with your email, or sign in. If you have no password yet, use “Forgot password”.',
    signIn: 'Sign in',
    forgot: 'Forgot password',
  },
};

/** Le français pour une interface en français, l'anglais pour toute autre langue (l'e-mail est bilingue FR/EN). */
export function reactivateLangFor(language: string | null | undefined): ReactivateLang {
  return String(language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
