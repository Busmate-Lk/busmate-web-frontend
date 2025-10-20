'use client';

import React, { useState } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import { TripResponse } from '@/lib/api-client/route-management';

interface TripStatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripResponse;
  onConfirm: (
    tripId: string,
    newStatus: string,
    reason?: string
  ) => Promise<void>;
}

const STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  {
    value: 'active',
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    value: 'in_transit',
    label: 'In Transit',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    value: 'boarding',
    label: 'Boarding',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    value: 'departed',
    label: 'Departed',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    value: 'completed',
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  {
    value: 'delayed',
    label: 'Delayed',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
];

export function TripStatusChangeModal({
  isOpen,
  onClose,
  trip,
  onConfirm,
}: TripStatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(
    trip.status || 'pending'
  );
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedStatus === trip.status) {
      setError('Please select a different status');
      return;
    }

    // Require reason for certain status changes
    if (
      (selectedStatus === 'cancelled' || selectedStatus === 'delayed') &&
      !reason.trim()
    ) {
      setError('Please provide a reason for this status change');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(trip.id!, selectedStatus, reason || undefined);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update trip status');
    } finally {
      setIsSubmitting(false);
    }
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

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    try {
      const timePart = timeString.includes('T')
        ? timeString.split('T')[1]
        : timeString;
      const [hours, minutes] = timePart.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return 'Invalid time';
    }
  };

  const currentStatusOption = STATUS_OPTIONS.find(
    (opt) => opt.value === trip.status
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Change Trip Status
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Update the status of this trip
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trip Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">
              Trip Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Route:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {trip.routeName || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatDate(trip.tripDate)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Departure:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatTime(trip.scheduledDepartureTime)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Bus:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {trip.busPlateNumber || 'Not assigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div className="flex items-center">
              <span
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  currentStatusOption?.color ||
                  'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                {currentStatusOption?.label || trip.status || 'Unknown'}
              </span>
            </div>
          </div>

          {/* New Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedStatus(option.value)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all ${
                    selectedStatus === option.value
                      ? `${option.color} ring-2 ring-offset-2 ring-blue-500`
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                  disabled={option.value === trip.status}
                >
                  {option.label}
                  {option.value === trip.status && (
                    <span className="ml-2 text-xs">(Current)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reason (Required for cancelled/delayed) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason{' '}
              {(selectedStatus === 'cancelled' ||
                selectedStatus === 'delayed') && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                selectedStatus === 'cancelled' || selectedStatus === 'delayed'
                  ? 'Required: Provide a reason for this status change'
                  : 'Optional: Add a reason for this status change'
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSubmitting || selectedStatus === trip.status}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Status</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
