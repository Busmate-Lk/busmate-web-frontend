'use client';

import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Eye,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  FileText,
  Bus,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Users,
  Flag,
  Navigation
} from 'lucide-react';
import { TripResponse } from '@/lib/api-client/route-management';

interface OperatorTripsTableProps {
  trips: TripResponse[];
  onView: (tripId: string) => void;
  onEdit: (tripId: string) => void;
  onStart: (tripId: string) => void;
  onComplete: (tripId: string) => void;
  onCancel: (tripId: string) => void;
  onAssignPsp: (tripId: string) => void;
  onSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  loading: boolean;
  currentSort: { field: string; direction: 'asc' | 'desc' };
  selectedTrips?: string[];
  onSelectTrip?: (tripId: string) => void;
  onSelectAll?: () => void;
}

export function OperatorTripsTable({
  trips,
  onView,
  onEdit,
  onStart,
  onComplete,
  onCancel,
  onAssignPsp,
  onSort,
  loading,
  currentSort,
  selectedTrips = [],
  onSelectTrip,
  onSelectAll
}: OperatorTripsTableProps) {
  const getSortIcon = (field: string) => {
    if (currentSort.field !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-300" />;
    }
    return currentSort.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const handleSort = (field: string) => {
    const newDirection = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
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
      // Handle time format (HH:mm:ss or HH:mm)
      const timePart = timeString.includes('T') ? timeString.split('T')[1] : timeString;
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
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'in_transit':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'boarding':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'departed':
        return <Play className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'delayed':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'boarding':
        return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'departed':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-500">There are no trips matching your current filters.</p>
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
              {/* Selection Checkbox */}
              {onSelectTrip && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTrips.length === trips.length && trips.length > 0}
                    onChange={onSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
              )}

              {/* Trip Date */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('tripDate')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  <Calendar className="w-4 h-4" />
                  Date
                  {getSortIcon('tripDate')}
                </button>
              </th>

              {/* Route */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Navigation className="w-4 h-4" />
                  Route
                </div>
              </th>

              {/* Schedule */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Schedule
                </div>
              </th>

              {/* Departure Time */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('scheduledDepartureTime')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  <Clock className="w-4 h-4" />
                  Departure
                  {getSortIcon('scheduledDepartureTime')}
                </button>
              </th>

              {/* Bus */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Bus className="w-4 h-4" />
                  Bus
                </div>
              </th>

              {/* Permit */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Permit
                </div>
              </th>

              {/* Status */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  <Flag className="w-4 h-4" />
                  Status
                  {getSortIcon('status')}
                </button>
              </th>

              {/* Actions */}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trips.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50">
                {/* Selection Checkbox */}
                {onSelectTrip && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTrips.includes(trip.id!)}
                      onChange={() => onSelectTrip(trip.id!)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                )}

                {/* Trip Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(trip.tripDate)}
                  </div>
                </td>

                {/* Route */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{trip.routeName || 'N/A'}</div>
                    {trip.routeGroupName && (
                      <div className="text-xs text-gray-500">{trip.routeGroupName}</div>
                    )}
                  </div>
                </td>

                {/* Schedule */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {trip.scheduleName || 'N/A'}
                  </div>
                </td>

                {/* Departure Time */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatTime(trip.scheduledDepartureTime)}
                  </div>
                  {trip.actualDepartureTime && (
                    <div className="text-xs text-gray-500">
                      Actual: {formatTime(trip.actualDepartureTime)}
                    </div>
                  )}
                </td>

                {/* Bus */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {trip.busPlateNumber ? (
                      <span className="font-medium">{trip.busPlateNumber}</span>
                    ) : (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </div>
                </td>

                {/* Permit */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {trip.passengerServicePermitNumber ? (
                      <span className="font-medium">{trip.passengerServicePermitNumber}</span>
                    ) : (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                    {getStatusIcon(trip.status)}
                    {getStatusLabel(trip.status)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* View */}
                    <button
                      onClick={() => onView(trip.id!)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && trips.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-600">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}