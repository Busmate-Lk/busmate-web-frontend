'use client';

import { useRouteWorkspace } from '@/context/RouteWorkspace/useRouteWorkspace';
import { StopTypeEnum, StopExistenceType, createEmptyRouteStop } from '@/types/RouteWorkspaceData';
import { GripVertical, LocationEditIcon, Trash, EllipsisVertical, Loader2, Search, Copy, CopyIcon } from 'lucide-react';
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
import { useState, useRef, useEffect } from 'react';
import { fetchRouteDirections, applyDistancesToRouteStops, extractValidStops, fetchAllStopCoordinates, fetchMissingStopCoordinates, applyCoordinatesToRouteStops, extractStopsForCoordinateFetch } from '@/services/routeWorkspaceMap';
import {
    searchStopExistence,
    processStopExistenceResult,
    searchAllStopsExistence,
    applyBulkSearchResultsToRouteStops,
    canSearchStop
} from '@/services/routeWorkspaceValidation';
import { useToast } from '@/hooks/use-toast';

interface RouteStopsListProps {
    routeIndex: number;
}

export default function RouteStopsList({ routeIndex }: RouteStopsListProps) {
    const { data, updateRoute, updateRouteStop, addRouteStop, removeRouteStop, reorderRouteStop, setSelectedStop, selectedRouteIndex, selectedStopIndex, coordinateEditingMode, setCoordinateEditingMode, clearCoordinateEditingMode, mapActions } = useRouteWorkspace();
    const route = data.routeGroup.routes[routeIndex];
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const [isFetchingDistances, setIsFetchingDistances] = useState(false);
    const [isFetchingAllCoordinates, setIsFetchingAllCoordinates] = useState(false);
    const [isFetchingMissingCoordinates, setIsFetchingMissingCoordinates] = useState(false);
    const [coordinateFetchProgress, setCoordinateFetchProgress] = useState<string>('');
    const [isSearchingAllStops, setIsSearchingAllStops] = useState(false);
    const [searchingStopIndex, setSearchingStopIndex] = useState<number | null>(null);
    const [searchProgress, setSearchProgress] = useState<string>('');
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

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

    const handleCopyRouteStopId = (routeStopId: string | undefined, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!routeStopId) {
            toast({
                title: "No Route Stop ID",
                description: "This route stop doesn't have an ID yet.",
                variant: "destructive"
            });
            return;
        }
        navigator.clipboard.writeText(routeStopId).then(() => {
            toast({
                title: "Copied!",
                description: "Route Stop ID copied to clipboard."
            });
        }).catch(() => {
            toast({
                title: "Failed to copy",
                description: "Could not copy Route Stop ID to clipboard.",
                variant: "destructive"
            });
        });
    };

    const handleCopyStopId = (stopId: string | undefined, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!stopId) {
            toast({
                title: "No Stop ID",
                description: "This is a new stop without an ID yet.",
                variant: "destructive"
            });
            return;
        }
        navigator.clipboard.writeText(stopId).then(() => {
            toast({
                title: "Copied!",
                description: "Stop ID copied to clipboard."
            });
        }).catch(() => {
            toast({
                title: "Failed to copy",
                description: "Could not copy Stop ID to clipboard.",
                variant: "destructive"
            });
        });
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setIsActionsMenuOpen(false);
            }
        };

        if (isActionsMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isActionsMenuOpen]);

    if (!route) {
        return (
            <div className="flex flex-col rounded-md px-4 py-2 bg-gray-100">
                <span className="underline mb-2">RouteStopsList</span>
                <p className="text-gray-600">No route data available</p>
            </div>
        );
    }

    const stops = route.routeStops || [];

    const handleFetchDistancesFromMap = async () => {
        // Check if we have enough stops with coordinates
        const validStops = extractValidStops(stops);

        if (validStops.length < 2) {
            alert('At least 2 stops with valid coordinates are required to calculate distances.');
            return;
        }

        // Check if start stop (first stop in list) has coordinates
        const firstStopHasCoordinates = stops[0]?.stop?.location?.latitude && stops[0]?.stop?.location?.longitude;
        if (!firstStopHasCoordinates) {
            alert('Start stop coordinates are required to fetch distances.');
            return;
        }

        setIsFetchingDistances(true);
        setIsActionsMenuOpen(false);

        try {
            // Use the shared service to fetch directions and calculate distances
            const result = await fetchRouteDirections(stops, (currentChunk, totalChunks) => {
                console.log(`Fetching distances: chunk ${currentChunk} of ${totalChunks}`);
            });

            // Apply the calculated distances to the route stops
            const updatedStops = applyDistancesToRouteStops(stops, result.distances);

            // Update the route with new distances
            updateRoute(routeIndex, { routeStops: updatedStops });

            alert(`Distances fetched successfully! Total distance: ${result.totalDistanceKm} km`);
        } catch (error) {
            console.error('Error fetching distances:', error);
            alert(`Failed to fetch distances. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsFetchingDistances(false);
        }
    };

    const handleFetchAllCoordinates = async () => {
        // Check if we have at least 2 stops with names
        const stopsWithNames = stops.filter(s => s.stop?.name?.trim());
        if (stopsWithNames.length < 2) {
            alert('At least 2 stops with names are required to fetch coordinates.');
            return;
        }

        setIsFetchingAllCoordinates(true);
        setIsActionsMenuOpen(false);
        setCoordinateFetchProgress('Starting...');

        try {
            const result = await fetchAllStopCoordinates(stops, (currentChunk, totalChunks) => {
                setCoordinateFetchProgress(`Fetching chunk ${currentChunk} of ${totalChunks}...`);
            });

            // Apply the fetched coordinates to the route stops
            const updatedStops = applyCoordinatesToRouteStops(stops, result.coordinates);
            updateRoute(routeIndex, { routeStops: updatedStops });

            if (result.failedStops.length > 0) {
                const failedNames = result.failedStops.map(s => s.name).join(', ');
                alert(`Coordinates fetched for ${result.successCount} stops.\nFailed to get coordinates for: ${failedNames}`);
            } else {
                alert(`Successfully fetched coordinates for all ${result.successCount} stops!`);
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            alert(`Failed to fetch coordinates. ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsFetchingAllCoordinates(false);
            setCoordinateFetchProgress('');
        }
    };

    const handleFetchMissingCoordinates = async () => {
        // Check stops info
        const stopsInfo = extractStopsForCoordinateFetch(stops);
        const stopsWithCoordinates = stopsInfo.filter(s => s.hasCoordinates);
        const stopsWithoutCoordinates = stopsInfo.filter(s => !s.hasCoordinates && s.name.trim() !== '');

        if (stopsWithoutCoordinates.length === 0) {
            alert('All stops already have coordinates.');
            return;
        }

        if (stopsWithCoordinates.length === 0) {
            alert('At least one stop with coordinates is required. Use "Fetch All Coordinates" instead.');
            return;
        }

        setIsFetchingMissingCoordinates(true);
        setIsActionsMenuOpen(false);
        setCoordinateFetchProgress('Starting...');

        try {
            const result = await fetchMissingStopCoordinates(stops, (currentChunk, totalChunks) => {
                setCoordinateFetchProgress(`Fetching chunk ${currentChunk} of ${totalChunks}...`);
            });

            // Apply the fetched coordinates to the route stops
            const updatedStops = applyCoordinatesToRouteStops(stops, result.coordinates);
            updateRoute(routeIndex, { routeStops: updatedStops });

            if (result.failedStops.length > 0) {
                const failedNames = result.failedStops.map(s => s.name).join(', ');
                alert(`Coordinates fetched for ${result.successCount} of ${result.totalProcessed} missing stops.\nFailed: ${failedNames}`);
            } else {
                alert(`Successfully fetched coordinates for all ${result.successCount} missing stops!`);
            }
        } catch (error) {
            console.error('Error fetching missing coordinates:', error);
            alert(`Failed to fetch coordinates. ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsFetchingMissingCoordinates(false);
            setCoordinateFetchProgress('');
        }
    };

    // Handler for searching a single stop's existence
    const handleSearchSingleStopExistence = async (stopIndex: number) => {
        const routeStop = stops[stopIndex];
        if (!routeStop) return;

        // Check if stop can be searched
        if (!canSearchStop(routeStop.stop)) {
            toast({
                title: "Cannot Search",
                description: "Stop has no ID or name to search",
                variant: "destructive"
            });
            return;
        }

        setSearchingStopIndex(stopIndex);

        try {
            const result = await searchStopExistence(routeStop.stop);

            if (result.error) {
                toast({
                    title: "Search Failed",
                    description: result.error,
                    variant: "destructive"
                });
            } else if (result.found && result.stop) {
                // Stop found - update with fetched data
                updateRouteStop(routeIndex, stopIndex, {
                    stop: result.stop
                });

                toast({
                    title: "Stop Found",
                    description: `Loaded: ${result.stop.name}`,
                    variant: "default"
                });
            } else {
                // Stop not found - process result to handle ID clearing
                const processedResult = processStopExistenceResult(routeStop.stop, result);

                // Update the stop with processed data
                updateRouteStop(routeIndex, stopIndex, {
                    stop: processedResult.stop
                });

                const message = processedResult.clearIdIfNotFound
                    ? `Not found. Invalid ID cleared.`
                    : `No stop found with ${result.searchedBy}: ${result.searchValue}`;

                toast({
                    title: "Stop Not Found",
                    description: message,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error searching for stop:', error);
            toast({
                title: "Search Failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive"
            });
        } finally {
            setSearchingStopIndex(null);
        }
    };

    // Handler for searching all stops' existence
    const handleSearchAllStopsExistence = async () => {
        if (stops.length === 0) {
            toast({
                title: "No Stops",
                description: "No stops to search for existence",
                variant: "destructive"
            });
            return;
        }

        // Check if any stops can be searched
        const searchableStops = stops.filter(s => canSearchStop(s.stop));
        if (searchableStops.length === 0) {
            toast({
                title: "Cannot Search",
                description: "No stops have ID or name to search",
                variant: "destructive"
            });
            return;
        }

        setIsSearchingAllStops(true);
        setIsActionsMenuOpen(false);
        setSearchProgress('Starting...');

        try {
            const results = await searchAllStopsExistence(stops, (current, total, stopName) => {
                setSearchProgress(`Searching ${current}/${total}: ${stopName}`);
            });

            // Apply results to route stops
            const updatedStops = applyBulkSearchResultsToRouteStops(stops, results);
            updateRoute(routeIndex, { routeStops: updatedStops });

            // Show summary toast
            toast({
                title: "Search Complete",
                description: `Found: ${results.successCount}, Not Found: ${results.notFoundCount}, Errors: ${results.errorCount}`,
                variant: results.successCount > 0 ? "default" : "destructive"
            });
        } catch (error) {
            console.error('Error searching all stops:', error);
            toast({
                title: "Search Failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive"
            });
        } finally {
            setIsSearchingAllStops(false);
            setSearchProgress('');
        }
    };

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
        isSearchingThis: boolean;
    }

    const SortableStopRow = ({ routeStop, actualIndex, isSelected, isInCoordinateEditingMode, isSearchingThis }: SortableStopRowProps) => {
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
                className={`cursor-pointer transition-colors ${isSelected
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
                <td className="border border-gray-300 px-2 py-2 text-sm">
                    <div className='flex items-center gap-2'>
                        <span className='font-mono text-xs text-gray-700'>
                            {routeStop.id ? routeStop.id.substring(0, 8) + '...' : '(new)'}
                        </span>
                        <button
                            onClick={(e) => handleCopyRouteStopId(routeStop.id, e)}
                            disabled={!routeStop.id}
                            className="px-1.5 py-1.5 border border-gray-400 text-gray-600 text-sm rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            title='Copy full Route Stop ID'
                        >
                            <Copy size={14}/>
                        </button>
                    </div>
                </td>
                <td className="border border-gray-300 px-2 py-2 text-sm">
                    <div className='flex items-center gap-2'>
                        <div className='flex flex-col gap-1 flex-grow'>
                            <div className='flex items-center gap-0'>
                                <span className='font-mono text-xs text-gray-700'>
                                    {routeStop.stop.id ? routeStop.stop.id.substring(0, 8) + '...' : ''}
                                </span>
                                {!routeStop.stop.id && (
                                    <span className="inline-block px-2 py-0.5 rounded-full text-white text-xs font-medium bg-orange-500">
                                        New
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className='flex gap-1'>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSearchSingleStopExistence(actualIndex);
                                }}
                                disabled={isSearchingThis || isSearchingAllStops}
                                className="px-1.5 py-1.5 border border-blue-500 text-blue-500 text-sm rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                title="Search for existing stop"
                            >
                                {isSearchingThis ? (
                                    <Loader2 className="animate-spin" size={14} />
                                ) : (
                                    <Search size={14} />
                                )}
                            </button>
                            <button
                                onClick={(e) => handleCopyStopId(routeStop.stop.id, e)}
                                disabled={!routeStop.stop.id}
                                className="px-1.5 py-1.5 border border-gray-400 text-gray-600 text-sm rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                title='Copy full Stop ID'
                            >
                                <Copy size={14}/>
                            </button>
                        </div>
                    </div>
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
                        className={`p-1 rounded transition-colors ${isInCoordinateEditingMode
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
                                    <th className="border border-gray-300 px-4 py-2 text-left" title='Route Stop ID'>Route Stop Id</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left" title='Stop ID with existence status'>Stop Id</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left" title='Distance from start(km)'>
                                        Distance (km)
                                    </th>
                                    <th className="border border-gray-300 w-6"></th>
                                    <th className="border border-gray-300 w-6"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableStops.map((routeStop) => {
                                    const actualIndex = stops.findIndex(s => s.orderNumber === routeStop.orderNumber);
                                    const isSelected = selectedRouteIndex === routeIndex && selectedStopIndex === actualIndex;
                                    const isInCoordinateEditingMode = coordinateEditingMode?.routeIndex === routeIndex && coordinateEditingMode?.stopIndex === actualIndex;
                                    const isSearchingThis = searchingStopIndex === actualIndex;
                                    return (
                                        <SortableStopRow
                                            key={routeStop.orderNumber}
                                            routeStop={routeStop}
                                            actualIndex={actualIndex}
                                            isSelected={isSelected}
                                            isInCoordinateEditingMode={isInCoordinateEditingMode}
                                            isSearchingThis={isSearchingThis}
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
            <div className="flex justify-between items-center mb-2">
                <span className="underline">RouteStopsList</span>
                <div className='flex gap-2'>
                    <button
                        onClick={() => mapActions.fitBoundsToRoute?.()}
                        disabled={!mapActions.fitBoundsToRoute}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                        title="View full route on map"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                            <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v1a1 1 0 11-2 0v-1a1 1 0 01-1-1zM7 16a1 1 0 100-2H4a1 1 0 100 2h3zM15 14a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" />
                        </svg>
                        View Full Route
                    </button>
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsActionsMenuOpen(!isActionsMenuOpen);
                            }}
                            disabled={isFetchingAllCoordinates || isFetchingMissingCoordinates || isSearchingAllStops}
                            className="px-1 py-1 text-sm text-black rounded hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                            title="Actions"
                        >
                            {(isFetchingAllCoordinates || isFetchingMissingCoordinates) ? (
                                <div className="flex items-center gap-1">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span className="text-xs">{coordinateFetchProgress}</span>
                                </div>
                            ) : isSearchingAllStops ? (
                                <div className="flex items-center gap-1">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span className="text-xs">{searchProgress}</span>
                                </div>
                            ) : (
                                <EllipsisVertical size={16} />
                            )}
                        </button>
                        {isActionsMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[250px]" ref={actionsMenuRef}>
                                {/* Coordinates Section */}
                                <div className="px-3 py-1 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                                    Coordinates
                                </div>
                                <button
                                    onClick={handleFetchAllCoordinates}
                                    disabled={isFetchingAllCoordinates || isFetchingMissingCoordinates}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Fetch coordinates for all stops using their names via Google Directions API"
                                >
                                    {isFetchingAllCoordinates ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={14} />
                                            Fetching all coordinates...
                                        </div>
                                    ) : (
                                        '📍 Fetch all coordinates by names'
                                    )}
                                </button>
                                <button
                                    onClick={handleFetchMissingCoordinates}
                                    disabled={isFetchingAllCoordinates || isFetchingMissingCoordinates}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Fetch coordinates only for stops that are missing coordinates, using existing coordinates as anchors"
                                >
                                    {isFetchingMissingCoordinates ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={14} />
                                            Fetching missing coordinates...
                                        </div>
                                    ) : (
                                        '📍 Fetch missing coordinates only'
                                    )}
                                </button>

                                {/* Distances Section */}
                                <div className="px-3 py-1 bg-gray-50 border-b border-t border-gray-200 text-xs font-semibold text-gray-500 uppercase mt-1">
                                    Distances
                                </div>
                                <button
                                    onClick={handleFetchDistancesFromMap}
                                    disabled={isFetchingDistances || isFetchingAllCoordinates || isFetchingMissingCoordinates || isSearchingAllStops}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Calculate distances from start for all stops using Google Directions API"
                                >
                                    {isFetchingDistances ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={14} />
                                            Fetching distances...
                                        </div>
                                    ) : (
                                        '📏 Fetch all distances from map'
                                    )}
                                </button>

                                {/* Validate Section */}
                                <div className="px-3 py-1 bg-gray-50 border-b border-t border-gray-200 text-xs font-semibold text-gray-500 uppercase mt-1">
                                    Validate
                                </div>
                                <button
                                    onClick={handleSearchAllStopsExistence}
                                    disabled={isFetchingAllCoordinates || isFetchingMissingCoordinates || isFetchingDistances || isSearchingAllStops}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Search for existence of all stops in the system by their ID or name"
                                >
                                    {isSearchingAllStops ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={14} />
                                            {searchProgress || 'Searching stops...'}
                                        </div>
                                    ) : (
                                        '🔍 Search all stops existence'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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