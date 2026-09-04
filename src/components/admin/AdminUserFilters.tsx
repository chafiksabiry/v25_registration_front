import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type TypeFilter = 'all' | 'rep' | 'company' | 'call-center';

export type VerifiedFilter = 'all' | 'true' | 'false';

export type OnboardingFilter =
  | 'all'
  | 'completed'
  | 'in_progress'
  | 'not_started'
  | 'pending'
  | 'missing';

export const TYPE_FILTERS: { value: TypeFilter; labelKey: string; fallback: string }[] = [
  { value: 'all', labelKey: 'adminFilters.typeAll', fallback: 'All' },
  { value: 'rep', labelKey: 'adminFilters.typeRep', fallback: 'REPs' },
  { value: 'company', labelKey: 'adminFilters.typeCompany', fallback: 'Companies' },
  { value: 'call-center', labelKey: 'adminFilters.typeCallCenter', fallback: 'Call Centers' },
];

export const VERIFIED_FILTERS: { value: VerifiedFilter; labelKey: string; fallback: string }[] = [
  { value: 'all', labelKey: 'adminFilters.verifiedAll', fallback: 'All statuses' },
  { value: 'true', labelKey: 'adminFilters.verifiedYes', fallback: 'Verified' },
  { value: 'false', labelKey: 'adminFilters.verifiedNo', fallback: 'Not verified' },
];

export const ONBOARDING_FILTERS: {
  value: OnboardingFilter;
  labelKey: string;
  fallback: string;
}[] = [
  { value: 'all', labelKey: 'adminFilters.onboardingAll', fallback: 'All onboarding' },
  { value: 'completed', labelKey: 'adminFilters.onboardingCompleted', fallback: 'Completed' },
  { value: 'in_progress', labelKey: 'adminFilters.onboardingInProgress', fallback: 'In progress' },
  { value: 'not_started', labelKey: 'adminFilters.onboardingNotStarted', fallback: 'Not started' },
  { value: 'pending', labelKey: 'adminFilters.onboardingPending', fallback: 'Pending' },
  { value: 'missing', labelKey: 'adminFilters.onboardingMissing', fallback: 'Missing' },
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
  const { t } = useTranslation();

  const typeFilters = TYPE_FILTERS.map((f) => ({
    value: f.value,
    label: t(f.labelKey, f.fallback),
  }));
  const verifiedFilters = VERIFIED_FILTERS.map((f) => ({
    value: f.value,
    label: t(f.labelKey, f.fallback),
  }));
  const onboardingFilters = ONBOARDING_FILTERS.map((f) => ({
    value: f.value,
    label: t(f.labelKey, f.fallback),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-3 h-5 w-5 text-violet-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t(
            'adminFilters.searchPlaceholder',
            'Search name, email, company, REP, phone…'
          )}
          className="admin-input"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <FilterPills filters={typeFilters} active={typeFilter} onChange={onTypeFilterChange} />
        {onVerifiedFilterChange ? (
          <FilterPills
            filters={verifiedFilters}
            active={verifiedFilter}
            onChange={onVerifiedFilterChange}
          />
        ) : null}
        {onOnboardingFilterChange ? (
          <FilterPills
            filters={onboardingFilters}
            active={onboardingFilter}
            onChange={onOnboardingFilterChange}
          />
        ) : null}
      </div>
    </div>
  );
}
