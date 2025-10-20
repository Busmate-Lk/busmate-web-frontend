'use client';

import React from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Users,
} from 'lucide-react';

interface TripStatsCardsProps {
  stats: {
    totalTrips: { count: number; change?: string };
    activeTrips: { count: number; change?: string };
    completedTrips: { count: number; change?: string };
    pendingTrips: { count: number; change?: string };
    cancelledTrips: { count: number; change?: string };
    tripsWithPsp: { count: number; change?: string };
    tripsWithBus: { count: number; change?: string };
    inTransitTrips: { count: number; change?: string };
  };
}

export function TripStatsCards({ stats }: TripStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
      {/* Total Trips */}
      <div className="bg-blue-50 border-blue-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Trips
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalTrips.count.toLocaleString()}
            </p>
            {stats.totalTrips.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalTrips.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Active Trips */}
      <div className="bg-green-50 border-green-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.activeTrips.count.toLocaleString()}
            </p>
            {stats.activeTrips.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.activeTrips.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Completed Trips */}
      <div className="bg-emerald-50 border-emerald-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.completedTrips.count.toLocaleString()}
            </p>
            {stats.completedTrips.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.completedTrips.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Trips */}
      <div className="bg-yellow-50 border-yellow-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.pendingTrips.count.toLocaleString()}
            </p>
            {stats.pendingTrips.change && (
              <p className="text-sm font-medium text-yellow-600">
                {stats.pendingTrips.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* In Transit Trips */}
      <div className="bg-orange-50 border-orange-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">In Transit</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.inTransitTrips.count.toLocaleString()}
            </p>
            {stats.inTransitTrips.change && (
              <p className="text-sm font-medium text-orange-600">
                {stats.inTransitTrips.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cancelled Trips */}
      <div className="bg-red-50 border-red-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-red-100 text-red-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Cancelled</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.cancelledTrips.count.toLocaleString()}
            </p>
            {stats.cancelledTrips.change && (
              <p className="text-sm font-medium text-red-600">
                {stats.cancelledTrips.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trips with PSP */}
      <div className="bg-purple-50 border-purple-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">With PSP</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.tripsWithPsp.count.toLocaleString()}
            </p>
            {stats.tripsWithPsp.change && (
              <p className="text-sm font-medium text-purple-600">
                {stats.tripsWithPsp.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trips with Bus */}
      <div className="bg-indigo-50 border-indigo-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">With Bus</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.tripsWithBus.count.toLocaleString()}
            </p>
            {stats.tripsWithBus.change && (
              <p className="text-sm font-medium text-indigo-600">
                {stats.tripsWithBus.change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
