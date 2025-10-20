'use client';

import React from 'react';
import { Plus, CheckSquare, Loader2 } from 'lucide-react';

interface TimekeeperActionButtonsProps {
  onAddTimekeeper: () => void;
  onBulkOperations?: () => void;
  isLoading?: boolean;
  selectedCount?: number;
}

export function TimekeeperActionButtons({
  onAddTimekeeper,
  onBulkOperations,
  isLoading = false,
  selectedCount = 0,
}: TimekeeperActionButtonsProps) {
  // primary blue used in the screenshot
  const primaryBlue = '#2166FF';
  const primaryShadow = '0 6px 18px rgba(33,102,255,0.24)';

  const btnBase =
    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
      {/* Primary Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={onAddTimekeeper}
          disabled={isLoading}
          className={btnBase}
          style={{
            backgroundColor: primaryBlue,
            boxShadow: primaryShadow,
          }}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Timekeeper</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Bulk Actions (only visible when items are selected) */}
      {selectedCount > 0 && onBulkOperations && (
        <div className="flex gap-3 flex-wrap mt-2 sm:mt-0">
          <button
            onClick={onBulkOperations}
            disabled={isLoading}
            className={btnBase}
            style={{
              backgroundColor: primaryBlue,
              boxShadow: primaryShadow,
            }}
          >
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Actions ({selectedCount})</span>
            <span className="sm:hidden">Actions ({selectedCount})</span>
          </button>
        </div>
      )}
    </div>
  );
}
