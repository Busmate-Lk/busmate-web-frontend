'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronUp,
  ChevronDown,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Users,
  Eye,
  FileText,
  MoreVertical,
  BusFront,
  ArrowRightLeft,
  ChevronRight,
  RefreshCw,
  UserPlus,
  ClipboardList,
} from 'lucide-react';
import { TripResponse } from '@/lib/api-client/route-management';

interface TimeKeeperTripsTableProps {
  trips: TripResponse[];
  onView: (tripId: string) => void;
  onAddNotes: (tripId: string) => void;
  onRemoveBus?: (tripId: string) => void;
  onChangeStatus?: (tripId: string) => void;
  onChangePsp?: (tripId: string) => void;
  onSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  activeFilters: Record<string, any>;
  loading: boolean;
  currentSort: { field: string; direction: 'asc' | 'desc' };
  assignedBusStopId?: string;
  canManageBus?: (trip: TripResponse) => boolean;
}

export function TimeKeeperTripsTable({
  trips,
  onView,
  onAddNotes,
  onRemoveBus,
  onChangeStatus,
  onChangePsp,
  onSort,
  activeFilters,
  loading,
  currentSort,
  assignedBusStopId,
  canManageBus,
}: TimeKeeperTripsTableProps) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleAssignTrip = (trip: TripResponse) => {
    // Navigate to trip assignment page with the trip ID as a query parameter
    router.push(`/timeKeeper/trip-assignment?tripId=${trip.id}`);
  };

  const toggleRowExpansion = (tripId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId);
      } else {
        newSet.add(tripId);
      }
      return newSet;
    });
  };

  const getSortIcon = (field: string) => {
    if (currentSort.field !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-300" />;
    }
    return currentSort.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  const handleSort = (field: string) => {
    const newDirection =
      currentSort.field === field && currentSort.direction === 'asc'
        ? 'desc'
        : 'asc';
    onSort(field, newDirection);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    try {
      const timePart = timeString.includes('T')
        ? timeString.split('T')[1]
        : timeString;
      const [hours, minutes] = timePart.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return 'Invalid time';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'in_transit':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'boarding':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'departed':
        return <CheckCircle className="w-4 h-4 text-indigo-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';
    return status
      .replace('_', ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'delayed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'boarding':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'departed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No trips found
          </h3>
          <p className="text-gray-500 mb-4">
            {Object.keys(activeFilters).length > 0
              ? 'No trips match your current filters. Try adjusting your search criteria.'
              : 'No trips are scheduled for your assigned station.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                {/* Expand column */}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('tripDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {getSortIcon('tripDate')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('scheduledDepartureTime')}
              >
                <div className="flex items-center space-x-1">
                  <span>Departure</span>
                  {getSortIcon('scheduledDepartureTime')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('scheduledArrivalTime')}
              >
                <div className="flex items-center space-x-1">
                  <span>Arrival</span>
                  {getSortIcon('scheduledArrivalTime')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bus / PSP
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trips.map((trip) => {
              const isExpanded = expandedRows.has(trip.id!);
              return (
                <React.Fragment key={trip.id}>
                  {/* Main Row */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRowExpansion(trip.id!)}
                        className="text-gray-400 hover:text-gray-600 transition-transform duration-200"
                        title={
                          isExpanded ? 'Collapse details' : 'Expand details'
                        }
                      >
                        <ChevronRight
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(trip.tripDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trip.routeName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trip.routeGroupName || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatTime(trip.scheduledDepartureTime)}</div>
                      {trip.actualDepartureTime && (
                        <div className="text-xs text-gray-500">
                          Act: {formatTime(trip.actualDepartureTime)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatTime(trip.scheduledArrivalTime)}</div>
                      {trip.actualArrivalTime && (
                        <div className="text-xs text-gray-500">
                          Act: {formatTime(trip.actualArrivalTime)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-900">
                          <span className="font-medium mr-1">Bus:</span>
                          {trip.busPlateNumber || 'Not assigned'}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-1">PSP:</span>
                          {trip.passengerServicePermitNumber || 'Not assigned'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {getStatusIcon(trip.status)}
                        <span className="ml-1">
                          {getStatusLabel(trip.status)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Actions only available for trips that start at the assigned stop */}
                        {canManageBus && canManageBus(trip) ? (
                          <>
                            <button
                              onClick={() => handleAssignTrip(trip)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Assign trip"
                            >
                              <ClipboardList className="w-4 h-4" />
                            </button>

                            {onAddNotes && (
                              <button
                                onClick={() => onAddNotes(trip.id!)}
                                className="text-green-600 hover:text-green-900"
                                title="Add/Edit notes"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}

                            {onChangeStatus && (
                              <button
                                onClick={() => onChangeStatus(trip.id!)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Change status"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}

                            {/* {onChangePsp && (
                              <button
                                onClick={() => onChangePsp(trip.id!)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Manage PSP"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )} */}

                            {/* {onRemoveBus && trip.busPlateNumber && (
                              <button
                                onClick={() => onRemoveBus(trip.id!)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Remove/Reassign bus"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                            )} */}
                          </>
                        ) : // For non-starting trips, only allow viewing details (handled elsewhere)
                        null}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Operator Information */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Operator
                            </h4>
                            <p className="text-sm text-gray-900">
                              {trip.operatorName || 'N/A'}
                            </p>
                          </div>

                          {/* Schedule Information */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Schedule
                            </h4>
                            <p className="text-sm text-gray-900">
                              {trip.scheduleName || 'N/A'}
                            </p>
                          </div>

                          {/* Bus Model Information */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Bus Model
                            </h4>
                            <p className="text-sm text-gray-900">
                              {trip.busModel || 'N/A'}
                            </p>
                          </div>

                          {/* Driver ID */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Driver ID
                            </h4>
                            <p className="text-sm text-gray-900">
                              {trip.driverId || 'Not assigned'}
                            </p>
                          </div>

                          {/* Conductor ID */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Conductor ID
                            </h4>
                            <p className="text-sm text-gray-900">
                              {trip.conductorId || 'Not assigned'}
                            </p>
                          </div>

                          {/* Notes */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Notes
                            </h4>
                            <p className="text-sm text-gray-900">
                              {trip.notes || 'No notes available'}
                            </p>
                          </div>

                          {/* Created/Updated Info */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                  Created
                                </h4>
                                <p className="text-sm text-gray-900">
                                  {trip.createdAt
                                    ? formatDate(trip.createdAt)
                                    : 'N/A'}
                                </p>
                                {trip.createdBy && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    By: {trip.createdBy}
                                  </p>
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                  Last Updated
                                </h4>
                                <p className="text-sm text-gray-900">
                                  {trip.updatedAt
                                    ? formatDate(trip.updatedAt)
                                    : 'N/A'}
                                </p>
                                {trip.updatedBy && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    By: {trip.updatedBy}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
