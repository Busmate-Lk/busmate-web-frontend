import { createContext } from 'react';
import {
  ScheduleWorkspaceData,
  Schedule,
  ScheduleStop,
  ScheduleCalendar,
  ScheduleException,
  RouteReference,
  AxisOrientation,
  createEmptyScheduleWorkspaceData,
  createEmptySchedule,
} from '@/types/ScheduleWorkspaceData';

// Workspace mode: 'create' for new schedules, 'edit' for existing, 'mixed' for both
export type ScheduleWorkspaceMode = 'create' | 'edit' | 'mixed';

export interface ScheduleWorkspaceContextType {
  // Mode and loading state
  mode: ScheduleWorkspaceMode;
  isLoading: boolean;
  loadError: string | null;
  
  // Route selection
  routeId: string | null;
  route: RouteReference | null;
  loadRoute: (routeId: string) => Promise<boolean>;
  
  // Schedule management
  data: ScheduleWorkspaceData;
  activeScheduleIndex: number;
  
  // Load existing schedules
  loadSchedules: (scheduleIds: string[]) => Promise<boolean>;
  
  // Reset workspace
  resetWorkspace: () => void;
  
  // Schedule CRUD operations
  addSchedule: (schedule?: Schedule) => void;
  removeSchedule: (index: number) => void;
  duplicateSchedule: (index: number) => void;
  updateSchedule: (index: number, schedule: Partial<Schedule>) => void;
  setActiveSchedule: (index: number) => void;
  
  // Schedule stop operations
  updateScheduleStop: (scheduleIndex: number, stopIndex: number, stop: Partial<ScheduleStop>) => void;
  updateAllScheduleStops: (scheduleIndex: number, stops: ScheduleStop[]) => void;
  
  // Calendar operations
  updateScheduleCalendar: (scheduleIndex: number, calendar: Partial<ScheduleCalendar>) => void;
  
  // Exception operations
  addScheduleException: (scheduleIndex: number, exception: ScheduleException) => void;
  removeScheduleException: (scheduleIndex: number, exceptionIndex: number) => void;
  updateScheduleException: (scheduleIndex: number, exceptionIndex: number, exception: Partial<ScheduleException>) => void;
  
  // Axis orientation (for grid and diagram views)
  gridAxisOrientation: AxisOrientation;
  diagramAxisOrientation: AxisOrientation;
  setGridAxisOrientation: (orientation: AxisOrientation) => void;
  setDiagramAxisOrientation: (orientation: AxisOrientation) => void;
  
  // Serialization
  getYaml: () => string;
  updateFromYaml: (yaml: string) => boolean;
  
  // Get data for submission
  getSchedulesForSubmission: () => Schedule[];
  
  // Save all schedules
  saveAllSchedules: () => Promise<void>;
  
  // Selection state
  selectedStopIndex: number | null;
  setSelectedStop: (index: number | null) => void;
}

export const ScheduleWorkspaceContext = createContext<ScheduleWorkspaceContextType>({
  // Mode and loading state defaults
  mode: 'create',
  isLoading: false,
  loadError: null,
  
  // Route selection defaults
  routeId: null,
  route: null,
  loadRoute: async () => false,
  
  // Schedule management defaults
  data: createEmptyScheduleWorkspaceData(),
  activeScheduleIndex: -1,
  
  // Load schedules default
  loadSchedules: async () => false,
  
  // Reset default
  resetWorkspace: () => {},
  
  // Schedule CRUD defaults
  addSchedule: () => {},
  removeSchedule: () => {},
  duplicateSchedule: () => {},
  updateSchedule: () => {},
  setActiveSchedule: () => {},
  
  // Schedule stop defaults
  updateScheduleStop: () => {},
  updateAllScheduleStops: () => {},
  
  // Calendar defaults
  updateScheduleCalendar: () => {},
  
  // Exception defaults
  addScheduleException: () => {},
  removeScheduleException: () => {},
  updateScheduleException: () => {},
  
  // Axis orientation defaults
  gridAxisOrientation: AxisOrientation.STOPS_BY_SCHEDULES,
  diagramAxisOrientation: AxisOrientation.TIME_BY_STOPS,
  setGridAxisOrientation: () => {},
  setDiagramAxisOrientation: () => {},
  
  // Serialization defaults
  getYaml: () => '',
  updateFromYaml: () => false,
  
  // Submission defaults
  getSchedulesForSubmission: () => [],
  
  // Save all schedules default
  saveAllSchedules: async () => {},
  
  // Selection defaults
  selectedStopIndex: null,
  setSelectedStop: () => {},
});
