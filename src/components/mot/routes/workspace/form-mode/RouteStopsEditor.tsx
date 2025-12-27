'use client';

import RouteStopsList from "./RouteStopsList";
import RouteStopsMap from "./RouteStopsMap";
import StopEditor from "./StopEditor";

export default function RouteStopsEditor() {
    return (
        <>
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="underline">RouteStopsEditor</span>
                <div className="grid grid-cols-5 gap-4 mt-4">
                    <StopEditor />

                    <RouteStopsList />

                    {/* <RouteStopsMap /> */}
                </div>
            </div>
        </>
    )
}





