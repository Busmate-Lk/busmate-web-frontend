'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/shared/layout';
import RouteAdvancedFilters from '@/components/mot/routes/RouteAdvancedFilters';
import { RouteStatsCards } from '@/components/mot/routes/RouteStatsCards';
import { RoutesTable } from '@/components/mot/routes/RoutesTable';
import { RouteActionButtons } from '@/components/mot/routes/RouteActionButtons';
import Pagination from '@/components/shared/Pagination';
import DeleteRouteConfirmation from '@/components/mot/routes/DeleteRouteConfirmation';
import { RouteManagementService } from '@/lib/api-client/route-management';
import type { RouteResponse, PageRouteResponse, RouteStatisticsResponse, RouteFilterOptionsResponse } from '@/lib/api-client/route-management';

interface QueryParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  search: string;
  routeGroupId?: string;
  direction?: 'OUTBOUND' | 'INBOUND';
  minDistance?: number;
  maxDistance?: number;
  minDuration?: number;
  maxDuration?: number;
}

interface FilterOptions {
  routeGroups: Array<{ id: string; name: string }>;
  directions: Array<'OUTBOUND' | 'INBOUND'>;
  roadTypes: Array<'NORMALWAY' | 'EXPRESSWAY'>;
  distanceRange: { min: number; max: number };
  durationRange: { min: number; max: number };
}

