import { createContext } from 'react';
import { RouteWorkspaceData, createEmptyRouteWorkspaceData, RouteGroup, Route, RouteStop, DirectionEnum, createEmptyRoute } from '@/types/RouteWorkspaceData';
import { RouteAutoGenerationResult, AutoGenerationOptions } from '@/services/routeAutoGeneration';

export interface RouteWorkspaceContextType {
  data: RouteWorkspaceData;
  updateRouteGroup: (routeGroup: Partial<RouteGroup>) => void;
  updateFromYaml: (yaml: string) => void;
  getYaml: () => string;
  getRouteGroupData: () => RouteGroup;
  updateRoute: (routeIndex: number, route: Partial<Route>) => void;
  updateRouteStop: (routeIndex: number, stopIndex: number, routeStop: Partial<RouteStop>) => void;
  addRoute: (route: Route) => void;
  replaceRoute: (routeIndex: number, route: Route) => void;
  addRouteStop: (routeIndex: number, routeStop: RouteStop) => void;
  removeRouteStop: (routeIndex: number, stopIndex: number) => void;
  reorderRouteStop: (routeIndex: number, fromIndex: number, toIndex: number) => void;
  setActiveRouteIndex: (index: number) => void;
  getRouteIndexByDirection: (direction: DirectionEnum) => number;
  generateRouteFromCorresponding: (
    targetDirection: DirectionEnum,
    options?: AutoGenerationOptions
  ) => RouteAutoGenerationResult;
  selectedRouteIndex: number | null;
  selectedStopIndex: number | null;
  setSelectedStop: (routeIndex: number, stopIndex: number) => void;
  clearSelectedStop: () => void;
  coordinateEditingMode: { routeIndex: number; stopIndex: number } | null;
  setCoordinateEditingMode: (routeIndex: number | null, stopIndex: number | null) => void;
  clearCoordinateEditingMode: () => void;
  mapActions: {
    fitBoundsToRoute: (() => void) | null;
  };
  registerMapAction: (action: 'fitBoundsToRoute', callback: () => void) => void;
  unregisterMapAction: (action: 'fitBoundsToRoute') => void;
}

export const RouteWorkspaceContext = createContext<RouteWorkspaceContextType>({
  data: createEmptyRouteWorkspaceData(),
  updateRouteGroup: () => {},
  updateFromYaml: () => {},
  getYaml: () => '',
  getRouteGroupData: () => createEmptyRouteWorkspaceData().routeGroup,
  updateRoute: () => {},
  updateRouteStop: () => {},
  addRoute: () => {},
  replaceRoute: () => {},
  addRouteStop: () => {},
  removeRouteStop: () => {},
  reorderRouteStop: () => {},
  setActiveRouteIndex: () => {},
  getRouteIndexByDirection: () => -1,
  generateRouteFromCorresponding: () => ({ success: false, route: {} as Route, message: '', warnings: [] }),
  selectedRouteIndex: null,
  selectedStopIndex: null,
  setSelectedStop: () => {},
  clearSelectedStop: () => {},
  coordinateEditingMode: null,
  setCoordinateEditingMode: () => {},
  clearCoordinateEditingMode: () => {},
  mapActions: {
    fitBoundsToRoute: null,
  },
  registerMapAction: () => {},
  unregisterMapAction: () => {},
});
