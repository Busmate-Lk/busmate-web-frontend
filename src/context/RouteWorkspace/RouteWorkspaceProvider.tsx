'use client';

import { ReactNode, useState, useCallback } from 'react';
import { RouteWorkspaceContext, WorkspaceMode } from './RouteWorkspaceContext';
import { RouteWorkspaceData, createEmptyRouteWorkspaceData, RouteGroup, Route, RouteStop, createEmptyRoute, moveRouteStop, DirectionEnum, StopExistenceType, createEmptyLocation } from '@/types/RouteWorkspaceData';
import { serializeToYaml, parseFromYaml } from '@/services/routeWorkspaceSerializer';
import { 
  generateRouteFromCorresponding as generateRouteFromCorrespondingService,
  findRouteByDirection,
  findRouteIndexByDirection,
  AutoGenerationOptions,
  RouteAutoGenerationResult
} from '@/services/routeAutoGeneration';
import { RouteManagementService, BusStopManagementService } from '@/lib/api-client/route-management';

interface RouteWorkspaceProviderProps {
  children: ReactNode;
}

export function RouteWorkspaceProvider({ children }: RouteWorkspaceProviderProps) {
  // Mode and loading state
  const [mode, setMode] = useState<WorkspaceMode>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routeGroupId, setRouteGroupId] = useState<string | null>(null);
  
  const [data, setData] = useState<RouteWorkspaceData>(createEmptyRouteWorkspaceData());
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [coordinateEditingMode, setCoordinateEditingModeState] = useState<{ routeIndex: number; stopIndex: number } | null>(null);
  const [mapActions, setMapActions] = useState<{ fitBoundsToRoute: (() => void) | null }>({
    fitBoundsToRoute: null,
  });

  // Load existing route group for editing
  const loadRouteGroup = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Fetch the route group data
      const routeGroupResponse = await RouteManagementService.getRouteGroupById(id);
      
      if (!routeGroupResponse) {
        throw new Error('Route group not found');
      }

      // Fetch full stop details for each route stop
      const routes: Route[] = [];
      
      for (const routeResponse of routeGroupResponse.routes || []) {
        const routeStops: RouteStop[] = [];
        
        for (const routeStopResponse of routeResponse.routeStops || []) {
          // Fetch full stop details if we have a stopId
          let stopData;
          if (routeStopResponse.stopId) {
            try {
              const stopResponse = await BusStopManagementService.getStopById(routeStopResponse.stopId);
              stopData = {
                id: stopResponse.id || '',
                name: stopResponse.name || '',
                nameSinhala: stopResponse.nameSinhala,
                nameTamil: stopResponse.nameTamil,
                description: stopResponse.description,
                location: stopResponse.location ? {
                  latitude: stopResponse.location.latitude || 0,
                  longitude: stopResponse.location.longitude || 0,
                  address: stopResponse.location.address,
                  city: stopResponse.location.city,
                  state: stopResponse.location.state,
                  zipCode: stopResponse.location.zipCode,
                  country: stopResponse.location.country,
                  addressSinhala: stopResponse.location.addressSinhala,
                  citySinhala: stopResponse.location.citySinhala,
                  stateSinhala: stopResponse.location.stateSinhala,
                  countrySinhala: stopResponse.location.countrySinhala,
                  addressTamil: stopResponse.location.addressTamil,
                  cityTamil: stopResponse.location.cityTamil,
                  stateTamil: stopResponse.location.stateTamil,
                  countryTamil: stopResponse.location.countryTamil,
                } : createEmptyLocation(),
                isAccessible: stopResponse.isAccessible,
                type: StopExistenceType.EXISTING,
              };
            } catch (error) {
              console.error(`Failed to fetch stop ${routeStopResponse.stopId}:`, error);
              // Use basic info from routeStopResponse if full fetch fails
              stopData = {
                id: routeStopResponse.stopId || '',
                name: routeStopResponse.stopName || '',
                location: routeStopResponse.location ? {
                  latitude: routeStopResponse.location.latitude || 0,
                  longitude: routeStopResponse.location.longitude || 0,
                  address: routeStopResponse.location.address,
                  city: routeStopResponse.location.city,
                  state: routeStopResponse.location.state,
                  zipCode: routeStopResponse.location.zipCode,
                  country: routeStopResponse.location.country,
                  addressSinhala: routeStopResponse.location.addressSinhala,
                  citySinhala: routeStopResponse.location.citySinhala,
                  stateSinhala: routeStopResponse.location.stateSinhala,
                  countrySinhala: routeStopResponse.location.countrySinhala,
                  addressTamil: routeStopResponse.location.addressTamil,
                  cityTamil: routeStopResponse.location.cityTamil,
                  stateTamil: routeStopResponse.location.stateTamil,
                  countryTamil: routeStopResponse.location.countryTamil,
                } : createEmptyLocation(),
                type: StopExistenceType.EXISTING,
              };
            }
          } else {
            // No stopId, create from basic info
            stopData = {
              id: '',
              name: routeStopResponse.stopName || '',
              location: routeStopResponse.location ? {
                latitude: routeStopResponse.location.latitude || 0,
                longitude: routeStopResponse.location.longitude || 0,
                address: routeStopResponse.location.address,
                city: routeStopResponse.location.city,
                state: routeStopResponse.location.state,
                zipCode: routeStopResponse.location.zipCode,
                country: routeStopResponse.location.country,
                addressSinhala: routeStopResponse.location.addressSinhala,
                citySinhala: routeStopResponse.location.citySinhala,
                stateSinhala: routeStopResponse.location.stateSinhala,
                countrySinhala: routeStopResponse.location.countrySinhala,
                addressTamil: routeStopResponse.location.addressTamil,
                cityTamil: routeStopResponse.location.cityTamil,
                stateTamil: routeStopResponse.location.stateTamil,
                countryTamil: routeStopResponse.location.countryTamil,
              } : createEmptyLocation(),
              type: StopExistenceType.NEW,
            };
          }

          routeStops.push({
            id: routeStopResponse.id,  // Preserve route stop ID for updates
            orderNumber: routeStopResponse.stopOrder ?? routeStops.length,
            distanceFromStart: routeStopResponse.distanceFromStartKm ?? 0,
            stop: stopData,
          });
        }

        routes.push({
          id: routeResponse.id,
          name: routeResponse.name || '',
          nameSinhala: routeResponse.nameSinhala,
          nameTamil: routeResponse.nameTamil,
          routeNumber: routeResponse.routeNumber,
          description: routeResponse.description,
          direction: (routeResponse.direction as DirectionEnum) || DirectionEnum.OUTBOUND,
          roadType: routeResponse.roadType as any || 'NORMALWAY',
          routeThrough: routeResponse.routeThrough,
          routeThroughSinhala: routeResponse.routeThroughSinhala,
          routeThroughTamil: routeResponse.routeThroughTamil,
          distanceKm: routeResponse.distanceKm,
          estimatedDurationMinutes: routeResponse.estimatedDurationMinutes,
          startStopId: routeResponse.startStopId,
          endStopId: routeResponse.endStopId,
          routeStops,
        });
      }

      // Set the loaded data
      setData({
        routeGroup: {
          id: routeGroupResponse.id,
          name: routeGroupResponse.name || '',
          nameSinhala: routeGroupResponse.nameSinhala,
          nameTamil: routeGroupResponse.nameTamil,
          description: routeGroupResponse.description,
          routes,
        },
      });

      setRouteGroupId(id);
      setMode('edit');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.body?.message || error.message || 'Failed to load route group';
      console.error('Failed to load route group:', error);
      setLoadError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Reset to create mode
  const resetToCreateMode = useCallback(() => {
    setData(createEmptyRouteWorkspaceData());
    setMode('create');
    setRouteGroupId(null);
    setLoadError(null);
    setSelectedRouteIndex(null);
    setSelectedStopIndex(null);
    setCoordinateEditingModeState(null);
  }, []);

  const updateRouteGroup = useCallback((routeGroup: Partial<RouteGroup>) => {
    setData(prevData => ({
      ...prevData,
      routeGroup: {
        ...prevData.routeGroup,
        ...routeGroup,
      },
    }));
  }, []);

  const updateFromYaml = useCallback((yamlText: string) => {
    try {
      const parsedData = parseFromYaml(yamlText);
      
      if (parsedData.routeGroup) {
        setData(prevData => ({
          ...prevData,
          routeGroup: {
            name: parsedData.routeGroup?.name || prevData.routeGroup.name,
            nameSinhala: parsedData.routeGroup?.nameSinhala || prevData.routeGroup.nameSinhala,
            nameTamil: parsedData.routeGroup?.nameTamil || prevData.routeGroup.nameTamil,
            description: parsedData.routeGroup?.description || prevData.routeGroup.description,
            routes: parsedData.routeGroup?.routes || prevData.routeGroup.routes,
          },
        }));
      }
    } catch (error) {
      console.error('Failed to update from YAML:', error);
    }
  }, []);

  const getYaml = useCallback(() => {
    return serializeToYaml(data);
  }, [data]);

  const getRouteGroupData = useCallback(() => {
    return data.routeGroup;
  }, [data]);

  const updateRoute = useCallback((routeIndex: number, route: Partial<Route>) => {
    setData(prevData => {
      const routes = [...prevData.routeGroup.routes];
      if (routes[routeIndex]) {
        routes[routeIndex] = { ...routes[routeIndex], ...route };
      }
      return {
        ...prevData,
        routeGroup: {
          ...prevData.routeGroup,
          routes,
        },
      };
    });
  }, []);

  const updateRouteStop = useCallback((routeIndex: number, stopIndex: number, routeStop: Partial<RouteStop>) => {
    setData(prevData => {
      const routes = [...prevData.routeGroup.routes];
      if (routes[routeIndex]) {
        const routeStops = [...routes[routeIndex].routeStops];
        if (routeStops[stopIndex]) {
          routeStops[stopIndex] = { ...routeStops[stopIndex], ...routeStop };
          routes[routeIndex] = { ...routes[routeIndex], routeStops };
        }
      }
      return {
        ...prevData,
        routeGroup: {
          ...prevData.routeGroup,
          routes,
        },
      };
    });
  }, []);

  const addRoute = useCallback((route: Route) => {
    setData(prevData => ({
      ...prevData,
      routeGroup: {
        ...prevData.routeGroup,
        routes: [...prevData.routeGroup.routes, route],
      },
    }));
  }, []);

  const replaceRoute = useCallback((routeIndex: number, route: Route) => {
    setData(prevData => {
      const routes = [...prevData.routeGroup.routes];
      if (routeIndex >= 0 && routeIndex < routes.length) {
        routes[routeIndex] = route;
      }
      return {
        ...prevData,
        routeGroup: {
          ...prevData.routeGroup,
          routes,
        },
      };
    });
  }, []);

  const addRouteStop = useCallback((routeIndex: number, routeStop: RouteStop) => {
    setData(prevData => {
      const routes = [...prevData.routeGroup.routes];
      if (routes[routeIndex]) {
        routes[routeIndex] = {
          ...routes[routeIndex],
          routeStops: [...routes[routeIndex].routeStops, routeStop],
        };
      }
      return {
        ...prevData,
        routeGroup: {
          ...prevData.routeGroup,
          routes,
        },
      };
    });
  }, []);

  const removeRouteStop = useCallback((routeIndex: number, stopIndex: number) => {
    setData(prevData => {
      const routes = [...prevData.routeGroup.routes];
      if (routes[routeIndex]) {
        const routeStops = routes[routeIndex].routeStops.filter((_, idx) => idx !== stopIndex);
        routes[routeIndex] = { ...routes[routeIndex], routeStops };
      }
      return {
        ...prevData,
        routeGroup: {
          ...prevData.routeGroup,
          routes,
        },
      };
    });
  }, []);

  const reorderRouteStop = useCallback((routeIndex: number, fromIndex: number, toIndex: number) => {
    setData(prevData => {
      const routes = [...prevData.routeGroup.routes];
      if (routes[routeIndex]) {
        const reorderedStops = moveRouteStop(routes[routeIndex].routeStops, fromIndex, toIndex);
        routes[routeIndex] = { ...routes[routeIndex], routeStops: reorderedStops };
      }
      return {
        ...prevData,
        routeGroup: {
          ...prevData.routeGroup,
          routes,
        },
      };
    });
  }, []);

  const setActiveRouteIndex = useCallback((index: number) => {
    setData(prevData => ({
      ...prevData,
      activeRouteIndex: index,
    }));
  }, []);

  const getRouteIndexByDirection = useCallback((direction: DirectionEnum): number => {
    return findRouteIndexByDirection(data.routeGroup.routes, direction);
  }, [data.routeGroup.routes]);

  const generateRouteFromCorresponding = useCallback((
    targetDirection: DirectionEnum,
    options?: AutoGenerationOptions
  ): RouteAutoGenerationResult => {
    // Determine the source direction (opposite of target)
    const sourceDirection = targetDirection === DirectionEnum.OUTBOUND
      ? DirectionEnum.INBOUND
      : DirectionEnum.OUTBOUND;

    // Find the source route
    const sourceRoute = findRouteByDirection(data.routeGroup.routes, sourceDirection);

    if (!sourceRoute) {
      return {
        success: false,
        route: createEmptyRoute(),
        message: `No ${sourceDirection} route found to generate from. Please create the ${sourceDirection} route first.`,
        warnings: [],
      };
    }

    // Generate the route using the service
    const result = generateRouteFromCorrespondingService(sourceRoute, options);

    if (result.success) {
      // Find if a route with the target direction already exists
      const existingIndex = findRouteIndexByDirection(data.routeGroup.routes, targetDirection);

      if (existingIndex >= 0) {
        // Replace the existing route, preserving its ID
        setData(prevData => {
          const routes = [...prevData.routeGroup.routes];
          const existingRouteId = routes[existingIndex].id;
          routes[existingIndex] = {
            ...result.route,
            id: existingRouteId, // Preserve the existing route ID
          };
          return {
            ...prevData,
            routeGroup: {
              ...prevData.routeGroup,
              routes,
            },
          };
        });
      } else {
        // Add as new route (ID will be undefined, which is correct for new routes)
        setData(prevData => ({
          ...prevData,
          routeGroup: {
            ...prevData.routeGroup,
            routes: [...prevData.routeGroup.routes, result.route],
          },
        }));
      }
    }

    return result;
  }, [data.routeGroup.routes]);

  const setSelectedStop = useCallback((routeIndex: number, stopIndex: number) => {
    setSelectedRouteIndex(routeIndex);
    setSelectedStopIndex(stopIndex);
  }, []);

  const clearSelectedStop = useCallback(() => {
    setSelectedRouteIndex(null);
    setSelectedStopIndex(null);
  }, []);

  const setCoordinateEditingMode = useCallback((routeIndex: number | null, stopIndex: number | null) => {
    if (routeIndex !== null && stopIndex !== null) {
      setCoordinateEditingModeState({ routeIndex, stopIndex });
    } else {
      setCoordinateEditingModeState(null);
    }
  }, []);

  const clearCoordinateEditingMode = useCallback(() => {
    setCoordinateEditingModeState(null);
  }, []);

  const registerMapAction = useCallback((action: 'fitBoundsToRoute', callback: () => void) => {
    setMapActions(prev => ({ ...prev, [action]: callback }));
  }, []);

  const unregisterMapAction = useCallback((action: 'fitBoundsToRoute') => {
    setMapActions(prev => ({ ...prev, [action]: null }));
  }, []);

  return (
    <RouteWorkspaceContext.Provider
      value={{
        // Mode and loading state
        mode,
        isLoading,
        loadError,
        routeGroupId,
        loadRouteGroup,
        resetToCreateMode,
        // Data and operations
        data,
        updateRouteGroup,
        updateFromYaml,
        getYaml,
        getRouteGroupData,
        updateRoute,
        updateRouteStop,
        addRoute,
        replaceRoute,
        addRouteStop,
        removeRouteStop,
        reorderRouteStop,
        setActiveRouteIndex,
        getRouteIndexByDirection,
        generateRouteFromCorresponding,
        selectedRouteIndex,
        selectedStopIndex,
        setSelectedStop,
        clearSelectedStop,
        coordinateEditingMode,
        setCoordinateEditingMode,
        clearCoordinateEditingMode,
        mapActions,
        registerMapAction,
        unregisterMapAction,
      }}
    >
      {children}
    </RouteWorkspaceContext.Provider>
  );
}
