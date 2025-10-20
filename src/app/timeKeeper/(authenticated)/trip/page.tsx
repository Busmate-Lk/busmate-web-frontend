'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TripManagementService,
  TripResponse,
  PageTripResponse,
  TripStatisticsResponse,
  TripFilterOptionsResponse,
  BusStopManagementService,
  StopResponse,
  RouteManagementService,
  RouteResponse,
} from '@/lib/api-client/route-management';
import { getUserFromToken } from '@/lib/utils/jwtHandler';
import { getCookie } from '@/lib/utils/cookieUtils';
import { userManagementClient } from '@/lib/api/client';

// Import our custom components
import { TripStatsCards } from '@/components/timeKeeper/trips/TripStatsCards';
import TripAdvancedFilters from '@/components/timeKeeper/trips/TripAdvancedFilters';
import { TimeKeeperTripsTable } from '@/components/timeKeeper/trips/TimeKeeperTripsTable';

// Import shared UI components
import Pagination from '@/components/shared/Pagination';
import { Layout } from '@/components/shared/layout';
import { BusReassignmentModal } from '@/components/timeKeeper/trips/BusReassignmentModal';
import { useAuth } from '@/context/AuthContext';

interface QueryParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  search: string;
  status?:
    | 'pending'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'delayed'
    | 'in_transit'
    | 'boarding'
    | 'departed';
  routeId?: string;
  operatorId?: string;
  scheduleId?: string;
  busId?: string;
  passengerServicePermitId?: string;
  fromDate?: string;
  toDate?: string;
  hasPsp?: boolean;
  hasBus?: boolean;
  hasDriver?: boolean;
  hasConductor?: boolean;
}

interface FilterOptions {
  statuses: Array<
    | 'pending'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'delayed'
    | 'in_transit'
    | 'boarding'
    | 'departed'
  >;
  routes: Array<{ id: string; name: string; routeGroup?: string }>;
  operators: Array<{ id: string; name: string }>;
  schedules: Array<{ id: string; name: string }>;
  buses: Array<{ id: string; registrationNumber: string }>;
  passengerServicePermits: Array<{ id: string; permitNumber: string }>;
}

