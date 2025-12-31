/**
 * Schedule Auto-Generation Service
 * 
 * Provides utilities to automatically generate schedule data
 * based on route information, time patterns, and frequency settings.
 */

import { 
  Schedule, 
  ScheduleStop,
  ScheduleCalendar,
  ScheduleTypeEnum, 
  ScheduleStatusEnum,
  createEmptySchedule,
  createEmptyScheduleCalendar,
} from '@/types/ScheduleWorkspaceData';

export interface GenerationPattern {
  /** Starting time in HH:mm format */
  startTime: string;
  /** Ending time in HH:mm format */
  endTime: string;
  /** Frequency in minutes between departures */
  frequencyMinutes: number;
}

export interface StopTimingPattern {
  /** Average time in minutes between stops */
  avgTimeBetweenStops: number;
  /** Dwell time at each stop in seconds */
  dwellTimeSeconds: number;
  /** Variation range in percentage (e.g., 10 means +/- 10%) */
  variationPercent?: number;
}

export interface AutoGenerationConfig {
  /** Route ID to generate schedules for */
  routeId: string;
  /** Route name for display */
  routeName: string;
  /** List of stops with their IDs and names */
  stops: Array<{ id: string; name: string; sequenceNumber: number }>;
  /** Time patterns for schedule generation */
  patterns: GenerationPattern[];
  /** How stops are timed */
  stopTiming: StopTimingPattern;
  /** Calendar configuration */
  calendar?: Partial<ScheduleCalendar>;
  /** Schedule type */
  scheduleType?: ScheduleTypeEnum;
  /** Base name for generated schedules */
  baseName?: string;
  /** Whether to generate return trips */
  includeReturnTrips?: boolean;
}

/**
 * Parse time string (HH:mm or HH:mm:ss) to minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const parts = time.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to time string (HH:mm:ss)
 */
export function minutesToTime(minutes: number): string {
  // Handle overflow to next day
  const normalizedMinutes = minutes % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
}

/**
 * Calculate arrival and departure times for all stops
 * based on a starting time and timing patterns
 */
export function calculateStopTimes(
  stops: Array<{ id: string; name: string; sequenceNumber: number }>,
  startTimeMinutes: number,
  timing: StopTimingPattern
): ScheduleStop[] {
  const scheduleStops: ScheduleStop[] = [];
  let currentTimeMinutes = startTimeMinutes;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    
    // Apply variation if specified
    let travelTime = timing.avgTimeBetweenStops;
    if (timing.variationPercent && i > 0) {
      const variation = (Math.random() - 0.5) * 2 * (timing.variationPercent / 100);
      travelTime = Math.round(travelTime * (1 + variation));
    }

    // First stop - no travel time
    if (i > 0) {
      currentTimeMinutes += travelTime;
    }

    const arrivalTime = minutesToTime(currentTimeMinutes);
    
    // Add dwell time for departure (except last stop)
    const dwellMinutes = timing.dwellTimeSeconds / 60;
    const departureTimeMinutes = i < stops.length - 1 
      ? currentTimeMinutes + dwellMinutes 
      : currentTimeMinutes;
    const departureTime = minutesToTime(departureTimeMinutes);

    scheduleStops.push({
      stopId: stop.id,
      stopName: stop.name,
      stopOrder: stop.sequenceNumber,
      arrivalTime,
      departureTime,
    });
  }

  return scheduleStops;
}

/**
 * Generate schedules based on patterns
 */
export function generateSchedulesFromPatterns(
  config: AutoGenerationConfig
): Schedule[] {
  const schedules: Schedule[] = [];
  let scheduleCounter = 1;

  const baseCalendar: ScheduleCalendar = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
    ...config.calendar,
  };

  // Generate schedules for each pattern
  for (const pattern of config.patterns) {
    const startMinutes = timeToMinutes(pattern.startTime);
    const endMinutes = timeToMinutes(pattern.endTime);
    
    // Generate departures at regular intervals
    for (let time = startMinutes; time <= endMinutes; time += pattern.frequencyMinutes) {
      // Forward direction
      const forwardSchedule = createEmptySchedule(config.routeId);
      forwardSchedule.name = config.baseName 
        ? `${config.baseName} #${scheduleCounter}` 
        : `${config.routeName} - ${minutesToTime(time).substring(0, 5)}`;
      forwardSchedule.scheduleType = config.scheduleType || ScheduleTypeEnum.REGULAR;
      forwardSchedule.status = ScheduleStatusEnum.PENDING;
      forwardSchedule.calendar = { ...baseCalendar };
      forwardSchedule.scheduleStops = calculateStopTimes(
        config.stops,
        time,
        config.stopTiming
      );
      
      schedules.push(forwardSchedule);
      scheduleCounter++;

      // Return direction (reversed stops)
      if (config.includeReturnTrips) {
        // Calculate when the forward trip ends
        const forwardTripDuration = config.stops.length * config.stopTiming.avgTimeBetweenStops;
        const returnStartTime = time + forwardTripDuration + 10; // 10 min turnaround

        const reversedStops = [...config.stops]
          .reverse()
          .map((stop, idx) => ({
            ...stop,
            sequenceNumber: idx + 1,
          }));

        const returnSchedule = createEmptySchedule(config.routeId);
        returnSchedule.name = config.baseName 
          ? `${config.baseName} #${scheduleCounter} (Return)` 
          : `${config.routeName} - ${minutesToTime(returnStartTime).substring(0, 5)} (Return)`;
        returnSchedule.scheduleType = config.scheduleType || ScheduleTypeEnum.REGULAR;
        returnSchedule.status = ScheduleStatusEnum.PENDING;
        returnSchedule.calendar = { ...baseCalendar };
        returnSchedule.scheduleStops = calculateStopTimes(
          reversedStops,
          returnStartTime,
          config.stopTiming
        );
        
        schedules.push(returnSchedule);
        scheduleCounter++;
      }
    }
  }

  return schedules;
}

