'use client';

import { useState, useEffect } from 'react';
import { RouteManagementService } from '@/lib/api-client/route-management/services/RouteManagementService';
import { TripManagementService } from '@/lib/api-client/route-management/services/TripManagementService';
import { PermitManagementService } from '@/lib/api-client/route-management/services/PermitManagementService';
import type { RouteGroupResponse } from '@/lib/api-client/route-management/models/RouteGroupResponse';
import type { PassengerServicePermitResponse } from '@/lib/api-client/route-management/models/PassengerServicePermitResponse';
import type { TripResponse } from '@/lib/api-client/route-management/models/TripResponse';
import type { BulkPspAssignmentRequest } from '@/lib/api-client/route-management/models/BulkPspAssignmentRequest';

// Workspace Sections
import { TimeKeeperTripsWorkspace } from './components/TimeKeeperTripsWorkspace';
import { TimeKeeperWorkspaceHeader } from './components/TimeKeeperWorkspaceHeader';
import { TimeKeeperWorkspaceSidebar } from './components/TimeKeeperWorkspaceSidebar';
import { TimeKeeperAssignmentPanel } from './components/TimeKeeperAssignmentPanel';

export interface TimeKeeperWorkspaceState {
  // TimeKeeper specific
  assignedBusStopId: string | null;
  assignedBusStopName: string | null;

  // Active selections
  selectedRouteGroup: string | null;
  selectedRoute: string | null;
  selectedDateRange: {
    startDate: Date;
    endDate: Date;
  };
  selectedTrips: string[];

  // Data
  routeGroups: RouteGroupResponse[];
  trips: TripResponse[];
  permits: PassengerServicePermitResponse[];

  // Loading states
  isLoadingRouteGroups: boolean;
  isLoadingTrips: boolean;
  isLoadingPermits: boolean;
  isAssigningPsps: boolean;

  // Error states
  routeGroupsError: string | null;
  tripsError: string | null;
  permitsError: string | null;
  assignmentError: string | null;
}