export default function TimeKeeperTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which trips start at the assigned bus stop (for bus management)
  const [tripsStartingAtStop, setTripsStartingAtStop] = useState<Set<string>>(
    new Set()
  );

  // TimeKeeper's assigned bus stop (this would come from user context/auth)
  // For now, we'll use a state variable - in production, get this from user session
  const [assignedBusStopId, setAssignedBusStopId] = useState<string>('');
  const [assignedBusStopName, setAssignedBusStopName] =
    useState<string>('Loading...');
  const [busStopDetails, setBusStopDetails] = useState<StopResponse | null>(
    null
  );
  const [userId, setUserId] = useState<string>('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [busFilter, setBusFilter] = useState('all');
  const [pspFilter, setPspFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hasPsp, setHasPsp] = useState(false);
  const [hasBus, setHasBus] = useState(false);
  const [hasDriver, setHasDriver] = useState(false);
  const [hasConductor, setHasConductor] = useState(false);

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    statuses: [],
    routes: [],
    operators: [],
    schedules: [],
    buses: [],
    passengerServicePermits: [],
  });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 0,
    size: 10,
    sortBy: 'tripDate',
    sortDir: 'desc',
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
    totalTrips: { count: 0 },
    activeTrips: { count: 0 },
    completedTrips: { count: 0 },
    pendingTrips: { count: 0 },
    cancelledTrips: { count: 0 },
    tripsWithPsp: { count: 0 },
    tripsWithBus: { count: 0 },
    inTransitTrips: { count: 0 },
  });

  // Bus reassignment modal state
  const [showBusReassignmentModal, setShowBusReassignmentModal] =
    useState(false);
  const [tripForBusReassignment, setTripForBusReassignment] =
    useState<TripResponse | null>(null);

  // Helper function to check if a trip starts at the assigned bus stop
  const tripStartsAtAssignedStop = useCallback(
    (trip: TripResponse): boolean => {
      // Check the pre-computed set
      return tripsStartingAtStop.has(trip.id || '');
    },
    [assignedBusStopId]
  );

  // Load timekeeper's assigned bus stop
  useEffect(() => {
    const fetchAssignedBusStop = async () => {
      try {
        // Step 1: Get access token from cookies
        const accessToken = getCookie('access_token');

        if (!accessToken) {
          throw new Error('No access token found. Please log in again.');
        }

        // Step 2: Extract user ID from JWT token
        const userFromToken = getUserFromToken(accessToken);

        if (!userFromToken?.id) {
          throw new Error('Invalid access token. Please log in again.');
        }

        const extractedUserId = userFromToken.id;
        setUserId(extractedUserId);

        console.log('Extracted User ID from token:', extractedUserId);

        // Step 3: Fetch timekeeper profile to get assigned_stand
        // Endpoint: GET /api/timekeeper/{userId} or /api/users/{userId}/profile
        const timekeeperResponse = await userManagementClient.get(
          `/api/timekeeper/profile/${extractedUserId}`
        );

        const timekeeperData = timekeeperResponse.data;

        // Extract assigned_stand from the response
        const assignedStandId = timekeeperData.assign_stand;
        console.log('Assigned Stand ID:', assignedStandId);
        if (!assignedStandId) {
          throw new Error('No bus stop assigned to this timekeeper');
        }

        setAssignedBusStopId(assignedStandId);

        // Step 4: Fetch bus stop details using the BusStopManagementService
        const busStop = await BusStopManagementService.getStopById(
          assignedStandId
        );
        setBusStopDetails(busStop);
        setAssignedBusStopName(busStop.name || 'Unknown Stop');
      } catch (err: any) {
        console.error('Failed to load assigned bus stop:', err);
        setAssignedBusStopName('Unknown Stop');
        setError(err?.message || 'Failed to load assigned bus stop');
      }
    };

    fetchAssignedBusStop();
  }, []);

  // Load filter options
  const loadFilterOptions = useCallback(async () => {
    try {
      const response: TripFilterOptionsResponse =
        await TripManagementService.getTripFilterOptions();

      setFilterOptions({
        statuses: (response.statuses as any) || [],
        routes:
          response.routes?.map((route) => ({
            id: route.id || '',
            name: route.name || '',
            routeGroup: route.routeGroupName,
          })) || [],
        operators:
          response.operators?.map((op) => ({
            id: op.id || '',
            name: op.name || '',
          })) || [],
        schedules:
          response.schedules?.map((schedule) => ({
            id: schedule.id || '',
            name: schedule.name || '',
          })) || [],
        buses:
          response.buses?.map((bus) => ({
            id: bus.id || '',
            registrationNumber: bus.plateNumber || '',
          })) || [],
        passengerServicePermits:
          response.passengerServicePermits?.map((psp) => ({
            id: psp.id || '',
            permitNumber: psp.permitNumber || '',
          })) || [],
      });
    } catch (err) {
      console.error('Failed to load filter options:', err);
    } finally {
      setFilterOptionsLoading(false);
    }
  }, []);

  // Load statistics (filtered by bus stop)
  const loadStatistics = useCallback(async () => {
    try {
      // If no assigned bus stop yet, don't load statistics
      if (!assignedBusStopId) {
        return;
      }

      // Get all trips and filter by assigned bus stop
      const allTripsResponse = await TripManagementService.getAllTrips(
        0,
        1000, // Get a large number to calculate accurate statistics
        'tripDate',
        'desc'
      );

      const allTrips = allTripsResponse.content || [];

      // Filter trips that pass through the assigned bus stop
      const filteredTripsPromises = allTrips.map(async (trip) => {
        try {
          if (!trip.routeId) {
            return null;
          }

          const route = await RouteManagementService.getRouteById(trip.routeId);

          const hasStop =
            route.startStopId === assignedBusStopId ||
            route.endStopId === assignedBusStopId ||
            route.routeStops?.some((stop) => stop.stopId === assignedBusStopId);
           
          return hasStop ? trip : null;
        } catch (err) {
          console.error('Failed to check route for trip:', trip.id, err);
          return null;
        }
      });

      const resolvedTrips = await Promise.all(filteredTripsPromises);
      const validTrips = resolvedTrips.filter(
        (trip): trip is TripResponse => trip !== null
      );
      console.log(validTrips);

      // Calculate statistics from filtered trips
      const totalTrips = validTrips.length;
      const activeTrips = validTrips.filter(
        (t) =>
          t.status === 'active' ||
          t.status === 'in_transit' ||
          t.status === 'boarding'
      ).length;
      const completedTrips = validTrips.filter(
        (t) => t.status === 'completed'
      ).length;
      const pendingTrips = validTrips.filter(
        (t) => t.status === 'pending'
      ).length;
      const cancelledTrips = validTrips.filter(
        (t) => t.status === 'cancelled'
      ).length;
      const tripsWithPsp = validTrips.filter(
        (t) => t.passengerServicePermitId
      ).length;
      const tripsWithBus = validTrips.filter((t) => t.busId).length;
      const inTransitTrips = validTrips.filter(
        (t) => t.status === 'in_transit'
      ).length;

      setStats({
        totalTrips: { count: totalTrips },
        activeTrips: { count: activeTrips },
        completedTrips: { count: completedTrips },
        pendingTrips: { count: pendingTrips },
        cancelledTrips: { count: cancelledTrips },
        tripsWithPsp: { count: tripsWithPsp },
        tripsWithBus: { count: tripsWithBus },
        inTransitTrips: { count: inTransitTrips },
      });
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, [assignedBusStopId]);

  // Load trips from API (filtered by bus stop)
  const loadTrips = useCallback(async () => {
    try {
      setError(null);

      // If no assigned bus stop yet, don't load trips
      if (!assignedBusStopId) {
        setIsLoading(false);
        return;
      }

      // Get all trips with the current filters
      const response: PageTripResponse =
        await TripManagementService.getAllTrips(
          0, // Get from first page
          1000, // Get a large number to filter client-side
          queryParams.sortBy,
          queryParams.sortDir,
          queryParams.search || undefined,
          queryParams.status,
          queryParams.routeId,
          queryParams.operatorId,
          queryParams.scheduleId,
          queryParams.passengerServicePermitId,
          queryParams.busId,
          queryParams.fromDate,
          queryParams.toDate,
          queryParams.hasPsp,
          queryParams.hasBus,
          queryParams.hasDriver,
          queryParams.hasConductor
        );

      const allTrips = response.content || [];

      // Filter trips that pass through the assigned bus stop
      const filteredTripsPromises = allTrips.map(async (trip) => {
        try {
          if (!trip.routeId) {
            return null;
          }

          const route = await RouteManagementService.getRouteById(trip.routeId);

          const hasStop =
            route.startStopId === assignedBusStopId ||
            route.endStopId === assignedBusStopId ||
            route.routeStops?.some((stop) => stop.stopId === assignedBusStopId);

          return hasStop ? trip : null;
        } catch (err) {
          console.error('Failed to check route for trip:', trip.id, err);
          return null;
        }
      });

      const resolvedTrips = await Promise.all(filteredTripsPromises);
      const validTrips = resolvedTrips.filter(
        (trip): trip is TripResponse => trip !== null
      );

      // Determine which trips start at the assigned stop (for bus management)
      const tripsStartingSet = new Set<string>();
      for (const trip of validTrips) {
        try {
          if (trip.routeId) {
            const route = await RouteManagementService.getRouteById(
              trip.routeId
            );
            if (route.startStopId === assignedBusStopId) {
              tripsStartingSet.add(trip.id || '');
            }
          }
        } catch (err) {
          console.error(
            'Failed to check if trip starts at stop:',
            trip.id,
            err
          );
        }
      }
      setTripsStartingAtStop(tripsStartingSet);

      // Apply client-side pagination
      const startIndex = queryParams.page * queryParams.size;
      const endIndex = startIndex + queryParams.size;
      const paginatedTrips = validTrips.slice(startIndex, endIndex);

      setTrips(paginatedTrips);
      setPagination({
        currentPage: queryParams.page,
        totalPages: Math.ceil(validTrips.length / queryParams.size),
        totalElements: validTrips.length,
        pageSize: queryParams.size,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load trips');
      console.error('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }
  }, [queryParams, assignedBusStopId]);

  useEffect(() => {
    loadFilterOptions();
    loadStatistics();
  }, [loadFilterOptions, loadStatistics]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Update query params with filters
  const updateQueryParams = useCallback(
    (updates: Partial<QueryParams>) => {
      setQueryParams((prev) => {
        const newParams = { ...prev, ...updates };

        if (statusFilter !== 'all') {
          newParams.status = statusFilter as any;
        } else {
          delete newParams.status;
        }

        if (routeFilter !== 'all') {
          newParams.routeId = routeFilter;
        } else {
          delete newParams.routeId;
        }

        if (operatorFilter !== 'all') {
          newParams.operatorId = operatorFilter;
        } else {
          delete newParams.operatorId;
        }

        if (scheduleFilter !== 'all') {
          newParams.scheduleId = scheduleFilter;
        } else {
          delete newParams.scheduleId;
        }

        if (busFilter !== 'all') {
          newParams.busId = busFilter;
        } else {
          delete newParams.busId;
        }

        if (pspFilter !== 'all') {
          newParams.passengerServicePermitId = pspFilter;
        } else {
          delete newParams.passengerServicePermitId;
        }

        if (fromDate) {
          newParams.fromDate = fromDate;
        } else {
          delete newParams.fromDate;
        }

        if (toDate) {
          newParams.toDate = toDate;
        } else {
          delete newParams.toDate;
        }

        if (hasPsp) {
          newParams.hasPsp = hasPsp;
        } else {
          delete newParams.hasPsp;
        }

        if (hasBus) {
          newParams.hasBus = hasBus;
        } else {
          delete newParams.hasBus;
        }

        if (hasDriver) {
          newParams.hasDriver = hasDriver;
        } else {
          delete newParams.hasDriver;
        }

        if (hasConductor) {
          newParams.hasConductor = hasConductor;
        } else {
          delete newParams.hasConductor;
        }

        return newParams;
      });
    },
    [
      statusFilter,
      routeFilter,
      operatorFilter,
      scheduleFilter,
      busFilter,
      pspFilter,
      fromDate,
      toDate,
      hasPsp,
      hasBus,
      hasDriver,
      hasConductor,
    ]
  );

  // Apply filters when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateQueryParams({ page: 0 });
    }, 300);

    return () => clearTimeout(timer);
  }, [
    statusFilter,
    routeFilter,
    operatorFilter,
    scheduleFilter,
    busFilter,
    pspFilter,
    fromDate,
    toDate,
    hasPsp,
    hasBus,
    hasDriver,
    hasConductor,
    updateQueryParams,
  ]);

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

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setRouteFilter('all');
    setOperatorFilter('all');
    setScheduleFilter('all');
    setBusFilter('all');
    setPspFilter('all');
    setFromDate('');
    setToDate('');
    setHasPsp(false);
    setHasBus(false);
    setHasDriver(false);
    setHasConductor(false);

    setQueryParams({
      page: 0,
      size: queryParams.size,
      sortBy: 'tripDate',
      sortDir: 'desc',
      search: '',
    });
  }, [queryParams.size]);

  // Trip action handlers
  const handleView = (tripId: string) => {
    router.push(`/timeKeeper/trip/${tripId}`);
  };

  const handleAddNotes = (tripId: string) => {
    router.push(`/timeKeeper/trip/${tripId}/notes`);
  };

  const handleRemoveBus = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip && tripStartsAtAssignedStop(trip)) {
      setTripForBusReassignment(trip);
      setShowBusReassignmentModal(true);
    } else {
      alert(
        'You can only remove buses from trips that start at your assigned bus stop.'
      );
    }
  };

  const handleBusReassignment = async (
    tripId: string,
    newBusId: string | null,
    reason: string
  ) => {
    try {
      // TODO: Call API to update trip bus assignment
      // await TripManagementService.updateTripBusAssignment(tripId, newBusId, reason);

      console.log('Bus reassignment:', { tripId, newBusId, reason });

      // Reload trips and stats
      await loadTrips();
      await loadStatistics();

      setShowBusReassignmentModal(false);
      setTripForBusReassignment(null);
    } catch (err) {
      console.error('Failed to reassign bus:', err);
      alert('Failed to reassign bus. Please try again.');
    }
  };

  if (isLoading && trips.length === 0) {
    return (
      <Layout
        activeItem="trip"
        pageTitle="Trip Management"
        pageDescription={`Manage trips for ${assignedBusStopName}`}
        role="timeKeeper"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading trips...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && trips.length === 0) {
    return (
      <Layout
        activeItem="trip"
        pageTitle="Trip Management"
        pageDescription={`Manage trips for ${assignedBusStopName}`}
        role="timeKeeper"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-2">
              Failed to load trips
            </p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                loadTrips();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      activeItem="trip"
      pageTitle="Trip Management"
      pageDescription={`Manage trips passing through ${assignedBusStopName}`}
      role="timeKeeper"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Assigned Bus Stop: {assignedBusStopName}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  You can view all trips passing through this bus stop. For
                  trips starting at this location, you have the ability to
                  remove or reassign buses as needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <TripStatsCards stats={stats} />

        {/* Filters */}
        <TripAdvancedFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          routeFilter={routeFilter}
          setRouteFilter={setRouteFilter}
          operatorFilter={operatorFilter}
          setOperatorFilter={setOperatorFilter}
          scheduleFilter={scheduleFilter}
          setScheduleFilter={setScheduleFilter}
          busFilter={busFilter}
          setBusFilter={setBusFilter}
          pspFilter={pspFilter}
          setPspFilter={setPspFilter}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          hasPsp={hasPsp}
          setHasPsp={setHasPsp}
          hasBus={hasBus}
          setHasBus={setHasBus}
          hasDriver={hasDriver}
          setHasDriver={setHasDriver}
          hasConductor={hasConductor}
          setHasConductor={setHasConductor}
          filterOptions={filterOptions}
          loading={filterOptionsLoading}
          totalCount={pagination.totalElements}
          filteredCount={pagination.totalElements}
          onClearAll={handleClearAllFilters}
          onSearch={handleSearch}
        />

        <div className="bg-white shadow-sm">
          {/* Trips Table */}
          <TimeKeeperTripsTable
            trips={trips}
            onView={handleView}
            onAddNotes={handleAddNotes}
            onRemoveBus={handleRemoveBus}
            onSort={handleSort}
            activeFilters={{}}
            loading={isLoading}
            currentSort={{
              field: queryParams.sortBy,
              direction: queryParams.sortDir,
            }}
            assignedBusStopId={assignedBusStopId}
            canManageBus={tripStartsAtAssignedStop}
          />

          {/* Pagination */}
          {pagination.totalElements > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalElements={pagination.totalElements}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>

        {/* Bus Reassignment Modal */}
        {showBusReassignmentModal && tripForBusReassignment && (
          <BusReassignmentModal
            isOpen={showBusReassignmentModal}
            onClose={() => {
              setShowBusReassignmentModal(false);
              setTripForBusReassignment(null);
            }}
            trip={tripForBusReassignment}
            availableBuses={filterOptions.buses}
            onConfirm={handleBusReassignment}
          />
        )}
      </div>
    </Layout>
  );
}
