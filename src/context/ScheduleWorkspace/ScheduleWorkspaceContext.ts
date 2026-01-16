import { createContext } from 'react';
import {
  ScheduleWorkspaceData,
  createEmptyScheduleWorkspaceData,
  Schedule,
  ScheduleStop,
  ScheduleCalendar,
  ScheduleException,
  RouteReference,
  RouteStopReference,
} from '@/types/ScheduleWorkspaceData';

// Workspace mode: 'create' for new schedules, 'edit' for existing ones
export type ScheduleWorkspaceMode = 'create' | 'edit';

export interface ScheduleWorkspaceContextType {
  // Mode and loading state
  mode: ScheduleWorkspaceMode;
  isLoading: boolean;
  loadError: string | null;
  scheduleId: string | null;

  // Load existing schedule for editing
  loadSchedule: (scheduleId: string) => Promise<boolean>;
  // Reset to create mode
  resetToCreateMode: () => void;

  // Data
  data: ScheduleWorkspaceData;

  // Schedule metadata operations
  updateSchedule: (schedule: Partial<Schedule>) => void;
  
  // Route selection
  setSelectedRoute: (routeId: string) => void;
  loadAvailableRoutes: () => Promise<void>;

  // Schedule stops operations
  updateScheduleStop: (stopIndex: number, scheduleStop: Partial<ScheduleStop>) => void;
  setAllStopTimes: (baseTime: string, intervalMinutes: number) => void;
  clearAllStopTimes: () => void;

  // Calendar operations
  updateCalendar: (calendar: Partial<ScheduleCalendar>) => void;
  setAllDays: (enabled: boolean) => void;
  setWeekdaysOnly: () => void;
  setWeekendsOnly: () => void;

  // Exception operations
  addException: (exception: ScheduleException) => void;
  updateException: (exceptionIndex: number, exception: Partial<ScheduleException>) => void;
  removeException: (exceptionIndex: number) => void;

  // Selection state
  selectedStopIndex: number | null;
  setSelectedStopIndex: (index: number | null) => void;
  selectedExceptionIndex: number | null;
  setSelectedExceptionIndex: (index: number | null) => void;

  // Submission
  getScheduleData: () => Schedule;
  validateSchedule: () => { valid: boolean; errors: string[] };
  submitSchedule: () => Promise<void>;
}

export const ScheduleWorkspaceContext = createContext<ScheduleWorkspaceContextType>({
  // Mode and loading state defaults
  mode: 'create',
  isLoading: false,
  loadError: null,
  scheduleId: null,

  // Load/reset defaults
  loadSchedule: async () => false,
  resetToCreateMode: () => {},

  // Data defaults
  data: createEmptyScheduleWorkspaceData(),

  // Schedule operations defaults
  updateSchedule: () => {},
  
  // Route selection defaults
  setSelectedRoute: () => {},
  loadAvailableRoutes: async () => {},

  // Schedule stops defaults
  updateScheduleStop: () => {},
  setAllStopTimes: () => {},
  clearAllStopTimes: () => {},

  // Calendar defaults
  updateCalendar: () => {},
  setAllDays: () => {},
  setWeekdaysOnly: () => {},
  setWeekendsOnly: () => {},

  // Exception defaults
  addException: () => {},
  updateException: () => {},
  removeException: () => {},

  // Selection defaults
  selectedStopIndex: null,
  setSelectedStopIndex: () => {},
  selectedExceptionIndex: null,
  setSelectedExceptionIndex: () => {},

  // Submission defaults
  getScheduleData: () => createEmptyScheduleWorkspaceData().schedule,
  validateSchedule: () => ({ valid: false, errors: [] }),
  submitSchedule: async () => {},
});
