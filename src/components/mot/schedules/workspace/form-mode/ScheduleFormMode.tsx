'use client';

import { useState } from 'react';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace/useScheduleWorkspace';
import { useToast } from '@/hooks/use-toast';
import ScheduleInfo from './ScheduleInfo';
import TimetableGrid from './TimetableGrid';
import TripLineDiagram from './TripLineDiagram';
import { 
  Plus, 
  Copy, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  LayoutGrid,
  GitBranch
} from 'lucide-react';
import { getScheduleIdentificationTag } from '@/types/ScheduleWorkspaceData';

export default function ScheduleFormMode() {
  const { 
    data, 
    route,
    activeScheduleIndex, 
    setActiveSchedule,
    addSchedule,
    duplicateSchedule,
    removeSchedule,
  } = useScheduleWorkspace();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'diagram'>('split');

  const activeSchedule = activeScheduleIndex >= 0 ? data.schedules[activeScheduleIndex] : null;

  const handleAddSchedule = () => {
    addSchedule();
    toast({
      title: 'Schedule Added',
      description: 'A new schedule has been added to the workspace',
    });
  };

  const handleDuplicateSchedule = (index: number) => {
    duplicateSchedule(index);
    toast({
      title: 'Schedule Duplicated',
      description: 'Schedule has been duplicated',
    });
  };

  const handleRemoveSchedule = (index: number) => {
    if (data.schedules.length <= 1) {
      toast({
        title: 'Cannot Remove',
        description: 'At least one schedule must remain in the workspace',
        variant: 'destructive',
      });
      return;
    }
    
    removeSchedule(index);
    toast({
      title: 'Schedule Removed',
      description: 'Schedule has been removed from the workspace',
    });
  };

  const navigateSchedule = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && activeScheduleIndex > 0) {
      setActiveSchedule(activeScheduleIndex - 1);
    } else if (direction === 'next' && activeScheduleIndex < data.schedules.length - 1) {
      setActiveSchedule(activeScheduleIndex + 1);
    }
  };

  if (!route) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Please select a route first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Route info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">{route.name}</h3>
              <p className="text-sm text-blue-700">
                {route.routeNumber && `Route #${route.routeNumber} • `}
                {route.routeGroupName && `${route.routeGroupName} • `}
                {route.direction && `${route.direction} • `}
                {route.routeStops.length} stops
                {route.distanceKm && ` • ${route.distanceKm.toFixed(1)} km`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule tabs and controls */}
      <div className="bg-white border rounded-lg">
        <div className="flex items-center justify-between border-b px-4 py-2">
          {/* Schedule navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateSchedule('prev')}
              disabled={activeScheduleIndex <= 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous schedule"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Schedule tabs */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-[600px]">
              {data.schedules.map((schedule, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSchedule(index)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    index === activeScheduleIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {schedule.name || `Schedule ${index + 1}`}
                    {schedule.isNew && (
                      <span className="ml-1 px-1 py-0.5 bg-green-500 text-white text-xs rounded">New</span>
                    )}
                    {schedule.isDirty && !schedule.isNew && (
                      <span className="ml-1 w-2 h-2 bg-yellow-500 rounded-full" title="Modified"></span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => navigateSchedule('next')}
              disabled={activeScheduleIndex >= data.schedules.length - 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next schedule"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* View mode toggles */}
            <div className="flex items-center border rounded-md mr-4">
              <button
                onClick={() => setViewMode('split')}
                className={`p-2 ${viewMode === 'split' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Split view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Grid only"
              >
                <Clock className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('diagram')}
                className={`p-2 ${viewMode === 'diagram' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Diagram only"
              >
                <GitBranch className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddSchedule}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Schedule
            </button>
            
            {activeSchedule && (
              <>
                <button
                  onClick={() => handleDuplicateSchedule(activeScheduleIndex)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                  title="Duplicate schedule"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRemoveSchedule(activeScheduleIndex)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                  title="Remove schedule"
                  disabled={data.schedules.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Active schedule content */}
        {activeSchedule ? (
          <div className="p-4 space-y-4">
            {/* Schedule metadata */}
            <ScheduleInfo scheduleIndex={activeScheduleIndex} />
            
            {/* Schedule identification tag */}
            <div className="text-sm text-gray-500">
              {getScheduleIdentificationTag(activeSchedule)}
            </div>

            {/* Timetable and diagram */}
            <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {(viewMode === 'split' || viewMode === 'grid') && (
                <div className={viewMode === 'grid' ? 'col-span-1' : ''}>
                  <TimetableGrid scheduleIndex={activeScheduleIndex} />
                </div>
              )}
              {(viewMode === 'split' || viewMode === 'diagram') && (
                <div className={viewMode === 'diagram' ? 'col-span-1' : ''}>
                  <TripLineDiagram scheduleIndex={activeScheduleIndex} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Calendar className="h-12 w-12 mb-4 text-gray-300" />
            <p>No schedules in workspace</p>
            <button
              onClick={handleAddSchedule}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add First Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
