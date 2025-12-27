import yaml from 'js-yaml';
import { RouteWorkspaceData, RouteGroup, Route, RouteStop, Stop, DirectionEnum, RoadTypeEnum, StopExistenceType } from '@/types/RouteWorkspaceData';

/**
 * Serialize RouteWorkspaceData to YAML format
 */
export function serializeToYaml(data: RouteWorkspaceData): string {
  const yamlData: any = {
    route_group: {
      name: data.routeGroup.name || '',
      name_sinhala: data.routeGroup.nameSinhala || '',
      name_tamil: data.routeGroup.nameTamil || '',
      description: data.routeGroup.description || '',
    }
  };

  // Add routes if they exist
  if (data.routeGroup.routes && data.routeGroup.routes.length > 0) {
    yamlData.route_group.routes = data.routeGroup.routes.map(route => ({
      route: {
        name: route.name || '',
        name_sinhala: route.nameSinhala || '',
        name_tamil: route.nameTamil || '',
        route_number: route.routeNumber || '',
        description: route.description || '',
        direction: route.direction || 'OUTBOUND',
        road_type: route.roadType || 'MAIN_ROAD',
        route_through: route.routeThrough || '',
        route_through_sinhala: route.routeThroughSinhala || '',
        route_through_tamil: route.routeThroughTamil || '',
        distance_km: route.distanceKm || 0,
        estimated_duration_minutes: route.estimatedDurationMinutes || 0,
        start_stop_id: route.startStopId || '',
        end_stop_id: route.endStopId || '',
        route_stops: route.routeStops.map(routeStop => ({
          route_stop: {
            stop_order: routeStop.orderNumber,
            distance_from_start_km: routeStop.distanceFromStart,
            estimated_time_minutes: 0, // You can add this to the RouteStop interface if needed
            stop: {
              id: routeStop.stop.id || '',
              name: routeStop.stop.name || '',
              name_sinhala: routeStop.stop.nameSinhala || '',
              name_tamil: routeStop.stop.nameTamil || '',
              type: routeStop.stop.type || 'new',
            }
          }
        }))
      }
    }));
  }

  return yaml.dump(yamlData, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });
}

/**
 * Parse YAML format to RouteWorkspaceData
 */
export function parseFromYaml(yamlText: string): Partial<RouteWorkspaceData> {
  try {
    if (!yamlText.trim()) {
      return {};
    }

    const parsed = yaml.load(yamlText) as any;
    console.log("parsed data: ", parsed)
    
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    const result: Partial<RouteWorkspaceData> = {};

    // Parse route group info
    if (parsed.route_group) {
      const routeGroup: Partial<RouteGroup> = {
        routes: []
      };
      
      if (parsed.route_group.name !== undefined) {
        routeGroup.name = String(parsed.route_group.name);
      }
      if (parsed.route_group.name_sinhala !== undefined) {
        routeGroup.nameSinhala = String(parsed.route_group.name_sinhala);
      }
      if (parsed.route_group.name_tamil !== undefined) {
        routeGroup.nameTamil = String(parsed.route_group.name_tamil);
      }
      if (parsed.route_group.description !== undefined) {
        routeGroup.description = String(parsed.route_group.description);
      }

      // Parse routes
      if (parsed.route_group.routes && Array.isArray(parsed.route_group.routes)) {
        routeGroup.routes = parsed.route_group.routes.map((routeWrapper: any) => {
          const routeData = routeWrapper.route;
          
          const route: Route = {
            name: String(routeData.name || ''),
            nameSinhala: routeData.name_sinhala ? String(routeData.name_sinhala) : undefined,
            nameTamil: routeData.name_tamil ? String(routeData.name_tamil) : undefined,
            routeNumber: routeData.route_number ? String(routeData.route_number) : undefined,
            description: routeData.description ? String(routeData.description) : undefined,
            direction: routeData.direction as DirectionEnum || DirectionEnum.UP,
            roadType: routeData.road_type as RoadTypeEnum || RoadTypeEnum.MAIN_ROAD,
            routeThrough: routeData.route_through ? String(routeData.route_through) : undefined,
            routeThroughSinhala: routeData.route_through_sinhala ? String(routeData.route_through_sinhala) : undefined,
            routeThroughTamil: routeData.route_through_tamil ? String(routeData.route_through_tamil) : undefined,
            distanceKm: routeData.distance_km ? Number(routeData.distance_km) : undefined,
            estimatedDurationMinutes: routeData.estimated_duration_minutes ? Number(routeData.estimated_duration_minutes) : undefined,
            startStopId: routeData.start_stop_id ? String(routeData.start_stop_id) : undefined,
            endStopId: routeData.end_stop_id ? String(routeData.end_stop_id) : undefined,
            routeStops: []
          };

          // Parse route stops
          if (routeData.route_stops && Array.isArray(routeData.route_stops)) {
            route.routeStops = routeData.route_stops.map((stopWrapper: any) => {
              const stopData = stopWrapper.route_stop;
              
              const stop: Stop = {
                id: String(stopData.stop.id || ''),
                name: String(stopData.stop.name || ''),
                nameSinhala: stopData.stop.name_sinhala ? String(stopData.stop.name_sinhala) : undefined,
                nameTamil: stopData.stop.name_tamil ? String(stopData.stop.name_tamil) : undefined,
                type: (stopData.stop.type as StopExistenceType) || StopExistenceType.NEW,
              };

              const routeStop: RouteStop = {
                orderNumber: Number(stopData.stop_order || 0),
                distanceFromStart: Number(stopData.distance_from_start_km || 0),
                stop: stop
              };

              return routeStop;
            });
          }

          return route;
        });
      }

      if (Object.keys(routeGroup).length > 0) {
        result.routeGroup = routeGroup as RouteGroup;
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to parse YAML:', error);
    return {};
  }
}
