import React from 'react';
import { Search } from 'lucide-react';

export type TypeFilter = 'all' | 'rep' | 'company';
export type VerifiedFilter = 'all' | 'true' | 'false';
export type OnboardingFilter =
  | 'all'
  | 'completed'
  | 'in_progress'
  | 'not_started'
  | 'pending'
  | 'missing';

export const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'rep', label: 'REPs' },
  { value: 'company', label: 'Companies' },
];

export const VERIFIED_FILTERS: { value: VerifiedFilter; label: string }[] = [
  { value: 'all', label: 'Tous statuts' },
  { value: 'true', label: 'Vérifiés' },
  { value: 'false', label: 'Non vérifiés' },
];

export const ONBOARDING_FILTERS: { value: OnboardingFilter; label: string }[] = [
  { value: 'all', label: 'Tous onboarding' },
  { value: 'completed', label: 'Terminé' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'not_started', label: 'Non démarré' },
  { value: 'pending', label: 'En attente' },
  { value: 'missing', label: 'Profil absent' },
];

type AdminUserFiltersProps = {
  search: string;
  typeFilter: TypeFilter;
  verifiedFilter?: VerifiedFilter;
  onboardingFilter?: OnboardingFilter;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: TypeFilter) => void;
  onVerifiedFilterChange?: (value: VerifiedFilter) => void;
  onOnboardingFilterChange?: (value: OnboardingFilter) => void;
};

function FilterPills<T extends string>({
  filters,
  active,
  onChange,
}: {
  filters: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = active === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`admin-filter-pill ${isActive ? 'admin-filter-pill--active' : 'admin-filter-pill--idle'}`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminUserFilters({
  search,
  typeFilter,
  verifiedFilter = 'all',
  onboardingFilter = 'all',
  onSearchChange,
  onTypeFilterChange,
  onVerifiedFilterChange,
  onOnboardingFilterChange,
}: AdminUserFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-3 h-5 w-5 text-violet-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher nom, email, company, REP, téléphone…"
          className="admin-input"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <FilterPills filters={TYPE_FILTERS} active={typeFilter} onChange={onTypeFilterChange} />
        {onVerifiedFilterChange ? (
          <FilterPills
            filters={VERIFIED_FILTERS}
            active={verifiedFilter}
            onChange={onVerifiedFilterChange}
          />
        ) : null}
        {onOnboardingFilterChange ? (
          <FilterPills
            filters={ONBOARDING_FILTERS}
            active={onboardingFilter}
            onChange={onOnboardingFilterChange}
          />
        ) : null}
      </div>
    </div>
  );
}
