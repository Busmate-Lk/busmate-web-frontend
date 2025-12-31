'use client';

import { ReactNode, useState, useCallback, useMemo } from 'react';
import { ScheduleWorkspaceContext, ScheduleWorkspaceMode } from './ScheduleWorkspaceContext';
import {
  ScheduleWorkspaceData,
  Schedule,
  ScheduleStop,
  ScheduleCalendar,
  ScheduleException,
  RouteReference,
  AxisOrientation,
  createEmptyScheduleWorkspaceData,
  createScheduleFromRoute,
  convertRouteResponseToReference,
  convertScheduleResponseToSchedule,
} from '@/types/ScheduleWorkspaceData';
import { serializeScheduleWorkspaceToYaml, parseScheduleWorkspaceFromYaml } from '@/services/scheduleWorkspaceSerializer';
import { RouteManagementService, ScheduleManagementService } from '@/lib/api-client/route-management';

interface ScheduleWorkspaceProviderProps {
  children: ReactNode;
}

export function ScheduleWorkspaceProvider({ children }: ScheduleWorkspaceProviderProps) {
  // Mode and loading state
  const [mode, setMode] = useState<ScheduleWorkspaceMode>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Route selection
  const [routeId, setRouteId] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteReference | null>(null);
  
  // Workspace data
  const [data, setData] = useState<ScheduleWorkspaceData>(createEmptyScheduleWorkspaceData());
  const [activeScheduleIndex, setActiveScheduleIndex] = useState<number>(-1);
  
  // Axis orientations
  const [gridAxisOrientation, setGridAxisOrientation] = useState<AxisOrientation>(AxisOrientation.STOPS_BY_SCHEDULES);
  const [diagramAxisOrientation, setDiagramAxisOrientation] = useState<AxisOrientation>(AxisOrientation.TIME_BY_STOPS);
  
  // Selection state
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);

  // Load route by ID
  const loadRoute = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const routeResponse = await RouteManagementService.getRouteById(id);
      
      if (!routeResponse) {
        throw new Error('Route not found');
      }

      const routeRef = convertRouteResponseToReference(routeResponse);
      setRoute(routeRef);
      setRouteId(id);
      
      // Update data with route reference
      setData(prevData => ({
        ...prevData,
        route: routeRef,
      }));
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.body?.message || error.message || 'Failed to load route';
      console.error('Failed to load route:', error);
      setLoadError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Load existing schedules by IDs
  const loadSchedules = useCallback(async (scheduleIds: string[]): Promise<boolean> => {
    if (!route) {
      setLoadError('Please select a route first');
      return false;
    }

    setIsLoading(true);
    setLoadError(null);
    
    try {
      const schedules: Schedule[] = [];
      let hasExisting = false;
      
      for (const scheduleId of scheduleIds) {
        try {
          const response = await ScheduleManagementService.getScheduleById(scheduleId);
          if (response) {
            const schedule = convertScheduleResponseToSchedule(response);
            schedules.push(schedule);
            hasExisting = true;
          }
        } catch (error) {
          console.error(`Failed to load schedule ${scheduleId}:`, error);
        }
      }
      
      if (schedules.length === 0 && scheduleIds.length > 0) {
        throw new Error('No schedules could be loaded');
      }

      setData(prevData => ({
        ...prevData,
        schedules,
        activeScheduleIndex: schedules.length > 0 ? 0 : -1,
      }));
      
      setActiveScheduleIndex(schedules.length > 0 ? 0 : -1);
      setMode(hasExisting ? 'edit' : 'create');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.body?.message || error.message || 'Failed to load schedules';
      console.error('Failed to load schedules:', error);
      setLoadError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, [route]);

  // Reset workspace
  const resetWorkspace = useCallback(() => {
    setData(createEmptyScheduleWorkspaceData());
    setMode('create');
    setRouteId(null);
    setRoute(null);
    setLoadError(null);
    setActiveScheduleIndex(-1);
    setSelectedStopIndex(null);
  }, []);

  // Add a new schedule
  const addSchedule = useCallback((schedule?: Schedule) => {
    if (!route) return;
    
    const newSchedule = schedule || createScheduleFromRoute(route);
    
    setData(prevData => {
      const newSchedules = [...prevData.schedules, newSchedule];
      return {
        ...prevData,
        schedules: newSchedules,
        activeScheduleIndex: newSchedules.length - 1,
      };
    });
    
    setActiveScheduleIndex(data.schedules.length);
    
    // Update mode if mixing new and existing
    if (mode === 'edit' && newSchedule.isNew) {
      setMode('mixed');
    }
  }, [route, data.schedules.length, mode]);

  // Remove a schedule
  const removeSchedule = useCallback((index: number) => {
    setData(prevData => {
      const newSchedules = prevData.schedules.filter((_, i) => i !== index);
      const newActiveIndex = Math.min(activeScheduleIndex, newSchedules.length - 1);
      
      return {
        ...prevData,
        schedules: newSchedules,
        activeScheduleIndex: newActiveIndex,
      };
    });
    
    if (activeScheduleIndex >= data.schedules.length - 1) {
      setActiveScheduleIndex(Math.max(0, data.schedules.length - 2));
    }
  }, [activeScheduleIndex, data.schedules.length]);

  // Duplicate a schedule
  const duplicateSchedule = useCallback((index: number) => {
    setData(prevData => {
      const originalSchedule = prevData.schedules[index];
      if (!originalSchedule) return prevData;
      
      const duplicatedSchedule: Schedule = {
        ...JSON.parse(JSON.stringify(originalSchedule)), // Deep clone
        id: undefined, // Remove ID for new schedule
        name: `${originalSchedule.name} (Copy)`,
        isNew: true,
        isDirty: true,
      };
      
      const newSchedules = [...prevData.schedules, duplicatedSchedule];
      
      return {
        ...prevData,
        schedules: newSchedules,
        activeScheduleIndex: newSchedules.length - 1,
      };
    });
    
    setActiveScheduleIndex(data.schedules.length);
    
    if (mode === 'edit') {
      setMode('mixed');
    }
  }, [data.schedules.length, mode]);

  // Update a schedule
  const updateSchedule = useCallback((index: number, scheduleUpdate: Partial<Schedule>) => {
    setData(prevData => {
      const schedules = [...prevData.schedules];
      if (schedules[index]) {
        schedules[index] = {
          ...schedules[index],
          ...scheduleUpdate,
          isDirty: true,
        };
      }
      return {
        ...prevData,
        schedules,
      };
    });
  }, []);

  // Set active schedule
  const setActiveSchedule = useCallback((index: number) => {
    if (index >= -1 && index < data.schedules.length) {
      setActiveScheduleIndex(index);
      setData(prevData => ({
        ...prevData,
        activeScheduleIndex: index,
      }));
      setSelectedStopIndex(null);
    }
  }, [data.schedules.length]);

  // Update a schedule stop
  const updateScheduleStop = useCallback((scheduleIndex: number, stopIndex: number, stopUpdate: Partial<ScheduleStop>) => {
    setData(prevData => {
      const schedules = [...prevData.schedules];
      if (schedules[scheduleIndex]) {
        const stops = [...schedules[scheduleIndex].scheduleStops];
        if (stops[stopIndex]) {
          stops[stopIndex] = { ...stops[stopIndex], ...stopUpdate };
          schedules[scheduleIndex] = {
            ...schedules[scheduleIndex],
            scheduleStops: stops,
            isDirty: true,
          };
        }
      }
      return {
        ...prevData,
        schedules,
      };
    });
  }, []);

  // Update all schedule stops
  const updateAllScheduleStops = useCallback((scheduleIndex: number, stops: ScheduleStop[]) => {
    setData(prevData => {
      const schedules = [...prevData.schedules];
      if (schedules[scheduleIndex]) {
        schedules[scheduleIndex] = {
          ...schedules[scheduleIndex],
          scheduleStops: stops,
          isDirty: true,
        };
      }
      return {
        ...prevData,
        schedules,
      };
    });
  }, []);

  // Update schedule calendar
  const updateScheduleCalendar = useCallback((scheduleIndex: number, calendarUpdate: Partial<ScheduleCalendar>) => {
    setData(prevData => {
      const schedules = [...prevData.schedules];
      if (schedules[scheduleIndex]) {
        schedules[scheduleIndex] = {
          ...schedules[scheduleIndex],
          calendar: {
            ...schedules[scheduleIndex].calendar,
            ...calendarUpdate,
          },
          isDirty: true,
        };
      }
      return {
        ...prevData,
        schedules,
      };
    });
  }, []);

  // Add schedule exception
  const addScheduleException = useCallback((scheduleIndex: number, exception: ScheduleException) => {
    setData(prevData => {
      const schedules = [...prevData.schedules];
      if (schedules[scheduleIndex]) {
        schedules[scheduleIndex] = {
          ...schedules[scheduleIndex],
          exceptions: [...schedules[scheduleIndex].exceptions, exception],
          isDirty: true,
        };
      }
      return {
        ...prevData,
        schedules,
      };
    });
  }, []);

  // Remove schedule exception
  const removeScheduleException = useCallback((scheduleIndex: number, exceptionIndex: number) => {
    setData(prevData => {
      const schedules = [...prevData.schedules];
      if (schedules[scheduleIndex]) {
        schedules[scheduleIndex] = {
          ...schedules[scheduleIndex],
          exceptions: schedules[scheduleIndex].exceptions.filter((_, i) => i !== exceptionIndex),
          isDirty: true,
        };
      }
      return {
        ...prevData,
        schedules,
      };
    });
  }, []);

  // Update schedule exception
  const updateScheduleException = useCallback((scheduleIndex: number, exceptionIndex: number, exceptionUpdate: Partial<ScheduleException>) => {
    setData(prevData => {
      const schedules = [...prevData.schedules];
      if (schedules[scheduleIndex]) {
        const exceptions = [...schedules[scheduleIndex].exceptions];
        if (exceptions[exceptionIndex]) {
          exceptions[exceptionIndex] = { ...exceptions[exceptionIndex], ...exceptionUpdate };
          schedules[scheduleIndex] = {
            ...schedules[scheduleIndex],
            exceptions,
            isDirty: true,
          };
        }
      }
      return {
        ...prevData,
        schedules,
      };
    });
  }, []);

  // YAML serialization
  const getYaml = useCallback(() => {
    return serializeScheduleWorkspaceToYaml(data);
  }, [data]);

  // YAML parsing
  const updateFromYaml = useCallback((yaml: string): boolean => {
    try {
      const parsedData = parseScheduleWorkspaceFromYaml(yaml);
      
      if (parsedData.schedules && parsedData.schedules.length > 0) {
        setData(prevData => ({
          ...prevData,
          schedules: parsedData.schedules!.map((s: Schedule) => ({
            ...s,
            routeId: route?.id || s.routeId,
            isDirty: true,
          })),
          activeScheduleIndex: 0,
        }));
        setActiveScheduleIndex(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to parse YAML:', error);
      return false;
    }
  }, [route]);

  // Get schedules for submission
  const getSchedulesForSubmission = useCallback(() => {
    return data.schedules;
  }, [data.schedules]);

  // Save all schedules to the backend
  const saveAllSchedules = useCallback(async (): Promise<void> => {
    const schedulesToSave = data.schedules.filter(s => s.isDirty || s.isNew);
    
    for (const schedule of schedulesToSave) {
      const scheduleRequest = {
        name: schedule.name,
        description: schedule.description,
        routeId: route?.id || schedule.routeId,
        scheduleType: schedule.scheduleType,
        effectiveStartDate: schedule.effectiveStartDate,
        effectiveEndDate: schedule.effectiveEndDate,
        status: schedule.status,
        scheduleStops: schedule.scheduleStops.map(stop => ({
          stopId: stop.stopId,
          stopOrder: stop.stopOrder,
          arrivalTime: stop.arrivalTime,
          departureTime: stop.departureTime,
        })),
        calendar: schedule.calendar,
        exceptions: schedule.exceptions.map(exc => ({
          exceptionDate: exc.exceptionDate,
          exceptionType: exc.exceptionType,
        })),
      };

      if (schedule.isNew) {
        await ScheduleManagementService.createSchedule(scheduleRequest as any);
      } else if (schedule.id) {
        await ScheduleManagementService.updateSchedule(schedule.id, scheduleRequest as any);
      }
    }

    // Mark all as saved
    setData(prevData => ({
      ...prevData,
      schedules: prevData.schedules.map(s => ({
        ...s,
        isDirty: false,
        isNew: false,
      })),
    }));
  }, [data.schedules, route]);

  // Set selected stop
  const setSelectedStop = useCallback((index: number | null) => {
    setSelectedStopIndex(index);
  }, []);

  const contextValue = useMemo(() => ({
    // Mode and loading state
    mode,
    isLoading,
    loadError,
    
    // Route selection
    routeId,
    route,
    loadRoute,
    
    // Schedule management
    data,
    activeScheduleIndex,
    
    // Load schedules
    loadSchedules,
    
    // Reset
    resetWorkspace,
    
    // Schedule CRUD
    addSchedule,
    removeSchedule,
    duplicateSchedule,
    updateSchedule,
    setActiveSchedule,
    
    // Schedule stop operations
    updateScheduleStop,
    updateAllScheduleStops,
    
    // Calendar operations
    updateScheduleCalendar,
    
    // Exception operations
    addScheduleException,
    removeScheduleException,
    updateScheduleException,
    
    // Axis orientation
    gridAxisOrientation,
    diagramAxisOrientation,
    setGridAxisOrientation,
    setDiagramAxisOrientation,
    
    // Serialization
    getYaml,
    updateFromYaml,
    
    // Submission
    getSchedulesForSubmission,
    saveAllSchedules,
    
    // Selection
    selectedStopIndex,
    setSelectedStop,
  }), [
    mode,
    isLoading,
    loadError,
    routeId,
    route,
    loadRoute,
    data,
    activeScheduleIndex,
    loadSchedules,
    resetWorkspace,
    addSchedule,
    removeSchedule,
    duplicateSchedule,
    updateSchedule,
    setActiveSchedule,
    updateScheduleStop,
    updateAllScheduleStops,
    updateScheduleCalendar,
    addScheduleException,
    removeScheduleException,
    updateScheduleException,
    gridAxisOrientation,
    diagramAxisOrientation,
    getYaml,
    updateFromYaml,
    getSchedulesForSubmission,
    saveAllSchedules,
    selectedStopIndex,
    setSelectedStop,
  ]);

  return (
    <ScheduleWorkspaceContext.Provider value={contextValue}>
      {children}
    </ScheduleWorkspaceContext.Provider>
  );
}
