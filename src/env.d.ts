/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_QIANKUN: string;
  readonly VITE_FRONT_URL: string;
  readonly VITE_COMPANY_API_URL: string;
  readonly VITE_COMPORCHESTRATOR_BACK_URL?: string;
  readonly VITE_COMPANY_ORCHESTRATOR_URL?: string;
  readonly VITE_REP_API_URL: string;
  readonly VITE_REP_CREATION_PROFILE_URL: string;
  readonly VITE_REP_DASHBOARD_URL: string;
  readonly VITE_REP_ORCHESTRATOR_URL: string;
  /** Recette seulement : « true » ouvre Company, Full Scope et Multi-clients (absent en production = « Bientôt disponible »). */
  readonly VITE_RECETTE_UNLOCK_OFFERS?: string;
  /** « recette » (ou toute valeur autre que « production ») : repères RECETTE visibles. Absente ou « production » : aucun repère (lib/appEnv.ts). */
  readonly VITE_APP_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}