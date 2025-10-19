'use client';

import React, { useState } from 'react';
import {
  Eye,
  Trash2,
  Bus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  FileText
} from 'lucide-react';
import { PermitManagementModal } from './PermitManagementModal';

interface FleetTableProps {
  buses: any[];
  onView: (busId: string) => void;
  onDelete: (busId: string, busRegistration: string) => void;
  onSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  activeFilters: Record<string, any>;
  loading: boolean;
  currentSort: { field: string; direction: 'asc' | 'desc' };
  busPermits?: Record<string, { permitNumber: string; permitType?: string } | null>;
  onPermitsChanged?: () => void;
}

export function FleetTable({
  buses,
  onView,
  onDelete,
  onSort,
  activeFilters,
  loading,
  currentSort,
  busPermits = {},
  onPermitsChanged
}: FleetTableProps) {
  const [permitModalBus, setPermitModalBus] = useState<{ id: string; registration: string } | null>(null);
  const formatFacilities = (facilities: any): string => {
    if (!facilities) return 'No facilities listed';

    try {
      // If it's already an array
      if (Array.isArray(facilities)) {
        return facilities.join(', ');
      }

      // If it's a string that might be JSON
      if (typeof facilities === 'string') {
        // Try to parse as JSON if it looks like JSON
        if (facilities.startsWith('[') || facilities.startsWith('{')) {
          const parsed = JSON.parse(facilities);
          if (Array.isArray(parsed)) {
            return parsed.join(', ');
          }
          return String(parsed);
        }
        return facilities;
      }

      // If it's an object, convert to string representation
      if (typeof facilities === 'object') {
        return Object.values(facilities).join(', ');
      }

      // Fallback to string conversion
      return String(facilities);
    } catch (error) {
      // If JSON parsing fails, return the original value as string
      return String(facilities);
    }
  };

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

  const getStatusIcon = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'INACTIVE':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading && buses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your fleet...</p>
        </div>
      </div>
    );
  }

  if (buses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <Bus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No buses found</h3>
          <p className="text-gray-500 mb-4">
            {Object.keys(activeFilters).some(key => activeFilters[key])
              ? "No buses match your current filters. Try adjusting your search criteria."
              : "You haven't added any buses to your fleet yet."}
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
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('ntcRegistrationNumber')}
              >
                <div className="flex items-center gap-2">
                  Registration Number
                  {getSortIcon('ntcRegistrationNumber')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('plateNumber')}
              >
                <div className="flex items-center gap-2">
                  Plate Number
                  {getSortIcon('plateNumber')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('model')}
              >
                <div className="flex items-center gap-2">
                  Model
                  {getSortIcon('model')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('capacity')}
              >
                <div className="flex items-center gap-2">
                  Capacity
                  {getSortIcon('capacity')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Route
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-2">
                  Added Date
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {buses.map((bus) => (
              <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bus className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {bus.ntcRegistrationNumber || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatFacilities(bus.facilities)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {bus.plateNumber || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{bus.model || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {bus.capacity ? `${bus.capacity} seats` : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bus.status)}`}>
                    {getStatusIcon(bus.status)}
                    {getStatusLabel(bus.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {bus.currentRoute ? (
                      <div className="flex items-center gap-1">
                        <span>{bus.currentRoute}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(bus.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {busPermits[bus.id] ? (
                    <button
                      onClick={() => setPermitModalBus({ id: bus.id, registration: bus.ntcRegistrationNumber })}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors"
                      title="View/manage permits"
                    >
                      <FileText className="w-3 h-3" />
                      {busPermits[bus.id]?.permitNumber || 'Unknown'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setPermitModalBus({ id: bus.id, registration: bus.ntcRegistrationNumber })}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-colors"
                      title="Assign permit"
                    >
                      <FileText className="w-3 h-3" />
                      Not assigned
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(bus.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(bus.id, bus.ntcRegistrationNumber)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                      title="Delete bus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && buses.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs text-blue-800">Updating fleet...</span>
          </div>
        </div>
      )}

      {permitModalBus && (
        <PermitManagementModal
          isOpen={!!permitModalBus}
          onClose={() => setPermitModalBus(null)}
          busId={permitModalBus.id}
          busRegistration={permitModalBus.registration}
          onChanged={onPermitsChanged}
        />
      )}
    </div>
  );
}