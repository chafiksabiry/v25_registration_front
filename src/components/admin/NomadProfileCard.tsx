import React from 'react';
import { OfferWordmark } from '../Hub/OfferWordmark';
import { InfoCard, formatDate } from './adminUiUtils';

/** Profil NOMAD renvoyé par GET /admin/users/:id (`nomadProfile`) : informations d'affichage seulement. */
export type NomadProfile = {
  companyId?: string | null;
  accountProfile?: string | null;
  name?: string | null;
  phone?: string | null;
  country?: string | null;
  identityCountry?: string | null;
  createdAt?: string | null;
};

/** Carte « Profil » d'un compte NOMAD (au lieu de « Aucun profil company ou rep »). Logo NOMAD, jamais le nom en texte. */
export default function NomadProfileCard({ profile }: { profile: NomadProfile }) {
  return (
    <section className="admin-section space-y-4" data-testid="nomad-profile">
      <div className="pl-3">
        <h2 className="admin-section-title flex items-center gap-2">
          <span>Profil</span>
          <span className="inline-flex [&_svg]:h-4 [&_svg]:w-auto [&_svg]:max-w-none [&_svg]:overflow-visible">
            <OfferWordmark offer="nomad" label="NOMAD" />
          </span>
        </h2>
        <p className="admin-section-desc">Profil enregistré par le portail pour ce compte.</p>
      </div>
      <div className="pl-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <InfoCard label="Nom" value={profile.name || '—'} />
        <InfoCard label="Téléphone" value={profile.phone || '—'} />
        <InfoCard label="Pays" value={profile.country || '—'} />
        <InfoCard label="Pays de l’identité" value={profile.identityCountry || '—'} />
        <InfoCard label="Créé le" value={profile.createdAt ? formatDate(profile.createdAt) : '—'} />
        <InfoCard label="Company ID" value={profile.companyId || '—'} />
      </div>
    </section>
  );
}
