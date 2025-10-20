'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  ChevronDown,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building
} from 'lucide-react';

interface FilterOptions {
  statuses: Array< 'active' | 'inactive' >;
  provinces: Array<string>;
  stands: Array<string>;
}

interface TimekeeperAdvancedFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  provinceFilter: string;
  setProvinceFilter: (value: string) => void;
  standFilter: string;
  setStandFilter: (value: string) => void;
  filterOptions: FilterOptions;
  loading: boolean;
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
  loading,
  totalCount = 0,
  filteredCount = 0,
  onClearAll,
  onSearch
}: TimekeeperAdvancedFiltersProps) {
  const [searchValue, setSearchValue] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== searchTerm) {
        setSearchTerm(searchValue);
        onSearch?.(searchValue);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchValue, searchTerm, setSearchTerm, onSearch]);

  // Sync local state when props change
  useEffect(() => {
    if (searchTerm !== searchValue) setSearchValue(searchTerm);
  }, [searchTerm]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    statusFilter !== 'all' ||
    provinceFilter !== 'all' ||
    standFilter !== 'all';

  const activeFilterCount = [
    searchTerm && 'search',
    statusFilter !== 'all' && 'status',
    provinceFilter !== 'all' && 'province',
    standFilter !== 'all' && 'stand'
  ].filter(Boolean).length;

  const handleClearAll = useCallback(() => {
    setSearchValue('');
    setStatusFilter('all');
    setProvinceFilter('all');
    setStandFilter('all');
    onClearAll?.();
  }, [setStatusFilter, setProvinceFilter, setStandFilter, onClearAll]);

  const getStatusIcon = (value: string) => {
    switch (value) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Filter className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (value: string) => {
    switch (value) {
      case 'active':
        return 'Active Only';
      case 'inactive':
        return 'Inactive Only';
      case 'pending':
        return 'Pending Only';
      case 'cancelled':
        return 'Cancelled Only';
      default:
        return 'All Statuses';
    }
  };

  const getProvinceIcon = () => <MapPin className="w-4 h-4 text-indigo-600" />;
  const getStandIcon = () => <Building className="w-4 h-4 text-blue-600" />;

  return (
    <div className="rounded-2xl backdrop-blur-md bg-white/80 border border-gray-100 shadow-lg transition-all duration-300 p-6 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
            Search & Filters
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">{filteredCount}</span> /{' '}
          {totalCount} timekeepers
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="🔍 Search by name, stand, or ID..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="block w-full rounded-xl border border-gray-200 bg-white/70 pl-4 pr-10 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        {[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: ['all', ...filterOptions.statuses],
            color: 'blue'
          },
          {
            label: 'Province',
            value: provinceFilter,
            onChange: setProvinceFilter,
            options: ['all', ...filterOptions.provinces],
            color: 'indigo'
          },
          {
            label: 'Stand',
            value: standFilter,
            onChange: setStandFilter,
            options: ['all', ...filterOptions.stands],
            color: 'purple'
          }
        ].map((filter, idx) => (
          <div key={idx} className="relative flex-1">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              disabled={loading}
              className={`block w-full rounded-xl border border-gray-200 bg-white/70 pl-3 pr-8 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-${filter.color}-500 focus:border-${filter.color}-500 disabled:opacity-50 appearance-none`}
            >
              {filter.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'all' ? `All ${filter.label}s` : opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-5 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-700">
                  <Search className="w-3 h-3 mr-1" />
                  “{searchTerm}”
                  <button
                    onClick={() => setSearchValue('')}
                    className="ml-1 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-green-100 text-green-700">
                  {getStatusIcon(statusFilter)}
                  <span className="ml-1">{getStatusLabel(statusFilter)}</span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {provinceFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-indigo-100 text-indigo-700">
                  {getProvinceIcon()}
                  <span className="ml-1">{provinceFilter}</span>
                  <button
                    onClick={() => setProvinceFilter('all')}
                    className="ml-1 hover:text-indigo-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {standFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-purple-100 text-purple-700">
                  {getStandIcon()}
                  <span className="ml-1">{standFilter}</span>
                  <button
                    onClick={() => setStandFilter('all')}
                    className="ml-1 hover:text-purple-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={handleClearAll}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          Loading filter options...
        </div>
      )}
    </div>
  );
}
