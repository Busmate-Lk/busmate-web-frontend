'use client';

import { useState } from 'react';

interface RouteStop {
    orderNumber: number;
    stopName: string;
    type: 'S' | 'E' | 'I';
    distanceFromStart: number;
}

const dummyStops: RouteStop[] = [
    { orderNumber: 0, stopName: 'Embilipitiya', type: 'S', distanceFromStart: 0 },
    { orderNumber: 1, stopName: 'Ratnapura', type: 'I', distanceFromStart: 50 },
    { orderNumber: 2, stopName: 'Kuruwita', type: 'I', distanceFromStart: 90 },
    { orderNumber: 3, stopName: 'Avissawella', type: 'I', distanceFromStart: 120 },
    { orderNumber: 4, stopName: 'Colombo', type: 'E', distanceFromStart: 160 }
];

export default function RouteStopsList() {
    const [stops, setStops] = useState<RouteStop[]>(dummyStops);

    const updateStopType = (stops: RouteStop[]): RouteStop[] => {
        return stops.map((stop, index) => ({
            ...stop,
            type: index === 0 ? 'S' : index === stops.length - 1 ? 'E' : 'I'
        }));
    };

    const handleFieldChange = (index: number, field: 'stopName' | 'distanceFromStart', value: string | number) => {
        const updatedStops = stops.map((stop, i) => {
            if (i === index) {
                return { ...stop, [field]: value };
            }
            return stop;
        });
        setStops(updateStopType(updatedStops));
    };

    const getTypeLabel = (type: 'S' | 'E' | 'I') => {
        switch (type) {
            case 'S': return 'Start';
            case 'E': return 'End';
            case 'I': return 'Intermediate';
        }
    };

    const getTypeBadgeColor = (type: 'S' | 'E' | 'I') => {
        switch (type) {
            case 'S': return 'bg-green-500';
            case 'E': return 'bg-red-500';
            case 'I': return 'bg-blue-500';
        }
    };

    const startEndStops = stops.filter(stop => stop.type === 'S' || stop.type === 'E');
    const intermediateStops = stops.filter(stop => stop.type === 'I');

    const StopTable = ({ stops, title }: { stops: RouteStop[], title: string }) => (
        <div>
            <h3 className="font-semibold mb-3">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Order</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Stop Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Distance (km)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stops.map((stop, idx) => {
                            const actualIndex = stops.findIndex(s => s.orderNumber === stop.orderNumber);
                            return (
                                <tr key={stop.orderNumber} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">
                                        <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                            {stop.orderNumber}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <input
                                            type="text"
                                            value={stop.stopName}
                                            onChange={(e) => handleFieldChange(actualIndex, 'stopName', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <span className={`${getTypeBadgeColor(stop.type)} text-white rounded-full px-3 py-1 text-xs font-bold inline-block`}>
                                            {getTypeLabel(stop.type)}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <input
                                            type="number"
                                            value={stop.distanceFromStart}
                                            onChange={(e) => handleFieldChange(actualIndex, 'distanceFromStart', parseFloat(e.target.value) || 0)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
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
        <div className="col-span-2">
            <span className="underline">RouteStopsList</span>

            <div className="space-y-6">
                <StopTable stops={startEndStops} title="Start & End Stops" />
                <StopTable stops={intermediateStops} title="Intermediate Stops" />
                
                <button className="w-full p-3 text-blue-600 border border-dashed border-blue-600 rounded hover:bg-blue-50">
                    + Add Intermediate Stop
                </button>
            </div>
        </div>
    );
}