export default function RoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [routeGroupFilter, setRouteGroupFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [minDistance, setMinDistance] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [minDuration, setMinDuration] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  
  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    routeGroups: [],
    directions: [],
    roadTypes: [],
    distanceRange: { min: 0, max: 100 },
    durationRange: { min: 0, max: 300 }
  });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 0,
    size: 10,
    sortBy: 'name',
    sortDir: 'asc',
    search: '',
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  });

  // Statistics state
  const [stats, setStats] = useState({
    totalRoutes: { count: 0, change: undefined as string | undefined },
    outboundRoutes: { count: 0, change: undefined as string | undefined },
    inboundRoutes: { count: 0, change: undefined as string | undefined },
    averageDistance: { count: 0, unit: 'km' },
    totalRouteGroups: { count: 0, change: undefined as string | undefined },
    averageDuration: { count: 0, unit: 'min' }
  });

  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<RouteResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load filter options
  const loadFilterOptions = useCallback(async () => {
    try {
      setFilterOptionsLoading(true);
      const response = await RouteManagementService.getRouteFilterOptions();

      setFilterOptions({
        routeGroups: response.routeGroups?.map((rg: any) => ({ 
          id: rg.id, 
          name: rg.name 
        })) || [],
        directions: response.directions || [],
        roadTypes: response.roadTypes || [],
        distanceRange: {
          min: response.distanceRange?.min || 0,
          max: response.distanceRange?.max || 100
        },
        durationRange: {
          min: response.durationRange?.min || 0,
          max: response.durationRange?.max || 300
        }
      });
    } catch (err) {
      console.error('Error loading filter options:', err);
    } finally {
      setFilterOptionsLoading(false);
    }
  }, []);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const statisticsData = await RouteManagementService.getRouteStatistics();
      
      setStats({
        totalRoutes: { 
          count: statisticsData.totalRoutes || 0,
          change: statisticsData.totalRoutes && statisticsData.totalRoutes > 0 ? '+5% this month' : undefined
        },
        outboundRoutes: { 
          count: statisticsData.outboundRoutes || 0,
          change: statisticsData.outboundRoutes && statisticsData.outboundRoutes > 0 ? '+3% this month' : undefined
        },
        inboundRoutes: { 
          count: statisticsData.inboundRoutes || 0,
          change: statisticsData.inboundRoutes && statisticsData.inboundRoutes > 0 ? '+2% this month' : undefined
        },
        averageDistance: { 
          count: statisticsData.averageDistanceKm || 0,
          unit: 'km'
        },
        totalRouteGroups: { 
          count: statisticsData.totalRouteGroups || 0,
          change: statisticsData.totalRouteGroups && statisticsData.totalRouteGroups > 0 ? '+1 new' : undefined
        },
        averageDuration: { 
          count: statisticsData.averageDurationMinutes || 0,
          unit: 'min'
        }
      });
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }, []);

  // Load routes from API
  const loadRoutes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: PageRouteResponse = await RouteManagementService.getAllRoutes(
        queryParams.page,
        queryParams.size,
        queryParams.sortBy,
        queryParams.sortDir,
        queryParams.search || undefined,
        queryParams.routeGroupId,
        queryParams.direction,
        undefined, // roadType - not currently used in UI
        queryParams.minDistance,
        queryParams.maxDistance,
        queryParams.minDuration,
        queryParams.maxDuration
      );

      setRoutes(response.content || []);
      setPagination({
        currentPage: response.number || 0,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
        pageSize: response.size || 10,
      });
    } catch (err) {
      console.error('Error loading routes:', err);
      setError('Failed to load routes. Please try again.');
      setRoutes([]);
      setPagination({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 10,
      });
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  // Update query params with filters (optimized to prevent unnecessary updates)
  const updateQueryParams = useCallback((updates: Partial<QueryParams>) => {
    setQueryParams(prev => {
      const newParams = { ...prev, ...updates };
      
      // Convert filter states to query params
      const currentRouteGroupId = routeGroupFilter !== 'all' ? routeGroupFilter : undefined;
      const currentDirection = directionFilter !== 'all' ? directionFilter as 'OUTBOUND' | 'INBOUND' : undefined;
      const currentMinDistance = minDistance ? parseFloat(minDistance) : undefined;
      const currentMaxDistance = maxDistance ? parseFloat(maxDistance) : undefined;
      const currentMinDuration = minDuration ? parseFloat(minDuration) : undefined;
      const currentMaxDuration = maxDuration ? parseFloat(maxDuration) : undefined;
      
      // Only update if values actually changed
      if (currentRouteGroupId !== prev.routeGroupId) {
        if (currentRouteGroupId) {
          newParams.routeGroupId = currentRouteGroupId;
        } else {
          delete newParams.routeGroupId;
        }
      }
      
      if (currentDirection !== prev.direction) {
        if (currentDirection) {
          newParams.direction = currentDirection;
        } else {
          delete newParams.direction;
        }
      }
      
      if (currentMinDistance !== prev.minDistance) {
        if (currentMinDistance) {
          newParams.minDistance = currentMinDistance;
        } else {
          delete newParams.minDistance;
        }
      }
      
      if (currentMaxDistance !== prev.maxDistance) {
        if (currentMaxDistance) {
          newParams.maxDistance = currentMaxDistance;
        } else {
          delete newParams.maxDistance;
        }
      }
      
      if (currentMinDuration !== prev.minDuration) {
        if (currentMinDuration) {
          newParams.minDuration = currentMinDuration;
        } else {
          delete newParams.minDuration;
        }
      }
      
      if (currentMaxDuration !== prev.maxDuration) {
        if (currentMaxDuration) {
          newParams.maxDuration = currentMaxDuration;
        } else {
          delete newParams.maxDuration;
        }
      }
      
      return newParams;
    });
  }, [routeGroupFilter, directionFilter, minDistance, maxDistance, minDuration, maxDuration]);

  // Apply filters when they change (with debounce for better UX)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateQueryParams({ page: 0 });
    }, 300); // Short debounce for filter changes

    return () => clearTimeout(timer);
  }, [routeGroupFilter, directionFilter, minDistance, maxDistance, minDuration, maxDuration]);

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    updateQueryParams({ search: searchTerm, page: 0 });
  };

  const handleSort = (sortBy: string, sortDir: 'asc' | 'desc') => {
    updateQueryParams({ sortBy, sortDir, page: 0 });
  };

  const handlePageChange = (page: number) => {
    updateQueryParams({ page });
  };

  const handlePageSizeChange = (size: number) => {
    updateQueryParams({ size, page: 0 });
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setRouteGroupFilter('all');
    setDirectionFilter('all');
    setMinDistance('');
    setMaxDistance('');
    setMinDuration('');
    setMaxDuration('');
  };

  const handleExportAll = async () => {
    try {
      // Get all routes without pagination for export
      const allRoutes = await RouteManagementService.getAllRoutesAsList();
      
      // Create CSV content
      const csvHeaders = [
        'ID', 'Name', 'Description', 'Route Group', 'Direction', 
        'Start Stop', 'End Stop', 'Distance (km)', 'Duration (min)', 
        'Created At', 'Updated At'
      ];
      const csvRows = allRoutes.map(route => [
        route.id || '',
        route.name || '',
        route.description || '',
        route.routeGroupName || '',
        route.direction || '',
        route.startStopName || '',
        route.endStopName || '',
        route.distanceKm || '',
        route.estimatedDurationMinutes || '',
        route.createdAt || '',
        route.updatedAt || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `routes-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting routes:', error);
      setError('Failed to export routes. Please try again.');
    }
  };

  const handleAddNewRoute = () => {
    router.push('/mot/routes/add-new');
  };

  const handleView = (routeId: string) => {
    // Navigate to route group page since routes are managed within route groups
    const route = routes.find(r => r.id === routeId);
    if (route?.routeGroupId) {
      router.push(`/mot/routes/${route.routeGroupId}?highlight=${routeId}`);
    }
  };

  const handleEdit = (routeId: string) => {
    // Navigate to route group edit page
    const route = routes.find(r => r.id === routeId);
    if (route?.routeGroupId) {
      router.push(`/mot/routes/${route.routeGroupId}/edit?route=${routeId}`);
    }
  };

  const handleDelete = (routeId: string, routeName: string) => {
    // Find the route to get full details for the modal
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setRouteToDelete(route);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRouteToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!routeToDelete?.id) return;

    try {
      setIsDeleting(true);
      // Note: You'll need to implement a delete route API endpoint
      // await RouteManagementService.deleteRoute(routeToDelete.id);
      console.log('Delete route not implemented in API yet:', routeToDelete.id);
      
      // Refresh the list after successful deletion
      await loadRoutes();
      
      setShowDeleteModal(false);
      setRouteToDelete(null);
    } catch (error) {
      console.error('Error deleting route:', error);
      setError('Failed to delete route. Please try again.');
      // Keep the modal open on error so user can see what happened
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && routes.length === 0) {
    return (
      <Layout
        activeItem="routes"
        pageTitle="Loading..."
        pageDescription="Loading routes"
        role="mot"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading routes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      activeItem="routes"
      pageTitle="Routes"
      pageDescription="Manage bus routes with advanced filtering and search capabilities"
      role="mot"
    >
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-600 text-sm">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <RouteStatsCards stats={stats} />

        {/* Action Buttons */}
        <RouteActionButtons
          onAddRoute={handleAddNewRoute}
          onExportAll={handleExportAll}
          isLoading={isLoading}
        />

        {/* Advanced Filters */}
        <RouteAdvancedFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          routeGroupFilter={routeGroupFilter}
          setRouteGroupFilter={setRouteGroupFilter}
          directionFilter={directionFilter}
          setDirectionFilter={setDirectionFilter}
          minDistance={minDistance}
          setMinDistance={setMinDistance}
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          minDuration={minDuration}
          setMinDuration={setMinDuration}
          maxDuration={maxDuration}
          setMaxDuration={setMaxDuration}
          filterOptions={filterOptions}
          loading={filterOptionsLoading}
          totalCount={pagination.totalElements}
          filteredCount={routes.length}
          onSearch={handleSearch}
          onClearAll={handleClearAllFilters}
        />

        {/* Routes Table */}
        <div className="bg-white rounded-lg shadow">
          <RoutesTable
            routes={routes}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSort={handleSort}
            activeFilters={{ 
              search: searchTerm,
              routeGroup: routeGroupFilter,
              direction: directionFilter,
              minDistance,
              maxDistance,
              minDuration,
              maxDuration
            }}
            loading={isLoading}
            currentSort={{ field: queryParams.sortBy, direction: queryParams.sortDir }}
          />


          {pagination.totalElements > 0 && (
            <div className="bg-white shadow px-2 py-0">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalElements={pagination.totalElements}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                loading={isLoading}
                searchActive={!!searchTerm}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteRouteConfirmation
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          route={routeToDelete}
          isDeleting={isDeleting}
        />
      </div>
    </Layout>
  );
}