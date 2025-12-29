'use client';

import { useState } from 'react';
import RouteStopsList from "./RouteStopsList";
import RouteStopsMap from "./RouteStopsMap";
import StopEditor from "./StopEditor";

interface RouteStopsEditorProps {
    routeIndex: number;
}

export default function RouteStopsEditor({ routeIndex }: RouteStopsEditorProps) {
    const [stopEditorCollapsed, setStopEditorCollapsed] = useState(false);
    const [routeStopsMapCollapsed, setRouteStopsMapCollapsed] = useState(false);

    const columns = [];
    if (stopEditorCollapsed) {
        columns.push('48px');
    } else {
        columns.push('1fr');
    }
    columns.push('2fr');
    if (routeStopsMapCollapsed) {
        columns.push('48px');
    } else {
        columns.push('2fr');
    }
    const gridTemplateColumns = columns.join(' ');

    return (
        <>
            <div className="flex flex-col rounded-md px-4 py-4 bg-gray-200">
                <span className="underline">RouteStopsEditor</span>
                <div className="grid gap-2 mt-4" style={{ gridTemplateColumns }}>
                    <StopEditor collapsed={stopEditorCollapsed} onToggle={() => setStopEditorCollapsed(!stopEditorCollapsed)} />
                    <RouteStopsList routeIndex={routeIndex} />
                    <RouteStopsMap collapsed={routeStopsMapCollapsed} onToggle={() => setRouteStopsMapCollapsed(!routeStopsMapCollapsed)} routeIndex={routeIndex} />
                </div>
            </div>
        </>
    )
}





