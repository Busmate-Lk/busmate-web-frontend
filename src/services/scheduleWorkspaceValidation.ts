/**
 * Schedule Workspace Validation Service
 * 
 * Comprehensive validation for schedule data including time conflicts,
 * route consistency, and data integrity across all schedules.
 */

import {
  Schedule,
  ScheduleStop,
  ScheduleCalendar,
  ScheduleWorkspaceData,
  parseTimeToMinutes,
  isValidTimeFormat,
} from '@/types/ScheduleWorkspaceData';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface ValidationIssue {
  severity: ValidationSeverity;
  field: string;
  message: string;
  scheduleIndex?: number;
  stopIndex?: number;
}

export interface ScheduleValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface BulkValidationResult {
  isValid: boolean;
  scheduleResults: ScheduleValidationResult[];
  crossScheduleIssues: ValidationIssue[];
  totalErrors: number;
  totalWarnings: number;
}

// ============================================================================
// SINGLE SCHEDULE VALIDATION
// ============================================================================

/**
 * Validate a single schedule
 */
export function validateSchedule(schedule: Schedule, scheduleIndex: number = 0): ScheduleValidationResult {
  const issues: ValidationIssue[] = [];

  // Required field validation
  if (!schedule.name || schedule.name.trim() === '') {
    issues.push({
      severity: ValidationSeverity.ERROR,
      field: 'name',
      message: 'Schedule name is required',
      scheduleIndex,
    });
  }

  if (!schedule.routeId) {
    issues.push({
      severity: ValidationSeverity.ERROR,
      field: 'routeId',
      message: 'Route ID is required',
      scheduleIndex,
    });
  }

  if (!schedule.effectiveStartDate) {
    issues.push({
      severity: ValidationSeverity.ERROR,
      field: 'effectiveStartDate',
      message: 'Effective start date is required',
      scheduleIndex,
    });
  }

  // Date validation
  if (schedule.effectiveStartDate && schedule.effectiveEndDate) {
    const startDate = new Date(schedule.effectiveStartDate);
    const endDate = new Date(schedule.effectiveEndDate);
    if (endDate < startDate) {
      issues.push({
        severity: ValidationSeverity.ERROR,
        field: 'effectiveEndDate',
        message: 'End date must be after start date',
        scheduleIndex,
      });
    }
  }

  // Calendar validation
  const calendarIssues = validateCalendar(schedule.calendar, scheduleIndex);
  issues.push(...calendarIssues);

  // Schedule stops validation
  const stopIssues = validateScheduleStops(schedule.scheduleStops, scheduleIndex);
  issues.push(...stopIssues);

  // Time sequence validation
  const timeIssues = validateTimeSequence(schedule.scheduleStops, scheduleIndex);
  issues.push(...timeIssues);

  const errors = issues.filter(i => i.severity === ValidationSeverity.ERROR);
  const warnings = issues.filter(i => i.severity === ValidationSeverity.WARNING);

  return {
    isValid: errors.length === 0,
    issues,
    errors,
    warnings,
  };
}

/**
 * Validate schedule calendar
 */
function validateCalendar(calendar: ScheduleCalendar, scheduleIndex: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const hasActiveDay = 
    calendar.monday || 
    calendar.tuesday || 
    calendar.wednesday || 
    calendar.thursday || 
    calendar.friday || 
    calendar.saturday || 
    calendar.sunday;

  if (!hasActiveDay) {
    issues.push({
      severity: ValidationSeverity.ERROR,
      field: 'calendar',
      message: 'At least one day must be selected in the calendar',
      scheduleIndex,
    });
  }

  return issues;
}

/**
 * Validate schedule stops
 */
