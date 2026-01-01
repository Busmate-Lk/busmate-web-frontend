import ScheduleMetadata from './ScheduleMetadata';
import ScheduleExceptions from './ScheduleExceptions';
import ScheduleGrid from './ScheduleGrid';

export default function ScheduleFormMode() {
    return (
        <div className="space-y-4">
            {/* Route selector */}
            <div className='flex items-center'>
                <select
                    id="route"
                    name="route"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">-- Select a Route --</option>
                    <option value="route1">Route 1 - Colombo to Kandy</option>
                    <option value="route2">Route 2 - Colombo to Galle</option>
                    <option value="route3">Route 3 - Colombo to Jaffna</option>
                </select>
            </div>

            <div className='flex gap-4'>
                <ScheduleMetadata />

                <ScheduleExceptions />
            </div>

            <ScheduleGrid />
        </div>
    );
}
