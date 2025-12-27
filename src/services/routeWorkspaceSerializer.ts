import yaml from 'js-yaml';
import { RouteWorkspaceData, RouteGroupInfo } from '@/types/RouteWorkspaceData';

/**
 * Serialize RouteWorkspaceData to YAML format
 */
export function serializeToYaml(data: RouteWorkspaceData): string {
  const yamlData = {
    route_group: {
      name: data.routeGroup.nameEnglish || '',
      name_sinhala: data.routeGroup.nameSinhala || '',
      name_tamil: data.routeGroup.nameTamil || '',
      description: data.routeGroup.description || '',
    }
  };

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
      const routeGroup: Partial<RouteGroupInfo> = {};
      
      if (parsed.route_group.name !== undefined) {
        routeGroup.nameEnglish = String(parsed.route_group.name);
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

      if (Object.keys(routeGroup).length > 0) {
        result.routeGroup = routeGroup as RouteGroupInfo;
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to parse YAML:', error);
    return {};
  }
}
