'use client';

import { useState } from 'react';
import { Clock, RefreshCw, Trash2 } from 'lucide-react';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace';
import { formatTimeForDisplay } from '@/types/ScheduleWorkspaceData';

export default function ScheduleGrid() {
    const { data, updateScheduleStop, setAllStopTimes, clearAllStopTimes, selectedStopIndex, setSelectedStopIndex } = useScheduleWorkspace();
    const { schedule } = data;
    const { scheduleStops } = schedule;

    const [baseTime, setBaseTime] = useState('06:00');
    const [intervalMinutes, setIntervalMinutes] = useState(10);

    const handleTimeChange = (stopIndex: number, field: 'arrivalTime' | 'departureTime', value: string) => {
        updateScheduleStop(stopIndex, { [field]: value });
    };

    const handleAutoFillTimes = () => {
        if (baseTime) {
            setAllStopTimes(baseTime, intervalMinutes);
        }
    };

    const handleStopClick = (index: number) => {
        setSelectedStopIndex(selectedStopIndex === index ? null : index);
    };

    if (scheduleStops.length === 0) {
        return (
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="mb-2 underline font-medium">Schedule Grid</span>
                <div className="bg-white rounded-md p-8 text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No stops to display</p>
                    <p className="text-sm mt-2">Select a route above to load stops for scheduling</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
            <div className="flex items-center justify-between mb-4">
                <span className="underline font-medium">Schedule Grid ({scheduleStops.length} stops)</span>
                
                {/* Auto-fill controls */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Start Time:</label>
                        <input
                            type="time"
                            value={baseTime}
                            onChange={(e) => setBaseTime(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Interval (min):</label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={intervalMinutes}
                            onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                            className="text-sm border border-gray-300 rounded px-2 py-1 w-16"
                        />
                    </div>
                    <button
                        onClick={handleAutoFillTimes}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                        <RefreshCw size={14} />
                        Auto-Fill
                    </button>
                    <button
                        onClick={clearAllStopTimes}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                        <Trash2 size={14} />
                        Clear All
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border-b border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                                #
                            </th>
                            <th className="px-4 py-2 border-b border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Stop Name
                            </th>
                            <th className="px-4 py-2 border-b border-gray-300 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                                Arrival Time
                            </th>
                            <th className="px-4 py-2 border-b border-gray-300 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                                Departure Time
                            </th>
                            <th className="px-4 py-2 border-b border-gray-300 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                                Dwell (min)
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {scheduleStops.map((stop, index) => {
                            const isSelected = selectedStopIndex === index;
                            const isFirst = index === 0;
                            const isLast = index === scheduleStops.length - 1;
                            
                            // Calculate dwell time
                            let dwellMinutes = 0;
                            if (stop.arrivalTime && stop.departureTime) {
                                const [arrHours, arrMins] = stop.arrivalTime.split(':').map(Number);
                                const [depHours, depMins] = stop.departureTime.split(':').map(Number);
                                dwellMinutes = (depHours * 60 + depMins) - (arrHours * 60 + arrMins);
                            }

                            return (
                                <tr 
                                    key={stop.stopId || index}
                                    onClick={() => handleStopClick(index)}
                                    className={`cursor-pointer transition-colors ${
                                        isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'
                                    } ${isFirst ? 'bg-green-50' : ''} ${isLast ? 'bg-red-50' : ''}`}
                                >
                                    <td className="px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-600">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{stop.stopName || 'Unknown Stop'}</span>
                                            {isFirst && (
                                                <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">START</span>
                                            )}
                                            {isLast && (
                                                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">END</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                                        <input
                                            type="time"
                                            value={formatTimeForDisplay(stop.arrivalTime || '')}
                                            onChange={(e) => handleTimeChange(index, 'arrivalTime', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-sm border border-gray-300 rounded px-2 py-1 w-24 text-center"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                                        <input
                                            type="time"
                                            value={formatTimeForDisplay(stop.departureTime || '')}
                                            onChange={(e) => handleTimeChange(index, 'departureTime', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-sm border border-gray-300 rounded px-2 py-1 w-24 text-center"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200 text-center text-sm text-gray-600">
                                        {dwellMinutes > 0 ? `${dwellMinutes} min` : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex gap-4">
                    <span>
                        <strong>First departure:</strong> {scheduleStops[0]?.departureTime ? formatTimeForDisplay(scheduleStops[0].departureTime) : 'Not set'}
                    </span>
                    <span>
                        <strong>Last arrival:</strong> {scheduleStops[scheduleStops.length - 1]?.arrivalTime ? formatTimeForDisplay(scheduleStops[scheduleStops.length - 1].arrivalTime!) : 'Not set'}
                    </span>
                </div>
                <div>
                    {scheduleStops.filter(s => s.arrivalTime || s.departureTime).length} / {scheduleStops.length} stops with timing
                </div>
            </div>
        </div>
    );
}