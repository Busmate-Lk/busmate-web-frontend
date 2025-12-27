import { createContext } from 'react';
import { RouteWorkspaceData, createEmptyRouteWorkspaceData, RouteGroup, Route, RouteStop } from '@/types/RouteWorkspaceData';

export interface RouteWorkspaceContextType {
  data: RouteWorkspaceData;
  updateRouteGroup: (routeGroup: Partial<RouteGroup>) => void;
  updateFromYaml: (yaml: string) => void;
  getYaml: () => string;
  getRouteGroupData: () => RouteGroup;
  updateRoute: (routeIndex: number, route: Partial<Route>) => void;
  updateRouteStop: (routeIndex: number, stopIndex: number, routeStop: Partial<RouteStop>) => void;
  addRoute: (route: Route) => void;
  addRouteStop: (routeIndex: number, routeStop: RouteStop) => void;
  removeRouteStop: (routeIndex: number, stopIndex: number) => void;
  reorderRouteStop: (routeIndex: number, fromIndex: number, toIndex: number) => void;
  setActiveRouteIndex: (index: number) => void;
  selectedRouteIndex: number | null;
  selectedStopIndex: number | null;
  setSelectedStop: (routeIndex: number, stopIndex: number) => void;
  clearSelectedStop: () => void;
  coordinateEditingMode: { routeIndex: number; stopIndex: number } | null;
  setCoordinateEditingMode: (routeIndex: number | null, stopIndex: number | null) => void;
  clearCoordinateEditingMode: () => void;
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
  addRouteStop: () => {},
  removeRouteStop: () => {},
  reorderRouteStop: () => {},
  setActiveRouteIndex: () => {},
  selectedRouteIndex: null,
  selectedStopIndex: null,
  setSelectedStop: () => {},
  clearSelectedStop: () => {},
  coordinateEditingMode: null,
  setCoordinateEditingMode: () => {},
  clearCoordinateEditingMode: () => {},
});
