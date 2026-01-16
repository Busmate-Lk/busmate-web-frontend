'use client';

import { ReactNode, useState, useCallback, useMemo } from 'react';
import { ScheduleWorkspaceContext, ScheduleWorkspaceMode } from './ScheduleWorkspaceContext';
import {
  ScheduleWorkspaceData,
  createEmptyScheduleWorkspaceData,
  createEmptyCalendar,
  createEmptySchedule,
  Schedule,
  ScheduleStop,
  ScheduleCalendar,
  ScheduleException,
  RouteReference,
  RouteStopReference,
  isScheduleValid,
  scheduleToApiRequest,
  calculateTimeOffset,
  ScheduleTypeEnum,
  ScheduleStatusEnum,
  ExceptionTypeEnum,
} from '@/types/ScheduleWorkspaceData';

interface ScheduleWorkspaceProviderProps {
  children: ReactNode;
}

// Dummy data for initial development - will be replaced with API calls
const DUMMY_ROUTES: RouteReference[] = [
  {
    id: 'route-001',
    name: 'Colombo - Kandy (Via Kegalle)',
    routeGroupId: 'rg-001',
    routeGroupName: '1 - Colombo - Kandy',
    direction: 'OUTBOUND',
    startStopName: 'Colombo Central',
    endStopName: 'Kandy',
  },
  {
    id: 'route-002',
    name: 'Kandy - Colombo (Via Kegalle)',
    routeGroupId: 'rg-001',
    routeGroupName: '1 - Colombo - Kandy',
    direction: 'INBOUND',
    startStopName: 'Kandy',
    endStopName: 'Colombo Central',
  },
  {
    id: 'route-003',
    name: 'Colombo - Galle (Expressway)',
    routeGroupId: 'rg-002',
    routeGroupName: '2 - Colombo - Galle',
    direction: 'OUTBOUND',
    startStopName: 'Colombo Central',
    endStopName: 'Galle',
  },
];

const DUMMY_ROUTE_STOPS: Record<string, RouteStopReference[]> = {
  'route-001': [
    { id: 'stop-001', name: 'Colombo Central', stopOrder: 0, distanceFromStartKm: 0 },
    { id: 'stop-002', name: 'Pettah', stopOrder: 1, distanceFromStartKm: 2 },
    { id: 'stop-003', name: 'Maradana', stopOrder: 2, distanceFromStartKm: 4 },
    { id: 'stop-004', name: 'Kelaniya', stopOrder: 3, distanceFromStartKm: 10 },
    { id: 'stop-005', name: 'Kadawatha', stopOrder: 4, distanceFromStartKm: 18 },
    { id: 'stop-006', name: 'Nittambuwa', stopOrder: 5, distanceFromStartKm: 35 },
    { id: 'stop-007', name: 'Warakapola', stopOrder: 6, distanceFromStartKm: 55 },
    { id: 'stop-008', name: 'Kegalle', stopOrder: 7, distanceFromStartKm: 75 },
    { id: 'stop-009', name: 'Mawanella', stopOrder: 8, distanceFromStartKm: 90 },
    { id: 'stop-010', name: 'Kadugannawa', stopOrder: 9, distanceFromStartKm: 100 },
    { id: 'stop-011', name: 'Peradeniya', stopOrder: 10, distanceFromStartKm: 110 },
    { id: 'stop-012', name: 'Kandy', stopOrder: 11, distanceFromStartKm: 115 },
  ],
  'route-002': [
    { id: 'stop-012', name: 'Kandy', stopOrder: 0, distanceFromStartKm: 0 },
    { id: 'stop-011', name: 'Peradeniya', stopOrder: 1, distanceFromStartKm: 5 },
    { id: 'stop-010', name: 'Kadugannawa', stopOrder: 2, distanceFromStartKm: 15 },
    { id: 'stop-009', name: 'Mawanella', stopOrder: 3, distanceFromStartKm: 25 },
    { id: 'stop-008', name: 'Kegalle', stopOrder: 4, distanceFromStartKm: 40 },
    { id: 'stop-007', name: 'Warakapola', stopOrder: 5, distanceFromStartKm: 60 },
    { id: 'stop-006', name: 'Nittambuwa', stopOrder: 6, distanceFromStartKm: 80 },
    { id: 'stop-005', name: 'Kadawatha', stopOrder: 7, distanceFromStartKm: 97 },
    { id: 'stop-004', name: 'Kelaniya', stopOrder: 8, distanceFromStartKm: 105 },
    { id: 'stop-003', name: 'Maradana', stopOrder: 9, distanceFromStartKm: 111 },
    { id: 'stop-002', name: 'Pettah', stopOrder: 10, distanceFromStartKm: 113 },
    { id: 'stop-001', name: 'Colombo Central', stopOrder: 11, distanceFromStartKm: 115 },
  ],
  'route-003': [
    { id: 'stop-020', name: 'Colombo Central', stopOrder: 0, distanceFromStartKm: 0 },
    { id: 'stop-021', name: 'Kottawa', stopOrder: 1, distanceFromStartKm: 25 },
    { id: 'stop-022', name: 'Kahathuduwa', stopOrder: 2, distanceFromStartKm: 35 },
    { id: 'stop-023', name: 'Dodangoda', stopOrder: 3, distanceFromStartKm: 55 },
    { id: 'stop-024', name: 'Welipenna', stopOrder: 4, distanceFromStartKm: 70 },
    { id: 'stop-025', name: 'Kurundugaha', stopOrder: 5, distanceFromStartKm: 85 },
    { id: 'stop-026', name: 'Baddegama', stopOrder: 6, distanceFromStartKm: 100 },
    { id: 'stop-027', name: 'Pinnaduwa', stopOrder: 7, distanceFromStartKm: 110 },
    { id: 'stop-028', name: 'Galle', stopOrder: 8, distanceFromStartKm: 120 },
  ],
};

