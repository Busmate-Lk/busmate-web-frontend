'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckSquare,
  Square,
  MapPin,
  User,
  Bus,
  AlertCircle,
  CheckCircle,
  Filter,
  List,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import type { TimeKeeperWorkspaceState } from '../TimeKeeperTripAssignmentWorkspace';
import type { TripResponse } from '@/lib/api-client/route-management/models/TripResponse';
import { TimeKeeperTripContextMenu } from './TimeKeeperTripContextMenu';
import { TripManagementService } from '@/lib/api-client/route-management/services/TripManagementService';

interface TimeKeeperTripsWorkspaceProps {
  workspace: TimeKeeperWorkspaceState;
  onTripSelect: (tripId: string, multi: boolean) => void;
  activeSection: 'assignments' | 'monitoring';
  onRefreshTrips?: () => void;
  onClearSelection?: () => void;
}

export function TimeKeeperTripsWorkspace({
  workspace,
  onTripSelect,
  activeSection,
  onRefreshTrips,
  onClearSelection,
}: TimeKeeperTripsWorkspaceProps) {
  const [viewMode, setViewMode] = useState<'all-list' | 'daily'>('all-list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<
    'all' | 'assigned' | 'unassigned'
  >('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Date navigation functions
  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getFilteredTrips = () => {
    let filtered = workspace.trips;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((trip) => trip.status === statusFilter);
    }

    // Assignment filter
    if (assignmentFilter === 'assigned') {
      filtered = filtered.filter((trip) => trip.passengerServicePermitId);
    } else if (assignmentFilter === 'unassigned') {
      filtered = filtered.filter((trip) => !trip.passengerServicePermitId);
    }

    // Date filter for daily view
    if (viewMode === 'daily') {
      filtered = filtered.filter((trip) => {
        if (!trip.tripDate) return false;
        const tripDate = new Date(trip.tripDate);
        return isSameDay(tripDate, selectedDate);
      });
    }

    return filtered;
  };

  const getTripStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'delayed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isSelected = (tripId: string) => {
    return workspace.selectedTrips.includes(tripId);
  };

  // Handle individual PSP assignment
  const handleAssignPsp = async (tripId: string, pspId: string) => {
    try {
      await TripManagementService.assignPassengerServicePermitToTrip(
        tripId,
        pspId
      );
      onRefreshTrips?.();
    } catch (error) {
      console.error('Error assigning PSP to trip:', error);
    }
  };

  // Handle PSP removal
  const handleRemovePsp = async (tripId: string) => {
    try {
      await TripManagementService.removePassengerServicePermitFromTrip(tripId);
      onRefreshTrips?.();
    } catch (error) {
      console.error('Error removing PSP from trip:', error);
    }
  };

  const filteredTrips = getFilteredTrips();

  if (!workspace.selectedRoute) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No Route Selected
          </h3>
          <p className="text-gray-500 max-w-md">
            Select a route from the sidebar to view trips starting from your
            assigned bus stop
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
      {/* Trips Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Trips for{' '}
              {
                workspace.routeGroups
                  .find((rg) => rg.id === workspace.selectedRouteGroup)
                  ?.routes?.find((r) => r.id === workspace.selectedRoute)?.name
              }
            </h2>
            <p className="text-sm text-gray-600 flex items-center space-x-2">
              <MapPin className="h-3 w-3 text-indigo-600" />
              <span>Starting from {workspace.assignedBusStopName}</span>
              {workspace.selectedTrips.length > 0 && (
                <span className="font-medium text-indigo-600">
                  • {workspace.selectedTrips.length} selected
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="delayed">Delayed</option>
              </select>

              {/* Assignment Filter */}
              <select
                value={assignmentFilter}
                onChange={(e) =>
                  setAssignmentFilter(
                    e.target.value as 'all' | 'assigned' | 'unassigned'
                  )
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Trips</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('all-list')}
                className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-2 text-sm ${
                  viewMode === 'all-list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="All Trips List"
              >
                <List className="h-4 w-4" />
                <span>All</span>
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-2 text-sm ${
                  viewMode === 'daily'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Daily Trips View"
              >
                <Calendar className="h-4 w-4" />
                <span>Daily</span>
              </button>
            </div>

            {/* Clear Selection */}
            {workspace.selectedTrips.length > 0 && (
              <button
                onClick={onClearSelection}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {/* Date Navigation Bar (for daily view) */}
        {viewMode === 'daily' && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDay('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>

              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <button
                onClick={() => navigateDay('next')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg border border-indigo-200"
              >
                Today
              </button>
              <span className="text-sm text-gray-500">
                {filteredTrips.length} trip
                {filteredTrips.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trips Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {workspace.isLoadingTrips ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
            <div className="text-gray-600">Loading trips...</div>
          </div>
        ) : workspace.tripsError ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-600 mb-2">Error Loading Trips</div>
            <div className="text-gray-600">{workspace.tripsError}</div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-600 mb-2">No trips found</div>
            <div className="text-gray-500">
              {workspace.trips.length === 0
                ? 'No trips starting from your bus stop for this route'
                : 'No trips match the current filters'}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={(e) =>
                  onTripSelect(trip.id || '', e.ctrlKey || e.metaKey)
                }
                className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected(trip.id || '')
                    ? 'border-indigo-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="p-4">
                  {/* Trip Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {isSelected(trip.id || '') ? (
                        <CheckSquare className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            Trip #{trip.id?.slice(0, 8)}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getTripStatusColor(
                              trip.status
                            )}`}
                          >
                            {trip.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(trip.tripDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {trip.passengerServicePermitId ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Assigned</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-orange-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            Unassigned
                          </span>
                        </div>
                      )}

                      {/* Context Menu */}
                      <TimeKeeperTripContextMenu
                        trip={trip}
                        permits={workspace.permits}
                        onAssignPsp={handleAssignPsp}
                        onRemovePsp={handleRemovePsp}
                      />
                    </div>
                  </div>

                  {/* Trip Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Departure</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatTime(trip.scheduledDepartureTime)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Arrival</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatTime(trip.scheduledArrivalTime)}
                        </div>
                      </div>
                    </div>

                    {trip.busPlateNumber && (
                      <div className="flex items-center space-x-2">
                        <Bus className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500">Bus</div>
                          <div className="text-sm font-medium text-gray-900">
                            {trip.busPlateNumber}
                          </div>
                        </div>
                      </div>
                    )}

                    {trip.passengerServicePermitId && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500">PSP</div>
                          <div className="text-sm font-medium text-gray-900">
                            {workspace.permits.find(
                              (p) => p.id === trip.passengerServicePermitId
                            )?.permitNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Starting Bus Stop Badge */}
                  <div className="flex items-center space-x-2 text-xs bg-indigo-50 rounded px-2 py-1 w-fit">
                    <MapPin className="h-3 w-3 text-indigo-600" />
                    <span className="text-indigo-900">
                      Starts from: {workspace.assignedBusStopName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
