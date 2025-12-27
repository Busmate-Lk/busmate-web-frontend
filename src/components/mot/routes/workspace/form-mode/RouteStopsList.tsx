'use client';

import { useRouteWorkspace } from '@/context/RouteWorkspace/useRouteWorkspace';
import { StopTypeEnum, StopExistenceType, createEmptyRouteStop } from '@/types/RouteWorkspaceData';
import { Grip, GripVertical, Trash } from 'lucide-react';

interface RouteStopsListProps {
    routeIndex: number;
}

export default function RouteStopsList({ routeIndex }: RouteStopsListProps) {
    const { data, updateRoute, updateRouteStop, addRouteStop, removeRouteStop, setSelectedStop, selectedRouteIndex, selectedStopIndex } = useRouteWorkspace();
    const route = data.routeGroup.routes[routeIndex];

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

    const startEndStops = stops.filter((_, idx) => idx === 0 || idx === stops.length - 1);
    const intermediateStops = stops.filter((_, idx) => idx !== 0 && idx !== stops.length - 1);

    const StopTable = ({ stops: tableStops, title }: { stops: typeof stops, title: string }) => (
        <div>
            <h3 className="font-semibold mb-3">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 bg-white">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="w-6"></th>
                            <th className="border border-gray-300 px-2 py-2 text-left" title='Stop Order Number'>#</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Id</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Existing?</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Distance (km)</th>
                            <th className="w-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableStops.map((routeStop) => {
                            const actualIndex = stops.findIndex(s => s.orderNumber === routeStop.orderNumber);
                            const isSelected = selectedRouteIndex === routeIndex && selectedStopIndex === actualIndex;
                            return (
                                <tr 
                                    key={routeStop.orderNumber} 
                                    onClick={() => setSelectedStop(routeIndex, actualIndex)}
                                    className={`cursor-pointer transition-colors ${
                                        isSelected 
                                            ? 'bg-blue-100 hover:bg-blue-150' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="border border-gray-300 w-6">
                                        <GripVertical className="text-gray-400" />
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
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col rounded-md px-4 py-2 bg-gray-100">
            <span className="underline mb-2">RouteStopsList</span>

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
        </div>
    );
}