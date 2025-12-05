'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BusStopManagementService } from '@/lib/api-client/route-management';
import type { StopResponse, PageStopResponse, StopRequest } from '@/lib/api-client/route-management';

// Components
import { BusStopStatsCards } from '@/components/mot/bus-stops/BusStopStatsCards';
import { BusStopAdvancedFilters } from '@/components/mot/bus-stops/BusStopAdvancedFilters';
import { BusStopActionButtons } from '@/components/mot/bus-stops/BusStopActionButtons';
import { BusStopsTable } from '@/components/mot/bus-stops/BusStopsTable';
import { BusStopsMapView } from '@/components/mot/bus-stops/BusStopsMapView';
import { ViewTabs } from '@/components/mot/bus-stops/ViewTabs';
import { BusStopPagination } from '@/components/mot/bus-stops/BusStopPagination';
import { DeleteConfirmationModal } from '@/components/mot/confirmation-modals';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/shared/layout';

export type ViewType = 'table' | 'map';

interface QueryParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  search: string;
  state?: string;
  isAccessible?: boolean;
}

interface FilterOptions {
  states: string[];
  accessibilityStatuses: boolean[];
}

export default function BusStopsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // View state
  const [currentView, setCurrentView] = useState<ViewType>('table');
  
  // Data states
  const [allBusStops, setAllBusStops] = useState<StopResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [accessibilityFilter, setAccessibilityFilter] = useState('all');

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    states: [],
    accessibilityStatuses: []
  });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 0,
    size: 10,
    sortBy: 'name',
    sortDir: 'asc',
    search: '',
  });

  // Statistics state
  const [stats, setStats] = useState({
    totalStops: { count: 0 },
    accessibleStops: { count: 0 },
    nonAccessibleStops: { count: 0 },
    totalStates: { count: 0 },
    totalCities: { count: 0 }
  });

  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stopToDelete, setStopToDelete] = useState<StopResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load filter options
  const loadFilterOptions = useCallback(async () => {
    try {
      setFilterOptionsLoading(true);
      const response = await BusStopManagementService.getFilterOptions1();

      setFilterOptions({
        states: response.states || [],
        accessibilityStatuses: response.accessibilityStatuses || []
      });
    } catch (error) {
      console.error('Failed to load filter options:', error);
    } finally {
      setFilterOptionsLoading(false);
    }
  }, []);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const response = await BusStopManagementService.getStopStatistics();
      setStats({
        totalStops: { count: response.totalStops || 0 },
        accessibleStops: { count: response.accessibleStops || 0 },
        nonAccessibleStops: { count: response.nonAccessibleStops || 0 },
        totalStates: { count: Object.keys(response.stopsByState || {}).length },
        totalCities: { count: Object.keys(response.stopsByCity || {}).length }
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }, []);

  // Load bus stops from API - handle both server-side and client-side filtering appropriately
  const loadBusStops = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If we have search, state, or accessibility filters, we need to get all data for client-side filtering
      // Otherwise, we can use server-side pagination for better performance
      const needsClientSideFiltering = queryParams.search || stateFilter !== 'all' || accessibilityFilter !== 'all';
      
      if (needsClientSideFiltering) {
        // Get all results for client-side filtering
        let allResults: StopResponse[] = [];
        let page = 0;
        let hasMore = true;
        const pageSize = 500; // Use reasonable page size for batch fetching
        
        while (hasMore) {
          const response: PageStopResponse = await BusStopManagementService.getAllStops(
            page,
            pageSize,
            queryParams.sortBy,
            queryParams.sortDir,
            queryParams.search
          );
          
          if (response.content && response.content.length > 0) {
            allResults = [...allResults, ...response.content];
            page++;
            hasMore = !response.last && response.content.length === pageSize;
          } else {
            hasMore = false;
          }
        }
        
        setAllBusStops(allResults);
      } else {
        // Use server-side pagination when no filters are applied
        const response: PageStopResponse = await BusStopManagementService.getAllStops(
          queryParams.page,
          queryParams.size,
          queryParams.sortBy,
          queryParams.sortDir
        );
        
        setAllBusStops(response.content || []);
      }
    } catch (error) {
      console.error('Failed to load bus stops:', error);
      setError('Failed to load bus stops. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [queryParams.search, queryParams.sortBy, queryParams.sortDir, queryParams.page, queryParams.size, stateFilter, accessibilityFilter]);

  useEffect(() => {
    loadFilterOptions();
    loadStatistics();
  }, [loadFilterOptions, loadStatistics]);

  useEffect(() => {
    loadBusStops();
  }, [loadBusStops]);

  // Update query params with filters
  const updateQueryParams = useCallback((updates: Partial<QueryParams>) => {
    const filteredUpdates: Partial<QueryParams> = {};

    // Only include defined values
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        (filteredUpdates as any)[key] = value;
      }
    });

    // Add filter-based query params
    if (stateFilter !== 'all') {
      filteredUpdates.state = stateFilter;
    }

    if (accessibilityFilter !== 'all') {
      filteredUpdates.isAccessible = accessibilityFilter === 'accessible';
    }

    setQueryParams(prev => ({
      ...prev,
      ...filteredUpdates,
      // Reset to first page when filters change (except when page is explicitly updated)
      page: 'page' in filteredUpdates ? filteredUpdates.page! : 0,
    }));
  }, [stateFilter, accessibilityFilter]);

  // Remove the automatic filter application useEffect - we'll handle it manually

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    // Reset to first page when search changes
    updateQueryParams({ search: searchTerm, page: 0 });
  };

  const handleSearchTermUpdate = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleSort = (sortBy: string, sortDir: 'asc' | 'desc') => {
    updateQueryParams({ sortBy, sortDir });
  };

  const handlePageChange = (page: number) => {
    updateQueryParams({ page });
  };

  const handlePageSizeChange = (size: number) => {
    updateQueryParams({ size, page: 0 });
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleStateFilterChange = (value: string) => {
    setStateFilter(value);
    // Reset to first page when filter changes
    setQueryParams(prev => ({ ...prev, page: 0 }));
  };

  const handleAccessibilityFilterChange = (value: string) => {
    setAccessibilityFilter(value);
    // Reset to first page when filter changes
    setQueryParams(prev => ({ ...prev, page: 0 }));
  };

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm('');
    setStateFilter('all');
    setAccessibilityFilter('all');
    setQueryParams({
      page: 0,
      size: 10,
      sortBy: 'name',
      sortDir: 'asc',
      search: '',
    });
  }, []);

  // Bus stop action handlers
  const handleAddBusStop = () => {
    router.push('/mot/bus-stops/add-new');
  };

  const handleImportBusStops = () => {
    router.push('/mot/bus-stops/import');
  };

  const handleExportAll = async () => {
    try {
      toast({
        title: "Export Started",
        description: "Your export will begin shortly...",
      });
      
      // TODO: Implement export functionality
      console.log('Exporting all bus stops...');
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export bus stops. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = (stopId: string) => {
    router.push(`/mot/bus-stops/${stopId}`);
  };

  const handleEdit = (stopId: string) => {
    router.push(`/mot/bus-stops/${stopId}/edit`);
  };

  const handleDeleteClick = (stopId: string, stopName: string) => {
    const stop = allBusStops.find(s => s.id === stopId);
    if (stop) {
      setStopToDelete(stop);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStopToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!stopToDelete) return;

    try {
      setIsDeleting(true);
      await BusStopManagementService.deleteStop(stopToDelete.id!);
      
      toast({
        title: "Bus Stop Deleted",
        description: `${stopToDelete.name} has been deleted successfully.`,
      });

      setShowDeleteModal(false);
      setStopToDelete(null);
      
      // Reload data
      loadBusStops();
      loadStatistics();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete bus stop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get filtered bus stops for map view
  const filteredMapBusStops = useMemo(() => {
    if (currentView !== 'map') return [];
    
    let filtered = allBusStops;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(stop =>
        stop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.location?.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply state filter
    if (stateFilter !== 'all') {
      filtered = filtered.filter(stop => stop.location?.state === stateFilter);
    }

    // Apply accessibility filter
    if (accessibilityFilter !== 'all') {
      const isAccessible = accessibilityFilter === 'accessible';
      filtered = filtered.filter(stop => stop.isAccessible === isAccessible);
    }

    return filtered;
  }, [currentView, allBusStops, searchTerm, stateFilter, accessibilityFilter]);

  // Get filtered and paginated bus stops for table view
  const filteredTableData = useMemo(() => {
    if (currentView !== 'table') return { data: [], totalElements: 0, totalPages: 0 };
    
    const needsClientSideFiltering = queryParams.search || stateFilter !== 'all' || accessibilityFilter !== 'all';
    
    if (!needsClientSideFiltering) {
      // When using server-side pagination, return the data as-is
      return {
        data: allBusStops,
        totalElements: stats.totalStops.count, // Use total from statistics
        totalPages: Math.ceil(stats.totalStops.count / queryParams.size)
      };
    }
    
    // Client-side filtering when filters are applied
    let filtered = allBusStops;

    // Apply search filter (note: search is also handled server-side but we keep this for consistency)
    if (searchTerm) {
      filtered = filtered.filter(stop =>
        stop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.location?.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply state filter
    if (stateFilter !== 'all') {
      filtered = filtered.filter(stop => stop.location?.state === stateFilter);
    }

    // Apply accessibility filter
    if (accessibilityFilter !== 'all') {
      const isAccessible = accessibilityFilter === 'accessible';
      filtered = filtered.filter(stop => stop.isAccessible === isAccessible);
    }

    // Apply sorting (only for client-side filtering, server-side is already sorted)
    if (needsClientSideFiltering) {
      filtered.sort((a, b) => {
        const field = queryParams.sortBy;
        const direction = queryParams.sortDir === 'asc' ? 1 : -1;
        
        let aVal = '';
        let bVal = '';
        
        switch (field) {
          case 'name':
            aVal = a.name || '';
            bVal = b.name || '';
            break;
          case 'createdAt':
            aVal = a.createdAt || '';
            bVal = b.createdAt || '';
            break;
          case 'updatedAt':
            aVal = a.updatedAt || '';
            bVal = b.updatedAt || '';
            break;
          case 'city':
            aVal = a.location?.city || '';
            bVal = b.location?.city || '';
            break;
          case 'state':
            aVal = a.location?.state || '';
            bVal = b.location?.state || '';
            break;
          default:
            aVal = a.name || '';
            bVal = b.name || '';
        }
        
        return aVal.localeCompare(bVal) * direction;
      });
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / queryParams.size);
    const startIndex = queryParams.page * queryParams.size;
    const endIndex = startIndex + queryParams.size;
    const data = filtered.slice(startIndex, endIndex);

    return {
      data,
      totalElements,
      totalPages
    };
  }, [currentView, allBusStops, searchTerm, stateFilter, accessibilityFilter, queryParams, stats.totalStops.count]);

  // Update busStops and pagination based on current view
  const busStops = currentView === 'table' ? filteredTableData.data : [];
  
  const pagination = useMemo(() => ({
    currentPage: queryParams.page,
    totalPages: currentView === 'table' ? filteredTableData.totalPages : 0,
    totalElements: currentView === 'table' ? filteredTableData.totalElements : 0,
    pageSize: queryParams.size,
  }), [queryParams.page, queryParams.size, currentView, filteredTableData]);

  const currentSort = {
    field: queryParams.sortBy,
    direction: queryParams.sortDir
  };

  const activeFilters = {
    search: searchTerm,
    state: stateFilter,
    accessibility: accessibilityFilter
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Bus Stops</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadBusStops();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout
          activeItem="bus-stops"
          pageTitle="Bus Stops"
          pageDescription="Manage and monitor bus stops across your network"
          role="mot"
        >
    <div className="space-y-6">
      {/* Statistics Cards */}
      <BusStopStatsCards stats={stats} />

      {/* Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <BusStopActionButtons
          onAddBusStop={handleAddBusStop}
          onImportBusStops={handleImportBusStops}
          onExportAll={handleExportAll}
          isLoading={isLoading}
        />
      </div>

      {/* Advanced Filters */}
      <BusStopAdvancedFilters
        searchTerm={searchTerm}
        setSearchTerm={handleSearchTermUpdate}
        stateFilter={stateFilter}
        setStateFilter={handleStateFilterChange}
        accessibilityFilter={accessibilityFilter}
        setAccessibilityFilter={handleAccessibilityFilterChange}
        filterOptions={filterOptions}
        loading={filterOptionsLoading}
        totalCount={stats.totalStops.count}
        filteredCount={currentView === 'table' ? pagination.totalElements : filteredMapBusStops.length}
        onClearAll={handleClearAllFilters}
        onSearch={handleSearch}
      />

      {/* View Tabs */}
      <ViewTabs
        activeView={currentView}
        onViewChange={handleViewChange}
        tableCount={pagination.totalElements}
        mapCount={filteredMapBusStops.length}
      />

      {/* Content based on current view */}
      {currentView === 'table' ? (
        <div className='bg-white shadow-sm rounded-lg border border-gray-200'>
          <BusStopsTable
            busStops={busStops}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onSort={handleSort}
            activeFilters={activeFilters}
            loading={isLoading}
            currentSort={currentSort}
          />

          <BusStopPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={isLoading}
          />
        </div>
      ) : (
        <BusStopsMapView
          busStops={filteredMapBusStops}
          loading={isLoading}
          onDelete={(stop: StopResponse) => handleDeleteClick(stop.id!, stop.name || 'Unknown')}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Bus Stop"
        itemName={stopToDelete?.name || 'this bus stop'}
        isLoading={isDeleting}
      />
    </div>
    </Layout>
  );
}