/**
 * Generate a standard weekday schedule pattern
 */
export function getWeekdayPattern(): GenerationPattern[] {
  return [
    // Morning peak
    { startTime: '06:00', endTime: '09:00', frequencyMinutes: 15 },
    // Mid-day
    { startTime: '09:15', endTime: '16:00', frequencyMinutes: 30 },
    // Evening peak
    { startTime: '16:00', endTime: '19:00', frequencyMinutes: 15 },
    // Night
    { startTime: '19:30', endTime: '22:00', frequencyMinutes: 30 },
  ];
}

/**
 * Generate a weekend schedule pattern
 */
export function getWeekendPattern(): GenerationPattern[] {
  return [
    // Late morning start
    { startTime: '08:00', endTime: '22:00', frequencyMinutes: 30 },
  ];
}

/**
 * Generate a special event pattern (e.g., holiday)
 */
export function getSpecialEventPattern(): GenerationPattern[] {
  return [
    { startTime: '09:00', endTime: '18:00', frequencyMinutes: 20 },
  ];
}

/**
 * Estimate total trip duration based on stops and timing
 */
export function estimateTripDuration(
  stopsCount: number,
  timing: StopTimingPattern
): { minutes: number; formatted: string } {
  const travelTime = (stopsCount - 1) * timing.avgTimeBetweenStops;
  const dwellTime = (stopsCount - 1) * (timing.dwellTimeSeconds / 60);
  const totalMinutes = Math.round(travelTime + dwellTime);
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  return {
    minutes: totalMinutes,
    formatted: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
  };
}

/**
 * Validate generation config
 */
export function validateGenerationConfig(config: AutoGenerationConfig): string[] {
  const errors: string[] = [];

  if (!config.routeId) {
    errors.push('Route ID is required');
  }

  if (!config.stops || config.stops.length < 2) {
    errors.push('At least 2 stops are required');
  }

  if (!config.patterns || config.patterns.length === 0) {
    errors.push('At least one time pattern is required');
  }

  for (const pattern of config.patterns || []) {
    if (timeToMinutes(pattern.startTime) >= timeToMinutes(pattern.endTime)) {
      errors.push(`Invalid pattern: start time ${pattern.startTime} must be before end time ${pattern.endTime}`);
    }
    if (pattern.frequencyMinutes <= 0) {
      errors.push('Frequency must be greater than 0 minutes');
    }
  }

  if (config.stopTiming) {
    if (config.stopTiming.avgTimeBetweenStops <= 0) {
      errors.push('Average time between stops must be greater than 0');
    }
    if (config.stopTiming.dwellTimeSeconds < 0) {
      errors.push('Dwell time cannot be negative');
    }
  }

  return errors;
}

/**
 * Generate quick schedule set with common presets
 */
export function generateQuickScheduleSet(
  routeId: string,
  routeName: string,
  stops: Array<{ id: string; name: string; sequenceNumber: number }>,
  preset: 'urban' | 'suburban' | 'express'
): Schedule[] {
  const presetConfigs = {
    urban: {
      patterns: getWeekdayPattern(),
      stopTiming: { avgTimeBetweenStops: 3, dwellTimeSeconds: 30 },
      includeReturnTrips: true,
    },
    suburban: {
      patterns: [
        { startTime: '06:00', endTime: '22:00', frequencyMinutes: 30 },
      ],
      stopTiming: { avgTimeBetweenStops: 5, dwellTimeSeconds: 45 },
      includeReturnTrips: true,
    },
    express: {
      patterns: [
        { startTime: '06:00', endTime: '09:00', frequencyMinutes: 20 },
        { startTime: '16:00', endTime: '19:00', frequencyMinutes: 20 },
      ],
      stopTiming: { avgTimeBetweenStops: 8, dwellTimeSeconds: 60 },
      includeReturnTrips: false,
    },
  };

  const presetConfig = presetConfigs[preset];

  return generateSchedulesFromPatterns({
    routeId,
    routeName,
    stops,
    ...presetConfig,
    baseName: `${routeName} - ${preset.charAt(0).toUpperCase() + preset.slice(1)}`,
  });
}