function validateScheduleStops(stops: ScheduleStop[], scheduleIndex: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!stops || stops.length === 0) {
    issues.push({
      severity: ValidationSeverity.WARNING,
      field: 'scheduleStops',
      message: 'Schedule has no stops defined',
      scheduleIndex,
    });
    return issues;
  }

  // Validate each stop
  stops.forEach((stop, stopIndex) => {
    // Stop ID validation
    if (!stop.stopId) {
      issues.push({
        severity: ValidationSeverity.ERROR,
        field: 'stopId',
        message: `Stop ${stopIndex + 1}: Missing stop ID`,
        scheduleIndex,
        stopIndex,
      });
    }

    // Time format validation
    if (stop.arrivalTime && !isValidTimeFormat(stop.arrivalTime)) {
      issues.push({
        severity: ValidationSeverity.ERROR,
        field: 'arrivalTime',
        message: `Stop ${stopIndex + 1} (${stop.stopName}): Invalid arrival time format`,
        scheduleIndex,
        stopIndex,
      });
    }

    if (stop.departureTime && !isValidTimeFormat(stop.departureTime)) {
      issues.push({
        severity: ValidationSeverity.ERROR,
        field: 'departureTime',
        message: `Stop ${stopIndex + 1} (${stop.stopName}): Invalid departure time format`,
        scheduleIndex,
        stopIndex,
      });
    }

    // Departure must be >= arrival
    if (stop.arrivalTime && stop.departureTime) {
      const arrivalMinutes = parseTimeToMinutes(stop.arrivalTime);
      const departureMinutes = parseTimeToMinutes(stop.departureTime);
      
      if (departureMinutes < arrivalMinutes) {
        issues.push({
          severity: ValidationSeverity.ERROR,
          field: 'departureTime',
          message: `Stop ${stopIndex + 1} (${stop.stopName}): Departure time must be >= arrival time`,
          scheduleIndex,
          stopIndex,
        });
      }
    }

    // Missing times warning
    if (!stop.arrivalTime || !stop.departureTime) {
      issues.push({
        severity: ValidationSeverity.WARNING,
        field: 'times',
        message: `Stop ${stopIndex + 1} (${stop.stopName}): Missing arrival or departure time`,
        scheduleIndex,
        stopIndex,
      });
    }
  });

  // Check for duplicate stop orders
  const orders = stops.map(s => s.stopOrder);
  const uniqueOrders = new Set(orders);
  if (orders.length !== uniqueOrders.size) {
    issues.push({
      severity: ValidationSeverity.ERROR,
      field: 'stopOrder',
      message: 'Duplicate stop order values found',
      scheduleIndex,
    });
  }

  return issues;
}

/**
 * Validate time sequence (each stop's arrival should be after previous stop's departure)
 */
function validateTimeSequence(stops: ScheduleStop[], scheduleIndex: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Sort stops by order
  const sortedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);

  for (let i = 1; i < sortedStops.length; i++) {
    const prevStop = sortedStops[i - 1];
    const currStop = sortedStops[i];

    if (prevStop.departureTime && currStop.arrivalTime) {
      const prevDeparture = parseTimeToMinutes(prevStop.departureTime);
      let currArrival = parseTimeToMinutes(currStop.arrivalTime);

      // Handle overnight schedules (arrival next day)
      if (currArrival < prevDeparture) {
        // Could be overnight, just warn
        issues.push({
          severity: ValidationSeverity.WARNING,
          field: 'arrivalTime',
          message: `Stop ${i + 1} (${currStop.stopName}): Arrival time is earlier than previous stop's departure. Is this an overnight schedule?`,
          scheduleIndex,
          stopIndex: i,
        });
      }
    }
  }

  return issues;
}

// ============================================================================
// BULK VALIDATION (ALL SCHEDULES)
// ============================================================================

/**
 * Validate all schedules in the workspace
 */
export function validateAllSchedules(data: ScheduleWorkspaceData): BulkValidationResult {
  const scheduleResults: ScheduleValidationResult[] = [];
  const crossScheduleIssues: ValidationIssue[] = [];

  // Validate route is selected
  if (!data.route) {
    crossScheduleIssues.push({
      severity: ValidationSeverity.ERROR,
      field: 'route',
      message: 'No route selected. Please select a route first.',
    });
  }

  // Validate we have schedules
  if (!data.schedules || data.schedules.length === 0) {
    crossScheduleIssues.push({
      severity: ValidationSeverity.ERROR,
      field: 'schedules',
      message: 'No schedules to validate. Please add at least one schedule.',
    });

    return {
      isValid: false,
      scheduleResults: [],
      crossScheduleIssues,
      totalErrors: crossScheduleIssues.length,
      totalWarnings: 0,
    };
  }

  // Validate each schedule individually
  data.schedules.forEach((schedule, index) => {
    const result = validateSchedule(schedule, index);
    scheduleResults.push(result);
  });

  // Cross-schedule validation
  const crossIssues = validateCrossSchedule(data.schedules);
  crossScheduleIssues.push(...crossIssues);

  // Calculate totals
  const totalErrors = 
    scheduleResults.reduce((sum, r) => sum + r.errors.length, 0) +
    crossScheduleIssues.filter(i => i.severity === ValidationSeverity.ERROR).length;

  const totalWarnings = 
    scheduleResults.reduce((sum, r) => sum + r.warnings.length, 0) +
    crossScheduleIssues.filter(i => i.severity === ValidationSeverity.WARNING).length;

  return {
    isValid: totalErrors === 0,
    scheduleResults,
    crossScheduleIssues,
    totalErrors,
    totalWarnings,
  };
}

