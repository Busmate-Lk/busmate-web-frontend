/**
 * Schedule Workspace Types
 * 
 * These types represent the complete structure for managing schedule data
 * in the Schedule Workspace, including schedules, stops, calendars, and exceptions.
 * Designed for bulk schedule management - multiple schedules per workspace session.
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

export enum AxisOrientation {
  STOPS_BY_SCHEDULES = 'stops-by-schedules',      // Y: Stops, X: Schedules
  SCHEDULES_BY_STOPS = 'schedules-by-stops',      // Y: Schedules, X: Stops
  STOPS_BY_TIME = 'stops-by-time',                // Y: Stops, X: Time slots
  TIME_BY_STOPS = 'time-by-stops',                // Y: Time, X: Stops
}

// ============================================================================
// ROUTE REFERENCE TYPES (from selected route)
// ============================================================================

export interface RouteStopReference {
  id: string;           // Route stop ID
  stopId: string;       // Bus stop ID
  stopName: string;
  stopOrder: number;
  distanceFromStartKm: number;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
  };
}

export interface RouteReference {
  id: string;
  name: string;
  nameSinhala?: string;
  nameTamil?: string;
  routeNumber?: string;
  description?: string;
  direction?: string;
  roadType?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  routeGroupId?: string;
  routeGroupName?: string;
  routeStops: RouteStopReference[];
}

// ============================================================================
// SCHEDULE STOP TYPES
// ============================================================================

export interface ScheduleStop {
  id?: string;                    // UUID - optional for new schedule stops
  stopId: string;                 // Reference to the bus stop
  stopName?: string;              // For display purposes
  stopOrder: number;              // Order in the schedule (0-based)
  arrivalTime: string;            // HH:mm:ss format
  departureTime: string;          // HH:mm:ss format
  distanceFromStartKm?: number;   // From route reference
}

// ============================================================================
// SCHEDULE CALENDAR TYPES
// ============================================================================

export interface ScheduleCalendar {
  id?: string;
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

export interface ScheduleException {
  id?: string;
  exceptionDate: string;          // YYYY-MM-DD format
  exceptionType: ExceptionTypeEnum;
}

// ============================================================================
// SCHEDULE TYPES
// ============================================================================

export interface Schedule {
  id?: string;                    // UUID - optional for new schedules
  name: string;
  description?: string;
  routeId: string;
  scheduleType: ScheduleTypeEnum;
  effectiveStartDate: string;     // YYYY-MM-DD format
  effectiveEndDate?: string;      // YYYY-MM-DD format
  status: ScheduleStatusEnum;
  scheduleStops: ScheduleStop[];
  calendar: ScheduleCalendar;
  exceptions: ScheduleException[];
  // Metadata for UI
  isNew?: boolean;                // True if created in this session
  isDirty?: boolean;              // True if modified
}

// ============================================================================
// WORKSPACE DATA TYPES
// ============================================================================

export interface ScheduleWorkspaceData {
  route: RouteReference | null;   // Selected route for all schedules
  schedules: Schedule[];          // Array of schedules being managed
  activeScheduleIndex: number;    // Currently selected schedule index
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createEmptyScheduleCalendar(): ScheduleCalendar {
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

export function createWeekdayCalendar(): ScheduleCalendar {
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

export function createWeekendCalendar(): ScheduleCalendar {
  return {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: true,
    sunday: true,
  };
}

export function createAllDaysCalendar(): ScheduleCalendar {
  return {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  };
}

export function createEmptyScheduleStop(stopId: string, stopName: string, stopOrder: number, distanceFromStartKm?: number): ScheduleStop {
  return {
    stopId,
    stopName,
    stopOrder,
    arrivalTime: '',
    departureTime: '',
    distanceFromStartKm,
  };
}

export function createEmptySchedule(routeId: string): Schedule {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    name: '',
    description: '',
    routeId,
    scheduleType: ScheduleTypeEnum.REGULAR,
    effectiveStartDate: today,
    effectiveEndDate: undefined,
    status: ScheduleStatusEnum.PENDING,
    scheduleStops: [],
    calendar: createEmptyScheduleCalendar(),
    exceptions: [],
    isNew: true,
    isDirty: false,
  };
}

export function createScheduleFromRoute(route: RouteReference, name?: string): Schedule {
  const today = new Date().toISOString().split('T')[0];
  
  // Create schedule stops from route stops
  const scheduleStops: ScheduleStop[] = route.routeStops.map((routeStop) => ({
    stopId: routeStop.stopId,
    stopName: routeStop.stopName,
    stopOrder: routeStop.stopOrder,
    arrivalTime: '',
    departureTime: '',
    distanceFromStartKm: routeStop.distanceFromStartKm,
  }));

  return {
    name: name || `${route.name} Schedule`,
    description: '',
    routeId: route.id,
    scheduleType: ScheduleTypeEnum.REGULAR,
    effectiveStartDate: today,
    effectiveEndDate: undefined,
    status: ScheduleStatusEnum.PENDING,
    scheduleStops,
    calendar: createEmptyScheduleCalendar(),
    exceptions: [],
    isNew: true,
    isDirty: false,
  };
}

export function createEmptyScheduleWorkspaceData(): ScheduleWorkspaceData {
  return {
    route: null,
    schedules: [],
    activeScheduleIndex: -1,
  };
}

// ============================================================================
// SCHEDULE STOP TIME HELPERS
// ============================================================================

/**
 * Parse time string (HH:mm:ss or HH:mm) to minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  return hours * 60 + minutes;
}

/**
 * Format minutes from midnight to time string (HH:mm:ss)
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

/**
 * Format minutes from midnight to time string (HH:mm)
 */
