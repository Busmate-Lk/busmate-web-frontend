'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/operator/header';
import { FleetStatsCards } from '@/components/operator/fleet/FleetStatsCards';
import { FleetActionButtons } from '@/components/operator/fleet/FleetActionButtons';
import FleetAdvancedFilters from '@/components/operator/fleet/FleetAdvancedFilters';
import { FleetTable } from '@/components/operator/fleet/FleetTable';
import Pagination from '@/components/shared/Pagination';
import { BusOperatorOperationsService } from '@/lib/api-client/route-management/services/BusOperatorOperationsService';
import { BusResponse } from '@/lib/api-client/route-management/models/BusResponse';
import { BusPermitAssignmentService } from '@/lib/api-client/route-management/services/BusPermitAssignmentService';

interface QueryParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  searchText: string;
  status?: 'pending' | 'active' | 'inactive' | 'cancelled';
  minCapacity?: string;
  maxCapacity?: string;
  model?: string;
}

export default function FleetManagement() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [buses, setBuses] = useState<BusResponse[]>([]);
  const [busPermits, setBusPermits] = useState<Record<string, { permitNumber: string; permitType?: string } | null>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [modelFilter, setModelFilter] = useState('all');

  // Available models from loaded buses
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 0,
    size: 10,
    sortBy: 'ntcRegistrationNumber',
    sortDir: 'asc',
    searchText: '',
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
    totalBuses: { count: 0 },
    activeBuses: { count: 0 },
    inactiveBuses: { count: 0 },
    averageCapacity: { count: 0 },
    totalCapacity: { count: 0 },
    pendingMaintenance: { count: 0 }
  });

  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [busToDelete, setBusToDelete] = useState<BusResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get operator ID from authenticated user - use memoized value to prevent unnecessary re-renders
  const operatorId = useMemo(() => {
    // Only use fallback if user is definitely not authenticated
    return user?.id || (isAuthenticated ? undefined : '11111111-1111-1111-1111-111111111112');
  }, [user?.id, isAuthenticated]);

  // Load fleet data from API
  const loadFleet = useCallback(async () => {
    // Don't load if we don't have a valid operator ID
    if (!operatorId) {
      console.log('Skipping fleet load - no operatorId');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading fleet with params:', { operatorId, queryParams });

      const response = await BusOperatorOperationsService.getOperatorBuses(
        operatorId,
        queryParams.page,
        queryParams.size,
        queryParams.sortBy,
        queryParams.sortDir,
        queryParams.status,
        queryParams.searchText || undefined,
        queryParams.minCapacity ? parseInt(queryParams.minCapacity) : undefined,
        queryParams.maxCapacity ? parseInt(queryParams.maxCapacity) : undefined
      );

      setBuses(response.content || []);
      setPagination({
        currentPage: response.number || 0,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
        pageSize: response.size || 10,
      });

      // Extract unique models from buses for filter
      const models = Array.from(new Set(
        (response.content || [])
          .map(bus => bus.model)
          .filter(model => model && model.trim() !== '')
      )) as string[];
      setAvailableModels(models);

    } catch (err) {
      console.error('Error loading fleet:', err);
      setError('Failed to load fleet data. Please try again.');
      // Set mock data for development
      setBuses([]);
      setPagination({
        currentPage: 0,
        totalPages: 1,
        totalElements: 0,
        pageSize: 10,
      });
    } finally {
      setIsLoading(false);
    }
  }, [operatorId, queryParams]);

  // Load statistics (mock for now)
  const loadStatistics = useCallback(async () => {
    try {
      // Mock statistics - in real app, call operator dashboard API
      const mockStats = {
        totalBuses: { count: buses.length },
        activeBuses: { count: buses.filter(b => b.status === 'ACTIVE').length },
        inactiveBuses: { count: buses.filter(b => b.status === 'INACTIVE').length },
        averageCapacity: { count: buses.length > 0 ? buses.reduce((acc, b) => acc + (b.capacity || 0), 0) / buses.length : 0 },
        totalCapacity: { count: buses.reduce((acc, b) => acc + (b.capacity || 0), 0) },
        pendingMaintenance: { count: Math.floor(buses.length * 0.2) } // Mock 20% need maintenance
      };
      setStats(mockStats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }, [buses]);

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Load bus permits
  const refreshBusPermits = useCallback(async () => {
    try {
      const assignments = await BusPermitAssignmentService.getAllAssignments();
      const map: Record<string, { permitNumber: string; permitType?: string } | null> = {};
      (assignments || []).forEach(a => {
        if (!a.busId) return;
        if (!map[a.busId]) {
          map[a.busId] = { permitNumber: a.permitNumber || a.passengerServicePermitId || 'Unknown' };
        }
      });
      setBusPermits(map);
    } catch (error) {
      console.error('Error loading bus permits:', error);
    }
  }, []);

  useEffect(() => {
    if (buses.length > 0) {
      refreshBusPermits();
    }
  }, [buses, refreshBusPermits]);

  // Update query params with filters
  const updateQueryParams = useCallback((updates: Partial<QueryParams>) => {
    setQueryParams(prev => {
      const newParams = { ...prev, ...updates };

      // Build status filter
      if (statusFilter !== 'all') {
        newParams.status = statusFilter as any;
      } else {
        delete newParams.status;
      }

      // Build capacity filters
      if (minCapacity) {
        newParams.minCapacity = minCapacity;
      } else {
        delete newParams.minCapacity;
      }

      if (maxCapacity) {
        newParams.maxCapacity = maxCapacity;
      } else {
        delete newParams.maxCapacity;
      }

      // Check if params actually changed to prevent unnecessary API calls
      const paramsChanged = Object.keys(newParams).some(key =>
        newParams[key as keyof QueryParams] !== prev[key as keyof QueryParams]
      );

      return paramsChanged ? newParams : prev;
    });
  }, [statusFilter, minCapacity, maxCapacity]);

  // Apply filters when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateQueryParams({ page: 0 });
    }, 300);

    return () => clearTimeout(timer);
  }, [statusFilter, minCapacity, maxCapacity, modelFilter, updateQueryParams]);

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    updateQueryParams({ searchText: searchTerm, page: 0 });
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

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setMinCapacity('');
    setMaxCapacity('');
    setModelFilter('all');

    setQueryParams(prev => ({
      ...prev,
      searchText: '',
      status: undefined,
      minCapacity: undefined,
      maxCapacity: undefined,
      model: undefined,
      page: 0,
    }));
  }, []);

  const handleAddNewBus = () => {
    router.push('/operator/buses/add-new');
  };

  const handleExportFleet = async () => {
    try {
      setIsLoading(true);
      // Export fleet logic would go here
      // For now, we'll create a simple CSV export of current data
      const csvContent = [
        ['Registration Number', 'Plate Number', 'Model', 'Capacity', 'Status', 'Created Date'].join(','),
        ...buses.map(bus => [
          bus.ntcRegistrationNumber || '',
          bus.plateNumber || '',
          bus.model || '',
          bus.capacity || '',
          bus.status || '',
          bus.createdAt ? new Date(bus.createdAt).toLocaleDateString() : ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleet-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export fleet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (busId: string) => {
    router.push(`/operator/fleet-management/${busId}`);
  };

  const handleEdit = (busId: string) => {
    router.push(`/operator/fleet-management/${busId}/edit`);
  };

  const handleAssignRoute = (busId: string, busRegistration: string) => {
    router.push(`/operator/fleet-management/${busId}/assign-route`);
  };

  const handleScheduleMaintenance = (busId: string, busRegistration: string) => {
    router.push(`/operator/buses/${busId}/maintenance`);
  };

  const handleDelete = (busId: string, busRegistration: string) => {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setBusToDelete(bus);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteCancel = () => {
    setBusToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!busToDelete) return;

    try {
      setIsDeleting(true);
      // Delete bus logic would go here
      // await BusOperatorOperationsService.deleteBus(operatorId, busToDelete.id);

      // Refresh the fleet list
      await loadFleet();
      setShowDeleteModal(false);
      setBusToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete bus');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateReport = () => {
    router.push('/operator/reports/fleet');
  };

  const handleMaintenanceSchedule = () => {
    router.push('/operator/maintenance/schedule');
  };

  if (isLoading && buses.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1">
          <Header
            pageTitle="Fleet Management"
            pageDescription="Manage and monitor your bus fleet"
          />
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading your fleet...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        <Header
          pageTitle="Fleet Management"
          pageDescription="Manage and monitor your bus fleet, routes, and maintenance"
        />

        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <FleetStatsCards stats={stats} />

          {/* Action Buttons */}
          <FleetActionButtons
            onAddBus={handleAddNewBus}
            onExportFleet={handleExportFleet}
            onMaintenanceSchedule={handleMaintenanceSchedule}
            onGenerateReport={handleGenerateReport}
            isLoading={isLoading}
          />

          {/* Advanced Filters */}
          <FleetAdvancedFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            minCapacity={minCapacity}
            setMinCapacity={setMinCapacity}
            maxCapacity={maxCapacity}
            setMaxCapacity={setMaxCapacity}
            modelFilter={modelFilter}
            setModelFilter={setModelFilter}
            models={availableModels}
            loading={isLoading}
            totalCount={pagination.totalElements}
            filteredCount={pagination.totalElements}
            onClearAll={handleClearAllFilters}
            onSearch={handleSearch}
          />

          {/* Fleet Table */}
          <FleetTable
            buses={buses}
            onView={handleView}
            onDelete={handleDelete}
            onSort={handleSort}
            activeFilters={{
              search: searchTerm,
              status: statusFilter !== 'all' ? statusFilter : undefined,
              model: modelFilter !== 'all' ? modelFilter : undefined,
              minCapacity,
              maxCapacity
            }}
            loading={isLoading}
            currentSort={{ field: queryParams.sortBy, direction: queryParams.sortDir }}
            busPermits={busPermits}
            onPermitsChanged={refreshBusPermits}
          />

          {/* Pagination */}
          {buses.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalElements={pagination.totalElements}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={isLoading}
              searchActive={!!searchTerm}
              filterCount={[
                statusFilter !== 'all' && 'status',
                modelFilter !== 'all' && 'model',
                minCapacity && 'minCapacity',
                maxCapacity && 'maxCapacity'
              ].filter(Boolean).length}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && busToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Delete Bus</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete bus "{busToDelete.ntcRegistrationNumber}"?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}