import { createContext } from 'react';
import { RouteWorkspaceData, createEmptyRouteWorkspaceData } from '@/types/RouteWorkspaceData';

export interface RouteWorkspaceContextType {
  data: RouteWorkspaceData;
  updateRouteGroup: (routeGroup: Partial<RouteWorkspaceData['routeGroup']>) => void;
  updateFromYaml: (yaml: string) => void;
  getYaml: () => string;
}

export const RouteWorkspaceContext = createContext<RouteWorkspaceContextType>({
  data: createEmptyRouteWorkspaceData(),
  updateRouteGroup: () => {},
  updateFromYaml: () => {},
  getYaml: () => '',
});
