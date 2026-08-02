import type { LegalDocument } from './types';

const COMPANY = 'HARX Technologies Inc.';
const ADDRESS = '16192 Coastal Hwy, Lewes, DE 19958, États-Unis';
const EMAIL = 'contact@harx.ai';
const UPDATED = '2 août 2026';

export const legalFr: Record<string, LegalDocument> = {
  privacy: {
    id: 'privacy',
    title: 'Politique de confidentialité',
    lastUpdated: UPDATED,
    intro: `La présente Politique de confidentialité explique comment ${COMPANY} (« HARX », « nous ») collecte, utilise et protège les données personnelles lorsque vous utilisez la plateforme Transaction-as-a-Service HARX, ses sites et services associés.`,
    contactNote: `Questions relatives à cette politique : ${EMAIL}. Adresse postale : ${ADDRESS}.`,
    sections: [
      {
        title: '1. Qui sommes-nous',
        paragraphs: [
          `${COMPANY} exploite la plateforme HARX qui met en relation des entreprises avec des agents humains et assistés par l’IA pour l’engagement client et services associés.`,
          `Responsable de traitement pour les données traitées via nos services : ${COMPANY}, ${ADDRESS}.`,
        ],
      },
      {
        title: '2. Données collectées',
        paragraphs: [
          'Données de compte : nom, e-mail, téléphone, mot de passe (haché), informations de profil entreprise ou agent, identifiants d’authentification (y compris LinkedIn si vous le connectez).',
          'Données d’usage : pages consultées, utilisation des fonctionnalités, adresse IP, localisation approximative dérivée de l’IP, informations appareil/navigateur, et journaux de diagnostic pour sécuriser et améliorer le service.',
          'Données transactionnelles : missions, inscriptions, métadonnées d’appels/sessions, statut de facturation et d’abonnement (les données de carte sont traitées par notre prestataire de paiement ; nous ne stockons pas les numéros de carte complets).',
          'Communications : messages au support, demandes de démo, et abonnements newsletter si vous y consentez.',
        ],
      },
      {
        title: '3. Finalités du traitement',
        paragraphs: [
          'Créer et gérer les comptes, authentifier les utilisateurs et fournir les fonctionnalités demandées.',
          'Mettre en relation entreprises et agents, opérer la téléphonie et les workflows assistés par l’IA lorsqu’ils sont activés, et délivrer les services contractuels.',
          'Traiter les paiements, prévenir la fraude, faire respecter nos Conditions et respecter les obligations légales.',
          'Envoyer des notices de service ; e-mails marketing uniquement lorsque cela est autorisé (ex. opt-in newsletter) avec possibilité de se désabonner.',
          'Améliorer la sécurité, la fiabilité et la qualité du produit via analytique et diagnostics.',
        ],
      },
      {
        title: '4. Bases légales (RGPD)',
        paragraphs: [
          'Exécution du contrat : fourniture du compte et des services demandés.',
          'Intérêt légitime : sécurisation de la plateforme, prévention des abus, amélioration du service, et communications B2B limitées le cas échéant.',
          'Consentement : cookies non strictement nécessaires, newsletter, et certaines intégrations optionnelles.',
          'Obligation légale : comptabilité, fiscalité et exigences réglementaires applicables.',
        ],
      },
      {
        title: '5. Partage et sous-traitants',
        paragraphs: [
          'Nous faisons appel à des prestataires (hébergement, bases de données, e-mail/SMS, analytique, paiements, téléphonie, fournisseurs d’IA) sous clauses contractuelles de protection des données. Ils ne traitent les données que selon nos instructions.',
          'Nous pouvons divulguer des données si la loi l’exige, pour protéger des droits et la sécurité, ou dans le cadre d’une opération corporate (fusion, acquisition) avec garanties appropriées.',
          'Nous ne vendons pas les données personnelles.',
        ],
      },
      {
        title: '6. Transferts internationaux',
        paragraphs: [
          'HARX est établi aux États-Unis. Si vous accédez au service depuis l’EEE/Royaume-Uni/Suisse, vos données peuvent être transférées vers les États-Unis et d’autres pays où opèrent nos prestataires.',
          'Le cas échéant, nous utilisons des garanties appropriées telles que les Clauses Contractuelles Types et des mesures complémentaires.',
        ],
      },
      {
        title: '7. Conservation',
        paragraphs: [
          'Nous conservons les données de compte et transactionnelles pendant la durée d’activité du compte, puis pendant une période raisonnable pour des besoins légaux, de sécurité et comptables.',
          'Les e-mails newsletter sont conservés jusqu’au désabonnement. Les tickets support et journaux sont conservés selon les besoins opérationnels et de sécurité, puis supprimés ou anonymisés.',
        ],
      },
      {
        title: '8. Vos droits',
        paragraphs: [
          'Selon votre lieu de résidence, vous pouvez disposer de droits d’accès, de rectification, d’effacement, de limitation, de portabilité, et d’opposition à certains traitements.',
          'Vous pouvez retirer votre consentement à tout moment lorsque le traitement est fondé sur le consentement (sans affecter la licéité antérieure).',
          `Pour exercer vos droits, contactez ${EMAIL}. Vous pouvez également introduire une réclamation auprès de l’autorité de contrôle compétente.`,
        ],
      },
      {
        title: '9. Sécurité',
        paragraphs: [
          'Nous appliquons des mesures techniques et organisationnelles adaptées au risque, notamment le chiffrement en transit, des contrôles d’accès et une surveillance. Aucun mode de transmission ou de stockage n’est totalement sûr.',
        ],
      },
      {
        title: '10. Mineurs',
        paragraphs: [
          'Le service s’adresse aux utilisateurs professionnels et aux adultes. Nous ne collectons pas sciemment de données de mineurs de moins de 16 ans.',
        ],
      },
      {
        title: '11. Modifications',
        paragraphs: [
          'Nous pouvons mettre à jour cette Politique. La date de « Dernière mise à jour » sera modifiée ; les changements importants pourront être communiqués via la plateforme ou par e-mail.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: "Conditions d'utilisation",
    lastUpdated: UPDATED,
    intro: `Les présentes Conditions d’utilisation (« Conditions ») régissent l’accès et l’usage de la plateforme HARX exploitée par ${COMPANY}. En créant un compte ou en utilisant les services, vous acceptez ces Conditions.`,
    contactNote: `Notifications juridiques : ${EMAIL}. ${COMPANY}, ${ADDRESS}.`,
    sections: [
      {
        title: '1. Le service',
        paragraphs: [
          'HARX fournit une plateforme Transaction-as-a-Service mettant en relation des entreprises avec des agents (humains et/ou assistés par l’IA) pour l’engagement sortant/entrant, des outils associés (matching, formation, téléphonie, base de connaissances) et la facturation.',
          'Les fonctionnalités peuvent varier selon le plan, la région et la configuration. Nous pouvons modifier ou interrompre des fonctionnalités avec un préavis raisonnable lorsque cela est possible.',
        ],
      },
      {
        title: '2. Comptes et éligibilité',
        paragraphs: [
          'Vous devez fournir des informations d’inscription exactes et garder vos identifiants confidentiels. Vous êtes responsable de l’activité sous votre compte.',
          'Les comptes entreprise doivent être créés par un représentant autorisé. Les comptes agents doivent respecter le droit du travail et les lois locales applicables à leur activité.',
        ],
      },
      {
        title: '3. Usage acceptable',
        paragraphs: [
          'Vous n’utiliserez pas la plateforme de façon abusive : pas de spam illégal, fraude, harcèlement, atteinte aux droits de tiers, malware, scraping excessif, ni tentative de contourner la sécurité ou la facturation.',
          'Vous êtes responsable de la légalité de vos campagnes, scripts, listes de prospects et du consentement aux communications (y compris les lois téléphonie/messaging applicables).',
          'Les appels et messages assistés par l’IA doivent être déclarés et utilisés conformément à la loi et aux paramètres de la plateforme.',
        ],
      },
      {
        title: '4. Contenus et propriété intellectuelle',
        paragraphs: [
          'Vous conservez vos droits sur les contenus que vous téléversez (scripts, base de connaissances, actifs de marque). Vous accordez à HARX une licence pour les héberger et les traiter uniquement afin de fournir les services.',
          'HARX et ses concédants détiennent le logiciel, la marque et la documentation. Vous disposez d’un droit limité, non exclusif et non transférable d’utiliser le service pendant votre abonnement.',
        ],
      },
      {
        title: '5. Tarifs et facturation',
        paragraphs: [
          'Les plans payants, frais d’usage (ex. minutes, lignes téléphoniques) et commissions sont décrits dans le produit ou un bon de commande. Les frais sont en principe non remboursables sauf obligation légale ou mention contraire.',
          'Vous autorisez HARX et ses prestataires de paiement à prélever les montants dus. Un défaut de paiement peut entraîner une suspension.',
        ],
      },
      {
        title: '6. Services tiers',
        paragraphs: [
          'La plateforme peut intégrer téléphonie, IA, paiements et identité. Leurs conditions et politiques de confidentialité s’appliquent également à ces composants.',
        ],
      },
      {
        title: '7. Avertissements',
        paragraphs: [
          'LE SERVICE EST FOURNI « EN L’ÉTAT » ET « SELON DISPONIBILITÉ ». DANS LA LIMITE AUTORISÉE PAR LA LOI, HARX EXCLUT LES GARANTIES DE QUALITÉ MARCHANDE, D’ADÉQUATION À UN USAGE PARTICULIER ET D’ABSENCE DE CONTREFAÇON.',
          'Nous ne garantissons pas de résultats business spécifiques, de taux de connexion d’appels, ni une disponibilité ininterrompue.',
        ],
      },
      {
        title: '8. Limitation de responsabilité',
        paragraphs: [
          'DANS LA LIMITE AUTORISÉE PAR LA LOI, HARX NE SERA PAS RESPONSABLE DES DOMMAGES INDIRECTS, ACCESSOIRES, SPÉCIAUX, CONSÉCUTIFS OU PUNITIFS, NI DES PERTES DE PROFITS/REVENUS.',
          'NOTRE RESPONSABILITÉ GLOBALE LIÉE AU SERVICE EST LIMITÉE AUX SOMMES PAYÉES À HARX POUR LE SERVICE AU COURS DES DOUZE (12) MOIS PRÉCÉDANT LA RÉCLAMATION.',
        ],
      },
      {
        title: '9. Résiliation',
        paragraphs: [
          'Vous pouvez cesser d’utiliser le service et demander la clôture du compte. Nous pouvons suspendre ou résilier en cas de manquement, de risque, de non-paiement ou pour motifs légaux.',
          'À la résiliation, votre droit d’accès prend fin. Les clauses qui doivent survivre (sommes dues, PI, limitations de responsabilité) demeurent applicables.',
        ],
      },
      {
        title: '10. Droit applicable',
        paragraphs: [
          'Ces Conditions sont régies par le droit de l’État du Delaware (États-Unis), sous réserve des dispositions impératives de protection des consommateurs de votre pays de résidence.',
          'Les tribunaux du Delaware sont compétents, sous réserve des fors impératifs locaux le cas échéant.',
        ],
      },
      {
        title: '11. Modifications',
        paragraphs: [
          'Nous pouvons mettre à jour ces Conditions. L’usage continu après la date d’effet vaut acceptation, sauf consentement additionnel exigé par la loi.',
        ],
      },
    ],
  },
  cookies: {
    id: 'cookies',
    title: 'Politique des cookies',
    lastUpdated: UPDATED,
    intro: `La présente Politique des cookies explique comment ${COMPANY} utilise les cookies et technologies similaires sur les sites et applications HARX.`,
    contactNote: `Questions cookies : ${EMAIL}.`,
    sections: [
      {
        title: '1. Qu’est-ce qu’un cookie ?',
        paragraphs: [
          'Les cookies sont de petits fichiers texte stockés sur votre appareil. Des technologies similaires incluent le stockage local, le stockage de session et certains pixels utilisés pour l’authentification, les préférences, l’analytique et la sécurité.',
        ],
      },
      {
        title: '2. Utilisation des cookies',
        paragraphs: [
          'Strictement nécessaires : authentification de session, sécurité, répartition de charge, et préférences essentielles (ex. langue).',
          'Fonctionnels : améliorer l’expérience (état d’interface entre pages).',
          'Analytiques : comprendre le trafic et l’usage des fonctionnalités pour améliorer le produit (lorsqu’ils sont activés).',
          'Marketing : uniquement s’ils sont activés et, le cas échéant, après consentement.',
        ],
      },
      {
        title: '3. Gestion des cookies',
        paragraphs: [
          'Vous pouvez contrôler les cookies via les paramètres de votre navigateur (blocage, suppression, alerte). Bloquer les cookies strictement nécessaires peut empêcher la connexion ou des fonctions essentielles.',
          'Lorsqu’une bannière de consentement est affichée, vous pouvez y mettre à jour vos choix. Vous pouvez aussi nous contacter pour savoir quelles technologies sont actives sur un environnement donné.',
        ],
      },
      {
        title: '4. Tiers',
        paragraphs: [
          'Certains cookies peuvent être déposés par nos prestataires (analytique, chat, paiements, authentification). Ils traitent les données selon leurs politiques et nos contrats.',
        ],
      },
      {
        title: '5. Mises à jour',
        paragraphs: [
          'Nous pouvons mettre à jour cette Politique lorsque nos pratiques ou prestataires évoluent. La date de « Dernière mise à jour » sera révisée en conséquence.',
        ],
      },
    ],
  },
  gdpr: {
    id: 'gdpr',
    title: 'Conformité RGPD',
    lastUpdated: UPDATED,
    intro: `${COMPANY} s’engage à traiter les données personnelles conformément au Règlement général sur la protection des données (RGPD) de l’UE et, le cas échéant, au UK GDPR.`,
    contactNote: `Contact protection des données : ${EMAIL}. Responsable de traitement : ${COMPANY}, ${ADDRESS}.`,
    sections: [
      {
        title: '1. Notre rôle',
        paragraphs: [
          'Pour les données de compte plateforme et visiteurs du site, HARX agit généralement en tant que responsable de traitement.',
          'Pour certains contenus clients traités pour le compte d’une entreprise cliente (ex. listes de prospects téléversées par cette cliente), HARX peut agir en tant que sous-traitant dans le cadre d’un accord de traitement des données (DPA).',
        ],
      },
      {
        title: '2. Principes',
        paragraphs: [
          'Licéité, loyauté et transparence ; limitation des finalités ; minimisation ; exactitude ; limitation de la conservation ; intégrité et confidentialité ; responsabilité.',
        ],
      },
      {
        title: '3. Droits des personnes',
        paragraphs: [
          'Les personnes concernées peuvent demander l’accès, la rectification, l’effacement, la limitation, la portabilité et l’opposition, et retirer leur consentement lorsque le traitement est fondé sur le consentement.',
          `Adressez vos demandes à ${EMAIL}. Nous répondrons dans les délais légaux après vérification de la demande.`,
        ],
      },
      {
        title: '4. Sous-traitants et transferts',
        paragraphs: [
          'Nous maintenons une liste des sous-traitants d’infrastructure et SaaS essentiels (hébergement, e-mail, téléphonie, IA, paiements). Les transferts hors EEE s’appuient sur des garanties appropriées (ex. CCT) lorsque requis.',
        ],
      },
      {
        title: '5. Sécurité et incidents',
        paragraphs: [
          'Nous mettons en œuvre des contrôles d’accès, le chiffrement en transit, une surveillance et des processus adaptés au risque.',
          'Les violations de données personnelles sont évaluées et, lorsque la loi l’exige, notifiées aux autorités et aux personnes concernées sans retard injustifié.',
        ],
      },
      {
        title: '6. DPA et clients entreprise',
        paragraphs: [
          'Les clients entreprise peuvent demander un accord de traitement des données couvrant les activités de sous-traitance, les mesures de sécurité et les sous-traitants. Contactez le commercial ou le juridique via l’e-mail ci-dessus.',
        ],
      },
      {
        title: '7. Documents associés',
        paragraphs: [
          'Voir aussi notre Politique de confidentialité, Politique des cookies et Conditions d’utilisation pour le détail des traitements, cookies et conditions contractuelles.',
        ],
      },
    ],
  },
};
