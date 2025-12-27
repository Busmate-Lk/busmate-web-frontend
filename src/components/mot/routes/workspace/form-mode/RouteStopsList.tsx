'use client';

import { useRouteWorkspace } from '@/context/RouteWorkspace/useRouteWorkspace';
import { StopTypeEnum, StopExistenceType, createEmptyRouteStop } from '@/types/RouteWorkspaceData';
import { GripVertical, LocationEditIcon, Trash } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

interface RouteStopsListProps {
    routeIndex: number;
}

export default function RouteStopsList({ routeIndex }: RouteStopsListProps) {
    const { data, updateRoute, updateRouteStop, addRouteStop, removeRouteStop, reorderRouteStop, setSelectedStop, selectedRouteIndex, selectedStopIndex, coordinateEditingMode, setCoordinateEditingMode, clearCoordinateEditingMode } = useRouteWorkspace();
    const route = data.routeGroup.routes[routeIndex];
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (!route) {
        return (
            <div className="flex flex-col rounded-md px-4 py-2 bg-gray-100">
                <span className="underline mb-2">RouteStopsList</span>
                <p className="text-gray-600">No route data available</p>
            </div>
        );
    }

    const stops = route.routeStops || [];

    const handleFieldChange = (stopIndex: number, field: string, value: any) => {
        const currentStop = stops[stopIndex];
        if (field === 'stopName') {
            updateRouteStop(routeIndex, stopIndex, {
                stop: { ...currentStop.stop, name: value }
            });
        } else if (field === 'stopNameSinhala') {
            updateRouteStop(routeIndex, stopIndex, {
                stop: { ...currentStop.stop, nameSinhala: value }
            });
        } else if (field === 'stopNameTamil') {
            updateRouteStop(routeIndex, stopIndex, {
                stop: { ...currentStop.stop, nameTamil: value }
            });
        } else if (field === 'distanceFromStart') {
            updateRouteStop(routeIndex, stopIndex, {
                distanceFromStart: value
            });
        } else if (field === 'isExisting') {
            updateRouteStop(routeIndex, stopIndex, {
                stop: { 
                    ...currentStop.stop, 
                    type: value ? StopExistenceType.EXISTING : StopExistenceType.NEW 
                }
            });
        }
    };

    const handleAddIntermediateStop = () => {
        const insertIndex = stops.length - 1;
        const newOrderNumber = insertIndex;
        const newStop = createEmptyRouteStop(newOrderNumber);
        
        // Create new array with the new stop inserted before the end
        const newStops = [...stops];
        newStops.splice(insertIndex, 0, newStop);
        
        // Recalculate order numbers to be sequential (0, 1, 2, ...)
        newStops.forEach((stop, index) => {
            stop.orderNumber = index;
        });
        
        updateRoute(routeIndex, { routeStops: newStops });
    };

    const handleDeleteStop = (stopIndex: number) => {
        // Remove the stop
        const newStops = stops.filter((_, idx) => idx !== stopIndex);
        
        // Recalculate order numbers to be sequential (0, 1, 2, ...)
        newStops.forEach((stop, index) => {
            stop.orderNumber = index;
        });
        
        updateRoute(routeIndex, { routeStops: newStops });
    };

    const getOrderBadgeColor = (stopIndex: number) => {
        if (stopIndex === 0) return 'bg-green-500'; // Start
        if (stopIndex === stops.length - 1) return 'bg-red-500'; // End
        return 'bg-blue-500'; // Intermediate
    };

    const getStopTypeLabel = (stopIndex: number) => {
        if (stopIndex === 0) return 'S'; // Start
        if (stopIndex === stops.length - 1) return 'E'; // End
        return 'I'; // Intermediate
    };

    const handleToggleCoordinateEditingMode = (stopIndex: number, e: React.MouseEvent) => {
        e.stopPropagation();
        
        // If this stop is already in editing mode, deactivate it
        if (coordinateEditingMode?.routeIndex === routeIndex && coordinateEditingMode?.stopIndex === stopIndex) {
            clearCoordinateEditingMode();
        } else {
            // Activate editing mode for this stop
            setCoordinateEditingMode(routeIndex, stopIndex);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = stops.findIndex(stop => `stop-${stop.orderNumber}` === active.id);
            const newIndex = stops.findIndex(stop => `stop-${stop.orderNumber}` === over.id);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                reorderRouteStop(routeIndex, oldIndex, newIndex);
            }
        }

        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const startEndStops = stops.filter((_, idx) => idx === 0 || idx === stops.length - 1);
    const intermediateStops = stops.filter((_, idx) => idx !== 0 && idx !== stops.length - 1);

    // Sortable Row Component
    interface SortableStopRowProps {
        routeStop: typeof stops[0];
        actualIndex: number;
        isSelected: boolean;
        isInCoordinateEditingMode: boolean;
    }

    const SortableStopRow = ({ routeStop, actualIndex, isSelected, isInCoordinateEditingMode }: SortableStopRowProps) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: `stop-${routeStop.orderNumber}` });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };

        return (
            <tr 
                ref={setNodeRef}
                style={style}
                onClick={() => setSelectedStop(routeIndex, actualIndex)}
                className={`cursor-pointer transition-colors ${
                    isSelected 
                        ? 'bg-blue-100 hover:bg-blue-150' 
                        : 'hover:bg-gray-50'
                } ${isDragging ? 'relative z-50' : ''}`}
            >
                <td className="border border-gray-300 w-6">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="text-gray-400" />
                    </button>
                </td>
                <td className={`border border-gray-300 px-2 py-2 ${getOrderBadgeColor(actualIndex)} text-white text-center font-bold`}>
                    {routeStop.orderNumber}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                    {routeStop.stop.id || '(new)'}
                </td>
                <td className="border border-gray-300">
                    <input
                        type="text"
                        defaultValue={routeStop.stop.name || ''}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => handleFieldChange(actualIndex, 'stopName', e.target.value)}
                        className="w-full px-4 py-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-white text-sm ${routeStop.stop.type === StopExistenceType.EXISTING ? 'bg-yellow-500' : 'bg-red-500'}`}>
                            {routeStop.stop.type === StopExistenceType.EXISTING ? 'exist' : 'new'}
                        </span>
                        <button
                            onClick={() => console.log(`Searching for availability of ${routeStop.stop.name}`)}
                            className="px-2 py-1 border border-blue-500 text-blue-500 text-sm rounded hover:bg-blue-50"
                            title="Search for existing stop"
                        >
                            🔍
                        </button>
                    </div>
                </td>
                <td className="border border-gray-300">
                    <input
                        type="number"
                        step="0.1"
                        defaultValue={routeStop.distanceFromStart || 0}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => handleFieldChange(actualIndex, 'distanceFromStart', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </td>
                <td className="border border-gray-300 w-8">
                    <button
                        onClick={(e) => handleToggleCoordinateEditingMode(actualIndex, e)}
                        className={`p-1 rounded transition-colors ${
                            isInCoordinateEditingMode 
                                ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title={isInCoordinateEditingMode ? "Deactivate coordinates editing mode" : "Activate coordinates editing mode on map"}
                    >
                        <LocationEditIcon size={16} />
                    </button>
                </td>
                <td className="border border-gray-300 w-8">
                    {actualIndex !== 0 && actualIndex !== stops.length - 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStop(actualIndex);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete stop"
                        >
                            <Trash size={16} />
                        </button>
                    )}
                </td>
            </tr>
        );
    };

    const StopTable = ({ stops: tableStops, title }: { stops: typeof stops, title: string }) => {
        const sortableIds = tableStops.map(stop => `stop-${stop.orderNumber}`);
        
        return (
            <div>
                <h3 className="font-semibold mb-3">{title}</h3>
                <div className="overflow-x-auto">
                    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                        <table className="w-full border-collapse border border-gray-300 bg-white">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="w-6"></th>
                                    <th className="border border-gray-300 px-2 py-2 text-left" title='Stop Order Number'>#</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Id</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Existing?</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Distance (km)</th>
                                    <th className="border border-gray-300 w-6"></th>
                                    <th className="border border-gray-300 w-6"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableStops.map((routeStop) => {
                                    const actualIndex = stops.findIndex(s => s.orderNumber === routeStop.orderNumber);
                                    const isSelected = selectedRouteIndex === routeIndex && selectedStopIndex === actualIndex;
                                    const isInCoordinateEditingMode = coordinateEditingMode?.routeIndex === routeIndex && coordinateEditingMode?.stopIndex === actualIndex;
                                    return (
                                        <SortableStopRow
                                            key={routeStop.orderNumber}
                                            routeStop={routeStop}
                                            actualIndex={actualIndex}
                                            isSelected={isSelected}
                                            isInCoordinateEditingMode={isInCoordinateEditingMode}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </SortableContext>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col rounded-md px-4 py-2 bg-gray-100">
            <span className="underline mb-2">RouteStopsList</span>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="space-y-6">
                    <StopTable stops={startEndStops} title="Start & End Stops" />
                    <StopTable stops={intermediateStops} title="Intermediate Stops" />
                    
                    <button 
                        onClick={handleAddIntermediateStop}
                        className="w-full p-3 text-blue-600 border border-dashed border-blue-600 rounded hover:bg-blue-50"
                    >
                        + Add Intermediate Stop
                    </button>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="bg-white border-2 border-blue-500 rounded shadow-lg opacity-90 p-2">
                            <div className="flex items-center gap-2">
                                <GripVertical className="text-gray-400" />
                                <span className="font-semibold">
                                    {stops.find(s => `stop-${s.orderNumber}` === activeId)?.stop.name || 'Dragging...'}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}