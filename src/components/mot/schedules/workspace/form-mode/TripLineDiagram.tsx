'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace/useScheduleWorkspace';
import { 
  parseTimeToMinutes,
  formatMinutesToTimeShort,
  AxisOrientation,
} from '@/types/ScheduleWorkspaceData';
import { 
  GitBranch, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface TripLineDiagramProps {
  scheduleIndex: number;
}

// Color palette for multiple schedules
const SCHEDULE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

export default function TripLineDiagram({ scheduleIndex }: TripLineDiagramProps) {
  const { 
    data, 
    route,
    diagramAxisOrientation,
    setDiagramAxisOrientation,
    selectedStopIndex,
    setSelectedStop,
  } = useScheduleWorkspace();
  
  const schedule = data.schedules[scheduleIndex];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [hoveredStop, setHoveredStop] = useState<number | null>(null);

  // Diagram dimensions
  const PADDING = 60;
  const WIDTH = 600;
  const HEIGHT = 400;

  // Get schedule color
  const scheduleColor = SCHEDULE_COLORS[scheduleIndex % SCHEDULE_COLORS.length];

  // Calculate diagram data
  const diagramData = useMemo(() => {
    if (!schedule || !route) return null;

    const stops = schedule.scheduleStops.length > 0 
      ? schedule.scheduleStops 
      : route.routeStops.map(rs => ({
          stopId: rs.stopId,
          stopName: rs.stopName,
          stopOrder: rs.stopOrder,
          arrivalTime: '',
          departureTime: '',
          distanceFromStartKm: rs.distanceFromStartKm,
        }));

    // Get time range
    const validTimes = stops
      .filter(s => s.arrivalTime)
      .map(s => parseTimeToMinutes(s.arrivalTime));
    
    if (validTimes.length === 0) {
      return {
        stops,
        minTime: 0,
        maxTime: 24 * 60,
        maxDistance: route.distanceKm || 20,
        hasData: false,
      };
    }

    const minTime = Math.min(...validTimes);
    const maxTime = Math.max(...validTimes);
    const timeRange = maxTime - minTime || 60; // At least 1 hour
    
    // Add padding to time range
    const paddedMinTime = Math.max(0, minTime - 30);
    const paddedMaxTime = Math.min(24 * 60, maxTime + 30);

    return {
      stops,
      minTime: paddedMinTime,
      maxTime: paddedMaxTime,
      maxDistance: route.distanceKm || stops[stops.length - 1]?.distanceFromStartKm || 20,
      hasData: true,
    };
  }, [schedule, route]);

  // Draw the diagram
  useEffect(() => {
    if (!canvasRef.current || !diagramData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with zoom
    const scaledWidth = WIDTH * zoom;
    const scaledHeight = HEIGHT * zoom;
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, scaledWidth, scaledHeight);

    const { stops, minTime, maxTime, maxDistance, hasData } = diagramData;
    
    // Calculate plot area
    const plotLeft = PADDING * zoom;
    const plotRight = scaledWidth - PADDING * zoom;
    const plotTop = PADDING * zoom;
    const plotBottom = scaledHeight - PADDING * zoom;
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;

    // Helper functions based on axis orientation
    const isTimeOnX = diagramAxisOrientation === AxisOrientation.TIME_BY_STOPS;
    
    const timeToPos = (minutes: number) => {
      const ratio = (minutes - minTime) / (maxTime - minTime);
      return isTimeOnX ? plotLeft + ratio * plotWidth : plotTop + ratio * plotHeight;
    };
    
    const distanceToPos = (distance: number) => {
      const ratio = distance / maxDistance;
      return isTimeOnX ? plotBottom - ratio * plotHeight : plotLeft + ratio * plotWidth;
    };

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Time grid lines
    const timeStep = 30; // 30 minute intervals
    for (let t = Math.ceil(minTime / timeStep) * timeStep; t <= maxTime; t += timeStep) {
      const pos = timeToPos(t);
      ctx.beginPath();
      if (isTimeOnX) {
        ctx.moveTo(pos, plotTop);
        ctx.lineTo(pos, plotBottom);
      } else {
        ctx.moveTo(plotLeft, pos);
        ctx.lineTo(plotRight, pos);
      }
      ctx.stroke();
    }

    // Distance grid lines (for each stop)
    stops.forEach((stop, idx) => {
      const pos = distanceToPos(stop.distanceFromStartKm || 0);
      ctx.beginPath();
      if (isTimeOnX) {
        ctx.moveTo(plotLeft, pos);
        ctx.lineTo(plotRight, pos);
      } else {
        ctx.moveTo(pos, plotTop);
        ctx.lineTo(pos, plotBottom);
      }
      ctx.stroke();
    });

    // Draw axis labels
    ctx.fillStyle = '#374151';
    ctx.font = `${11 * zoom}px sans-serif`;
    ctx.textAlign = 'center';

    // Time labels
    for (let t = Math.ceil(minTime / timeStep) * timeStep; t <= maxTime; t += timeStep) {
      const pos = timeToPos(t);
      const label = formatMinutesToTimeShort(t);
      if (isTimeOnX) {
        ctx.fillText(label, pos, plotBottom + 15 * zoom);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(label, plotLeft - 5 * zoom, pos + 4 * zoom);
      }
    }

    // Stop name labels
    ctx.textAlign = isTimeOnX ? 'right' : 'center';
    stops.forEach((stop, idx) => {
      const pos = distanceToPos(stop.distanceFromStartKm || 0);
      const name = stop.stopName || `Stop ${idx + 1}`;
      const shortName = name.length > 12 ? name.slice(0, 10) + '...' : name;
      
      if (isTimeOnX) {
        ctx.fillText(shortName, plotLeft - 5 * zoom, pos + 4 * zoom);
      } else {
        ctx.save();
        ctx.translate(pos, plotBottom + 15 * zoom);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText(shortName, 0, 0);
        ctx.restore();
      }
    });

    // Draw trip line if we have data
    if (hasData) {
      const validStops = stops.filter(s => s.arrivalTime);
      
      if (validStops.length > 1) {
        ctx.strokeStyle = scheduleColor;
        ctx.lineWidth = 3 * zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        validStops.forEach((stop, idx) => {
          const timePos = timeToPos(parseTimeToMinutes(stop.arrivalTime));
          const distPos = distanceToPos(stop.distanceFromStartKm || 0);
          
          const x = isTimeOnX ? timePos : distPos;
          const y = isTimeOnX ? distPos : timePos;

          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();

        // Draw stop markers
        validStops.forEach((stop, idx) => {
          const stopIndex = stops.findIndex(s => s.stopId === stop.stopId);
          const timePos = timeToPos(parseTimeToMinutes(stop.arrivalTime));
          const distPos = distanceToPos(stop.distanceFromStartKm || 0);
          
          const x = isTimeOnX ? timePos : distPos;
          const y = isTimeOnX ? distPos : timePos;

          const isHovered = hoveredStop === stopIndex;
          const isSelected = selectedStopIndex === stopIndex;

          ctx.beginPath();
          ctx.arc(x, y, (isHovered || isSelected ? 8 : 6) * zoom, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? '#1d4ed8' : isHovered ? '#60a5fa' : scheduleColor;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 * zoom;
          ctx.stroke();
        });
      }
    }

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plotLeft, plotTop);
    ctx.lineTo(plotLeft, plotBottom);
    ctx.lineTo(plotRight, plotBottom);
    ctx.stroke();

    // Axis titles
    ctx.fillStyle = '#374151';
    ctx.font = `bold ${12 * zoom}px sans-serif`;
    ctx.textAlign = 'center';

    if (isTimeOnX) {
      ctx.fillText('Time', (plotLeft + plotRight) / 2, scaledHeight - 10 * zoom);
      ctx.save();
      ctx.translate(15 * zoom, (plotTop + plotBottom) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Stops (Distance)', 0, 0);
      ctx.restore();
    } else {
      ctx.fillText('Stops (Distance)', (plotLeft + plotRight) / 2, scaledHeight - 10 * zoom);
      ctx.save();
      ctx.translate(15 * zoom, (plotTop + plotBottom) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Time', 0, 0);
      ctx.restore();
    }

    // Draw "No data" message if needed
    if (!hasData) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = `${14 * zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Add arrival times to see trip line', scaledWidth / 2, scaledHeight / 2);
    }

  }, [diagramData, zoom, hoveredStop, selectedStopIndex, scheduleColor, diagramAxisOrientation]);

  // Toggle axis orientation
  const toggleAxisOrientation = () => {
    setDiagramAxisOrientation(
      diagramAxisOrientation === AxisOrientation.TIME_BY_STOPS
        ? AxisOrientation.STOPS_BY_TIME
        : AxisOrientation.TIME_BY_STOPS
    );
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (!schedule || !route) return null;

  return (
    <div className="border rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Trip Line Diagram</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAxisOrientation}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Toggle axis orientation"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <div className="flex items-center border rounded">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-gray-500 hover:bg-gray-100"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-xs text-gray-600 hover:bg-gray-100"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-gray-500 hover:bg-gray-100"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div className="p-4 overflow-auto" style={{ maxHeight: '450px' }}>
        <canvas
          ref={canvasRef}
          style={{ 
            width: WIDTH * zoom, 
            height: HEIGHT * zoom,
            display: 'block',
            margin: '0 auto',
          }}
        />
      </div>

      {/* Legend */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-1 rounded"
                style={{ backgroundColor: scheduleColor }}
              />
              <span className="text-gray-600">{schedule.name || 'Current Schedule'}</span>
            </div>
          </div>
          <div className="text-gray-500 text-xs">
            {diagramAxisOrientation === AxisOrientation.TIME_BY_STOPS 
              ? 'X: Time, Y: Stops' 
              : 'X: Stops, Y: Time'}
          </div>
        </div>
      </div>
    </div>
  );
}
