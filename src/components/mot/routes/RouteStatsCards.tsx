'use client';

import React from 'react';
import { Route, Navigation, MapPin, Users, Clock, Zap } from 'lucide-react';

interface RouteStatsCardsProps {
  stats: {
    totalRoutes: { count: number; change?: string };
    outboundRoutes: { count: number; change?: string };
    inboundRoutes: { count: number; change?: string };
    averageDistance: { count: number; unit: string };
    totalRouteGroups: { count: number; change?: string };
    averageDuration: { count: number; unit: string };
  };
}

export function RouteStatsCards({ stats }: RouteStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {/* Total Routes */}
      <div className="bg-blue-50 border-blue-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Route className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Routes
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalRoutes.count.toLocaleString()}
            </p>
            {stats.totalRoutes.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalRoutes.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Outbound Routes */}
      <div className="bg-green-50 border-green-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Outbound</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.outboundRoutes.count.toLocaleString()}
            </p>
            {stats.outboundRoutes.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.outboundRoutes.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Inbound Routes */}
      <div className="bg-purple-50 border-purple-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Navigation className="w-6 h-6 rotate-180" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Inbound</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.inboundRoutes.count.toLocaleString()}
            </p>
            {stats.inboundRoutes.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.inboundRoutes.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Average Distance */}
      <div className="bg-orange-50 border-orange-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Avg Distance
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.averageDistance.count.toFixed(1)}
              <span className="ml-1 text-sm font-medium text-gray-600">
                {stats.averageDistance.unit}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Route Groups */}
      <div className="bg-indigo-50 border-indigo-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Route Groups
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalRouteGroups.count.toLocaleString()}
            </p>
            {stats.totalRouteGroups.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalRouteGroups.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Average Duration */}
      <div className="bg-teal-50 border-teal-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-teal-100 text-teal-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Avg Duration
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.averageDuration.count.toFixed(0)}
              <span className="ml-1 text-sm font-medium text-gray-600">
                {stats.averageDuration.unit}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
