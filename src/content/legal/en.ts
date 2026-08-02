import type { LegalDocument } from './types';

const COMPANY = 'HARX Technologies Inc.';
const ADDRESS = '16192 Coastal Hwy, Lewes, DE 19958, United States';
const EMAIL = 'contact@harx.ai';
const UPDATED = 'August 2, 2026';

export const legalEn: Record<string, LegalDocument> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    lastUpdated: UPDATED,
    intro: `This Privacy Policy explains how ${COMPANY} ("HARX", "we", "us") collects, uses, and protects personal data when you use the HARX Transaction-as-a-Service platform, websites, and related services.`,
    contactNote: `Questions about this policy: ${EMAIL}. Postal address: ${ADDRESS}.`,
    sections: [
      {
        title: '1. Who we are',
        paragraphs: [
          `${COMPANY} operates the HARX platform that connects companies with human and AI-assisted agents for customer engagement and related services.`,
          `Controller for personal data processed through our services: ${COMPANY}, ${ADDRESS}.`,
        ],
      },
      {
        title: '2. Data we collect',
        paragraphs: [
          'Account data: name, email, phone number, password (hashed), company or agent profile information, and authentication identifiers (including LinkedIn where you choose to connect).',
          'Usage data: pages visited, feature usage, IP address, approximate location derived from IP, device/browser information, and diagnostic logs needed to secure and improve the service.',
          'Transactional data: gigs, enrollments, call/session metadata, billing and subscription status (payment card details are processed by our payment provider; we do not store full card numbers).',
          'Communications: messages you send to support, demo requests, and newsletter subscriptions if you opt in.',
        ],
      },
      {
        title: '3. Why we process data',
        paragraphs: [
          'To create and manage accounts, authenticate users, and provide the platform features you request.',
          'To match companies and agents, operate telephony and AI-assisted workflows where enabled, and deliver contracted services.',
          'To process payments, prevent fraud, enforce our Terms, and comply with legal obligations.',
          'To send service notices; marketing emails only where permitted (e.g. newsletter opt-in) with an unsubscribe option.',
          'To improve security, reliability, and product quality through analytics and diagnostics.',
        ],
      },
      {
        title: '4. Legal bases (GDPR)',
        paragraphs: [
          'Contract performance: providing the account and platform services you request.',
          'Legitimate interests: securing the platform, preventing abuse, improving services, and limited B2B communications where appropriate.',
          'Consent: cookies that are not strictly necessary, newsletter subscription, and certain optional integrations.',
          'Legal obligation: accounting, tax, and regulatory requirements where applicable.',
        ],
      },
      {
        title: '5. Sharing and processors',
        paragraphs: [
          'We use vetted service providers (hosting, databases, email/SMS, analytics, payments, telephony, AI providers) under contractual data-protection terms. They may process data only on our instructions.',
          'We may disclose data if required by law, to protect rights and safety, or in connection with a corporate transaction (merger, acquisition) with appropriate safeguards.',
          'We do not sell personal data.',
        ],
      },
      {
        title: '6. International transfers',
        paragraphs: [
          'HARX is based in the United States. If you access the service from the EEA/UK/Switzerland, your data may be transferred to the US and other countries where our processors operate.',
          'Where required, we use appropriate safeguards such as Standard Contractual Clauses and additional measures.',
        ],
      },
      {
        title: '7. Retention',
        paragraphs: [
          'We retain account and transactional data for as long as your account is active and for a reasonable period afterward for legal, security, and accounting purposes.',
          'Newsletter emails are kept until you unsubscribe. Support tickets and logs are retained according to operational and security needs, then deleted or anonymized.',
        ],
      },
      {
        title: '8. Your rights',
        paragraphs: [
          'Depending on your location, you may have rights to access, rectify, erase, restrict, or port your data, and to object to certain processing.',
          'You may withdraw consent at any time where processing is based on consent (without affecting prior lawful processing).',
          `To exercise rights, contact ${EMAIL}. You may also lodge a complaint with your local supervisory authority.`,
        ],
      },
      {
        title: '9. Security',
        paragraphs: [
          'We apply technical and organizational measures appropriate to the risk, including encryption in transit, access controls, and monitoring. No method of transmission or storage is 100% secure.',
        ],
      },
      {
        title: '10. Children',
        paragraphs: [
          'The service is intended for business users and adults. We do not knowingly collect personal data from children under 16.',
        ],
      },
      {
        title: '11. Changes',
        paragraphs: [
          'We may update this Privacy Policy from time to time. The “Last updated” date will change, and material changes may be communicated via the platform or email.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    lastUpdated: UPDATED,
    intro: `These Terms of Service (“Terms”) govern access to and use of the HARX platform operated by ${COMPANY}. By creating an account or using the services, you agree to these Terms.`,
    contactNote: `Legal notices: ${EMAIL}. ${COMPANY}, ${ADDRESS}.`,
    sections: [
      {
        title: '1. The service',
        paragraphs: [
          'HARX provides a Transaction-as-a-Service platform connecting companies with agents (human and/or AI-assisted) for outbound/inbound engagement, related tooling (matching, training, telephony, knowledge base), and billing features.',
          'Features may vary by plan, region, and configuration. We may modify or discontinue features with reasonable notice where practicable.',
        ],
      },
      {
        title: '2. Accounts and eligibility',
        paragraphs: [
          'You must provide accurate registration information and keep credentials confidential. You are responsible for activity under your account.',
          'Company accounts must be created by an authorized representative. Agent accounts must comply with applicable labor and local laws for their activity.',
        ],
      },
      {
        title: '3. Acceptable use',
        paragraphs: [
          'You will not misuse the platform: no unlawful spam, fraud, harassment, infringement of third-party rights, malware, scraping that burdens the service, or attempts to bypass security or billing.',
          'You are responsible for the legality of your campaigns, scripts, lead lists, and consent for communications (including telephony and messaging laws such as TCPA where applicable).',
          'AI-assisted calling and messaging must be disclosed and used in accordance with applicable law and platform settings.',
        ],
      },
      {
        title: '4. Content and IP',
        paragraphs: [
          'You retain rights to content you upload (scripts, knowledge base materials, brand assets). You grant HARX a license to host and process that content solely to provide the services.',
          'HARX and its licensors own the platform software, branding, and documentation. You receive a limited, non-exclusive, non-transferable right to use the service during your subscription.',
        ],
      },
      {
        title: '5. Fees and billing',
        paragraphs: [
          'Paid plans, usage-based charges (e.g. minutes, phone lines), and commissions are described in-product or in an order form. Fees are generally non-refundable except where required by law or expressly stated.',
          'You authorize us and our payment processors to charge applicable fees. Late or failed payment may result in suspension.',
        ],
      },
      {
        title: '6. Third-party services',
        paragraphs: [
          'The platform may integrate telephony, AI, payment, and identity providers. Their terms and privacy policies also apply to your use of those components.',
        ],
      },
      {
        title: '7. Disclaimers',
        paragraphs: [
          'THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”. TO THE MAXIMUM EXTENT PERMITTED BY LAW, HARX DISCLAIMS WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
          'We do not guarantee specific business results, call connect rates, or uninterrupted availability.',
        ],
      },
      {
        title: '8. Limitation of liability',
        paragraphs: [
          'TO THE MAXIMUM EXTENT PERMITTED BY LAW, HARX WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS/REVENUE.',
          'OUR AGGREGATE LIABILITY ARISING OUT OF THE SERVICE IS LIMITED TO THE FEES PAID TO HARX FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.',
        ],
      },
      {
        title: '9. Termination',
        paragraphs: [
          'You may stop using the service and request account closure. We may suspend or terminate for breach, risk, non-payment, or legal reasons.',
          'Upon termination, your right to access the service ends. Provisions that by nature should survive (fees owed, IP, liability limits) will survive.',
        ],
      },
      {
        title: '10. Governing law',
        paragraphs: [
          `These Terms are governed by the laws of the State of Delaware, USA, excluding conflict-of-law rules, unless mandatory consumer protections in your country of residence apply.`,
          'Courts located in Delaware shall have exclusive jurisdiction, subject to mandatory local venues where required by law.',
        ],
      },
      {
        title: '11. Changes',
        paragraphs: [
          'We may update these Terms. Continued use after the effective date of changes constitutes acceptance, except where additional consent is required by law.',
        ],
      },
    ],
  },
  cookies: {
    id: 'cookies',
    title: 'Cookie Policy',
    lastUpdated: UPDATED,
    intro: `This Cookie Policy explains how ${COMPANY} uses cookies and similar technologies on HARX websites and applications.`,
    contactNote: `Cookie questions: ${EMAIL}.`,
    sections: [
      {
        title: '1. What are cookies?',
        paragraphs: [
          'Cookies are small text files stored on your device. Similar technologies include local storage, session storage, and pixels used for authentication, preferences, analytics, and security.',
        ],
      },
      {
        title: '2. How we use cookies',
        paragraphs: [
          'Strictly necessary: session authentication, security, load balancing, and remembering essential preferences (e.g. language).',
          'Functional: improving UX such as keeping UI state across pages.',
          'Analytics: understanding traffic and feature usage to improve the product (where enabled).',
          'Marketing: only if activated and, where required, after consent.',
        ],
      },
      {
        title: '3. Managing cookies',
        paragraphs: [
          'You can control cookies through your browser settings (block, delete, or alert). Blocking strictly necessary cookies may prevent login or core features from working.',
          'Where a consent banner is shown, you can update choices there. You may also contact us to ask which technologies are active on a given environment.',
        ],
      },
      {
        title: '4. Third parties',
        paragraphs: [
          'Some cookies may be set by providers we use (analytics, chat, payments, authentication). Those providers process data under their own policies and our agreements.',
        ],
      },
      {
        title: '5. Updates',
        paragraphs: [
          'We may update this Cookie Policy when our practices or providers change. The “Last updated” date will be revised accordingly.',
        ],
      },
    ],
  },
  gdpr: {
    id: 'gdpr',
    title: 'GDPR Compliance',
    lastUpdated: UPDATED,
    intro: `${COMPANY} is committed to processing personal data in line with the EU General Data Protection Regulation (GDPR) and equivalent UK GDPR principles where applicable.`,
    contactNote: `Data protection contact: ${EMAIL}. Controller: ${COMPANY}, ${ADDRESS}.`,
    sections: [
      {
        title: '1. Our role',
        paragraphs: [
          'For platform account data and website visitors, HARX typically acts as a controller.',
          'For certain customer content processed on behalf of a company customer (e.g. lead lists uploaded by that customer), HARX may act as a processor under a data processing agreement (DPA).',
        ],
      },
      {
        title: '2. Principles we follow',
        paragraphs: [
          'Lawfulness, fairness, and transparency; purpose limitation; data minimization; accuracy; storage limitation; integrity and confidentiality; and accountability.',
        ],
      },
      {
        title: '3. Rights of individuals',
        paragraphs: [
          'Data subjects may request access, rectification, erasure, restriction, portability, and objection, and may withdraw consent where processing is consent-based.',
          `Submit requests to ${EMAIL}. We will respond within the timelines required by applicable law after verifying the request.`,
        ],
      },
      {
        title: '4. Subprocessors and transfers',
        paragraphs: [
          'We maintain a list of core infrastructure and SaaS subprocessors (hosting, email, telephony, AI, payments). Transfers outside the EEA rely on appropriate safeguards such as SCCs when required.',
        ],
      },
      {
        title: '5. Security and incidents',
        paragraphs: [
          'We implement access controls, encryption in transit, monitoring, and staff/process controls proportionate to risk.',
          'Personal data breaches will be assessed and, where legally required, notified to authorities and affected individuals without undue delay.',
        ],
      },
      {
        title: '6. DPA and enterprise customers',
        paragraphs: [
          'Enterprise customers may request a Data Processing Agreement covering processor activities, security measures, and subprocessor terms. Contact sales or legal via the email above.',
        ],
      },
      {
        title: '7. Related documents',
        paragraphs: [
          'See also our Privacy Policy, Cookie Policy, and Terms of Service for full details on processing, cookies, and contractual terms.',
        ],
      },
    ],
  },
};
