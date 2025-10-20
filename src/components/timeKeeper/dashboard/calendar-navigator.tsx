'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CalendarNavigatorProps {
  onDateSelect?: (date: string) => void;
}

export function CalendarNavigator({ onDateSelect }: CalendarNavigatorProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateToTrips = (date: Date) => {
    // Format date as YYYY-MM-DD without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    router.push(`/timeKeeper/trip?fromDate=${dateString}&toDate=${dateString}`);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      // Format date as YYYY-MM-DD without timezone conversion
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onDateSelect(`${year}-${month}-${day}`);
    } else {
      navigateToTrips(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const hasSchedules = (date: Date) => {
    // Mock logic to show which dates have schedules
    return date.getDay() !== 0; // No schedules on Sundays
  };

  const hasDelays = (date: Date) => {
    // Mock logic to show which dates have reported delays
    const today = new Date();
    return (
      date <= today &&
      date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <div className="p-1.5 bg-blue-800 rounded-lg">
            <CalendarIcon className="h-3.5 w-3.5 text-white" />
          </div>
          Schedule Calendar
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3 bg-white/60 backdrop-blur-sm rounded-lg px-2 py-2">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-all hover:scale-105"
        >
          <ChevronLeft className="h-3.5 w-3.5 text-slate-700" />
        </button>

        <h4 className="text-sm font-semibold text-slate-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>

        <button
          onClick={goToNextMonth}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-all hover:scale-105"
        >
          <ChevronRight className="h-3.5 w-3.5 text-slate-700" />
        </button>
      </div>

      {/* Days of Week Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-600 py-1.5 bg-slate-200/50 rounded-t"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date && (
              <button
                onClick={() => handleDateClick(date)}
                className={`w-full h-full flex flex-col items-center justify-center text-xs rounded-md transition-all relative ${
                  isToday(date)
                    ? 'bg-blue-800 text-white font-bold shadow-lg scale-105 ring-2 ring-blue-400 ring-offset-1'
                    : isSelected(date)
                    ? 'bg-blue-100 text-blue-800 font-semibold shadow-md scale-105'
                    : 'hover:bg-slate-200 text-slate-700 bg-white/80 hover:scale-105 hover:shadow'
                }`}
              >
                <span className="mb-0.5">{date.getDate()}</span>

                {/* Schedule indicators */}
                <div className="flex gap-0.5">
                  {hasSchedules(date) && (
                    <div
                      className={`w-1 h-1 rounded-full shadow-sm ${
                        isToday(date) ? 'bg-emerald-300' : 'bg-emerald-500'
                      }`}
                      title="Has schedules"
                    />
                  )}
                  {hasDelays(date) && (
                    <div
                      className={`w-1 h-1 rounded-full shadow-sm ${
                        isToday(date) ? 'bg-amber-300' : 'bg-rose-500'
                      }`}
                      title="Has delays reported"
                    />
                  )}
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="text-[10px] text-slate-500 text-center font-medium">
          Click on any date to view trips for that day
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-white/60 rounded-lg py-1.5">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></div>
            <span className="text-slate-600 font-medium">Schedules</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm"></div>
            <span className="text-slate-600 font-medium">Delays</span>
          </div>
        </div>
      </div>
    </div>
  );
}
