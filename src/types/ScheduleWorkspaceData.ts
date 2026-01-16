/**
 * Schedule Workspace Types
 * 
 * These types represent the complete structure for managing schedule data
 * in the Schedule Workspace, including schedules, stops, calendars, and exceptions.
 * Designed to work seamlessly with the route-management-service Schedule APIs.
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum ScheduleTypeEnum {
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL',
}

export enum ScheduleStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
}

export enum ExceptionTypeEnum {
  ADDED = 'ADDED',
  REMOVED = 'REMOVED',
}

// ============================================================================
// SCHEDULE CALENDAR TYPES
// ============================================================================

/**
 * Calendar defining which days of the week the schedule operates
 */
export interface ScheduleCalendar {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

// ============================================================================
// SCHEDULE EXCEPTION TYPES
// ============================================================================

/**
 * Exception date for adding or removing service on specific dates
 */
export interface ScheduleException {
  id?: string; // Client-side ID for UI management
  exceptionDate: string; // YYYY-MM-DD format
  exceptionType: ExceptionTypeEnum;
  description?: string; // UI-only field for notes
}

// ============================================================================
// SCHEDULE STOP TYPES
// ============================================================================

/**
 * Stop timing information within a schedule
 */
export interface ScheduleStop {
  id?: string; // UUID - used for updates
  stopId: string; // UUID of the bus stop
  stopName?: string; // Display name (populated from route or stop data)
  stopOrder: number; // 0-based order in the route
  arrivalTime?: string; // HH:mm:ss format
  departureTime?: string; // HH:mm:ss format
}

// ============================================================================
// SCHEDULE TYPES
// ============================================================================

/**
 * Complete schedule data model for workspace
 */
export interface Schedule {
  id?: string; // UUID - optional for new schedules
  name: string;
  routeId: string; // UUID of the route this schedule belongs to
  routeName?: string; // Display name (populated from route data)
  routeGroupId?: string; // For reference
  routeGroupName?: string; // Display name
  scheduleType: ScheduleTypeEnum;
  effectiveStartDate: string; // YYYY-MM-DD format
  effectiveEndDate?: string; // YYYY-MM-DD format, optional for indefinite
  status: ScheduleStatusEnum;
  description?: string;
  generateTrips?: boolean;
  scheduleStops: ScheduleStop[];
  calendar: ScheduleCalendar;
  exceptions: ScheduleException[];
}

// ============================================================================
// ROUTE REFERENCE TYPES (for route selection)
// ============================================================================

/**
 * Minimal route information for selection dropdown
 */
export interface RouteReference {
  id: string;
  name: string;
  routeGroupId?: string;
  routeGroupName?: string;
  direction?: string;
  startStopName?: string;
  endStopName?: string;
}

/**
 * Stop reference from route for populating schedule stops
 */
export interface RouteStopReference {
  id: string; // Stop ID
  name: string;
  stopOrder: number;
  distanceFromStartKm?: number;
}

// ============================================================================
// WORKSPACE DATA TYPES
// ============================================================================

export interface ScheduleWorkspaceData {
  schedule: Schedule;
  // Available routes for selection
  availableRoutes: RouteReference[];
  // Route stops when a route is selected (used to build schedule stops)
  routeStops: RouteStopReference[];
  // Currently selected stop index for editing
  selectedStopIndex: number | null;
  // Currently selected exception index for editing
  selectedExceptionIndex: number | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createEmptyCalendar(): ScheduleCalendar {
  return {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  };
}

export function createEmptyScheduleStop(stopOrder: number): ScheduleStop {
  return {
    stopId: '',
    stopName: '',
    stopOrder,
    arrivalTime: '',
    departureTime: '',
  };
}

export function createEmptyException(): ScheduleException {
  return {
    id: `exc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    exceptionDate: '',
    exceptionType: ExceptionTypeEnum.REMOVED,
    description: '',
  };
}

export function createEmptySchedule(): Schedule {
  return {
    name: '',
    routeId: '',
    routeName: '',
    scheduleType: ScheduleTypeEnum.REGULAR,
    effectiveStartDate: new Date().toISOString().split('T')[0],
    effectiveEndDate: '',
    status: ScheduleStatusEnum.PENDING,
    description: '',
    generateTrips: true,
    scheduleStops: [],
    calendar: createEmptyCalendar(),
    exceptions: [],
  };
}

export function createEmptyScheduleWorkspaceData(): ScheduleWorkspaceData {
  return {
    schedule: createEmptySchedule(),
    availableRoutes: [],
    routeStops: [],
    selectedStopIndex: null,
    selectedExceptionIndex: null,
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates if a schedule has all required fields filled
 */
export function isScheduleValid(schedule: Schedule): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!schedule.name.trim()) {
    errors.push('Schedule name is required');
  }

  if (!schedule.routeId) {
    errors.push('Route selection is required');
  }

  if (!schedule.effectiveStartDate) {
    errors.push('Start date is required');
  }

  if (schedule.effectiveEndDate && schedule.effectiveStartDate > schedule.effectiveEndDate) {
    errors.push('End date must be after start date');
  }

  if (schedule.scheduleStops.length === 0) {
    errors.push('At least one schedule stop is required');
  }

  // Validate each schedule stop has timing
  const stopsWithoutTiming = schedule.scheduleStops.filter(
    stop => !stop.arrivalTime && !stop.departureTime
  );
  if (stopsWithoutTiming.length > 0) {
    errors.push(`${stopsWithoutTiming.length} stops are missing timing information`);
  }

  // Validate at least one operating day is selected
  const { calendar } = schedule;
  const hasOperatingDay = calendar.monday || calendar.tuesday || calendar.wednesday ||
    calendar.thursday || calendar.friday || calendar.saturday || calendar.sunday;
  if (!hasOperatingDay) {
    errors.push('At least one operating day must be selected');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// API CONVERSION HELPERS
// ============================================================================

/**
 * Converts workspace schedule data to API request format
 */
export function scheduleToApiRequest(schedule: Schedule): {
  name: string;
  routeId: string;
  scheduleType: 'REGULAR' | 'SPECIAL';
  effectiveStartDate: string;
  effectiveEndDate?: string;
  status?: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
  description?: string;
  generateTrips?: boolean;
  scheduleStops?: {
    id?: string;
    stopId: string;
    stopOrder: number;
    arrivalTime?: string;
    departureTime?: string;
  }[];
  calendar?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  exceptions?: {
    exceptionDate: string;
    exceptionType: 'ADDED' | 'REMOVED';
  }[];
} {
  return {
    name: schedule.name,
    routeId: schedule.routeId,
    scheduleType: schedule.scheduleType,
    effectiveStartDate: schedule.effectiveStartDate,
    effectiveEndDate: schedule.effectiveEndDate || undefined,
    status: schedule.status,
    description: schedule.description || undefined,
    generateTrips: schedule.generateTrips,
    scheduleStops: schedule.scheduleStops.map(stop => ({
      id: stop.id,
      stopId: stop.stopId,
      stopOrder: stop.stopOrder,
      arrivalTime: stop.arrivalTime || undefined,
      departureTime: stop.departureTime || undefined,
    })),
    calendar: schedule.calendar,
    exceptions: schedule.exceptions.map(exc => ({
      exceptionDate: exc.exceptionDate,
      exceptionType: exc.exceptionType,
    })),
  };
}

// ============================================================================
// TIME HELPERS
// ============================================================================

/**
 * Formats time string to HH:mm:ss format
 */
export function formatTimeForApi(time: string): string {
  if (!time) return '';
  
  // If already in HH:mm:ss format
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  
  // If in HH:mm format, add seconds
  if (/^\d{2}:\d{2}$/.test(time)) {
    return `${time}:00`;
  }
  
  return time;
}

/**
 * Formats time string to HH:mm format for display
 */
export function formatTimeForDisplay(time: string): string {
  if (!time) return '';
  
  // Extract HH:mm from HH:mm:ss
  const match = time.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : time;
}

/**
 * Calculates time offset from first stop
 */
export function calculateTimeOffset(baseTime: string, offsetMinutes: number): string {
  if (!baseTime) return '';
  
  const [hours, minutes] = baseTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + offsetMinutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}
