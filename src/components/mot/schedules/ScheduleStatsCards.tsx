'use client';

import React from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Zap,
} from 'lucide-react';

interface ScheduleStatsCardsProps {
  stats: {
    totalSchedules: { count: number; change?: string };
    activeSchedules: { count: number; change?: string };
    inactiveSchedules: { count: number; change?: string };
    regularSchedules: { count: number; change?: string };
    specialSchedules: { count: number; change?: string };
    totalRoutes: { count: number; change?: string };
  };
}

export function ScheduleStatsCards({ stats }: ScheduleStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {/* Total Schedules */}
      <div className="bg-blue-50 border-blue-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Schedules
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalSchedules.count.toLocaleString()}
            </p>
            {stats.totalSchedules.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalSchedules.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Active Schedules */}
      <div className="bg-green-50 border-green-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.activeSchedules.count.toLocaleString()}
            </p>
            {stats.activeSchedules.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.activeSchedules.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Inactive Schedules */}
      <div className="bg-red-50 border-red-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-red-100 text-red-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Inactive</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.inactiveSchedules.count.toLocaleString()}
            </p>
            {stats.inactiveSchedules.change && (
              <p className="text-sm font-medium text-red-600">
                {stats.inactiveSchedules.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Regular Schedules */}
      <div className="bg-indigo-50 border-indigo-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Regular</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.regularSchedules.count.toLocaleString()}
            </p>
            {stats.regularSchedules.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.regularSchedules.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Special Schedules */}
      <div className="bg-purple-50 border-purple-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Special</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.specialSchedules.count.toLocaleString()}
            </p>
            {stats.specialSchedules.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.specialSchedules.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Total Routes */}
      <div className="bg-orange-50 border-orange-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Routes Covered
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
    </div>
  );
}
