import React from 'react';
import { Search } from 'lucide-react';

export type TypeFilter = 'all' | 'rep' | 'company';

export const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'rep', label: 'REPs' },
  { value: 'company', label: 'Companies' },
];

type AdminUserFiltersProps = {
  search: string;
  typeFilter: TypeFilter;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: TypeFilter) => void;
};

export default function AdminUserFilters({
  search,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
}: AdminUserFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-3 h-5 w-5 text-violet-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher nom company, email, industrie, téléphone…"
          className="admin-input"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => {
          const active = typeFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onTypeFilterChange(filter.value)}
              className={`admin-filter-pill ${active ? 'admin-filter-pill--active' : 'admin-filter-pill--idle'}`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
