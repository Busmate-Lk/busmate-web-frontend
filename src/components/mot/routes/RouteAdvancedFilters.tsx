'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  MapPin,
  Route,
  RotateCcw,
  Navigation,
  Clock,
  Ruler
} from 'lucide-react';

interface FilterOptions {
  routeGroups: Array<{ id: string; name: string }>;
  directions: Array<'OUTBOUND' | 'INBOUND'>;
  roadTypes: Array<'NORMALWAY' | 'EXPRESSWAY'>;
  distanceRange: { min: number; max: number };
  durationRange: { min: number; max: number };
}

interface RouteAdvancedFiltersProps {
  // Search
  searchTerm: string;
  setSearchTerm: (value: string) => void;

  // Filters
  routeGroupFilter: string;
  setRouteGroupFilter: (value: string) => void;
  directionFilter: string;
  setDirectionFilter: (value: string) => void;
  minDistance: string;
  setMinDistance: (value: string) => void;
  maxDistance: string;
  setMaxDistance: (value: string) => void;
  minDuration: string;
  setMinDuration: (value: string) => void;
  maxDuration: string;
  setMaxDuration: (value: string) => void;

  // Data
  filterOptions: FilterOptions;
  loading: boolean;

  // Stats for display
  totalCount?: number;
  filteredCount?: number;

  // Event handlers
  onClearAll?: () => void;
  onSearch?: (term: string) => void;
}

export default function RouteAdvancedFilters({
  searchTerm,
  setSearchTerm,
  routeGroupFilter,
  setRouteGroupFilter,
  directionFilter,
  setDirectionFilter,
  minDistance,
  setMinDistance,
  maxDistance,
  setMaxDistance,
  minDuration,
  setMinDuration,
  maxDuration,
  setMaxDuration,
  filterOptions,
  loading,
  totalCount = 0,
  filteredCount = 0,
  onClearAll,
  onSearch
}: RouteAdvancedFiltersProps) {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(searchTerm);

    // Debounced search effect
  useEffect(() => {
    if (searchValue !== searchTerm) {
      const handler = setTimeout(() => {
        setSearchTerm(searchValue);
        if (onSearch) {
          onSearch(searchValue);
        }
      }, 400);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [searchValue, searchTerm, setSearchTerm, onSearch]);

  // Update local search when prop changes (but avoid infinite loops)
  useEffect(() => {
    if (searchTerm !== searchValue) {
      setSearchValue(searchTerm);
    }
  }, [searchTerm]);

  const hasActiveFilters = Boolean(
    searchTerm ||
    routeGroupFilter !== 'all' ||
    directionFilter !== 'all' ||
    minDistance ||
    maxDistance ||
    minDuration ||
    maxDuration
  );

  const activeFilterCount = [
    searchTerm && 'search',
    routeGroupFilter !== 'all' && 'route-group',
    directionFilter !== 'all' && 'direction',
    minDistance && 'min-distance',
    maxDistance && 'max-distance',
    minDuration && 'min-duration',
    maxDuration && 'max-duration'
  ].filter(Boolean).length;

  const handleClearAll = useCallback(() => {
    setSearchValue('');
    setRouteGroupFilter('all');
    setDirectionFilter('all');
    setMinDistance('');
    setMaxDistance('');
    setMinDuration('');
    setMaxDuration('');
    if (onClearAll) {
      onClearAll();
    }
  }, [setRouteGroupFilter, setDirectionFilter, setMinDistance, setMaxDistance, setMinDuration, setMaxDuration, onClearAll]);

  const getDirectionIcon = (value: string) => {
    switch (value) {
      case 'OUTBOUND':
        return <Navigation className="w-4 h-4 text-blue-600" />;
      case 'INBOUND':
        return <Navigation className="w-4 h-4 text-green-600 rotate-180" />;
      default:
        return <Route className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDirectionLabel = (value: string) => {
    switch (value) {
      case 'OUTBOUND':
        return 'Outbound Only';
      case 'INBOUND':
        return 'Inbound Only';
      default:
        return 'All Directions';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Compact Main Filter Section */}
      <div className="p-4">
        {/* Header with Count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {filteredCount.toLocaleString()}
            </span>
            <> of {totalCount.toLocaleString()} routes</>
          </div>
        </div>

        {/* Compact Filter Row */}
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search routes by name, description, route group, or stop names..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="block w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {/* Show loading indicator when search value differs from current search term */}
              {searchValue !== searchTerm && searchValue && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              )}
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

          {/* Filter Row */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Route Group Filter */}
            <div className="relative">
              <select
                value={routeGroupFilter}
                onChange={(e) => setRouteGroupFilter(e.target.value)}
                disabled={loading}
                className="block w-full lg:w-48 pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="all">All Route Groups</option>
                {filterOptions.routeGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Direction Filter */}
            <div className="relative">
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="block w-full lg:w-40 pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
              >
                <option value="all">All Directions</option>
                {filterOptions.directions.map((direction) => (
                  <option key={direction} value={direction}>
                    {direction === 'OUTBOUND' ? 'Outbound' : 'Inbound'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Distance Range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Min km"
                  value={minDistance}
                  onChange={(e) => setMinDistance(e.target.value)}
                  min={filterOptions.distanceRange.min}
                  max={filterOptions.distanceRange.max}
                  className="block w-24 pl-3 pr-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Max km"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  min={filterOptions.distanceRange.min}
                  max={filterOptions.distanceRange.max}
                  className="block w-24 pl-3 pr-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Duration Range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Min min"
                  value={minDuration}
                  onChange={(e) => setMinDuration(e.target.value)}
                  min={filterOptions.durationRange.min}
                  max={filterOptions.durationRange.max}
                  className="block w-24 pl-3 pr-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Max min"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(e.target.value)}
                  min={filterOptions.durationRange.min}
                  max={filterOptions.durationRange.max}
                  className="block w-24 pl-3 pr-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Section */}
      {hasActiveFilters && (
        <div className="border-t border-gray-100">
          <div className="p-3">
            <div className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </span>
                <div className='flex items-center gap-2 ml-4 flex-wrap'>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      <Search className="w-3 h-3" />
                      "{searchTerm}"
                      <button
                        onClick={() => setSearchValue('')}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {routeGroupFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      <MapPin className="w-3 h-3" />
                      {filterOptions.routeGroups.find(g => g.id === routeGroupFilter)?.name || routeGroupFilter}
                      <button
                        onClick={() => setRouteGroupFilter('all')}
                        className="ml-1 hover:text-green-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {directionFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                      {getDirectionIcon(directionFilter)}
                      {directionFilter === 'OUTBOUND' ? 'Outbound' : 'Inbound'}
                      <button
                        onClick={() => setDirectionFilter('all')}
                        className="ml-1 hover:text-purple-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(minDistance || maxDistance) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                      <Ruler className="w-3 h-3" />
                      {minDistance || 0}km - {maxDistance || '∞'}km
                      <button
                        onClick={() => {
                          setMinDistance('');
                          setMaxDistance('');
                        }}
                        className="ml-1 hover:text-orange-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(minDuration || maxDuration) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-pink-100 text-pink-800">
                      <Clock className="w-3 h-3" />
                      {minDuration || 0}min - {maxDuration || '∞'}min
                      <button
                        onClick={() => {
                          setMinDuration('');
                          setMaxDuration('');
                        }}
                        className="ml-1 hover:text-pink-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
              {/* Clear All Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs text-blue-800">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}