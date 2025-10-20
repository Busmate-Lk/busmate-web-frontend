'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Users,
} from 'lucide-react';
import { BusStopManagementService } from '@/lib/api-client/route-management/services/BusStopManagementService';


// Types

interface Timekeeper {
  id: string;
  fullname: string;
  phonenumber?: string;
  email?: string;
  assign_stand?: string; // Bus stop ID
  nic?: string;
  province?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TimekeepersTableProps {
  timekeepers: Timekeeper[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  activeFilters: Record<string, any>;
  loading: boolean;
  currentSort: { field: string; direction: 'asc' | 'desc' };
}

// -----------------------------
// Component
// -----------------------------
export function TimekeepersTable({
  timekeepers,
  onView,
  onSort,
  activeFilters,
  loading,
  currentSort,
}: TimekeepersTableProps) {
  const [standNames, setStandNames] = useState<Record<string, string>>({});

  // -----------------------------
  // Load stand names for all unique stop IDs
  // -----------------------------
  useEffect(() => {
    const fetchStandNames = async () => {
      const stopIds = Array.from(
        new Set(timekeepers.map((t) => t.assign_stand).filter(Boolean))
      ) as string[];

      if (stopIds.length === 0) return;

      const namesMap: Record<string, string> = {};

      await Promise.all(
        stopIds.map(async (id) => {
          try {
            const stop = await BusStopManagementService.getStopById(id);
            namesMap[id] = stop.name || 'Unknown Stand';
          } catch {
            namesMap[id] = 'Unknown Stand';
          }
        })
      );

      setStandNames((prev) => ({ ...prev, ...namesMap }));
    };

    fetchStandNames();
  }, [timekeepers]);

  // -----------------------------
  // Helpers
  // -----------------------------
  const getSortIcon = (field: string) => {
    if (currentSort.field !== field)
      return <ChevronUp className="w-4 h-4 text-gray-300" />;

    return currentSort.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  const handleSort = (field: string) => {
    const newDirection =
      currentSort.field === field && currentSort.direction === 'asc'
        ? 'desc'
        : 'asc';
    onSort(field, newDirection);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // -----------------------------
  // UI States
  // -----------------------------
  if (loading && timekeepers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="p-10 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading timekeepers...</p>
        </div>
      </div>
    );
  }

  if (timekeepers.length === 0) {
    const hasFilters = Object.values(activeFilters).some(Boolean);
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No timekeepers found
          </h3>
          <p className="text-gray-500 text-sm">
            {hasFilters
              ? 'No timekeepers match your current filters.'
              : 'No timekeepers have been added yet.'}
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // Main Table
  // -----------------------------
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: 'Full Name', field: 'fullname' },
                { label: 'Contact' },
                { label: 'Stand & Province' },
                { label: 'Status' },
                { label: 'Actions' },
              ].map((col, idx) => (
                <th
                  key={idx}
                  onClick={col.field ? () => handleSort(col.field) : undefined}
                  className={`px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider ${
                    col.field
                      ? 'cursor-pointer hover:bg-gray-100 transition'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {col.field && getSortIcon(col.field)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {timekeepers.map((tk) => (
              <tr key={tk.id} className="hover:bg-blue-50/30 transition">
                {/* Full Name */}
                <td className="px-6 py-4 font-medium text-gray-900">
                  {tk.fullname || 'Unnamed'}
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4 text-gray-700">
                  <div>{tk.phonenumber || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{tk.email || 'N/A'}</div>
                </td>

                {/* Stand & Province */}
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-800">
                        {standNames[tk.assign_stand || ''] || 'Loading...'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tk.province || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                      tk.status
                    )}`}
                  >
                    {getStatusIcon(tk.status)}
                    <span className="ml-1 capitalize">
                      {tk.status || 'Unknown'}
                    </span>
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => onView(tk.id)}
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline loading indicator */}
      {loading && timekeepers.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 flex items-center gap-2 text-blue-700 text-xs">
          <div className="animate-spin h-3 w-3 border-b-2 border-blue-600 rounded-full" />
          <span>Updating data...</span>
        </div>
      )}
    </div>
  );
}