export function TimeKeeperTripAssignmentWorkspace() {
  // Workspace state
  const [workspace, setWorkspace] = useState<TimeKeeperWorkspaceState>({
    assignedBusStopId: null,
    assignedBusStopName: null,
    selectedRouteGroup: null,
    selectedRoute: null,
    selectedDateRange: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
    },
    selectedTrips: [],
    routeGroups: [],
    trips: [],
    permits: [],
    isLoadingRouteGroups: true,
    isLoadingTrips: false,
    isLoadingPermits: false,
    isAssigningPsps: false,
    routeGroupsError: null,
    tripsError: null,
    permitsError: null,
    assignmentError: null,
  });

  // Workspace view mode
  const [activeSection, setActiveSection] = useState<
    'assignments' | 'monitoring'
  >('assignments');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize workspace data
  useEffect(() => {
    loadAssignedBusStop();
    loadRouteGroups();
  }, []);

  // Load TimeKeeper's assigned bus stop
  const loadAssignedBusStop = async () => {
    try {
      // TODO: Replace with actual API call to get timekeeper's assigned bus stop
      // Example: const response = await TimekeeperService.getAssignedBusStop();
      // For now, using mock data
      setWorkspace((prev) => ({
        ...prev,
        assignedBusStopId: 'mock-bus-stop-id',
        assignedBusStopName: 'Main Terminal',
      }));
    } catch (error) {
      console.error('Error loading assigned bus stop:', error);
      setWorkspace((prev) => ({
        ...prev,
        assignedBusStopName: 'Unknown Stop',
      }));
    }
  };

  // Load route groups
  const loadRouteGroups = async () => {
    try {
      setWorkspace((prev) => ({
        ...prev,
        isLoadingRouteGroups: true,
        routeGroupsError: null,
      }));
      const response = await RouteManagementService.getAllRouteGroupsAsList();
      setWorkspace((prev) => ({
        ...prev,
        routeGroups: response,
        isLoadingRouteGroups: false,
      }));
    } catch (error) {
      console.error('Error loading route groups:', error);
      setWorkspace((prev) => ({
        ...prev,
        routeGroupsError: 'Failed to load route groups',
        isLoadingRouteGroups: false,
      }));
    }
  };

  // Load trips for selected route (filtered by assigned bus stop)
  const loadTrips = async (routeId: string) => {
    try {
      setWorkspace((prev) => ({
        ...prev,
        isLoadingTrips: true,
        tripsError: null,
      }));
      const response = await TripManagementService.getTripsByRoute(routeId);

      // Filter trips that start from the timekeeper's assigned bus stop
      // TODO: Replace with actual API filtering when backend supports busStopId parameter
      const filteredTrips = workspace.assignedBusStopId
        ? response.filter((trip) => {
            // For now, showing all trips. In production, filter by:
            // trip.startingStopId === workspace.assignedBusStopId
            return true;
          })
        : response;

      setWorkspace((prev) => ({
        ...prev,
        trips: filteredTrips,
        isLoadingTrips: false,
      }));
    } catch (error) {
      console.error('Error loading trips:', error);
      setWorkspace((prev) => ({
        ...prev,
        tripsError: 'Failed to load trips',
        isLoadingTrips: false,
      }));
    }
  };

  // Load permits for selected route group
  const loadPermits = async (routeGroupId: string) => {
    try {
      setWorkspace((prev) => ({
        ...prev,
        isLoadingPermits: true,
        permitsError: null,
      }));
      const response = await PermitManagementService.getPermitsByRouteGroupId(
        routeGroupId
      );
      setWorkspace((prev) => ({
        ...prev,
        permits: response,
        isLoadingPermits: false,
      }));
    } catch (error) {
      console.error('Error loading permits:', error);
      setWorkspace((prev) => ({
        ...prev,
        permitsError: 'Failed to load permits',
        isLoadingPermits: false,
      }));
    }
  };

  // Bulk assign PSPs to trips
  const bulkAssignPsps = async (assignments: BulkPspAssignmentRequest) => {
    try {
      setWorkspace((prev) => ({
        ...prev,
        isAssigningPsps: true,
        assignmentError: null,
      }));

      const response = await TripManagementService.bulkAssignPspsToTrips(
        assignments
      );

      // Refresh trips after assignment
      if (workspace.selectedRoute) {
        await loadTrips(workspace.selectedRoute);
      }

      setWorkspace((prev) => ({
        ...prev,
        isAssigningPsps: false,
        selectedTrips: [],
      }));
      return response;
    } catch (error) {
      console.error('Error assigning PSPs:', error);
      setWorkspace((prev) => ({
        ...prev,
        assignmentError: 'Failed to assign PSPs',
        isAssigningPsps: false,
      }));
      throw error;
    }
  };

  // Handle route group selection
  const handleRouteGroupSelect = (routeGroupId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      selectedRouteGroup: routeGroupId,
      selectedRoute: null,
      selectedTrips: [],
      trips: [],
    }));
    loadPermits(routeGroupId);
  };

  // Handle route selection
  const handleRouteSelect = (routeId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      selectedRoute: routeId,
      selectedTrips: [],
    }));
    loadTrips(routeId);
  };

  // Handle trip selection
  const handleTripSelect = (tripId: string, multi: boolean = false) => {
    setWorkspace((prev) => {
      const selectedTrips = multi
        ? prev.selectedTrips.includes(tripId)
          ? prev.selectedTrips.filter((id) => id !== tripId)
          : [...prev.selectedTrips, tripId]
        : [tripId];

      return { ...prev, selectedTrips };
    });
  };

  // Handle clear all selections
  const handleClearSelection = () => {
    setWorkspace((prev) => ({
      ...prev,
      selectedTrips: [],
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setWorkspace((prev) => ({
      ...prev,
      selectedDateRange: { startDate, endDate },
    }));
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-50">
      {/* Workspace Sidebar */}
      <TimeKeeperWorkspaceSidebar
        workspace={workspace}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onRouteGroupSelect={handleRouteGroupSelect}
        onRouteSelect={handleRouteSelect}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Workspace Header */}
        <TimeKeeperWorkspaceHeader
          workspace={workspace}
          activeSection={activeSection}
          onDateRangeChange={handleDateRangeChange}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Assignment Management */}
          {activeSection === 'assignments' && (
            <TimeKeeperAssignmentPanel
              workspace={workspace}
              onBulkAssign={bulkAssignPsps}
            />
          )}

          {/* Center Panel - Trips Workspace */}
          <TimeKeeperTripsWorkspace
            workspace={workspace}
            onTripSelect={handleTripSelect}
            activeSection={activeSection}
            onRefreshTrips={() =>
              workspace.selectedRoute && loadTrips(workspace.selectedRoute)
            }
            onClearSelection={handleClearSelection}
          />
        </div>
      </div>
    </div>
  );
}
