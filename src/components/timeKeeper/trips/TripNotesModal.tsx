'use client';

import React, { useState } from 'react';
import { X, AlertCircle, FileText, Save } from 'lucide-react';
import { TripResponse } from '@/lib/api-client/route-management';

interface TripNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripResponse;
  onConfirm: (tripId: string, notes: string) => Promise<void>;
}

export function TripNotesModal({
  isOpen,
  onClose,
  trip,
  onConfirm,
}: TripNotesModalProps) {
  const [notes, setNotes] = useState(trip.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await onConfirm(trip.id!, notes);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update trip notes');
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

  const characterCount = notes.length;
  const maxCharacters = 500;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {trip.notes ? 'Edit Trip Notes' : 'Add Trip Notes'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Add or update notes for this trip
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
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium text-gray-900 capitalize">
                  {trip.status || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Operator:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {trip.operatorName || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any important notes about this trip (e.g., delays, issues, observations)..."
              rows={8}
              maxLength={maxCharacters}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {notes
                  ? 'You can edit or add more information'
                  : 'No notes yet'}
              </span>
              <span
                className={`font-medium ${
                  characterCount > maxCharacters * 0.9
                    ? 'text-orange-600'
                    : 'text-gray-500'
                }`}
              >
                {characterCount} / {maxCharacters}
              </span>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Tips for effective notes:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Record any delays and their reasons</li>
              <li>Note any bus maintenance issues observed</li>
              <li>Document passenger-related incidents</li>
              <li>Mention weather conditions affecting the trip</li>
              <li>Record any route deviations or changes</li>
            </ul>
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
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Save className="w-4 h-4 animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Notes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
