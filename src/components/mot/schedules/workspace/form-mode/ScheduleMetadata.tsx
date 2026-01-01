export default function ScheduleMetadata() {
    // Dummy data
    const scheduleMetadata = {
        name: 'Sample Schedule', // Added missing name
        scheduleType: 'Regular',
        status: 'Active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        notes: 'Regular weekday schedule'
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200 w-3/5">
            <span className="mb-2 underline">Schedule Metadata</span>
            <form className="flex flex-col gap-4">
                {/* First row: Name, Schedule Type, Status */}
                <div className="flex flex-row gap-4">
                    {/* Schedule name */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Schedule Name</label>
                        <input
                            type="text"
                            className="border border-gray-400 rounded px-2 bg-white"
                            value={scheduleMetadata.name}
                            onChange={() => {}} // Dummy
                        />
                    </div>
                    {/* scheduleType */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Schedule Type</label>
                        <select
                            className="border border-gray-400 rounded px-2 bg-white"
                            value={scheduleMetadata.scheduleType}
                            onChange={() => {}} // Dummy
                        >
                            <option value="Regular">Regular</option>
                            <option value="Special">Special</option>
                            <option value="Holiday">Holiday</option>
                        </select>
                    </div>
                    {/* ScheduleStatus */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            className="border border-gray-400 rounded px-2 bg-white"
                            value={scheduleMetadata.status}
                            onChange={() => {}} // Dummy
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>
                </div>
                {/* Second row: Start Date, End Date, Description */}
                <div className="flex flex-row gap-4">
                    {/* Start Date */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            className="border border-gray-400 rounded px-2 bg-white"
                            value={scheduleMetadata.startDate}
                            onChange={() => {}} // Dummy
                        />
                    </div>
                    {/* End Date */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            type="date"
                            className="border border-gray-400 rounded px-2 bg-white"
                            value={scheduleMetadata.endDate}
                            onChange={() => {}} // Dummy
                        />
                    </div>
                    {/* Description */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="border border-gray-400 rounded px-2 bg-white"
                            value={scheduleMetadata.notes}
                            onChange={() => {}} // Dummy
                            rows={1}
                        />
                    </div>
                </div>
                {/* Third row: Operating Days */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-2">Operating Days</label>
                    <div className="grid grid-cols-7 gap-2">
                        {daysOfWeek.map(day => (
                            <label key={day} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={scheduleMetadata.operatingDays.includes(day)}
                                    onChange={() => {}} // Dummy
                                    className="mr-2"
                                />
                                <span className="text-sm">{day.slice(0, 3)}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
}