'use client';

import React from 'react';
import { MapPin, CheckCircle, XCircle, Building, Globe } from 'lucide-react';

interface BusStopStatsCardsProps {
  stats: {
    totalStops: { count: number; change?: string };
    accessibleStops: { count: number; change?: string };
    nonAccessibleStops: { count: number; change?: string };
    totalStates: { count: number; change?: string };
    totalCities: { count: number; change?: string };
  };
}

export function BusStopStatsCards({ stats }: BusStopStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {/* Total Bus Stops */}
      <div className="bg-blue-50 border-blue-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Bus Stops
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalStops.count.toLocaleString()}
            </p>
            {stats.totalStops.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalStops.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Accessible Stops */}
      <div className="bg-green-50 border-green-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Accessible</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.accessibleStops.count.toLocaleString()}
            </p>
            {stats.accessibleStops.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.accessibleStops.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Non-Accessible Stops */}
      <div className="bg-orange-50 border-orange-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Non-Accessible
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.nonAccessibleStops.count.toLocaleString()}
            </p>
            {stats.nonAccessibleStops.change && (
              <p className="text-sm font-medium text-red-600">
                {stats.nonAccessibleStops.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Total States */}
      <div className="bg-purple-50 border-purple-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">States</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalStates.count.toLocaleString()}
            </p>
            {stats.totalStates.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalStates.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Total Cities */}
      <div className="bg-teal-50 border-teal-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-teal-100 text-teal-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Cities</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalCities.count.toLocaleString()}
            </p>
            {stats.totalCities.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalCities.change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
