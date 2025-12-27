'use client';

import { ReactNode, useState, useCallback } from 'react';
import { RouteWorkspaceContext } from './RouteWorkspaceContext';
import { RouteWorkspaceData, createEmptyRouteWorkspaceData } from '@/types/RouteWorkspaceData';
import { serializeToYaml, parseFromYaml } from '@/services/routeWorkspaceSerializer';

interface RouteWorkspaceProviderProps {
  children: ReactNode;
}

export function RouteWorkspaceProvider({ children }: RouteWorkspaceProviderProps) {
  const [data, setData] = useState<RouteWorkspaceData>(createEmptyRouteWorkspaceData());

  const updateRouteGroup = useCallback((routeGroup: Partial<RouteWorkspaceData['routeGroup']>) => {
    setData(prevData => ({
      ...prevData,
      routeGroup: {
        ...prevData.routeGroup,
        ...routeGroup,
      },
    }));
  }, []);

  const updateFromYaml = useCallback((yamlText: string) => {
    const parsedData = parseFromYaml(yamlText);
    
    setData(prevData => ({
      ...prevData,
      routeGroup: {
        ...prevData.routeGroup,
        ...(parsedData.routeGroup || {}),
      },
    }));
  }, []);

  const getYaml = useCallback(() => {
    return serializeToYaml(data);
  }, [data]);

  return (
    <RouteWorkspaceContext.Provider
      value={{
        data,
        updateRouteGroup,
        updateFromYaml,
        getYaml,
      }}
    >
      {children}
    </RouteWorkspaceContext.Provider>
  );
}
