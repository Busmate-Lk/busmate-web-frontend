'use client';

import React from 'react';
import { Plus, Upload, Download, FileText, CheckSquare } from 'lucide-react';

interface ScheduleActionButtonsProps {
  onAddSchedule: () => void;
  onImportSchedules: () => void;
  onExportAll: () => void;
  onBulkOperations?: () => void;
  isLoading?: boolean;
  selectedCount?: number;
}

export function ScheduleActionButtons({
  onAddSchedule,
  onImportSchedules,
  onExportAll,
  onBulkOperations,
  isLoading = false,
  selectedCount = 0
}: ScheduleActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Primary Actions */}
      <div className="flex gap-3">
        {/* Fixme: This button will move to add and edit schedule buttons */}
        <button
          onClick={() => {
            // Navigate to the schedule workspace page
            window.location.href = '/mot/schedules/workspace';
          }}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          Workspace
        </button>

        <button
          onClick={onAddSchedule}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Schedule</span>
          <span className="sm:hidden">Add</span>
        </button>

        
        <button
          onClick={onImportSchedules}
          disabled={isLoading}
          className="flex items-center gap-2 border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-lg hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-3">
        <button
          onClick={onExportAll}
          disabled={isLoading}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export All</span>
          <span className="sm:hidden">Export</span>
        </button>

        {/* Bulk Operations - Only show when items are selected */}
        {selectedCount > 0 && onBulkOperations && (
          <button
            onClick={onBulkOperations}
            disabled={isLoading}
            className="flex items-center gap-2 border border-orange-300 text-orange-700 bg-orange-50 px-4 py-2 rounded-lg hover:bg-orange-100 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">
              Bulk Actions ({selectedCount})
            </span>
            <span className="sm:hidden">
              Actions ({selectedCount})
            </span>
          </button>
        )}
      </div>
    </div>
  );
}