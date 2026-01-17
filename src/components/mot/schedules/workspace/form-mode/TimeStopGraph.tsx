'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace';
import { Schedule, RouteStopReference } from '@/types/ScheduleWorkspaceData';
import { Clock, ZoomIn, ZoomOut, Move, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Color palette for schedules
const SCHEDULE_COLORS = [
    '#2563eb', // blue-600
    '#dc2626', // red-600
    '#16a34a', // green-600
    '#9333ea', // purple-600
    '#ea580c', // orange-600
    '#0891b2', // cyan-600
    '#c026d3', // fuchsia-600
    '#65a30d', // lime-600
    '#e11d48', // rose-600
    '#0d9488', // teal-600
    '#7c3aed', // violet-600
    '#ca8a04', // yellow-600
];

interface Point {
    x: number;
    y: number;
    time: string;
    stopName: string;
    stopIndex: number;
    scheduleIndex: number;
    scheduleName: string;
}

interface TooltipData {
    visible: boolean;
    x: number;
    y: number;
    stopName: string;
    time: string;
    scheduleName: string;
    color: string;
}

// Convert time string (HH:mm or HH:mm:ss) to minutes from midnight
function timeToMinutes(time: string | undefined): number | null {
    if (!time) return null;
    const parts = time.split(':');
    if (parts.length < 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
}

// Format minutes to HH:mm (handles times beyond 24 hours)
function minutesToTime(minutes: number): string {
    const totalHours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);
    
    if (days > 0) {
        // Show day indicator for multi-day schedules
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}+${days}d`;
    }
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Adjust times to handle midnight crossings
// Returns adjusted time values where times after midnight are shifted to continue the sequence
function adjustTimesForMidnightCrossing(times: (number | null)[]): number[] {
    const adjusted: number[] = [];
    let dayOffset = 0;
    
    for (let i = 0; i < times.length; i++) {
        const time = times[i];
        if (time === null) continue;
        
        // If current time is significantly less than previous time, we likely crossed midnight
        if (i > 0 && adjusted.length > 0) {
            const prevTime = adjusted[adjusted.length - 1] % 1440; // Get time within current day
            // If time decreased by more than 12 hours, assume midnight crossing
            if (time < prevTime && (prevTime - time) > 720) {
                dayOffset += 1440; // Add 24 hours
            }
        }
        
        // adjusted.push(time + dayOffset);
        adjusted[i] = time + dayOffset;
    }
    
    return adjusted;
}

// Get display time for a stop (departure for all except last, arrival for last)
function getDisplayTime(stop: { arrivalTime?: string; departureTime?: string }, isLastStop: boolean): string | undefined {
    if (isLastStop) {
        return stop.arrivalTime || stop.departureTime;
    }
    return stop.departureTime || stop.arrivalTime;
}

export default function TimeStopGraph() {
    const { data, setActiveScheduleIndex, activeScheduleIndex, setHighlightedScheduleIndex } = useScheduleWorkspace();
    const { schedules, routeStops, selectedRouteId } = data;

    // SVG container ref
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Dimensions
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
    
    // Pan and zoom state
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    
    // Tooltip state
    const [tooltip, setTooltip] = useState<TooltipData>({
        visible: false,
        x: 0,
        y: 0,
        stopName: '',
        time: '',
        scheduleName: '',
        color: '',
    });

    // Schedule visibility state
    const [visibleSchedules, setVisibleSchedules] = useState<Set<number>>(new Set());

    // Initialize visible schedules when schedules change
    useEffect(() => {
        setVisibleSchedules(new Set(schedules.map((_, i) => i)));
    }, [schedules.length]);

    // Chart margins and dimensions
    const margin = { top: 60, right: 200, bottom: 60, left: 180 };
    const chartWidth = containerSize.width - margin.left - margin.right;
    const chartHeight = containerSize.height - margin.top - margin.bottom;

    // Resize observer for responsive sizing
    useEffect(() => {
        const container = svgContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setContainerSize({
                    width: Math.max(600, width),
                    height: Math.max(400, Math.min(height, 700)),
                });
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    // Calculate time range from all schedules
    const { minTime, maxTime, timeRange } = useMemo(() => {
        let min = Infinity;
        let max = -Infinity;

        schedules.forEach((schedule) => {
            // Extract all times for this schedule
            const scheduleTimes = schedule.scheduleStops.map((stop, idx) => {
                const isLast = idx === schedule.scheduleStops.length - 1;
                const time = getDisplayTime(stop, isLast);
                return timeToMinutes(time);
            });

            // Adjust for midnight crossings
            const adjustedTimes = adjustTimesForMidnightCrossing(scheduleTimes);

            // Update min/max with adjusted times
            adjustedTimes.forEach((time) => {
                min = Math.min(min, time);
                max = Math.max(max, time);
            });
        });

        // Add padding to time range
        const padding = 30; // 30 minutes padding
        min = min === Infinity ? 0 : Math.max(0, min - padding);
        max = max === -Infinity ? 24 * 60 : max + padding;

        return { minTime: min, maxTime: max, timeRange: max - min };
    }, [schedules]);

    // Scale functions
    const xScale = useCallback((minutes: number): number => {
        if (timeRange <= 0) return margin.left;
        return margin.left + ((minutes - minTime) / timeRange) * chartWidth;
    }, [minTime, timeRange, chartWidth, margin.left]);

    const yScale = useCallback((stopIndex: number): number => {
        if (routeStops.length <= 1) return margin.top;
        return margin.top + (stopIndex / (routeStops.length - 1)) * chartHeight;
    }, [routeStops.length, chartHeight, margin.top]);

    // Generate points for each schedule
    const schedulePoints = useMemo(() => {
        return schedules.map((schedule, scheduleIndex) => {
            const points: Point[] = [];
            
            // Extract all times first
            const scheduleTimes = schedule.scheduleStops.map((stop, idx) => {
                const isLast = idx === schedule.scheduleStops.length - 1;
                const time = getDisplayTime(stop, isLast);
                return timeToMinutes(time);
            });

            // Adjust for midnight crossings
            const adjustedTimes = adjustTimesForMidnightCrossing(scheduleTimes);

            // Create points with adjusted times, matching stops by stopId
            schedule.scheduleStops.forEach((scheduleStop, arrayIndex) => {
                const adjustedMinutes = adjustedTimes[arrayIndex];
                if (adjustedMinutes !== undefined) {
                    const isLast = arrayIndex === schedule.scheduleStops.length - 1;
                    const originalTime = getDisplayTime(scheduleStop, isLast);
                    
                    // Find the matching route stop by stopId (primary) or stopOrder (fallback)
                    const routeStopIndex = routeStops.findIndex(
                        rs => rs.id === scheduleStop.stopId || rs.stopOrder === scheduleStop.stopOrder
                    );
                    
                    // Skip if s1top not found in route
                    if (routeStopIndex === -1) {
                        console.warn(`Schedule stop ${scheduleStop.stopName} (ID: ${scheduleStop.stopId}) not found in route stops`);
                        return;
                    }
1
                    const matchingRouteStop = routeStops[routeStopIndex];
                    const stopName = scheduleStop.stopName || matchingRouteStop?.name || `Stop ${routeStopIndex + 1}`;
                    
                    points.push({
                        x: xScale(adjustedMinutes),
                        y: yScale(routeStopIndex), // Use routeStops array index for Y position
                        time: originalTime || '',
                        stopName: stopName,
                        stopIndex: routeStopIndex, // Use route stop array index
                        scheduleIndex,
                        scheduleName: schedule.name || `Schedule ${scheduleIndex + 1}`,
                    });
                }
            });
            
            return points;
        });
    }, [schedules, routeStops, xScale, yScale]);

    // Generate time axis ticks
    const timeAxisTicks = useMemo(() => {
        const ticks: number[] = [];
        // Round to nearest 30 minutes
        const start = Math.ceil(minTime / 30) * 30;
        const end = Math.floor(maxTime / 30) * 30;
        for (let t = start; t <= end; t += 30) {
            ticks.push(t);
        }
        return ticks;
    }, [minTime, maxTime]);

    // Event handlers for pan and zoom
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
        }
    }, [transform]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            setTransform(prev => ({
                ...prev,
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            }));
        }
    }, [isPanning, panStart]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsPanning(false);
        setTooltip(prev => ({ ...prev, visible: false }));
    }, []);

    // Wheel event handler
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(5, Math.max(0.5, transform.scale * delta));
        
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
            const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);
            
            setTransform({ x: newX, y: newY, scale: newScale });
        }
    }, [transform]);

    // Add non-passive wheel event listener
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        svg.addEventListener('wheel', handleWheel, { passive: false });
        return () => svg.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    // Zoom controls
    const handleZoomIn = () => {
        setTransform(prev => ({
            ...prev,
            scale: Math.min(5, prev.scale * 1.2),
        }));
    };

    const handleZoomOut = () => {
        setTransform(prev => ({
            ...prev,
            scale: Math.max(0.5, prev.scale / 1.2),
        }));
    };

    const handleResetView = () => {
        setTransform({ x: 0, y: 0, scale: 1 });
    };

    // Toggle schedule visibility
    const toggleScheduleVisibility = (index: number) => {
        setVisibleSchedules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Show all/hide all
    const showAllSchedules = () => {
        setVisibleSchedules(new Set(schedules.map((_, i) => i)));
    };

    const hideAllSchedules = () => {
        setVisibleSchedules(new Set());
    };

    // Handle point hover
    const handlePointMouseEnter = (point: Point, color: string, e: React.MouseEvent) => {
        const rect = svgContainerRef.current?.getBoundingClientRect();
        if (rect) {
            setTooltip({
                visible: true,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                stopName: point.stopName,
                time: point.time,
                scheduleName: point.scheduleName,
                color,
            });
        }
    };

    const handlePointMouseLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    // Handle schedule line click
    const handleScheduleClick = (scheduleIndex: number) => {
        setActiveScheduleIndex(scheduleIndex);
        setHighlightedScheduleIndex(scheduleIndex);
    };

    // Render empty states
    if (!selectedRouteId) {
        return (
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="mb-2 underline font-medium">Time-Stop Graph</span>
                <div className="bg-white rounded-md p-8 text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a Route</p>
                    <p className="text-sm mt-2">Choose a route above to view the time-stop graph</p>
                </div>
            </div>
        );
    }

    if (routeStops.length === 0) {
        return (
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="mb-2 underline font-medium">Time-Stop Graph</span>
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
                <span className="mb-2 underline font-medium">Time-Stop Graph</span>
                <div className="bg-white rounded-md p-8 text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No Schedules</p>
                    <p className="text-sm mt-2">Add a schedule to see the time-stop visualization</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
            <div className="flex items-center justify-between mb-4">
                <span className="underline font-medium">
                    Time-Stop Graph ({routeStops.length} stops × {schedules.length} schedules)
                </span>
                
                {/* Zoom controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomIn}
                        className="p-2 bg-white rounded-md hover:bg-gray-100 transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-2 bg-white rounded-md hover:bg-gray-100 transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleResetView}
                        className="p-2 bg-white rounded-md hover:bg-gray-100 transition-colors"
                        title="Reset View"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Move className="h-3 w-3" /> Drag to pan, scroll to zoom
                    </span>
                </div>
            </div>

            <div className="flex gap-4">
                {/* Main graph area */}
                <div
                    ref={svgContainerRef}
                    className="flex-1 bg-white rounded-md overflow-hidden relative"
                    style={{ height: '600px', cursor: isPanning ? 'grabbing' : 'grab' }}
                >
                    <svg
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        style={{ touchAction: 'none' }}
                    >
                        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
                            {/* Grid lines - Vertical (time) */}
                            {timeAxisTicks.map((tick) => (
                                <line
                                    key={`vgrid-${tick}`}
                                    x1={xScale(tick)}
                                    y1={margin.top}
                                    x2={xScale(tick)}
                                    y2={margin.top + chartHeight}
                                    stroke="#e5e7eb"
                                    strokeWidth={1 / transform.scale}
                                />
                            ))}

                            {/* Grid lines - Horizontal (stops) */}
                            {routeStops.map((_, index) => (
                                <line
                                    key={`hgrid-${index}`}
                                    x1={margin.left}
                                    y1={yScale(index)}
                                    x2={margin.left + chartWidth}
                                    y2={yScale(index)}
                                    stroke="#e5e7eb"
                                    strokeWidth={1 / transform.scale}
                                />
                            ))}

                            {/* Y-Axis labels (Stop names) */}
                            {routeStops.map((stop, index) => (
                                <g key={`ylabel-${index}`}>
                                    <text
                                        x={margin.left - 10}
                                        y={yScale(index)}
                                        textAnchor="end"
                                        dominantBaseline="middle"
                                        fontSize={11 / transform.scale}
                                        fill="#374151"
                                        className="select-none"
                                    >
                                        {stop.name.length > 20 
                                            ? stop.name.substring(0, 20) + '...' 
                                            : stop.name}
                                    </text>
                                    {/* Stop order indicator */}
                                    <circle
                                        cx={margin.left - 5}
                                        cy={yScale(index)}
                                        r={3 / transform.scale}
                                        fill={index === 0 ? '#16a34a' : index === routeStops.length - 1 ? '#dc2626' : '#9ca3af'}
                                    />
                                </g>
                            ))}

                            {/* X-Axis labels (Time) */}
                            {timeAxisTicks.map((tick) => (
                                <g key={`xlabel-${tick}`}>
                                    <text
                                        x={xScale(tick)}
                                        y={margin.top + chartHeight + 20}
                                        textAnchor="middle"
                                        fontSize={10 / transform.scale}
                                        fill="#6b7280"
                                        className="select-none"
                                    >
                                        {minutesToTime(tick)}
                                    </text>
                                </g>
                            ))}

                            {/* X-Axis title */}
                            <text
                                x={margin.left + chartWidth / 2}
                                y={margin.top + chartHeight + 45}
                                textAnchor="middle"
                                fontSize={12 / transform.scale}
                                fill="#374151"
                                fontWeight="500"
                                className="select-none"
                            >
                                Time
                            </text>

                            {/* Y-Axis title */}
                            <text
                                x={20}
                                y={margin.top + chartHeight / 2}
                                textAnchor="middle"
                                fontSize={12 / transform.scale}
                                fill="#374151"
                                fontWeight="500"
                                transform={`rotate(-90, 20, ${margin.top + chartHeight / 2})`}
                                className="select-none"
                            >
                                Stops
                            </text>

                            {/* Schedule lines and points */}
                            {schedulePoints.map((points, scheduleIndex) => {
                                if (!visibleSchedules.has(scheduleIndex)) return null;
                                
                                const color = SCHEDULE_COLORS[scheduleIndex % SCHEDULE_COLORS.length];
                                const isActive = activeScheduleIndex === scheduleIndex;
                                
                                // Build path
                                const pathD = points
                                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                                    .join(' ');

                                return (
                                    <g key={`schedule-${scheduleIndex}`}>
                                        {/* Schedule line */}
                                        {points.length > 1 && (
                                            <path
                                                d={pathD}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth={(isActive ? 3 : 2) / transform.scale}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                opacity={isActive ? 1 : 0.7}
                                                className="cursor-pointer hover:opacity-100"
                                                onClick={() => handleScheduleClick(scheduleIndex)}
                                            />
                                        )}

                                        {/* Points */}
                                        {points.map((point, pointIndex) => (
                                            <circle
                                                key={`point-${scheduleIndex}-${pointIndex}`}
                                                cx={point.x}
                                                cy={point.y}
                                                r={(isActive ? 6 : 5) / transform.scale}
                                                fill={color}
                                                stroke="white"
                                                strokeWidth={2 / transform.scale}
                                                className="cursor-pointer"
                                                onMouseEnter={(e) => handlePointMouseEnter(point, color, e)}
                                                onMouseLeave={handlePointMouseLeave}
                                                onClick={() => handleScheduleClick(scheduleIndex)}
                                            />
                                        ))}
                                    </g>
                                );
                            })}
                        </g>
                    </svg>

                    {/* Tooltip */}
                    {tooltip.visible && (
                        <div
                            className="absolute pointer-events-none z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg"
                            style={{
                                left: tooltip.x + 15,
                                top: tooltip.y - 10,
                                transform: 'translateY(-50%)',
                            }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tooltip.color }}
                                />
                                <span className="font-medium">{tooltip.scheduleName}</span>
                            </div>
                            <div className="text-gray-300">
                                <div>{tooltip.stopName}</div>
                                <div className="font-mono">{tooltip.time}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend panel */}
                <div className="w-48 bg-white rounded-md p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Schedules</span>
                        <div className="flex gap-1">
                            <button
                                onClick={showAllSchedules}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Show All"
                            >
                                <Eye className="h-3 w-3" />
                            </button>
                            <button
                                onClick={hideAllSchedules}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Hide All"
                            >
                                <EyeOff className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {schedules.map((schedule, index) => {
                            const color = SCHEDULE_COLORS[index % SCHEDULE_COLORS.length];
                            const isVisible = visibleSchedules.has(index);
                            const isActive = activeScheduleIndex === index;
                            const firstStopTime = schedule.scheduleStops[0]?.departureTime || '--:--';
                            
                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                                        isActive ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50",
                                        !isVisible && "opacity-50"
                                    )}
                                    onClick={() => handleScheduleClick(index)}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleScheduleVisibility(index);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        {isVisible ? (
                                            <Eye className="h-3 w-3" />
                                        ) : (
                                            <EyeOff className="h-3 w-3 text-gray-400" />
                                        )}
                                    </button>
                                    <div
                                        className="w-4 h-3 rounded-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium truncate">
                                            {schedule.name || `Schedule ${index + 1}`}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            {firstStopTime.substring(0, 5)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend info */}
                    <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-600" />
                            <span>First stop</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-600" />
                            <span>Last stop</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
