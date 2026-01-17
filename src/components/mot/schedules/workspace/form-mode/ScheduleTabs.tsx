'use client';

import { useState } from 'react';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace';
import { cn } from '@/lib/utils';
import { Plus, Copy, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper to get start time from schedule (first stop departure time)
const getScheduleStartTime = (schedule: { scheduleStops: { departureTime?: string }[] }): string => {
    const firstStop = schedule.scheduleStops[0];
    return firstStop?.departureTime || '00:00';
};

export function ScheduleTabs() {
    const {
        data,
        activeScheduleIndex,
        setActiveScheduleIndex,
        setHighlightedScheduleIndex,
        addNewSchedule,
        removeSchedule,
        duplicateSchedule,
    } = useScheduleWorkspace();

    const { schedules, selectedRouteId } = data;
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

    const handleTabClick = (index: number) => {
        setActiveScheduleIndex(index);
        // Trigger highlight in grid
        setHighlightedScheduleIndex(index);
    };

    const handleAddSchedule = () => {
        addNewSchedule();
    };

    const handleDuplicateSchedule = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        duplicateSchedule(index);
    };

    const handleRemoveClick = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDeleteIndex(index);
    };

    const handleConfirmRemove = () => {
        if (confirmDeleteIndex !== null) {
            removeSchedule(confirmDeleteIndex);
            setConfirmDeleteIndex(null);
        }
    };

    const handleCancelRemove = () => {
        setConfirmDeleteIndex(null);
    };

    if (!selectedRouteId) {
        return (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground border-b">
                Select a route to view schedules
            </div>
        );
    }

    return (
        <div className="bg-gray-50 rounded-md">
            {/* Delete Confirmation Modal */}
            {confirmDeleteIndex !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
                        <h3 className="text-lg font-semibold mb-2">Remove Schedule</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to remove &quot;{schedules[confirmDeleteIndex]?.name || `Schedule ${confirmDeleteIndex + 1}`}&quot;?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCancelRemove}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleConfirmRemove}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Tabs Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300">
                <div className="text-md font-bold flex items-center gap-2">
                    Schedules <span className='bg-gray-400 w-6 h-6 text-sm rounded-full flex items-center justify-center text-white'>{schedules.length}</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSchedule}
                    className="h-7 gap-1"
                    title="Add a new schedule for this route"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Schedule
                </Button>
            </div>

            {/* Tabs Container with Horizontal Scroll */}
            <div className="flex gap-1 p-2 overflow-x-auto">
                {schedules.length === 0 ? (
                    <div className="flex items-center justify-center w-full py-3 text-sm text-gray-500">
                        No schedules. Click &quot;Add Schedule&quot; to create one.
                    </div>
                ) : (
                    schedules.map((schedule, index) => (
                        <div
                            key={index}
                            onClick={() => handleTabClick(index)}
                            className={cn(
                                'group relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors min-w-[160px]',
                                'border border-gray-300 hover:border-gray-400',
                                activeScheduleIndex === index
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white hover:bg-gray-100'
                            )}
                        >
                            {/* Schedule Time Badge */}
                            <div
                                className={cn(
                                    'flex items-center gap-1 text-xs font-medium',
                                    activeScheduleIndex === index
                                        ? 'text-blue-100'
                                        : 'text-gray-500'
                                )}
                            >
                                <Clock className="h-3 w-3" />
                                {getScheduleStartTime(schedule)}
                            </div>

                            {/* Schedule Name */}
                            <div className="flex-1 truncate text-sm font-medium">
                                {schedule.name || `Schedule ${index + 1}`}
                            </div>

                            {/* Actions (shown on hover or when active) */}
                            <div
                                className={cn(
                                    'flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
                                    activeScheduleIndex === index && 'opacity-100'
                                )}
                            >
                                <button
                                    onClick={(e) => handleDuplicateSchedule(index, e)}
                                    title="Duplicate this schedule"
                                    className={cn(
                                        'p-1 rounded hover:bg-white/20',
                                        activeScheduleIndex === index
                                            ? 'text-blue-100 hover:text-white'
                                            : 'text-gray-400 hover:text-gray-600'
                                    )}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </button>

                                {schedules.length > 1 && (
                                    <button
                                        onClick={(e) => handleRemoveClick(index, e)}
                                        title="Remove this schedule"
                                        className={cn(
                                            'p-1 rounded hover:bg-red-100',
                                            activeScheduleIndex === index
                                                ? 'text-blue-100 hover:text-red-500'
                                                : 'text-gray-400 hover:text-red-500'
                                        )}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}