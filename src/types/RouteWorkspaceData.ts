export interface RouteGroupInfo {
  nameEnglish: string;
  nameSinhala: string;
  nameTamil: string;
  description: string;
}

export interface RouteWorkspaceData {
  routeGroup: RouteGroupInfo;
}

export const createEmptyRouteWorkspaceData = (): RouteWorkspaceData => ({
  routeGroup: {
    nameEnglish: '',
    nameSinhala: '',
    nameTamil: '',
    description: '',
  },
});
