'use client';

import React from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MapPin,
} from 'lucide-react';

interface PermitStatsCardsProps {
  stats?: {
    totalPermits?: number;
    activePermits?: number;
    inactivePermits?: number;
    expiringSoonPermits?: number;
    permitsByOperator?: Record<string, number>;
    permitsByRouteGroup?: Record<string, number>;
  } | null;
  loading?: boolean;
}

export function PermitStatsCards({
  stats,
  loading = false,
}: PermitStatsCardsProps) {
  // Provide default values when stats is null/undefined
  const safeStats = stats || {
    totalPermits: 0,
    activePermits: 0,
    inactivePermits: 0,
    expiringSoonPermits: 0,
    permitsByOperator: {},
    permitsByRouteGroup: {},
  };

  // Calculate derived values
  const totalOperators = Object.keys(safeStats.permitsByOperator || {}).length;
  const totalRouteGroups = Object.keys(
    safeStats.permitsByRouteGroup || {}
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {/* Total Permits */}
      <div className="bg-blue-50 border-blue-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Permits
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? (
                <span className="animate-pulse bg-gray-200 h-9 w-16 rounded inline-block"></span>
              ) : (
                (safeStats.totalPermits || 0).toLocaleString()
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Active Permits */}
      <div className="bg-green-50 border-green-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? (
                <span className="animate-pulse bg-gray-200 h-9 w-16 rounded inline-block"></span>
              ) : (
                (safeStats.activePermits || 0).toLocaleString()
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Inactive Permits */}
      <div className="bg-orange-50 border-orange-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Inactive</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? (
                <span className="animate-pulse bg-gray-200 h-9 w-16 rounded inline-block"></span>
              ) : (
                (safeStats.inactivePermits || 0).toLocaleString()
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Expiring Permits */}
      <div className="bg-teal-50 border-teal-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-teal-100 text-teal-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Expiring Soon
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? (
                <span className="animate-pulse bg-gray-200 h-9 w-16 rounded inline-block"></span>
              ) : (
                (safeStats.expiringSoonPermits || 0).toLocaleString()
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Total Operators */}
      <div className="bg-purple-50 border-purple-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Operators</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? (
                <span className="animate-pulse bg-gray-200 h-9 w-16 rounded inline-block"></span>
              ) : (
                totalOperators.toLocaleString()
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Total Route Groups */}
      <div className="bg-indigo-50 border-indigo-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Route Groups
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? (
                <span className="animate-pulse bg-gray-200 h-9 w-16 rounded inline-block"></span>
              ) : (
                totalRouteGroups.toLocaleString()
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
