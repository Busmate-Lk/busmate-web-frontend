/**
 * Schedule Workspace Serialization Service
 * 
 * Handles YAML serialization and deserialization for schedule workspace data.
 * Supports multiple schedules in a single workspace session.
 */

import yaml from 'js-yaml';
import {
  ScheduleWorkspaceData,
  Schedule,
  ScheduleStop,
  ScheduleCalendar,
  ScheduleException,
  ScheduleTypeEnum,
  ScheduleStatusEnum,
  ExceptionTypeEnum,
  createEmptyScheduleCalendar,
} from '@/types/ScheduleWorkspaceData';

/**
 * Serialize ScheduleWorkspaceData to YAML format
 */
export function serializeScheduleWorkspaceToYaml(data: ScheduleWorkspaceData): string {
  const yamlData: any = {};

  // Add route reference if available
  if (data.route) {
    yamlData.route_id = data.route.id;
    yamlData.route_name = data.route.name;
    if (data.route.routeNumber) {
      yamlData.route_number = data.route.routeNumber;
    }
  }

  // Add schedules
  if (data.schedules && data.schedules.length > 0) {
    yamlData.schedules = data.schedules.map((schedule) => {
      const scheduleYaml: any = {
        name: schedule.name || '',
        schedule_type: schedule.scheduleType || 'REGULAR',
        effective_start_date: schedule.effectiveStartDate || '',
        status: schedule.status || 'PENDING',
      };

      // Add optional fields
      if (schedule.id) {
        scheduleYaml.id = schedule.id;
      }
      if (schedule.description) {
        scheduleYaml.description = schedule.description;
      }
      if (schedule.effectiveEndDate) {
        scheduleYaml.effective_end_date = schedule.effectiveEndDate;
      }

      // Add calendar
      scheduleYaml.calendar = {
        monday: schedule.calendar.monday,
        tuesday: schedule.calendar.tuesday,
        wednesday: schedule.calendar.wednesday,
        thursday: schedule.calendar.thursday,
        friday: schedule.calendar.friday,
        saturday: schedule.calendar.saturday,
        sunday: schedule.calendar.sunday,
      };

      // Add schedule stops
      if (schedule.scheduleStops && schedule.scheduleStops.length > 0) {
        scheduleYaml.schedule_stops = schedule.scheduleStops.map((stop) => {
          const stopYaml: any = {
            stop_id: stop.stopId,
            stop_order: stop.stopOrder,
          };

          if (stop.id) {
            stopYaml.id = stop.id;
          }
          if (stop.stopName) {
            stopYaml.stop_name = stop.stopName;
          }
          if (stop.arrivalTime) {
            stopYaml.arrival_time = stop.arrivalTime;
          }
          if (stop.departureTime) {
            stopYaml.departure_time = stop.departureTime;
          }

          return stopYaml;
        });
      }

      // Add exceptions
      if (schedule.exceptions && schedule.exceptions.length > 0) {
        scheduleYaml.exceptions = schedule.exceptions.map((exc) => ({
          exception_date: exc.exceptionDate,
          exception_type: exc.exceptionType,
        }));
      }

      return scheduleYaml;
    });
  }

  return yaml.dump(yamlData, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });
}

/**
 * Parse YAML format to ScheduleWorkspaceData
 */
export function parseScheduleWorkspaceFromYaml(yamlText: string): Partial<ScheduleWorkspaceData> {
  try {
    if (!yamlText.trim()) {
      return { schedules: [] };
    }

    const parsed = yaml.load(yamlText) as any;

    if (!parsed || typeof parsed !== 'object') {
      return { schedules: [] };
    }

    const result: Partial<ScheduleWorkspaceData> = {};

    // Parse schedules
    if (parsed.schedules && Array.isArray(parsed.schedules)) {
      result.schedules = parsed.schedules.map((scheduleData: any): Schedule => {
        // Parse calendar
        const calendar: ScheduleCalendar = scheduleData.calendar
          ? {
              id: scheduleData.calendar.id,
              monday: scheduleData.calendar.monday ?? false,
              tuesday: scheduleData.calendar.tuesday ?? false,
              wednesday: scheduleData.calendar.wednesday ?? false,
              thursday: scheduleData.calendar.thursday ?? false,
              friday: scheduleData.calendar.friday ?? false,
              saturday: scheduleData.calendar.saturday ?? false,
              sunday: scheduleData.calendar.sunday ?? false,
            }
          : createEmptyScheduleCalendar();

        // Parse schedule stops
        const scheduleStops: ScheduleStop[] = (scheduleData.schedule_stops || []).map(
          (stopData: any): ScheduleStop => ({
            id: stopData.id,
            stopId: stopData.stop_id || '',
            stopName: stopData.stop_name || '',
            stopOrder: stopData.stop_order ?? 0,
            arrivalTime: stopData.arrival_time || '',
            departureTime: stopData.departure_time || '',
            distanceFromStartKm: stopData.distance_from_start_km,
          })
        );

        // Parse exceptions
        const exceptions: ScheduleException[] = (scheduleData.exceptions || []).map(
          (excData: any): ScheduleException => ({
            id: excData.id,
            exceptionDate: excData.exception_date || '',
            exceptionType: (excData.exception_type as ExceptionTypeEnum) || ExceptionTypeEnum.REMOVED,
          })
        );

        return {
          id: scheduleData.id,
          name: scheduleData.name || '',
          description: scheduleData.description || '',
          routeId: parsed.route_id || '',
          scheduleType: (scheduleData.schedule_type as ScheduleTypeEnum) || ScheduleTypeEnum.REGULAR,
          effectiveStartDate: scheduleData.effective_start_date || '',
          effectiveEndDate: scheduleData.effective_end_date,
          status: (scheduleData.status as ScheduleStatusEnum) || ScheduleStatusEnum.PENDING,
          scheduleStops,
          calendar,
          exceptions,
          isNew: !scheduleData.id,
          isDirty: true,
        };
      });
    } else {
      result.schedules = [];
    }

    return result;
  } catch (error) {
    console.error('Failed to parse schedule workspace YAML:', error);
    return { schedules: [] };
  }
}

