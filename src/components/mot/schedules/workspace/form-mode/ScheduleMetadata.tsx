'use client';

import { useScheduleWorkspace } from '@/context/ScheduleWorkspace';
import { ScheduleTypeEnum, ScheduleStatusEnum, ScheduleCalendar } from '@/types/ScheduleWorkspaceData';

export default function ScheduleMetadata() {
    const { 
        getActiveSchedule, 
        updateActiveSchedule, 
        updateCalendar, 
        setWeekdaysOnly, 
        setWeekendsOnly, 
        setAllDays,
        activeScheduleIndex,
    } = useScheduleWorkspace();
    
    const activeSchedule = getActiveSchedule();
    
    // Don't render if no active schedule
    if (!activeSchedule || activeScheduleIndex === null) {
        return (
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200 w-3/5">
                <span className="mb-2 text-gray-500">No schedule selected</span>
            </div>
        );
    }
    
    const { calendar } = activeSchedule;

    const daysOfWeek = [
        { key: 'monday', label: 'Monday', short: 'Mon' },
        { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
        { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
        { key: 'thursday', label: 'Thursday', short: 'Thu' },
        { key: 'friday', label: 'Friday', short: 'Fri' },
        { key: 'saturday', label: 'Saturday', short: 'Sat' },
        { key: 'sunday', label: 'Sunday', short: 'Sun' },
    ] as const;

    const handleDayToggle = (day: keyof ScheduleCalendar) => {
        updateCalendar({ [day]: !calendar[day] });
    };

    return (
        <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200 w-3/5">
            <span className="mb-2 underline font-medium">
                Schedule Metadata
                <span className="text-sm font-normal text-gray-600 ml-2">
                    (Editing: {activeSchedule.name || `Schedule ${activeScheduleIndex + 1}`})
                </span>
            </span>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                {/* First row: Name, Schedule Type, Status */}
                <div className="flex flex-row gap-4">
                    {/* Schedule name */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Schedule Name *</label>
                        <input
                            type="text"
                            className="border border-gray-400 rounded px-2 py-1 bg-white"
                            value={activeSchedule.name}
                            onChange={(e) => updateActiveSchedule({ name: e.target.value })}
                            placeholder="Enter schedule name"
                        />
                    </div>
                    {/* scheduleType */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Schedule Type</label>
                        <select
                            className="border border-gray-400 rounded px-2 py-1 bg-white"
                            value={activeSchedule.scheduleType}
                            onChange={(e) => updateActiveSchedule({ scheduleType: e.target.value as ScheduleTypeEnum })}
                        >
                            <option value={ScheduleTypeEnum.REGULAR}>Regular</option>
                            <option value={ScheduleTypeEnum.SPECIAL}>Special</option>
                        </select>
                    </div>
                    {/* ScheduleStatus */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            className="border border-gray-400 rounded px-2 py-1 bg-white"
                            value={activeSchedule.status}
                            onChange={(e) => updateActiveSchedule({ status: e.target.value as ScheduleStatusEnum })}
                        >
                            <option value={ScheduleStatusEnum.PENDING}>Pending</option>
                            <option value={ScheduleStatusEnum.ACTIVE}>Active</option>
                            <option value={ScheduleStatusEnum.INACTIVE}>Inactive</option>
                            <option value={ScheduleStatusEnum.CANCELLED}>Cancelled</option>
                        </select>
                    </div>
                </div>
                {/* Second row: Start Date, End Date, Description */}
                <div className="flex flex-row gap-4">
                    {/* Start Date */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Start Date *</label>
                        <input
                            type="date"
                            className="border border-gray-400 rounded px-2 py-1 bg-white"
                            value={activeSchedule.effectiveStartDate}
                            onChange={(e) => updateActiveSchedule({ effectiveStartDate: e.target.value })}
                        />
                    </div>
                    {/* End Date */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            type="date"
                            className="border border-gray-400 rounded px-2 py-1 bg-white"
                            value={activeSchedule.effectiveEndDate || ''}
                            onChange={(e) => updateActiveSchedule({ effectiveEndDate: e.target.value })}
                        />
                    </div>
                    {/* Description */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="border border-gray-400 rounded px-2 py-1 bg-white"
                            value={activeSchedule.description || ''}
                            onChange={(e) => updateActiveSchedule({ description: e.target.value })}
                            rows={1}
                            placeholder="Optional description"
                        />
                    </div>
                </div>
                {/* Third row: Operating Days with quick actions */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Operating Days</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={setWeekdaysOnly}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                                Weekdays
                            </button>
                            <button
                                type="button"
                                onClick={setWeekendsOnly}
                                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            >
                                Weekends
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllDays(true)}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllDays(false)}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-300"
                            >
                                None
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {daysOfWeek.map(day => (
                            <label key={day.key} className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={calendar[day.key]}
                                    onChange={() => handleDayToggle(day.key)}
                                    className="mr-2 cursor-pointer"
                                />
                                <span className="text-sm">{day.short}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Generate Trips toggle */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="generateTrips"
                        checked={activeSchedule.generateTrips ?? false}
                        onChange={(e) => updateActiveSchedule({ generateTrips: e.target.checked })}
                        className="cursor-pointer"
                    />
                    <label htmlFor="generateTrips" className="text-sm cursor-pointer">
                        Automatically generate trips for this schedule
                    </label>
                </div>
            </form>
        </div>
    );
}