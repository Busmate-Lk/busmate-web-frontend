'use client';

import React from 'react';
import { Bus, CheckCircle, XCircle, Users, MapPin, Gauge } from 'lucide-react';

interface BusStatsCardsProps {
  stats: {
    totalBuses: { count: number; change?: string };
    activeBuses: { count: number; change?: string };
    inactiveBuses: { count: number; change?: string };
    totalOperators: { count: number; change?: string };
    averageCapacity: { count: number; change?: string };
    totalCapacity: { count: number; change?: string };
  };
}

export function BusStatsCards({ stats }: BusStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {/* Total Buses */}
      <div className="bg-blue-50 border-blue-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Buses
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalBuses.count.toLocaleString()}
            </p>
            {stats.totalBuses.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalBuses.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Active Buses */}
      <div className="bg-green-50 border-green-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.activeBuses.count.toLocaleString()}
            </p>
            {stats.activeBuses.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.activeBuses.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Inactive Buses */}
      <div className="bg-orange-50 border-orange-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Inactive</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.inactiveBuses.count.toLocaleString()}
            </p>
            {stats.inactiveBuses.change && (
              <p className="text-sm font-medium text-red-600">
                {stats.inactiveBuses.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Total Operators */}
      <div className="bg-indigo-50 border-indigo-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Operators</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalOperators.count.toLocaleString()}
            </p>
            {stats.totalOperators.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalOperators.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Average Capacity */}
      <div className="bg-purple-50 border-purple-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Gauge className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Avg Capacity
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {Math.round(stats.averageCapacity.count)}
            </p>
            {stats.averageCapacity.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.averageCapacity.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Total Capacity */}
      <div className="bg-teal-50 border-teal-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-teal-100 text-teal-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Capacity
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalCapacity.count.toLocaleString()}
            </p>
            {stats.totalCapacity.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalCapacity.change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
