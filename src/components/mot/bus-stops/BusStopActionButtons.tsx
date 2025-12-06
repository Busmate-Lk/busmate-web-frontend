'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload, Download, FileText, CheckSquare, Settings } from 'lucide-react';

interface BusStopActionButtonsProps {
  onAddBusStop: () => void;
  onImportBusStops: () => void;
  onBulkOperations?: () => void;
  isLoading?: boolean;
  selectedCount?: number;
}

export function BusStopActionButtons({
  onAddBusStop,
  onImportBusStops,
  onBulkOperations,
  isLoading = false,
  selectedCount = 0
}: BusStopActionButtonsProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Primary Actions */}
      <div className="flex gap-3">
        <button
          onClick={onAddBusStop}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Bus Stop</span>
          <span className="sm:hidden">Add</span>
        </button>
        
        <button
          onClick={onImportBusStops}
          disabled={isLoading}
          className="flex items-center gap-2 border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-lg hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import Stops</span>
          <span className="sm:hidden">Import</span>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/mot/bus-stops/export')}
            disabled={isLoading}
            className="flex items-center gap-2 border border-blue-300 text-blue-700 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Stops</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

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