export function formatMinutesToTimeShort(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculate duration between two time strings
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const startMinutes = parseTimeToMinutes(startTime);
  let endMinutes = parseTimeToMinutes(endTime);
  
  // Handle overnight schedules
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  return endMinutes - startMinutes;
}

/**
 * Add minutes to a time string
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const currentMinutes = parseTimeToMinutes(timeStr);
  return formatMinutesToTime(currentMinutes + minutesToAdd);
}

// ============================================================================
// SCHEDULE VALIDATION HELPERS
// ============================================================================

export function isValidTimeFormat(timeStr: string): boolean {
  if (!timeStr) return false;
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  return regex.test(timeStr);
}

export function isScheduleComplete(schedule: Schedule): boolean {
  // Check required fields
  if (!schedule.name || !schedule.routeId || !schedule.effectiveStartDate) {
    return false;
  }

  // Check if at least one day is selected in calendar
  const hasActiveDay = Object.values(schedule.calendar).some(
    (value, index) => index > 0 && value === true // Skip 'id' field
  );
  if (!hasActiveDay) {
    return false;
  }

  // Check if all stops have times
  const allStopsHaveTimes = schedule.scheduleStops.every(
    (stop) => stop.arrivalTime && stop.departureTime
  );
  if (!allStopsHaveTimes) {
    return false;
  }

  return true;
}

export function validateScheduleTimes(schedule: Schedule): string[] {
  const errors: string[] = [];

  schedule.scheduleStops.forEach((stop, index) => {
    // Validate time formats
    if (stop.arrivalTime && !isValidTimeFormat(stop.arrivalTime)) {
      errors.push(`Stop ${index + 1} (${stop.stopName}): Invalid arrival time format`);
    }
    if (stop.departureTime && !isValidTimeFormat(stop.departureTime)) {
      errors.push(`Stop ${index + 1} (${stop.stopName}): Invalid departure time format`);
    }

    // Validate departure >= arrival
    if (stop.arrivalTime && stop.departureTime) {
      const arrival = parseTimeToMinutes(stop.arrivalTime);
      const departure = parseTimeToMinutes(stop.departureTime);
      if (departure < arrival) {
        errors.push(`Stop ${index + 1} (${stop.stopName}): Departure time must be >= arrival time`);
      }
    }

    // Validate sequence (arrival at next stop should be after departure from previous)
    if (index > 0 && schedule.scheduleStops[index - 1].departureTime && stop.arrivalTime) {
      const prevDeparture = parseTimeToMinutes(schedule.scheduleStops[index - 1].departureTime);
      const currArrival = parseTimeToMinutes(stop.arrivalTime);
      if (currArrival < prevDeparture) {
        errors.push(`Stop ${index + 1} (${stop.stopName}): Arrival time must be after previous stop's departure`);
      }
    }
  });

  return errors;
}

// ============================================================================
// CALENDAR DISPLAY HELPERS
// ============================================================================

export function getCalendarDaysString(calendar: ScheduleCalendar): string {
  const days: string[] = [];
  if (calendar.monday) days.push('Mon');
  if (calendar.tuesday) days.push('Tue');
  if (calendar.wednesday) days.push('Wed');
  if (calendar.thursday) days.push('Thu');
  if (calendar.friday) days.push('Fri');
  if (calendar.saturday) days.push('Sat');
  if (calendar.sunday) days.push('Sun');
  
  if (days.length === 7) return 'Every day';
  if (days.length === 0) return 'No days selected';
  
  // Check for weekdays only
  if (days.length === 5 && !calendar.saturday && !calendar.sunday) {
    return 'Weekdays';
  }
  
  // Check for weekends only
  if (days.length === 2 && calendar.saturday && calendar.sunday) {
    return 'Weekends';
  }
  
  return days.join(', ');
}

export function getScheduleIdentificationTag(schedule: Schedule): string {
  const type = schedule.scheduleType === ScheduleTypeEnum.REGULAR ? 'Regular' : 'Special';
  const calendar = getCalendarDaysString(schedule.calendar);
  return `${type} - ${calendar}`;
}

// ============================================================================
// CONVERSION HELPERS (API <-> Workspace)
// ============================================================================

export function convertRouteResponseToReference(routeResponse: any): RouteReference {
  return {
    id: routeResponse.id || '',
    name: routeResponse.name || '',
    nameSinhala: routeResponse.nameSinhala,
    nameTamil: routeResponse.nameTamil,
    routeNumber: routeResponse.routeNumber,
    description: routeResponse.description,
    direction: routeResponse.direction,
    roadType: routeResponse.roadType,
    distanceKm: routeResponse.distanceKm,
    estimatedDurationMinutes: routeResponse.estimatedDurationMinutes,
    routeGroupId: routeResponse.routeGroupId,
    routeGroupName: routeResponse.routeGroupName,
    routeStops: (routeResponse.routeStops || []).map((stop: any) => ({
      id: stop.id || '',
      stopId: stop.stopId || '',
      stopName: stop.stopName || '',
      stopOrder: stop.stopOrder ?? 0,
      distanceFromStartKm: stop.distanceFromStartKm ?? 0,
      location: stop.location,
    })),
  };
}

export function convertScheduleResponseToSchedule(response: any): Schedule {
  const calendar: ScheduleCalendar = response.scheduleCalendars?.[0] 
    ? {
        id: response.scheduleCalendars[0].id,
        monday: response.scheduleCalendars[0].monday ?? false,
        tuesday: response.scheduleCalendars[0].tuesday ?? false,
        wednesday: response.scheduleCalendars[0].wednesday ?? false,
        thursday: response.scheduleCalendars[0].thursday ?? false,
        friday: response.scheduleCalendars[0].friday ?? false,
        saturday: response.scheduleCalendars[0].saturday ?? false,
        sunday: response.scheduleCalendars[0].sunday ?? false,
      }
    : createEmptyScheduleCalendar();

  const scheduleStops: ScheduleStop[] = (response.scheduleStops || []).map((stop: any) => ({
    id: stop.id,
    stopId: stop.stopId || '',
    stopName: stop.stopName || '',
    stopOrder: stop.stopOrder ?? 0,
    arrivalTime: stop.arrivalTime || '',
    departureTime: stop.departureTime || '',
  }));

  const exceptions: ScheduleException[] = (response.scheduleExceptions || []).map((exc: any) => ({
    id: exc.id,
    exceptionDate: exc.exceptionDate || '',
    exceptionType: exc.exceptionType as ExceptionTypeEnum,
  }));

  return {
    id: response.id,
    name: response.name || '',
    description: response.description || '',
    routeId: response.routeId || '',
    scheduleType: (response.scheduleType as ScheduleTypeEnum) || ScheduleTypeEnum.REGULAR,
    effectiveStartDate: response.effectiveStartDate || '',
    effectiveEndDate: response.effectiveEndDate,
    status: (response.status as ScheduleStatusEnum) || ScheduleStatusEnum.PENDING,
    scheduleStops,
    calendar,
    exceptions,
    isNew: false,
    isDirty: false,
  };
}

export function convertScheduleToRequest(schedule: Schedule): any {
  return {
    name: schedule.name,
    routeId: schedule.routeId,
    scheduleType: schedule.scheduleType,
    effectiveStartDate: schedule.effectiveStartDate,
    effectiveEndDate: schedule.effectiveEndDate || undefined,
    status: schedule.status,
    description: schedule.description || undefined,
    generateTrips: true,
    scheduleStops: schedule.scheduleStops.map((stop) => ({
      id: stop.id,
      stopId: stop.stopId,
      stopOrder: stop.stopOrder,
      arrivalTime: stop.arrivalTime,
      departureTime: stop.departureTime,
    })),
    calendar: {
      monday: schedule.calendar.monday,
      tuesday: schedule.calendar.tuesday,
      wednesday: schedule.calendar.wednesday,
      thursday: schedule.calendar.thursday,
      friday: schedule.calendar.friday,
      saturday: schedule.calendar.saturday,
      sunday: schedule.calendar.sunday,
    },
    exceptions: schedule.exceptions.map((exc) => ({
      exceptionDate: exc.exceptionDate,
      exceptionType: exc.exceptionType,
    })),
  };
}
