'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import RouteStopsEditor from "./RouteStopsEditor";
import { useRouteWorkspace } from "@/context/RouteWorkspace/useRouteWorkspace";
import { createEmptyRoute, RoadTypeEnum, DirectionEnum } from "@/types/RouteWorkspaceData";
import { Wand2, AlertCircle, CheckCircle } from "lucide-react";
import { canGenerateRouteFromCorresponding, findRouteByDirection } from "@/services/routeAutoGeneration";
import { useToast } from "@/hooks/use-toast";

export default function RouteFormMode() {
    const [activeTab, setActiveTab] = useState<'outbound' | 'inbound'>('outbound');
    const {
        data,
        addRoute,
        setActiveRouteIndex,
        getRouteIndexByDirection,
        generateRouteFromCorresponding,
        clearSelectedStop
    } = useRouteWorkspace();
    const { toast } = useToast();

    // Ensure we have at least one route for each direction
    useEffect(() => {
        if (data.routeGroup.routes.length === 0) {
            // Add default outbound route
            const outboundRoute = createEmptyRoute();
            outboundRoute.direction = DirectionEnum.OUTBOUND;
            addRoute(outboundRoute);
            setActiveRouteIndex(0);
        }
    }, []);

    // Get route index based on the active tab direction
    const activeRouteIndex = useMemo(() => {
        const targetDirection = activeTab === 'outbound' ? DirectionEnum.OUTBOUND : DirectionEnum.INBOUND;
        const index = getRouteIndexByDirection(targetDirection);
        return index >= 0 ? index : 0;
    }, [activeTab, getRouteIndexByDirection, data.routeGroup.routes]);

    // Update context when tab changes
    useEffect(() => {
        setActiveRouteIndex(activeRouteIndex);
        clearSelectedStop(); // Clear selected stop when switching tabs
    }, [activeRouteIndex, setActiveRouteIndex, clearSelectedStop]);

    // Check if the source route exists for auto-generation
    const sourceDirection = activeTab === 'outbound' ? DirectionEnum.INBOUND : DirectionEnum.OUTBOUND;
    const sourceRoute = findRouteByDirection(data.routeGroup.routes, sourceDirection);
    const canAutoGenerate = canGenerateRouteFromCorresponding(sourceRoute);

    // Handle tab switch with route creation if needed
    const handleTabSwitch = useCallback((tab: 'outbound' | 'inbound') => {
        const targetDirection = tab === 'outbound' ? DirectionEnum.OUTBOUND : DirectionEnum.INBOUND;
        const existingIndex = getRouteIndexByDirection(targetDirection);

        // If no route exists for this direction, create one
        if (existingIndex < 0) {
            const newRoute = createEmptyRoute();
            newRoute.direction = targetDirection;
            addRoute(newRoute);
        }

        setActiveTab(tab);
    }, [getRouteIndexByDirection, addRoute]);

    // Handle auto-generate route
    const handleAutoGenerate = useCallback(() => {
        const targetDirection = activeTab === 'outbound' ? DirectionEnum.OUTBOUND : DirectionEnum.INBOUND;

        const result = generateRouteFromCorresponding(targetDirection);

        if (result.success) {
            toast({
                title: "Route Generated Successfully",
                description: result.message,
                duration: 5000,
            });

            // Show warnings if any
            if (result.warnings.length > 0) {
                result.warnings.forEach(warning => {
                    toast({
                        title: "Warning",
                        description: warning,
                        variant: "destructive",
                        duration: 7000,
                    });
                });
            }
        } else {
            toast({
                title: "Failed to Generate Route",
                description: result.message,
                variant: "destructive",
                duration: 5000,
            });
        }
    }, [activeTab, generateRouteFromCorresponding, toast]);

    return (
        <div className="space-y-4">
            <RouteGroupInfo />

            <div className="flex bg-gray-100 border-b pl-1 justify-between">
                <div>
                    <button
                        onClick={() => handleTabSwitch('outbound')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'outbound'
                            ? 'text-white bg-blue-800'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Outbound Route
                    </button>
                    <button
                        onClick={() => handleTabSwitch('inbound')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'inbound'
                            ? 'text-white bg-blue-800'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Inbound Route
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {/* Button for auto generating selected route using data in other routes */}
                    <button
                        onClick={handleAutoGenerate}
                        disabled={!canAutoGenerate}
                        className={`ml-4 mx-2 my-1 px-2 py-1 text-sm font-medium text-white border-2 rounded-md transition-colors flex items-center gap-2 ${canAutoGenerate
                            ? 'border-purple-600 bg-purple-700 hover:bg-purple-800 cursor-pointer'
                            : 'border-gray-400 bg-gray-400 cursor-not-allowed'
                            }`}
                        title={canAutoGenerate
                            ? `Generate ${activeTab} route by reversing the ${activeTab === 'outbound' ? 'inbound' : 'outbound'} route stops`
                            : `No ${activeTab === 'outbound' ? 'inbound' : 'outbound'} route available to generate from`
                        }
                    >
                        <Wand2 className="w-4 h-4" />
                        Auto-Generate From {activeTab === 'outbound' ? 'Inbound' : 'Outbound'}
                    </button>
                </div>
            </div>
            <RouteInfo routeIndex={activeRouteIndex} />
        </div>
    )
}

function RouteGroupInfo() {
    const { data, updateRouteGroup } = useRouteWorkspace();

    return (
        <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
            <span className="mb-2 underline">Route Group Info</span>
            <form className="space-y-4">
                {/* Route group id field(This will be a read only label field and useful in route group updating scenarios) */}
                <div className="flex gap-0 items-center">
                    <label className="block text-sm font-medium w-32">Route Group ID :</label>
                    <span className={`text-sm px-2 py-1 rounded ${data.routeGroup.id ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {data.routeGroup.id || 'new'}
                    </span>
                </div>
                <div className="flex">
                    <label className="block text-sm font-medium w-32">Name (English) <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="w-200 border border-gray-400 rounded px-2 bg-white"
                        value={data.routeGroup.name || ''}
                        onChange={(e) => updateRouteGroup({ name: e.target.value })}
                    />
                </div>
                <div className="flex">
                    <label className="block text-sm font-medium w-32">Name (Sinhala)</label>
                    <input
                        type="text"
                        className="w-200 border border-gray-400 rounded px-2 bg-white"
                        value={data.routeGroup.nameSinhala || ''}
                        onChange={(e) => updateRouteGroup({ nameSinhala: e.target.value })}
                    />
                </div>
                <div className="flex">
                    <label className="block text-sm font-medium w-32">Name (Tamil)</label>
                    <input
                        type="text"
                        className="w-200 border border-gray-400 rounded px-2 bg-white"
                        value={data.routeGroup.nameTamil || ''}
                        onChange={(e) => updateRouteGroup({ nameTamil: e.target.value })}
                    />
                </div>
                <div className="flex">
                    <label className="block text-sm font-medium w-32">Description</label>
                    <textarea
                        className="w-200 border border-gray-400 rounded px-2 bg-white"
                        rows={3}
                        value={data.routeGroup.description || ''}
                        onChange={(e) => updateRouteGroup({ description: e.target.value })}
                    ></textarea>
                </div>
            </form>
        </div>
    );
}

function RouteInfo({ routeIndex }: { routeIndex: number }) {
    const { data, updateRoute } = useRouteWorkspace();
    const route = data.routeGroup.routes[routeIndex];

    // If no route exists at this index, show a message
    if (!route) {
        return (
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="mb-2 text-gray-600">No route data available. Paste YAML in Textual Mode to load route data.</span>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="mb-2 underline">Route Info</span>
                <form className="space-y-4">
                    {/* Route id field(This will be a read only label field and useful in route updating scenarios) */}
                    <div className="flex gap-0 items-center w-full">
                        <label className="block text-sm font-medium w-32">Route ID :</label>
                        <span className={`text-sm px-2 py-1 rounded ${route.id ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {route.id || 'new'}
                        </span>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Name (English) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.name || ''}
                                onChange={(e) => updateRoute(routeIndex, { name: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Name (Sinhala)</label>
                            <input
                                type="text"
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.nameSinhala || ''}
                                onChange={(e) => updateRoute(routeIndex, { nameSinhala: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Name (Tamil)</label>
                            <input
                                type="text"
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.nameTamil || ''}
                                onChange={(e) => updateRoute(routeIndex, { nameTamil: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Route Number</label>
                            <input
                                type="text"
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.routeNumber || ''}
                                onChange={(e) => updateRoute(routeIndex, { routeNumber: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Road Type</label>
                            <select
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.roadType || ''}
                                onChange={(e) => updateRoute(routeIndex, { roadType: e.target.value as RoadTypeEnum })}
                            >
                                <option value="">Select road type</option>
                                <option value={RoadTypeEnum.NORMALWAY}>Normalway</option>
                                <option value={RoadTypeEnum.EXPRESSWAY}>Expressway</option>
                            </select>
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Direction</label>
                            <select
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.direction || ''}
                                onChange={(e) => updateRoute(routeIndex, { direction: e.target.value as DirectionEnum })}
                            >
                                <option value="">Select direction</option>
                                <option value={DirectionEnum.OUTBOUND}>Outbound/Up</option>
                                <option value={DirectionEnum.INBOUND}>Inbound/Down</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Route Through (English)</label>
                            <input
                                type="text"
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.routeThrough || ''}
                                onChange={(e) => updateRoute(routeIndex, { routeThrough: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Route Through (Sinhala)</label>
                            <input
                                type="text"
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.routeThroughSinhala || ''}
                                onChange={(e) => updateRoute(routeIndex, { routeThroughSinhala: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Route Through (Tamil)</label>
                            <input
                                type="text"
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.routeThroughTamil || ''}
                                onChange={(e) => updateRoute(routeIndex, { routeThroughTamil: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Distance (km)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.distanceKm || ''}
                                onChange={(e) => updateRoute(routeIndex, { distanceKm: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Estimated Duration (minutes)</label>
                            <input
                                type="number"
                                className="w-full border border-gray-400 rounded px-2 bg-white"
                                value={route.estimatedDurationMinutes || ''}
                                onChange={(e) => updateRoute(routeIndex, { estimatedDurationMinutes: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium w-32">Description</label>
                        <textarea
                            className="w-full border border-gray-400 rounded px-2 bg-white"
                            rows={3}
                            value={route.description || ''}
                            onChange={(e) => updateRoute(routeIndex, { description: e.target.value })}
                        ></textarea>
                    </div>
                </form>
            </div>

            <RouteStopsEditor routeIndex={routeIndex} />
        </>
    );
}
