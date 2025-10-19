'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  Route,
  Building,
  Search,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  MapPin,
} from 'lucide-react';
import type { TimeKeeperWorkspaceState } from '../TimeKeeperTripAssignmentWorkspace';

interface TimeKeeperWorkspaceSidebarProps {
  workspace: TimeKeeperWorkspaceState;
  activeSection: 'assignments' | 'monitoring';
  onSectionChange: (section: 'assignments' | 'monitoring') => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onRouteGroupSelect: (routeGroupId: string) => void;
  onRouteSelect: (routeId: string) => void;
}

export function TimeKeeperWorkspaceSidebar({
  workspace,
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  onRouteGroupSelect,
  onRouteSelect,
}: TimeKeeperWorkspaceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRouteGroups, setExpandedRouteGroups] = useState<string[]>([]);

  const sectionItems = [
    {
      id: 'assignments' as const,
      label: 'Trip Assignment',
      icon: Settings,
      description: 'Manage trip assignments',
    },
    {
      id: 'monitoring' as const,
      label: 'Trip Monitoring',
      icon: BarChart3,
      description: 'Monitor trip status',
    },
  ];

  const toggleRouteGroup = (routeGroupId: string) => {
    setExpandedRouteGroups((prev) =>
      prev.includes(routeGroupId)
        ? prev.filter((id) => id !== routeGroupId)
        : [...prev, routeGroupId]
    );
  };

  const filteredRouteGroups = workspace.routeGroups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.routes?.some((route) =>
        route.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (collapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col">
        {/* Toggle Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Section Icons */}
        <div className="flex-1 py-4">
          {sectionItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full p-3 flex items-center justify-center transition-colors ${
                  activeSection === item.id
                    ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">TimeKeeper</h2>
            {workspace.assignedBusStopName && (
              <div className="flex items-center space-x-1 mt-1">
                <MapPin className="h-3 w-3 text-indigo-600" />
                <span className="text-xs text-gray-600">
                  {workspace.assignedBusStopName}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-2">
          {sectionItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                  activeSection === item.id
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-indigo-50 border-b border-indigo-200">
        <div className="text-xs text-indigo-900">
          <strong>Note:</strong> You can only manage trips starting from your
          assigned bus stop.
        </div>
      </div>

      {/* Route Groups & Routes */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Route Selection
          </h3>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Route Groups List */}
        <div className="flex-1 overflow-y-auto p-4">
          {workspace.isLoadingRouteGroups ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">Loading routes...</div>
            </div>
          ) : workspace.routeGroupsError ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">⚠️ Error</div>
              <div className="text-sm text-gray-600">
                {workspace.routeGroupsError}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRouteGroups.map((routeGroup) => (
                <div
                  key={routeGroup.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Route Group Header */}
                  <div
                    className={`p-3 cursor-pointer transition-colors ${
                      workspace.selectedRouteGroup === routeGroup.id
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (routeGroup.id) {
                        onRouteGroupSelect(routeGroup.id);
                        toggleRouteGroup(routeGroup.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900 text-sm">
                          {routeGroup.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {routeGroup.routes?.length || 0} routes
                        </span>
                        {expandedRouteGroups.includes(routeGroup.id || '') ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Routes List */}
                  {expandedRouteGroups.includes(routeGroup.id || '') &&
                    routeGroup.routes && (
                      <div className="bg-white">
                        {routeGroup.routes.map((route) => (
                          <div
                            key={route.id}
                            className={`p-3 cursor-pointer border-t border-gray-100 transition-colors ${
                              workspace.selectedRoute === route.id
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => route.id && onRouteSelect(route.id)}
                          >
                            <div className="flex items-center space-x-2">
                              <Route className="h-4 w-4 text-gray-400" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {route.name}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      route.direction === 'OUTBOUND'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}
                                  >
                                    {route.direction === 'OUTBOUND'
                                      ? 'Out'
                                      : 'In'}
                                  </span>
                                  {route.distanceKm && (
                                    <span className="text-xs text-gray-500">
                                      {route.distanceKm}km
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
