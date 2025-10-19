'use client';

import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Users
} from 'lucide-react';

interface TimekeeperTableData {
  id: string;
  fullname: string;
  phonenumber?: string;
  email?: string;
  assign_stand?: string; // can be "123 - Stand Name"
  nic?: string;
  province?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TimekeepersTableProps {
  timekeepers: TimekeeperTableData[];
  onView: (timekeeperId: string) => void;
  onEdit: (timekeeperId: string) => void;
  onDelete: (timekeeperId: string) => void;
  onSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  activeFilters: Record<string, any>;
  loading: boolean;
  currentSort: { field: string; direction: 'asc' | 'desc' };
}

export function TimekeepersTable({
  timekeepers,
  onView,
  onEdit,
  onDelete,
  onSort,
  activeFilters,
  loading,
  currentSort
}: TimekeepersTableProps) {
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
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive': return 'bg-red-50 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (loading && timekeepers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="p-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading timekeepers...</p>
        </div>
      </div>
    );
  }

  if (timekeepers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No timekeepers found</h3>
          <p className="text-gray-500 text-sm">
            {Object.keys(activeFilters).some(key => activeFilters[key])
              ? "No timekeepers match your current filters."
              : "No timekeepers have been created yet."}
          </p>
        </div>
      </div>
    );
  }

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
                { label: 'Created', field: 'createdAt' },
                { label: 'Updated', field: 'updatedAt' },
                { label: 'Actions' },
              ].map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider ${col.field ? 'cursor-pointer hover:bg-gray-100 transition' : ''}`}
                  onClick={col.field ? () => handleSort(col.field) : undefined}
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
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="font-medium text-gray-900">{tk.fullname || 'Unnamed'}</div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4 text-gray-700">
                  <div>{tk.phonenumber || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{tk.email || 'N/A'}</div>
                </td>

                {/* Stand & Province */}
                <td className="px-6 py-4">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                    {/* Only display the stand name, hide ID */}
                    {tk.assign_stand
                      ? tk.assign_stand.includes(' - ')
                        ? tk.assign_stand.split(' - ').slice(1).join(' - ')
                        : tk.assign_stand
                      : 'Unassigned'}
                  </div>
                  <div className="text-xs text-gray-500">{tk.province || 'N/A'}</div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(tk.status)}`}>
                    {getStatusIcon(tk.status)}
                    <span className="ml-1">{tk.status ? tk.status.charAt(0).toUpperCase() + tk.status.slice(1) : 'Unknown'}</span>
                  </span>
                </td>

                {/* Created */}
                <td className="px-6 py-4 text-gray-700">
                  <div>{formatDate(tk.createdAt)}</div>
                  <div className="text-xs text-gray-400">
                    {tk.createdAt && new Date(tk.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>

                {/* Updated */}
                <td className="px-6 py-4 text-gray-700">
                  <div>{formatDate(tk.updatedAt)}</div>
                  <div className="text-xs text-gray-400">
                    {tk.updatedAt && new Date(tk.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onView(tk.id)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => onEdit(tk.id)} className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(tk.id)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && timekeepers.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 flex items-center gap-2 text-blue-700 text-xs">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span>Updating...</span>
        </div>
      )}
    </div>
  );
}
