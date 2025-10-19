'use client';

import { Calendar, Eye, MapPin } from 'lucide-react';
import type { TimeKeeperWorkspaceState } from '../TimeKeeperTripAssignmentWorkspace';

interface TimeKeeperWorkspaceHeaderProps {
  workspace: TimeKeeperWorkspaceState;
  activeSection: 'assignments' | 'monitoring';
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export function TimeKeeperWorkspaceHeader({
  workspace,
  activeSection,
  onDateRangeChange,
}: TimeKeeperWorkspaceHeaderProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    onDateRangeChange(newStartDate, workspace.selectedDateRange.endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    onDateRangeChange(workspace.selectedDateRange.startDate, newEndDate);
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'assignments':
        return 'Trip Assignment Management';
      case 'monitoring':
        return 'Trip Monitoring Dashboard';
      default:
        return 'TimeKeeper Workspace';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'assignments':
        return 'Manage and reassign buses for trips starting from your bus stop';
      case 'monitoring':
        return 'Monitor trips passing through your assigned bus stop';
      default:
        return 'Manage trips at your assigned bus stop';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Description */}
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              {activeSection === 'assignments' && (
                <Calendar className="h-5 w-5 text-indigo-600" />
              )}
              {activeSection === 'monitoring' && (
                <Eye className="h-5 w-5 text-indigo-600" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {getSectionTitle()}
              </h1>
              <p className="text-sm text-gray-600">{getSectionDescription()}</p>
            </div>
          </div>
        </div>

        {/* Right Section - Bus Stop Info and Date Range */}
        <div className="flex items-center space-x-4">
          {/* Assigned Bus Stop Badge */}
          {workspace.assignedBusStopName && (
            <div className="flex items-center space-x-2 bg-indigo-50 rounded-lg px-4 py-2 border border-indigo-200">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <div className="text-sm">
                <span className="text-gray-600 font-medium">
                  Assigned Stop:
                </span>
                <span className="ml-1 text-indigo-900 font-semibold">
                  {workspace.assignedBusStopName}
                </span>
              </div>
            </div>
          )}

          {/* Date Range Selector */}
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div className="flex items-center space-x-1">
              <input
                type="date"
                value={
                  workspace.selectedDateRange.startDate
                    .toISOString()
                    .split('T')[0]
                }
                onChange={handleStartDateChange}
                className="text-sm border-none bg-transparent focus:outline-none focus:ring-0"
              />
              <span className="text-gray-400">–</span>
              <input
                type="date"
                value={
                  workspace.selectedDateRange.endDate
                    .toISOString()
                    .split('T')[0]
                }
                onChange={handleEndDateChange}
                className="text-sm border-none bg-transparent focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {workspace.trips.length}
              </div>
              <div className="text-xs text-gray-600">Trips</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {
                  workspace.trips.filter((t) => t.passengerServicePermitId)
                    .length
                }
              </div>
              <div className="text-xs text-gray-600">Assigned</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {
                  workspace.trips.filter((t) => !t.passengerServicePermitId)
                    .length
                }
              </div>
              <div className="text-xs text-gray-600">Unassigned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