/**
 * Generate example YAML template
 */
export function getScheduleYamlTemplate(routeId: string, routeName: string): string {
  const today = new Date().toISOString().split('T')[0];
  
  return `# Schedule Workspace YAML
# Route: ${routeName}
route_id: "${routeId}"
route_name: "${routeName}"

schedules:
  # Weekday Morning Schedule
  - name: "Weekday Morning Express"
    schedule_type: REGULAR
    effective_start_date: "${today}"
    effective_end_date: ""
    status: PENDING
    description: "Morning express service for weekday commuters"
    calendar:
      monday: true
      tuesday: true
      wednesday: true
      thursday: true
      friday: true
      saturday: false
      sunday: false
    schedule_stops:
      - stop_id: "your-stop-id-1"
        stop_name: "First Stop"
        stop_order: 0
        arrival_time: "06:00:00"
        departure_time: "06:00:00"
      - stop_id: "your-stop-id-2"
        stop_name: "Second Stop"
        stop_order: 1
        arrival_time: "06:10:00"
        departure_time: "06:12:00"
    exceptions:
      - exception_date: "2026-01-01"
        exception_type: REMOVED  # No service on New Year's Day

  # Weekend Schedule
  - name: "Weekend Service"
    schedule_type: REGULAR
    effective_start_date: "${today}"
    status: PENDING
    description: "Relaxed weekend schedule"
    calendar:
      monday: false
      tuesday: false
      wednesday: false
      thursday: false
      friday: false
      saturday: true
      sunday: true
    schedule_stops:
      - stop_id: "your-stop-id-1"
        stop_order: 0
        arrival_time: "08:00:00"
        departure_time: "08:00:00"
`;
}

/**
 * Validate YAML structure
 */
export function validateScheduleYaml(yamlText: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const parsed = yaml.load(yamlText) as any;

    if (!parsed || typeof parsed !== 'object') {
      errors.push('Invalid YAML structure');
      return { valid: false, errors };
    }

    // Check for route_id
    if (!parsed.route_id) {
      errors.push('Missing route_id');
    }

    // Check for schedules array
    if (!parsed.schedules || !Array.isArray(parsed.schedules)) {
      errors.push('Missing or invalid schedules array');
      return { valid: errors.length === 0, errors };
    }

    // Validate each schedule
    parsed.schedules.forEach((schedule: any, index: number) => {
      const prefix = `Schedule ${index + 1}`;

      if (!schedule.name) {
        errors.push(`${prefix}: Missing name`);
      }
      if (!schedule.schedule_type) {
        errors.push(`${prefix}: Missing schedule_type`);
      }
      if (!schedule.effective_start_date) {
        errors.push(`${prefix}: Missing effective_start_date`);
      }

      // Validate calendar
      if (!schedule.calendar) {
        errors.push(`${prefix}: Missing calendar`);
      } else {
        const hasActiveDay = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          .some(day => schedule.calendar[day] === true);
        if (!hasActiveDay) {
          errors.push(`${prefix}: Calendar must have at least one active day`);
        }
      }

      // Validate schedule stops
      if (schedule.schedule_stops && Array.isArray(schedule.schedule_stops)) {
        schedule.schedule_stops.forEach((stop: any, stopIndex: number) => {
          if (!stop.stop_id) {
            errors.push(`${prefix}, Stop ${stopIndex + 1}: Missing stop_id`);
          }
          if (stop.stop_order === undefined) {
            errors.push(`${prefix}, Stop ${stopIndex + 1}: Missing stop_order`);
          }
        });
      }
    });

    return { valid: errors.length === 0, errors };
  } catch (error: any) {
    errors.push(`YAML parsing error: ${error.message}`);
    return { valid: false, errors };
  }
}
