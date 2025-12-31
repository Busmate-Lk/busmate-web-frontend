'use client';

import { useState, useMemo, useCallback } from 'react';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace/useScheduleWorkspace';
import { useToast } from '@/hooks/use-toast';
import { 
  ScheduleStop, 
  parseTimeToMinutes, 
  formatMinutesToTimeShort,
  addMinutesToTime,
  AxisOrientation,
} from '@/types/ScheduleWorkspaceData';
import { 
  RotateCcw, 
  Wand2, 
  Clock, 
  ArrowRight,
  RotateCw,
  Settings,
} from 'lucide-react';

interface TimetableGridProps {
  scheduleIndex: number;
}

export default function TimetableGrid({ scheduleIndex }: TimetableGridProps) {
  const { 
    data, 
    route,
    updateScheduleStop,
    updateAllScheduleStops,
    gridAxisOrientation,
    setGridAxisOrientation,
    selectedStopIndex,
    setSelectedStop,
  } = useScheduleWorkspace();
  const { toast } = useToast();
  
  const schedule = data.schedules[scheduleIndex];
  
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [startTime, setStartTime] = useState('06:00');
  const [avgSpeedKmh, setAvgSpeedKmh] = useState(25);
  const [dwellTimeSeconds, setDwellTimeSeconds] = useState(60);

  if (!schedule || !route) return null;

  // Ensure schedule stops are synced with route stops
  const scheduleStops = useMemo(() => {
    if (schedule.scheduleStops.length > 0) {
      return schedule.scheduleStops;
    }
    
    // Initialize from route stops if empty
    return route.routeStops.map((routeStop) => ({
      stopId: routeStop.stopId,
      stopName: routeStop.stopName,
      stopOrder: routeStop.stopOrder,
      arrivalTime: '',
      departureTime: '',
      distanceFromStartKm: routeStop.distanceFromStartKm,
    }));
  }, [schedule.scheduleStops, route.routeStops]);

  // Auto-generate times based on distance and average speed
  const handleAutoGenerate = useCallback(() => {
    if (!route) return;

    const newStops: ScheduleStop[] = route.routeStops.map((routeStop, index) => {
      let arrivalMinutes = parseTimeToMinutes(startTime);
      let departureMinutes = arrivalMinutes;

      if (index > 0 && routeStop.distanceFromStartKm > 0) {
        // Calculate travel time in minutes
        const travelTimeMinutes = (routeStop.distanceFromStartKm / avgSpeedKmh) * 60;
        arrivalMinutes = parseTimeToMinutes(startTime) + Math.round(travelTimeMinutes);
      }

      // Add dwell time for departure (except for last stop)
      const isLastStop = index === route.routeStops.length - 1;
      departureMinutes = isLastStop ? arrivalMinutes : arrivalMinutes + Math.ceil(dwellTimeSeconds / 60);

      return {
        stopId: routeStop.stopId,
        stopName: routeStop.stopName,
        stopOrder: routeStop.stopOrder,
        arrivalTime: formatMinutesToTimeShort(arrivalMinutes) + ':00',
        departureTime: formatMinutesToTimeShort(departureMinutes) + ':00',
        distanceFromStartKm: routeStop.distanceFromStartKm,
      };
    });

    updateAllScheduleStops(scheduleIndex, newStops);
    setShowAutoGenerate(false);
    
    toast({
      title: 'Times Generated',
      description: `Generated arrival/departure times starting at ${startTime}`,
    });
  }, [route, startTime, avgSpeedKmh, dwellTimeSeconds, scheduleIndex, updateAllScheduleStops, toast]);

  // Clear all times
  const handleClearTimes = () => {
    const clearedStops = scheduleStops.map(stop => ({
      ...stop,
      arrivalTime: '',
      departureTime: '',
    }));
    updateAllScheduleStops(scheduleIndex, clearedStops);
    toast({
      title: 'Times Cleared',
      description: 'All arrival and departure times have been cleared',
    });
  };

  // Handle time input change
  const handleTimeChange = (stopIndex: number, field: 'arrivalTime' | 'departureTime', value: string) => {
    // Append :00 for seconds if not present
    const formattedValue = value && !value.includes(':00') && value.split(':').length === 2 
      ? value + ':00' 
      : value;
    
    updateScheduleStop(scheduleIndex, stopIndex, { [field]: formattedValue });
  };

  // Copy arrival to departure
  const copyArrivalToDeparture = (stopIndex: number) => {
    const stop = scheduleStops[stopIndex];
    if (stop.arrivalTime) {
      updateScheduleStop(scheduleIndex, stopIndex, { departureTime: stop.arrivalTime });
    }
  };

  // Toggle axis orientation
  const toggleAxisOrientation = () => {
    setGridAxisOrientation(
      gridAxisOrientation === AxisOrientation.STOPS_BY_SCHEDULES
        ? AxisOrientation.SCHEDULES_BY_STOPS
        : AxisOrientation.STOPS_BY_SCHEDULES
    );
  };

  return (
    <div className="border rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Timetable Grid</h3>
          <span className="text-xs text-gray-500">
            ({scheduleStops.length} stops)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAxisOrientation}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Toggle axis orientation"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAutoGenerate(!showAutoGenerate)}
            className={`flex items-center gap-1 px-2 py-1 text-sm rounded ${
              showAutoGenerate ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Wand2 className="h-4 w-4" />
            Auto Generate
          </button>
          <button
            onClick={handleClearTimes}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Auto-generate panel */}
      {showAutoGenerate && (
        <div className="p-3 bg-blue-50 border-b">
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Avg Speed (km/h)</label>
              <input
                type="number"
                value={avgSpeedKmh}
                onChange={(e) => setAvgSpeedKmh(Number(e.target.value))}
                min={5}
                max={100}
                className="w-20 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Dwell Time (sec)</label>
              <input
                type="number"
                value={dwellTimeSeconds}
                onChange={(e) => setDwellTimeSeconds(Number(e.target.value))}
                min={0}
                max={600}
                step={15}
                className="w-20 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAutoGenerate}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Times will be calculated based on distance between stops and average speed.
          </p>
        </div>
      )}

      {/* Timetable */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600 border-b w-10">#</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 border-b">Stop Name</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600 border-b w-20">Dist (km)</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600 border-b w-32">Arrival</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600 border-b w-8"></th>
              <th className="px-3 py-2 text-center font-medium text-gray-600 border-b w-32">Departure</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600 border-b w-16">Dwell</th>
            </tr>
          </thead>
          <tbody>
            {scheduleStops.map((stop, index) => {
              const arrivalMinutes = parseTimeToMinutes(stop.arrivalTime);
              const departureMinutes = parseTimeToMinutes(stop.departureTime);
              const dwellTime = stop.arrivalTime && stop.departureTime 
                ? departureMinutes - arrivalMinutes 
                : null;
              const isSelected = selectedStopIndex === index;
              const isFirst = index === 0;
              const isLast = index === scheduleStops.length - 1;

              return (
                <tr 
                  key={index}
                  onClick={() => setSelectedStop(index)}
                  className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-100' : ''
                  } ${isFirst ? 'bg-green-50' : isLast ? 'bg-red-50' : ''}`}
                >
                  <td className="px-3 py-2 border-b text-gray-500">{index + 1}</td>
                  <td className="px-3 py-2 border-b">
                    <div className="font-medium">{stop.stopName || `Stop ${index + 1}`}</div>
                    {isFirst && <span className="text-xs text-green-600">Start</span>}
                    {isLast && <span className="text-xs text-red-600">End</span>}
                  </td>
                  <td className="px-3 py-2 border-b text-center text-gray-500">
                    {stop.distanceFromStartKm?.toFixed(1) || '-'}
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    <input
                      type="time"
                      value={stop.arrivalTime?.slice(0, 5) || ''}
                      onChange={(e) => handleTimeChange(index, 'arrivalTime', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 w-24"
                    />
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyArrivalToDeparture(index);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Copy arrival to departure"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    <input
                      type="time"
                      value={stop.departureTime?.slice(0, 5) || ''}
                      onChange={(e) => handleTimeChange(index, 'departureTime', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 w-24"
                    />
                  </td>
                  <td className="px-3 py-2 border-b text-center text-gray-500">
                    {dwellTime !== null ? `${dwellTime}m` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer stats */}
      <div className="p-3 border-t bg-gray-50 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <div>
            {scheduleStops.filter(s => s.arrivalTime && s.departureTime).length} / {scheduleStops.length} stops with times
          </div>
          {scheduleStops.length > 0 && scheduleStops[0].arrivalTime && scheduleStops[scheduleStops.length - 1].arrivalTime && (
            <div>
              Total journey: {
                parseTimeToMinutes(scheduleStops[scheduleStops.length - 1].arrivalTime) - 
                parseTimeToMinutes(scheduleStops[0].departureTime || scheduleStops[0].arrivalTime)
              } minutes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