// Dummy initial schedule data
const createDummySchedule = (): Schedule => ({
  name: 'Morning Express - Colombo to Kandy',
  routeId: 'route-001',
  routeName: 'Colombo - Kandy (Via Kegalle)',
  routeGroupId: 'rg-001',
  routeGroupName: '1 - Colombo - Kandy',
  scheduleType: ScheduleTypeEnum.REGULAR,
  effectiveStartDate: '2024-01-01',
  effectiveEndDate: '2024-12-31',
  status: ScheduleStatusEnum.ACTIVE,
  description: 'Regular morning express service from Colombo to Kandy',
  generateTrips: true,
  scheduleStops: DUMMY_ROUTE_STOPS['route-001'].map((stop, index) => ({
    stopId: stop.id,
    stopName: stop.name,
    stopOrder: stop.stopOrder,
    arrivalTime: calculateTimeOffset('06:00', index * 10),
    departureTime: calculateTimeOffset('06:00', index * 10 + 2),
  })),
  calendar: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  },
  exceptions: [
    {
      id: 'exc-001',
      exceptionDate: '2024-04-14',
      exceptionType: ExceptionTypeEnum.REMOVED,
      description: 'Sinhala & Tamil New Year - No service',
    },
    {
      id: 'exc-002',
      exceptionDate: '2024-05-23',
      exceptionType: ExceptionTypeEnum.REMOVED,
      description: 'Vesak Poya Day - No service',
    },
    {
      id: 'exc-003',
      exceptionDate: '2024-12-25',
      exceptionType: ExceptionTypeEnum.ADDED,
      description: 'Christmas - Special service added',
    },
  ],
});

