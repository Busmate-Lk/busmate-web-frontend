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
  PermitManagementService,
  PassengerServicePermitResponse,
  TripRequest,
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
import { TripStatusChangeModal } from '@/components/timeKeeper/trips/TripStatusChangeModal';
import { TripNotesModal } from '@/components/timeKeeper/trips/TripNotesModal';
import { TimeKeeperTripContextMenu } from '@/components/timeKeeper/trip-assignment-workspace/components/TimeKeeperTripContextMenu';
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

  // Cache for route data to avoid repeated API calls
  const [routeCache, setRouteCache] = useState<Map<string, RouteResponse>>(
    new Map()
  );

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

  // Status change modal state
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [tripForStatusChange, setTripForStatusChange] =
    useState<TripResponse | null>(null);

  // Notes modal state
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [tripForNotes, setTripForNotes] = useState<TripResponse | null>(null);

  // PSP management modal state
  const [showPspModal, setShowPspModal] = useState(false);
  const [tripForPsp, setTripForPsp] = useState<TripResponse | null>(null);

  // Available PSPs for assignment
  const [availablePsps, setAvailablePsps] = useState<
    Array<{
      id: string;
      permitNumber: string;
      operatorName?: string;
      status?: string;
      maximumBusAssigned?: number;
    }>
  >([]);

  // Helper function to batch load routes and cache them
  const loadRoutesInBatch = useCallback(
    async (routeIds: string[]): Promise<Map<string, RouteResponse>> => {
      const uniqueRouteIds = [...new Set(routeIds)].filter(
        (id) => id && !routeCache.has(id)
      );

      if (uniqueRouteIds.length === 0) {
        return routeCache;
      }

      console.log(`Loading ${uniqueRouteIds.length} unique routes...`);

      // Load routes in parallel batches to avoid overwhelming the server
      const BATCH_SIZE = 10;
      const newRoutes = new Map<string, RouteResponse>(routeCache);

      for (let i = 0; i < uniqueRouteIds.length; i += BATCH_SIZE) {
        const batch = uniqueRouteIds.slice(i, i + BATCH_SIZE);
        const routePromises = batch.map(async (routeId) => {
          try {
            const route = await RouteManagementService.getRouteById(routeId);
            return { routeId, route };
          } catch (err) {
            console.error(`Failed to load route ${routeId}:`, err);
            return null;
          }
        });

        const results = await Promise.all(routePromises);
        results.forEach((result) => {
          if (result) {
            newRoutes.set(result.routeId, result.route);
          }
        });
      }

      setRouteCache(newRoutes);
      return newRoutes;
    },
    [routeCache]
  );

  // Helper function to check if a route passes through assigned bus stop
  const routePassesThroughStop = useCallback(
    (route: RouteResponse, busStopId: string): boolean => {
      return (
        route.startStopId === busStopId ||
        route.endStopId === busStopId ||
        route.routeStops?.some((stop) => stop.stopId === busStopId) ||
        false
      );
    },
    []
  );

  // Helper function to check if a trip starts at the assigned bus stop
  const tripStartsAtAssignedStop = useCallback(
    (trip: TripResponse): boolean => {
      // Check the pre-computed set
      return tripsStartingAtStop.has(trip.id || '');
    },
    [tripsStartingAtStop]
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

  // Load available PSPs for assignment
  const loadAvailablePsps = useCallback(async () => {
    try {
      const psps = await PermitManagementService.getAllPermits();
      setAvailablePsps(
        psps.map((psp) => ({
          id: psp.id || '',
          permitNumber: psp.permitNumber || '',
          operatorName: psp.operatorName,
          status: psp.status,
          maximumBusAssigned: psp.maximumBusAssigned,
        }))
      );
    } catch (err) {
      console.error('Failed to load PSPs:', err);
    }
  }, []);

  // Load statistics (filtered by bus stop)
  const loadStatistics = useCallback(async () => {
    try {
      // If no assigned bus stop yet, don't load statistics
      if (!assignedBusStopId) {
        return;
      }

      // Get all trips
      const allTripsResponse = await TripManagementService.getAllTrips(
        0,
        1000, // Get a large number to calculate accurate statistics
        'tripDate',
        'desc'
      );

      const allTrips = allTripsResponse.content || [];

      // Extract unique route IDs
      const routeIds = allTrips
        .map((trip) => trip.routeId)
        .filter((id): id is string => !!id);

      // Batch load all routes at once
      const routes = await loadRoutesInBatch(routeIds);

      // Filter trips that pass through the assigned bus stop
      const validTrips = allTrips.filter((trip) => {
        if (!trip.routeId) return false;
        const route = routes.get(trip.routeId);
        return route ? routePassesThroughStop(route, assignedBusStopId) : false;
      });

      console.log(
        `Statistics: ${validTrips.length} trips pass through ${assignedBusStopName}`
      );

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
  }, [
    assignedBusStopId,
    assignedBusStopName,
    loadRoutesInBatch,
    routePassesThroughStop,
  ]);

  // Load trips from API (filtered by bus stop)
  const loadTrips = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // If no assigned bus stop yet, don't load trips
      if (!assignedBusStopId) {
        setIsLoading(false);
        return;
      }

      console.time('Load Trips Total');

      // Get all trips with the current filters
      console.time('Fetch Trips API');
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
      console.timeEnd('Fetch Trips API');

      const allTrips = response.content || [];

      // Extract unique route IDs and batch load all routes
      console.time('Load Routes Batch');
      const routeIds = allTrips
        .map((trip) => trip.routeId)
        .filter((id): id is string => !!id);

      const routes = await loadRoutesInBatch(routeIds);
      console.timeEnd('Load Routes Batch');

      // Filter trips that pass through the assigned bus stop
      console.time('Filter Trips');
      const validTrips = allTrips.filter((trip) => {
        if (!trip.routeId) return false;
        const route = routes.get(trip.routeId);
        return route ? routePassesThroughStop(route, assignedBusStopId) : false;
      });
      console.timeEnd('Filter Trips');

      console.log(
        `Loaded ${validTrips.length} trips passing through ${assignedBusStopName}`
      );

      // Determine which trips start at the assigned stop (for bus management)
      console.time('Identify Starting Trips');
      const tripsStartingSet = new Set<string>();
      validTrips.forEach((trip) => {
        if (trip.routeId) {
          const route = routes.get(trip.routeId);
          if (route && route.startStopId === assignedBusStopId) {
            tripsStartingSet.add(trip.id || '');
          }
        }
      });
      setTripsStartingAtStop(tripsStartingSet);
      console.timeEnd('Identify Starting Trips');

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

      console.timeEnd('Load Trips Total');
    } catch (err: any) {
      setError(err?.message || 'Failed to load trips');
      console.error('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    queryParams,
    assignedBusStopId,
    assignedBusStopName,
    loadRoutesInBatch,
    routePassesThroughStop,
  ]);

  useEffect(() => {
    loadFilterOptions();
    loadStatistics();
    loadAvailablePsps();
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
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      setTripForNotes(trip);
      setShowNotesModal(true);
    }
  };

  const handleChangeStatus = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip && tripStartsAtAssignedStop(trip)) {
      setTripForStatusChange(trip);
      setShowStatusChangeModal(true);
    } else {
      alert(
        'You can only change status for trips that start at your assigned bus stop.'
      );
    }
  };

  const handleChangePsp = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip && tripStartsAtAssignedStop(trip)) {
      setTripForPsp(trip);
      setShowPspModal(true);
    } else {
      alert(
        'You can only manage PSP for trips that start at your assigned bus stop.'
      );
    }
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

  const handleStatusChange = async (
    tripId: string,
    newStatus: string,
    reason?: string
  ) => {
    try {
      await TripManagementService.updateTripStatus(tripId, newStatus as any);

      // Reload trips and stats
      await loadTrips();
      await loadStatistics();

      setShowStatusChangeModal(false);
      setTripForStatusChange(null);
    } catch (err) {
      console.error('Failed to change status:', err);
      throw err;
    }
  };

  const handleNotesUpdate = async (tripId: string, notes: string) => {
    try {
      // Get the current trip data
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }

      // Create update request with only the notes changed
      const updateRequest: TripRequest = {
        tripDate: trip.tripDate || '',
        scheduledDepartureTime: trip.scheduledDepartureTime || '',
        scheduledArrivalTime: trip.scheduledArrivalTime || '',
        scheduleId: trip.scheduleId || '',
        notes: notes,
        // Include other required fields if they exist
        ...(trip.busId && { busId: trip.busId }),
        ...(trip.driverId && { driverId: trip.driverId }),
        ...(trip.conductorId && { conductorId: trip.conductorId }),
        ...(trip.passengerServicePermitId && {
          passengerServicePermitId: trip.passengerServicePermitId,
        }),
      };

      await TripManagementService.updateTrip(tripId, updateRequest);

      // Reload trips
      await loadTrips();

      setShowNotesModal(false);
      setTripForNotes(null);
    } catch (err) {
      console.error('Failed to update notes:', err);
      throw err;
    }
  };

  const handleAssignPsp = async (tripId: string, pspId: string) => {
    try {
      await TripManagementService.assignPassengerServicePermitToTrip(
        tripId,
        pspId
      );

      // Reload trips and stats
      await loadTrips();
      await loadStatistics();

      setShowPspModal(false);
      setTripForPsp(null);
    } catch (err) {
      console.error('Failed to assign PSP:', err);
      alert('Failed to assign PSP. Please try again.');
    }
  };

  const handleRemovePsp = async (tripId: string) => {
    try {
      await TripManagementService.removePassengerServicePermitFromTrip(tripId);

      // Reload trips and stats
      await loadTrips();
      await loadStatistics();

      setShowPspModal(false);
      setTripForPsp(null);
    } catch (err) {
      console.error('Failed to remove PSP:', err);
      alert('Failed to remove PSP. Please try again.');
    }
  };

  const handleBusReassignment = async (
    tripId: string,
    newBusId: string | null,
    reason: string
  ) => {
    try {
      // Get the current trip data
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }

      // Create update request with the bus changed
      const updateRequest: TripRequest = {
        tripDate: trip.tripDate || '',
        scheduledDepartureTime: trip.scheduledDepartureTime || '',
        scheduledArrivalTime: trip.scheduledArrivalTime || '',
        scheduleId: trip.scheduleId || '',
        notes: trip.notes
          ? `${trip.notes}\n\n[${new Date().toISOString()}] Bus ${
              newBusId ? 'reassigned' : 'removed'
            }: ${reason}`
          : `[${new Date().toISOString()}] Bus ${
              newBusId ? 'reassigned' : 'removed'
            }: ${reason}`,
        // Include other fields
        ...(newBusId && { busId: newBusId }),
        ...(trip.driverId && { driverId: trip.driverId }),
        ...(trip.conductorId && { conductorId: trip.conductorId }),
        ...(trip.passengerServicePermitId && {
          passengerServicePermitId: trip.passengerServicePermitId,
        }),
      };

      await TripManagementService.updateTrip(tripId, updateRequest);

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
                  trips starting at this location, you have the ability to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Change trip status</li>
                  <li>Add or edit trip notes</li>
                  <li>Assign or remove Passenger Service Permits (PSP)</li>
                  <li>Remove or reassign buses</li>
                </ul>
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
            onChangeStatus={handleChangeStatus}
            onChangePsp={handleChangePsp}
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

        {/* Status Change Modal */}
        {showStatusChangeModal && tripForStatusChange && (
          <TripStatusChangeModal
            isOpen={showStatusChangeModal}
            onClose={() => {
              setShowStatusChangeModal(false);
              setTripForStatusChange(null);
            }}
            trip={tripForStatusChange}
            onConfirm={handleStatusChange}
          />
        )}

        {/* Notes Modal */}
        {showNotesModal && tripForNotes && (
          <TripNotesModal
            isOpen={showNotesModal}
            onClose={() => {
              setShowNotesModal(false);
              setTripForNotes(null);
            }}
            trip={tripForNotes}
            onConfirm={handleNotesUpdate}
          />
        )}

        {/* PSP Management Modal - Using existing TimeKeeperTripContextMenu */}
        {showPspModal && tripForPsp && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Manage PSP Assignment
                </h2>
                <button
                  onClick={() => {
                    setShowPspModal(false);
                    setTripForPsp(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                    Trip Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Route:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {tripForPsp.routeName || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Bus:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {tripForPsp.busPlateNumber || 'Not assigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current PSP:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {tripForPsp.passengerServicePermitNumber ||
                          'Not assigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">
                        {tripForPsp.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    {tripForPsp.passengerServicePermitId
                      ? 'Change or Remove PSP'
                      : 'Assign PSP'}
                  </h4>

                  {tripForPsp.passengerServicePermitId && (
                    <button
                      onClick={() => handleRemovePsp(tripForPsp.id!)}
                      className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100"
                    >
                      Remove Current PSP
                    </button>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select PSP to Assign
                    </label>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                      {availablePsps
                        .filter(
                          (psp) =>
                            psp.status === 'ACTIVE' &&
                            (psp.maximumBusAssigned || 0) > 0
                        )
                        .map((psp) => (
                          <button
                            key={psp.id}
                            onClick={() =>
                              handleAssignPsp(tripForPsp.id!, psp.id)
                            }
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                            disabled={
                              tripForPsp.passengerServicePermitId === psp.id
                            }
                          >
                            <div className="font-medium text-gray-900">
                              {psp.permitNumber}
                            </div>
                            <div className="text-sm text-gray-600">
                              {psp.operatorName}
                            </div>
                            {tripForPsp.passengerServicePermitId === psp.id && (
                              <div className="text-xs text-blue-600 mt-1">
                                Currently Assigned
                              </div>
                            )}
                          </button>
                        ))}
                      {availablePsps.filter(
                        (psp) =>
                          psp.status === 'ACTIVE' &&
                          (psp.maximumBusAssigned || 0) > 0
                      ).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No available PSPs found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
