'use client';

import { ReactNode, useState, useCallback } from 'react';
import { RouteWorkspaceContext } from './RouteWorkspaceContext';
import { RouteWorkspaceData, createEmptyRouteWorkspaceData, RouteGroup } from '@/types/RouteWorkspaceData';
import { serializeToYaml, parseFromYaml } from '@/services/routeWorkspaceSerializer';

interface RouteWorkspaceProviderProps {
  children: ReactNode;
}

export function RouteWorkspaceProvider({ children }: RouteWorkspaceProviderProps) {
  const [data, setData] = useState<RouteWorkspaceData>(createEmptyRouteWorkspaceData());

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

  return (
    <RouteWorkspaceContext.Provider
      value={{
        data,
        updateRouteGroup,
        updateFromYaml,
        getYaml,
        getRouteGroupData,
      }}
    >
      {children}
    </RouteWorkspaceContext.Provider>
  );
}
