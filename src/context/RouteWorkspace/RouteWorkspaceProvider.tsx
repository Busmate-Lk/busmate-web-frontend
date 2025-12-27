'use client';

import { ReactNode, useState, useCallback } from 'react';
import { RouteWorkspaceContext } from './RouteWorkspaceContext';
import { RouteWorkspaceData, createEmptyRouteWorkspaceData, RouteGroup, Route, RouteStop, createEmptyRoute, moveRouteStop } from '@/types/RouteWorkspaceData';
import { serializeToYaml, parseFromYaml } from '@/services/routeWorkspaceSerializer';

interface RouteWorkspaceProviderProps {
  children: ReactNode;
}

export function RouteWorkspaceProvider({ children }: RouteWorkspaceProviderProps) {
  const [data, setData] = useState<RouteWorkspaceData>(createEmptyRouteWorkspaceData());
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [coordinateEditingMode, setCoordinateEditingModeState] = useState<{ routeIndex: number; stopIndex: number } | null>(null);

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

  return (
    <RouteWorkspaceContext.Provider
      value={{
        data,
        updateRouteGroup,
        updateFromYaml,
        getYaml,
        getRouteGroupData,
        updateRoute,
        updateRouteStop,
        addRoute,
        addRouteStop,
        removeRouteStop,
        reorderRouteStop,
        setActiveRouteIndex,
        selectedRouteIndex,
        selectedStopIndex,
        setSelectedStop,
        clearSelectedStop,
        coordinateEditingMode,
        setCoordinateEditingMode,
        clearCoordinateEditingMode,
      }}
    >
      {children}
    </RouteWorkspaceContext.Provider>
  );
}
