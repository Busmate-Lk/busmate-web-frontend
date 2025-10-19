'use client';

import React, { useState } from 'react';
import {
  BusFront,
  Clock,
  MapPin,
  ChevronRight,
  Eye,
  Calendar,
  Users,
} from 'lucide-react';
import { TripResponse } from '@/lib/api-client/route-management';
import { useRouter } from 'next/navigation';

interface TodaysBusesTableProps {
  trips: TripResponse[];
  loading: boolean;
}

export function TodaysBusesTable({ trips, loading }: TodaysBusesTableProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  // Show only first 5 trips by default
  const displayedTrips = showAll ? trips : trips.slice(0, 5);

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

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';
    return status
      .replace('_', ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleViewTrip = (tripId: string) => {
    router.push(`/timeKeeper/trip/${tripId}`);
  };

  const handleShowMore = () => {
    router.push('/timeKeeper/trip');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading today's buses...</span>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BusFront className="w-5 h-5 mr-2 text-blue-600" />
            Today's Scheduled Buses
          </h2>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No buses scheduled for today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BusFront className="w-5 h-5 mr-2 text-blue-600" />
            Today's Scheduled Buses
          </h2>
          <span className="text-sm text-gray-500">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} scheduled
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bus / Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departure Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Arrival Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedTrips.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <BusFront className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {trip.busPlateNumber || 'Not Assigned'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trip.routeName || 'N/A'}
                      </div>
                      {trip.routeGroupName && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {trip.routeGroupName}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {formatTime(trip.scheduledDepartureTime)}
                  </div>
                  {trip.actualDepartureTime && (
                    <div className="text-xs text-gray-500 ml-6">
                      Act: {formatTime(trip.actualDepartureTime)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {formatTime(trip.scheduledArrivalTime)}
                  </div>
                  {trip.actualArrivalTime && (
                    <div className="text-xs text-gray-500 ml-6">
                      Act: {formatTime(trip.actualArrivalTime)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      trip.status
                    )}`}
                  >
                    {getStatusLabel(trip.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewTrip(trip.id!)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Button */}
      {trips.length > 5 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleShowMore}
            className="w-full flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors py-2 rounded-lg hover:bg-gray-100"
          >
            <span>
              {showAll
                ? 'View All Trips'
                : `Show ${trips.length - 5} More Trip${
                    trips.length - 5 === 1 ? '' : 's'
                  }`}
            </span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
        <div className="flex items-center text-sm text-blue-800">
          <Users className="w-4 h-4 mr-2" />
          <span>
            Showing {displayedTrips.length} of {trips.length} scheduled trips
            for today
          </span>
        </div>
      </div>
    </div>
  );
}
