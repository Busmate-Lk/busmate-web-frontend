'use client';

import React from 'react';
import { Plus, Download, Upload } from 'lucide-react';

interface RouteActionButtonsProps {
  onAddRoute: () => void;
  onExportAll: () => void;
  onImport?: () => void;
  isLoading?: boolean;
}

export function RouteActionButtons({
  onAddRoute,
  onExportAll,
  onImport,
  isLoading = false
}: RouteActionButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onAddRoute}
        disabled={isLoading}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Route</span>
        <span className="sm:hidden">Add</span>
      </button>
      
      {onImport && (
        <button
          onClick={onImport}
          disabled={isLoading}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import Routes</span>
          <span className="sm:hidden">Import</span>
        </button>
      )}
      
      <button
        onClick={onExportAll}
        disabled={isLoading}
        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export All</span>
        <span className="sm:hidden">Export</span>
      </button>
    </div>
  );
}