/**
 * Cross-schedule validation (conflicts, overlaps, etc.)
 */
function validateCrossSchedule(schedules: Schedule[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for duplicate schedule names
  const names = schedules.map(s => s.name.toLowerCase().trim());
  const nameCounts: { [key: string]: number[] } = {};
  
  names.forEach((name, index) => {
    if (!nameCounts[name]) {
      nameCounts[name] = [];
    }
    nameCounts[name].push(index);
  });

  Object.entries(nameCounts).forEach(([name, indices]) => {
    if (indices.length > 1) {
      issues.push({
        severity: ValidationSeverity.ERROR,
        field: 'name',
        message: `Duplicate schedule name "${name}" found in schedules ${indices.map(i => i + 1).join(', ')}`,
      });
    }
  });

  // Check for overlapping effective dates with same calendar days
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const overlap = checkScheduleOverlap(schedules[i], schedules[j]);
      if (overlap) {
        issues.push({
          severity: ValidationSeverity.WARNING,
          field: 'effectiveDates',
          message: `Schedules "${schedules[i].name}" and "${schedules[j].name}" have overlapping effective dates and operating days`,
        });
      }
    }
  }

  return issues;
}

/**
 * Check if two schedules overlap in effective dates and operating days
 */
function checkScheduleOverlap(schedule1: Schedule, schedule2: Schedule): boolean {
  // Check date range overlap
  const start1 = new Date(schedule1.effectiveStartDate);
  const end1 = schedule1.effectiveEndDate ? new Date(schedule1.effectiveEndDate) : new Date('9999-12-31');
  const start2 = new Date(schedule2.effectiveStartDate);
  const end2 = schedule2.effectiveEndDate ? new Date(schedule2.effectiveEndDate) : new Date('9999-12-31');

  const datesOverlap = start1 <= end2 && start2 <= end1;
  if (!datesOverlap) return false;

  // Check calendar overlap
  const cal1 = schedule1.calendar;
  const cal2 = schedule2.calendar;

  const daysOverlap = 
    (cal1.monday && cal2.monday) ||
    (cal1.tuesday && cal2.tuesday) ||
    (cal1.wednesday && cal2.wednesday) ||
    (cal1.thursday && cal2.thursday) ||
    (cal1.friday && cal2.friday) ||
    (cal1.saturday && cal2.saturday) ||
    (cal1.sunday && cal2.sunday);

  return daysOverlap;
}

// ============================================================================
// QUICK VALIDATION HELPERS
// ============================================================================

/**
 * Check if schedule is ready for submission
 */
export function isScheduleReadyForSubmission(schedule: Schedule): boolean {
  // Basic required fields
  if (!schedule.name || !schedule.routeId || !schedule.effectiveStartDate) {
    return false;
  }

  // At least one calendar day
  const hasActiveDay = 
    schedule.calendar.monday || 
    schedule.calendar.tuesday || 
    schedule.calendar.wednesday || 
    schedule.calendar.thursday || 
    schedule.calendar.friday || 
    schedule.calendar.saturday || 
    schedule.calendar.sunday;

  if (!hasActiveDay) {
    return false;
  }

  // All stops have times
  const allStopsHaveTimes = schedule.scheduleStops.every(
    stop => stop.arrivalTime && stop.departureTime
  );

  return allStopsHaveTimes;
}

/**
 * Count validation issues by severity
 */
export function countValidationIssues(result: BulkValidationResult): {
  errors: number;
  warnings: number;
  info: number;
} {
  let errors = result.totalErrors;
  let warnings = result.totalWarnings;
  let info = 0;

  result.crossScheduleIssues.forEach(issue => {
    if (issue.severity === ValidationSeverity.INFO) info++;
  });

  result.scheduleResults.forEach(sr => {
    sr.issues.forEach(issue => {
      if (issue.severity === ValidationSeverity.INFO) info++;
    });
  });

  return { errors, warnings, info };
}

/**
 * Get validation summary message
 */
export function getValidationSummary(result: BulkValidationResult): string {
  const { errors, warnings } = countValidationIssues(result);

  if (errors === 0 && warnings === 0) {
    return 'All schedules are valid and ready for submission.';
  }

  const parts: string[] = [];
  if (errors > 0) {
    parts.push(`${errors} error${errors > 1 ? 's' : ''}`);
  }
  if (warnings > 0) {
    parts.push(`${warnings} warning${warnings > 1 ? 's' : ''}`);
  }

  return `Validation found ${parts.join(' and ')}.`;
}
