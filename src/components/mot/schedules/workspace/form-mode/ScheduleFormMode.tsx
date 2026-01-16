'use client';

import { useScheduleWorkspace } from '@/context/ScheduleWorkspace';
import ScheduleMetadata from './ScheduleMetadata';
import ScheduleExceptions from './ScheduleExceptions';
import ScheduleGrid from './ScheduleGrid';

export default function ScheduleFormMode() {
    const { data, setSelectedRoute, isLoading } = useScheduleWorkspace();
    const { schedule, availableRoutes } = data;

    const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const routeId = e.target.value;
        if (routeId) {
            setSelectedRoute(routeId);
        }
    };

    return (
        <div className="space-y-4">
            {/* Route selector */}
            <div className='flex items-center gap-4'>
                <label htmlFor="route" className="text-sm font-medium whitespace-nowrap">
                    Select Route:
                </label>
                <select
                    id="route"
                    name="route"
                    value={schedule.routeId}
                    onChange={handleRouteChange}
                    disabled={isLoading}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">-- Select a Route --</option>
                    {availableRoutes.map(route => (
                        <option key={route.id} value={route.id}>
                            {route.routeGroupName} - {route.name}
                            {route.direction && ` (${route.direction})`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Show selected route info */}
            {schedule.routeId && (
                <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                    <span className="font-medium">Selected Route: </span>
                    {schedule.routeName}
                    {schedule.routeGroupName && (
                        <span className="ml-2 text-gray-500">
                            (Group: {schedule.routeGroupName})
                        </span>
                    )}
                </div>
            )}

            <div className='flex gap-4'>
                <ScheduleMetadata />
                <ScheduleExceptions />
            </div>

            <ScheduleGrid />
        </div>
    );
}
