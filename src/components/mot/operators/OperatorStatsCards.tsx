'use client';

import React from 'react';
import {
  Building,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';

interface OperatorStatsCardsProps {
  stats: {
    totalOperators: { count: number; change?: string };
    activeOperators: { count: number; change?: string };
    inactiveOperators: { count: number; change?: string };
    privateOperators: { count: number; change?: string };
    ctbOperators: { count: number; change?: string };
    totalRegions: { count: number; change?: string };
  };
}

export function OperatorStatsCards({ stats }: OperatorStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {/* Total Operators */}
      <div className="bg-blue-50 border-blue-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Operators
            </p>
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

      {/* Active Operators */}
      <div className="bg-green-50 border-green-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.activeOperators.count.toLocaleString()}
            </p>
            {stats.activeOperators.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.activeOperators.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Inactive Operators */}
      <div className="bg-red-50 border-red-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-red-100 text-red-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Inactive</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.inactiveOperators.count.toLocaleString()}
            </p>
            {stats.inactiveOperators.change && (
              <p className="text-sm font-medium text-red-600">
                {stats.inactiveOperators.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Private Operators */}
      <div className="bg-indigo-50 border-indigo-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Private</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.privateOperators.count.toLocaleString()}
            </p>
            {stats.privateOperators.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.privateOperators.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CTB Operators */}
      <div className="bg-purple-50 border-purple-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">CTB</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.ctbOperators.count.toLocaleString()}
            </p>
            {stats.ctbOperators.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.ctbOperators.change}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Total Regions */}
      <div className="bg-orange-50 border-orange-200 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Regions Covered
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalRegions.count.toLocaleString()}
            </p>
            {stats.totalRegions.change && (
              <p className="text-sm font-medium text-green-600">
                {stats.totalRegions.change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
