'use client';

import React, { useEffect, useState } from 'react';
import { Search, X, ChevronDown, Filter, CheckCircle, XCircle, Clock, MapPin, Building } from 'lucide-react';

type StandOption = { id: string; name: string };

interface FilterOptions {
  statuses: string[];
  provinces: string[];
  stands: StandOption[]; // expects [{ id, name }]
}

interface TimekeeperAdvancedFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  provinceFilter: string;
  setProvinceFilter: (v: string) => void;
  standFilter: string;
  setStandFilter: (v: string) => void;
  filterOptions: FilterOptions;
  loading?: boolean;
  totalCount?: number;
  filteredCount?: number;
  onClearAll?: () => void;
  onSearch?: (term: string) => void;
}

export default function TimekeeperAdvancedFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  provinceFilter,
  setProvinceFilter,
  standFilter,
  setStandFilter,
  filterOptions,
  loading = false,
  totalCount = 0,
  filteredCount = 0,
  onClearAll,
  onSearch,
}: TimekeeperAdvancedFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => setLocalSearch(searchTerm), [searchTerm]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== searchTerm) {
        setSearchTerm(localSearch);
        onSearch?.(localSearch);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch, searchTerm, setSearchTerm, onSearch]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    statusFilter !== 'all' ||
    provinceFilter !== 'all' ||
    standFilter !== 'all';

  const statusIcon = (s: string) =>
    s === 'active' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
      s === 'inactive' ? <XCircle className="w-4 h-4 text-red-600" /> :
        s === 'pending' ? <Clock className="w-4 h-4 text-yellow-600" /> :
          <Filter className="w-4 h-4 text-gray-600" />;

  const prettifyAll = (s: string) => s || '';

  return (
    <div className="rounded-lg bg-white/90 border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Search & Filters</h3>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">{filteredCount}</span> / {totalCount}
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by name, stand, NIC, email..."
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              aria-label="clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Status */}
        <div>
          <label className="sr-only">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            {filterOptions.statuses?.map((s) => (
              <option key={s} value={s}>
                {prettifyAll(s)}
              </option>
            ))}
          </select>
        </div>

        {/* Province */}
        <div>
          <label className="sr-only">Province</label>
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="all">All Provinces</option>
            {filterOptions.provinces?.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Stand (shows names but value is id) */}
        <div>
          <label className="sr-only">Stand</label>
          <select
            value={standFilter}
            onChange={(e) => setStandFilter(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm appearance-none"
          >
            <option value="all">All Stands</option>
            {filterOptions.stands?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 mt-2 pointer-events-none" />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                  <Search className="w-3 h-3 mr-1" /> {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">
                  {statusIcon(statusFilter)} <span className="ml-1">{statusFilter}</span>
                  <button onClick={() => setStatusFilter('all')} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {provinceFilter !== 'all' && (
                <span className="inline-flex items-center bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs">
                  <MapPin className="w-3 h-3" /> <span className="ml-1">{provinceFilter}</span>
                  <button onClick={() => setProvinceFilter('all')} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {standFilter !== 'all' && (
                <span className="inline-flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs">
                  <Building className="w-3 h-3" />
                  <span className="ml-1">
                    {filterOptions.stands?.find((s) => s.id === standFilter)?.name ?? standFilter}
                  </span>
                  <button onClick={() => setStandFilter('all')} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setProvinceFilter('all'); setStandFilter('all'); onClearAll?.(); }} className="text-xs text-blue-600">
              Clear all
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
          <div className="animate-spin h-3 w-3 rounded-full border-b-2 border-blue-600"></div>
          Loading filter options...
        </div>
      )}
    </div>
  );
}
