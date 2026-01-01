export default function ScheduleGrid() {
    // Dummy data
    const stops = [
        'Colombo Central',
        'Pettah',
        'Fort',
        'Slave Island',
        'Wellawatte',
        'Dehiwala',
        'Mount Lavinia',
        'Ratmalana',
        'Moratuwa',
        'Panadura'
    ];

    const schedules = [
        {
            id: 'SCH001',
            departureTime: '06:00',
            stops: [
                '06:00', '06:05', '06:10', '06:15', '06:20',
                '06:25', '06:30', '06:35', '06:40', '06:50'
            ]
        },
        {
            id: 'SCH002',
            departureTime: '07:00',
            stops: [
                '07:00', '07:05', '07:10', '07:15', '07:20',
                '07:25', '07:30', '07:35', '07:40', '07:50'
            ]
        },
        {
            id: 'SCH003',
            departureTime: '08:00',
            stops: [
                '08:00', '08:05', '08:10', '08:15', '08:20',
                '08:25', '08:30', '08:35', '08:40', '08:50'
            ]
        }
    ];

    return (
        <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
            <span className="mb-2 underline">Schedule Grid</span>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-300 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Schedule
                            </th>
                            {stops.map(stop => (
                                <th key={stop} className="px-4 py-2 border-b border-gray-300 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {stop}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map(schedule => (
                            <tr key={schedule.id}>
                                <td className="px-4 py-2 border-b border-gray-300 text-sm font-medium">
                                    {schedule.departureTime}
                                </td>
                                {schedule.stops.map((time, index) => (
                                    <td key={index} className="px-4 py-2 border-b border-gray-300 text-sm">
                                        {time}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Add Schedule
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Edit Selected
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Delete Selected
                </button>
            </div>
        </div>
    );
}