export function ScheduleWorkspaceProvider({ children }: ScheduleWorkspaceProviderProps) {
  // Mode and loading state
  const [mode, setMode] = useState<ScheduleWorkspaceMode>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scheduleId, setScheduleId] = useState<string | null>(null);

  // Initialize with dummy data for development
  const [data, setData] = useState<ScheduleWorkspaceData>(() => ({
    schedule: createDummySchedule(),
    availableRoutes: DUMMY_ROUTES,
    routeStops: DUMMY_ROUTE_STOPS['route-001'],
    selectedStopIndex: null,
    selectedExceptionIndex: null,
  }));

  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [selectedExceptionIndex, setSelectedExceptionIndex] = useState<number | null>(null);

  // Load existing schedule for editing (placeholder - will use real API later)
  const loadSchedule = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await ScheduleManagementService.getScheduleById(id);
      
      // For now, just set dummy data
      console.log('Loading schedule:', id);
      setScheduleId(id);
      setMode('edit');
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to load schedule:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load schedule');
      setIsLoading(false);
      return false;
    }
  }, []);

  // Reset to create mode
  const resetToCreateMode = useCallback(() => {
    setMode('create');
    setScheduleId(null);
    setLoadError(null);
    setData({
      schedule: createEmptySchedule(),
      availableRoutes: DUMMY_ROUTES,
      routeStops: [],
      selectedStopIndex: null,
      selectedExceptionIndex: null,
    });
    setSelectedStopIndex(null);
    setSelectedExceptionIndex(null);
  }, []);

  // Update schedule metadata
  const updateSchedule = useCallback((scheduleUpdate: Partial<Schedule>) => {
    setData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        ...scheduleUpdate,
      },
    }));
  }, []);

  // Set selected route and populate schedule stops
  const setSelectedRoute = useCallback((routeId: string) => {
    const selectedRoute = DUMMY_ROUTES.find(r => r.id === routeId);
    const routeStops = DUMMY_ROUTE_STOPS[routeId] || [];
    
    // Create schedule stops from route stops
    const scheduleStops: ScheduleStop[] = routeStops.map(stop => ({
      stopId: stop.id,
      stopName: stop.name,
      stopOrder: stop.stopOrder,
      arrivalTime: '',
      departureTime: '',
    }));

    setData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        routeId,
        routeName: selectedRoute?.name || '',
        routeGroupId: selectedRoute?.routeGroupId || '',
        routeGroupName: selectedRoute?.routeGroupName || '',
        scheduleStops,
      },
      routeStops,
    }));
  }, []);

  // Load available routes (placeholder - will use real API later)
  const loadAvailableRoutes = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const routes = await RouteManagementService.getAllRoutesAsList();
      
      // For now, use dummy data
      setData(prev => ({
        ...prev,
        availableRoutes: DUMMY_ROUTES,
      }));
    } catch (error) {
      console.error('Failed to load routes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a specific schedule stop
  const updateScheduleStop = useCallback((stopIndex: number, scheduleStopUpdate: Partial<ScheduleStop>) => {
    setData(prev => {
      const newStops = [...prev.schedule.scheduleStops];
      if (stopIndex >= 0 && stopIndex < newStops.length) {
        newStops[stopIndex] = {
          ...newStops[stopIndex],
          ...scheduleStopUpdate,
        };
      }
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          scheduleStops: newStops,
        },
      };
    });
  }, []);

  // Set all stop times with base time and interval
  const setAllStopTimes = useCallback((baseTime: string, intervalMinutes: number) => {
    setData(prev => {
      const newStops = prev.schedule.scheduleStops.map((stop, index) => ({
        ...stop,
        arrivalTime: calculateTimeOffset(baseTime, index * intervalMinutes),
        departureTime: calculateTimeOffset(baseTime, index * intervalMinutes + 2), // 2 min stop time
      }));
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          scheduleStops: newStops,
        },
      };
    });
  }, []);

  // Clear all stop times
  const clearAllStopTimes = useCallback(() => {
    setData(prev => {
      const newStops = prev.schedule.scheduleStops.map(stop => ({
        ...stop,
        arrivalTime: '',
        departureTime: '',
      }));
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          scheduleStops: newStops,
        },
      };
    });
  }, []);

  // Update calendar
  const updateCalendar = useCallback((calendarUpdate: Partial<ScheduleCalendar>) => {
    setData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        calendar: {
          ...prev.schedule.calendar,
          ...calendarUpdate,
        },
      },
    }));
  }, []);

  // Set all days enabled/disabled
  const setAllDays = useCallback((enabled: boolean) => {
    setData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        calendar: {
          monday: enabled,
          tuesday: enabled,
          wednesday: enabled,
          thursday: enabled,
          friday: enabled,
          saturday: enabled,
          sunday: enabled,
        },
      },
    }));
  }, []);

  // Set weekdays only
  const setWeekdaysOnly = useCallback(() => {
    setData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        calendar: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
      },
    }));
  }, []);

  // Set weekends only
  const setWeekendsOnly = useCallback(() => {
    setData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        calendar: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: true,
          sunday: true,
        },
      },
    }));
  }, []);

  // Add exception
  const addException = useCallback((exception: ScheduleException) => {
    setData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        exceptions: [...prev.schedule.exceptions, exception],
      },
    }));
  }, []);

  // Update exception
  const updateException = useCallback((exceptionIndex: number, exceptionUpdate: Partial<ScheduleException>) => {
    setData(prev => {
      const newExceptions = [...prev.schedule.exceptions];
      if (exceptionIndex >= 0 && exceptionIndex < newExceptions.length) {
        newExceptions[exceptionIndex] = {
          ...newExceptions[exceptionIndex],
          ...exceptionUpdate,
        };
      }
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          exceptions: newExceptions,
        },
      };
    });
  }, []);

  // Remove exception
  const removeException = useCallback((exceptionIndex: number) => {
    setData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        exceptions: prev.schedule.exceptions.filter((_, index) => index !== exceptionIndex),
      },
    }));
    // Clear selection if removed exception was selected
    if (selectedExceptionIndex === exceptionIndex) {
      setSelectedExceptionIndex(null);
    }
  }, [selectedExceptionIndex]);

  // Get schedule data
  const getScheduleData = useCallback(() => {
    return data.schedule;
  }, [data.schedule]);

  // Validate schedule
  const validateSchedule = useCallback(() => {
    return isScheduleValid(data.schedule);
  }, [data.schedule]);

  // Submit schedule (currently logs to console)
  const submitSchedule = useCallback(async () => {
    const validation = isScheduleValid(data.schedule);
    
    if (!validation.valid) {
      console.error('Schedule validation failed:', validation.errors);
      return;
    }

    const apiRequest = scheduleToApiRequest(data.schedule);
    
    console.log('='.repeat(60));
    console.log('SCHEDULE SUBMISSION DATA');
    console.log('='.repeat(60));
    console.log('Mode:', mode);
    console.log('Schedule ID:', scheduleId);
    console.log('-'.repeat(60));
    console.log('Workspace Schedule Data:');
    console.log(JSON.stringify(data.schedule, null, 2));
    console.log('-'.repeat(60));
    console.log('API Request Format (ready to send to backend):');
    console.log(JSON.stringify(apiRequest, null, 2));
    console.log('='.repeat(60));
    
    // TODO: Replace with actual API call
    // if (mode === 'create') {
    //   await ScheduleManagementService.createSchedule(apiRequest);
    // } else {
    //   await ScheduleManagementService.updateSchedule(scheduleId!, apiRequest);
    // }
  }, [data.schedule, mode, scheduleId]);

  const contextValue = useMemo(() => ({
    mode,
    isLoading,
    loadError,
    scheduleId,
    loadSchedule,
    resetToCreateMode,
    data,
    updateSchedule,
    setSelectedRoute,
    loadAvailableRoutes,
    updateScheduleStop,
    setAllStopTimes,
    clearAllStopTimes,
    updateCalendar,
    setAllDays,
    setWeekdaysOnly,
    setWeekendsOnly,
    addException,
    updateException,
    removeException,
    selectedStopIndex,
    setSelectedStopIndex,
    selectedExceptionIndex,
    setSelectedExceptionIndex,
    getScheduleData,
    validateSchedule,
    submitSchedule,
  }), [
    mode,
    isLoading,
    loadError,
    scheduleId,
    loadSchedule,
    resetToCreateMode,
    data,
    updateSchedule,
    setSelectedRoute,
    loadAvailableRoutes,
    updateScheduleStop,
    setAllStopTimes,
    clearAllStopTimes,
    updateCalendar,
    setAllDays,
    setWeekdaysOnly,
    setWeekendsOnly,
    addException,
    updateException,
    removeException,
    selectedStopIndex,
    setSelectedStopIndex,
    selectedExceptionIndex,
    setSelectedExceptionIndex,
    getScheduleData,
    validateSchedule,
    submitSchedule,
  ]);

  return (
    <ScheduleWorkspaceContext.Provider value={contextValue}>
      {children}
    </ScheduleWorkspaceContext.Provider>
  );
}
