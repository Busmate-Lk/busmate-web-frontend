'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, RefreshCw, Trash2 } from 'lucide-react';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace';
import { formatTimeForDisplay } from '@/types/ScheduleWorkspaceData';
import { cn } from '@/lib/utils';

// Helper to get start time from schedule (first stop departure time)
const getScheduleStartTime = (schedule: { scheduleStops: { departureTime?: string }[] }): string => {
    const firstStop = schedule.scheduleStops[0];
    return firstStop?.departureTime || '--:--';
};

export default function ScheduleGrid() {
    const { 
        data, 
        updateScheduleStopByScheduleIndex,
        setActiveScheduleIndex,
        activeScheduleIndex,
        highlightedScheduleIndex,
        setHighlightedScheduleIndex,
    } = useScheduleWorkspace();
    const { schedules, routeStops, selectedRouteId } = data;

    const [editingCell, setEditingCell] = useState<{scheduleIndex: number, stopIndex: number, field: 'arrivalTime' | 'departureTime'} | null>(null);

    // Ref for highlighted column animation
    const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clear highlight after animation
    useEffect(() => {
        if (highlightedScheduleIndex !== null) {
            if (highlightTimeoutRef.current) {
                clearTimeout(highlightTimeoutRef.current);
            }
            highlightTimeoutRef.current = setTimeout(() => {
                setHighlightedScheduleIndex(null);
            }, 1500);
        }
        return () => {
            if (highlightTimeoutRef.current) {
                clearTimeout(highlightTimeoutRef.current);
            }
        };
    }, [highlightedScheduleIndex, setHighlightedScheduleIndex]);

    const handleTimeChange = (scheduleIndex: number, stopIndex: number, field: 'arrivalTime' | 'departureTime', value: string) => {
        updateScheduleStopByScheduleIndex(scheduleIndex, stopIndex, { [field]: value });
    };

    const handleCellClick = (scheduleIndex: number, stopIndex: number, field: 'arrivalTime' | 'departureTime') => {
        setEditingCell({ scheduleIndex, stopIndex, field });
    };

    const handleCellBlur = () => {
        setEditingCell(null);
    };

    const handleColumnHeaderDoubleClick = (scheduleIndex: number) => {
        setActiveScheduleIndex(scheduleIndex);
    };

    if (!selectedRouteId) {
        return (
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="mb-2 underline font-medium">Schedule Grid</span>
                <div className="bg-white rounded-md p-8 text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a Route</p>
                    <p className="text-sm mt-2">Choose a route above to view and edit schedules</p>
                </div>
            </div>
        );
    }

    if (routeStops.length === 0) {
        return (
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="mb-2 underline font-medium">Schedule Grid</span>
                <div className="bg-white rounded-md p-8 text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No Stops Available</p>
                    <p className="text-sm mt-2">This route has no stops defined</p>
                </div>
            </div>
        );
    }

    if (schedules.length === 0) {
        return (
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="mb-2 underline font-medium">Schedule Grid</span>
                <div className="bg-white rounded-md p-8 text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No Schedules</p>
                    <p className="text-sm mt-2">Add a schedule using the button above to start editing</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
            <div className="flex items-center justify-between mb-4">
                <span className="underline font-medium">
                    Schedule Grid
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <thead>
                        {/* First header row: Schedule names */}
                        <tr className="bg-gray-100">
                            <th className="px-3 py-2 border-b border-r border-gray-300 text-left text-xs font-semibold text-gray-600 w-10" rowSpan={2}>
                                #
                            </th>
                            <th className="px-4 py-2 border-b border-r border-gray-300 text-left text-xs font-semibold text-gray-600 min-w-[150px]" rowSpan={2}>
                                Stop Name
                            </th>
                            {schedules.map((schedule, scheduleIndex) => (
                                <th
                                    key={scheduleIndex}
                                    colSpan={2}
                                    onDoubleClick={() => handleColumnHeaderDoubleClick(scheduleIndex)}
                                    className={cn(
                                        'px-2 py-2 border-b border-r border-gray-300 text-center text-xs font-semibold cursor-pointer transition-all',
                                        activeScheduleIndex === scheduleIndex
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-gray-700 hover:bg-gray-200',
                                        highlightedScheduleIndex === scheduleIndex && 'animate-pulse bg-yellow-200'
                                    )}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-sm">
                                            {getScheduleStartTime(schedule)}
                                        </span>
                                        <span className="text-[10px] truncate max-w-[100px]" title={schedule.name}>
                                            {schedule.name || `Schedule ${scheduleIndex + 1}`}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                        {/* Second header row: Arr/Dep labels */}
                        <tr className="bg-gray-50">
                            {schedules.map((_, scheduleIndex) => (
                                <th
                                    key={`${scheduleIndex}-arr`}
                                    className={cn(
                                        'px-1 py-1 border-b border-gray-300 text-center text-[10px] font-medium w-[70px]',
                                        activeScheduleIndex === scheduleIndex && 'bg-primary/10',
                                        highlightedScheduleIndex === scheduleIndex && 'bg-yellow-100'
                                    )}
                                >
                                    Arr
                                </th>
                            )).flatMap((el, idx) => [
                                el,
                                <th
                                    key={`${idx}-dep`}
                                    className={cn(
                                        'px-1 py-1 border-b border-r border-gray-300 text-center text-[10px] font-medium w-[70px]',
                                        activeScheduleIndex === idx && 'bg-primary/10',
                                        highlightedScheduleIndex === idx && 'bg-yellow-100'
                                    )}
                                >
                                    Dep
                                </th>
                            ])}
                        </tr>
                    </thead>
                    <tbody>
                        {routeStops.map((stop, stopIndex) => {
                            const isFirst = stopIndex === 0;
                            const isLast = stopIndex === routeStops.length - 1;

                            return (
                                <tr 
                                    key={stop.id}
                                    className={cn(
                                        'transition-colors hover:bg-gray-50',
                                        isFirst && 'bg-green-50/50',
                                        isLast && 'bg-red-50/50'
                                    )}
                                >
                                    {/* Stop order */}
                                    <td className="px-3 py-1.5 border-b border-r border-gray-200 text-xs font-medium text-gray-600 text-center">
                                        {stopIndex + 1}
                                    </td>
                                    {/* Stop name */}
                                    <td className="px-4 py-1.5 border-b border-r border-gray-200">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium truncate">{stop.name}</span>
                                            {isFirst && (
                                                <span className="text-[10px] bg-green-500 text-white px-1 rounded flex-shrink-0">START</span>
                                            )}
                                            {isLast && (
                                                <span className="text-[10px] bg-red-500 text-white px-1 rounded flex-shrink-0">END</span>
                                            )}
                                        </div>
                                    </td>
                                    {/* Time cells for each schedule */}
                                    {schedules.map((schedule, scheduleIndex) => {
                                        const scheduleStop = schedule.scheduleStops[stopIndex];
                                        const isActive = activeScheduleIndex === scheduleIndex;
                                        const isHighlighted = highlightedScheduleIndex === scheduleIndex;

                                        const arrivalTime = scheduleStop?.arrivalTime || '';
                                        const departureTime = scheduleStop?.departureTime || '';

                                        const isEditingArr = editingCell?.scheduleIndex === scheduleIndex && 
                                                            editingCell?.stopIndex === stopIndex && 
                                                            editingCell?.field === 'arrivalTime';
                                        const isEditingDep = editingCell?.scheduleIndex === scheduleIndex && 
                                                            editingCell?.stopIndex === stopIndex && 
                                                            editingCell?.field === 'departureTime';

                                        return (
                                            <React.Fragment key={`${scheduleIndex}-${stopIndex}`}>
                                                {/* Arrival time */}
                                                <td
                                                    onClick={() => handleCellClick(scheduleIndex, stopIndex, 'arrivalTime')}
                                                    className={cn(
                                                        'px-1 py-1 border-b border-gray-200 text-center cursor-pointer',
                                                        isActive && 'bg-primary/5',
                                                        isHighlighted && 'bg-yellow-100 animate-pulse'
                                                    )}
                                                >
                                                    {isEditingArr ? (
                                                        <input
                                                            type="time"
                                                            value={formatTimeForDisplay(arrivalTime)}
                                                            onChange={(e) => handleTimeChange(scheduleIndex, stopIndex, 'arrivalTime', e.target.value)}
                                                            onBlur={handleCellBlur}
                                                            autoFocus
                                                            className="w-[65px] text-xs border border-blue-400 rounded px-1 py-0.5 text-center"
                                                        />
                                                    ) : (
                                                        <span className={cn(
                                                            'text-xs',
                                                            arrivalTime ? 'text-gray-800' : 'text-gray-300'
                                                        )}>
                                                            {arrivalTime ? formatTimeForDisplay(arrivalTime) : '--:--'}
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Departure time */}
                                                <td
                                                    key={`${scheduleIndex}-${stopIndex}-dep`}
                                                    onClick={() => handleCellClick(scheduleIndex, stopIndex, 'departureTime')}
                                                    className={cn(
                                                        'px-1 py-1 border-b border-r border-gray-200 text-center cursor-pointer',
                                                        isActive && 'bg-primary/5',
                                                        isHighlighted && 'bg-yellow-100 animate-pulse'
                                                    )}
                                                >
                                                    {isEditingDep ? (
                                                        <input
                                                            type="time"
                                                            value={formatTimeForDisplay(departureTime)}
                                                            onChange={(e) => handleTimeChange(scheduleIndex, stopIndex, 'departureTime', e.target.value)}
                                                            onBlur={handleCellBlur}
                                                            autoFocus
                                                            className="w-[65px] text-xs border border-blue-400 rounded px-1 py-0.5 text-center"
                                                        />
                                                    ) : (
                                                        <span className={cn(
                                                            'text-xs',
                                                            departureTime ? 'text-gray-800' : 'text-gray-300'
                                                        )}>
                                                            {departureTime ? formatTimeForDisplay(departureTime) : '--:--'}
                                                        </span>
                                                    )}
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}