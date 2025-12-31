'use client';

import { useScheduleWorkspace } from '@/context/ScheduleWorkspace/useScheduleWorkspace';
import { 
  ScheduleTypeEnum, 
  ScheduleStatusEnum, 
  ExceptionTypeEnum,
  ScheduleException,
  createWeekdayCalendar,
  createWeekendCalendar,
  createAllDaysCalendar,
} from '@/types/ScheduleWorkspaceData';
import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ScheduleInfoProps {
  scheduleIndex: number;
}

export default function ScheduleInfo({ scheduleIndex }: ScheduleInfoProps) {
  const { data, updateSchedule, updateScheduleCalendar, addScheduleException, removeScheduleException } = useScheduleWorkspace();
  const schedule = data.schedules[scheduleIndex];
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showExceptionsPanel, setShowExceptionsPanel] = useState(false);
  const [newExceptionDate, setNewExceptionDate] = useState('');
  const [newExceptionType, setNewExceptionType] = useState<ExceptionTypeEnum>(ExceptionTypeEnum.REMOVED);

  if (!schedule) return null;

  const handleFieldChange = (field: string, value: any) => {
    updateSchedule(scheduleIndex, { [field]: value });
  };

  const handleCalendarDayToggle = (day: string) => {
    updateScheduleCalendar(scheduleIndex, { [day]: !schedule.calendar[day as keyof typeof schedule.calendar] });
  };

  const handleCalendarPreset = (preset: 'weekdays' | 'weekends' | 'all') => {
    const calendar = preset === 'weekdays' 
      ? createWeekdayCalendar() 
      : preset === 'weekends' 
      ? createWeekendCalendar() 
      : createAllDaysCalendar();
    
    updateScheduleCalendar(scheduleIndex, calendar);
  };

  const handleAddException = () => {
    if (!newExceptionDate) return;
    
    const exception: ScheduleException = {
      exceptionDate: newExceptionDate,
      exceptionType: newExceptionType,
    };
    
    addScheduleException(scheduleIndex, exception);
    setNewExceptionDate('');
  };

  const days = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ];

  return (
    <div className="border rounded-lg bg-gray-50">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Schedule Details</span>
          {schedule.isNew && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">New</span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Name *
              </label>
              <input
                type="text"
                value={schedule.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="e.g., Weekday Morning Express"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Type *
              </label>
              <select
                value={schedule.scheduleType}
                onChange={(e) => handleFieldChange('scheduleType', e.target.value as ScheduleTypeEnum)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={ScheduleTypeEnum.REGULAR}>Regular</option>
                <option value={ScheduleTypeEnum.SPECIAL}>Special</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={schedule.status}
                onChange={(e) => handleFieldChange('status', e.target.value as ScheduleStatusEnum)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={ScheduleStatusEnum.PENDING}>Pending</option>
                <option value={ScheduleStatusEnum.ACTIVE}>Active</option>
                <option value={ScheduleStatusEnum.INACTIVE}>Inactive</option>
                <option value={ScheduleStatusEnum.CANCELLED}>Cancelled</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={schedule.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Effective Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Start Date *
              </label>
              <input
                type="date"
                value={schedule.effectiveStartDate}
                onChange={(e) => handleFieldChange('effectiveStartDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective End Date
              </label>
              <input
                type="date"
                value={schedule.effectiveEndDate || ''}
                onChange={(e) => handleFieldChange('effectiveEndDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for indefinite schedule</p>
            </div>
          </div>

          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Operating Days *
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCalendarPreset('weekdays')}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Weekdays
                </button>
                <button
                  onClick={() => handleCalendarPreset('weekends')}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Weekends
                </button>
                <button
                  onClick={() => handleCalendarPreset('all')}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Every Day
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {days.map((day) => (
                <button
                  key={day.key}
                  onClick={() => handleCalendarDayToggle(day.key)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    schedule.calendar[day.key as keyof typeof schedule.calendar]
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exceptions */}
          <div>
            <button
              onClick={() => setShowExceptionsPanel(!showExceptionsPanel)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <Clock className="h-4 w-4" />
              Schedule Exceptions ({schedule.exceptions.length})
              {showExceptionsPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showExceptionsPanel && (
              <div className="mt-3 p-3 bg-white border rounded-md">
                {/* Add exception form */}
                <div className="flex items-end gap-3 mb-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Exception Date</label>
                    <input
                      type="date"
                      value={newExceptionDate}
                      onChange={(e) => setNewExceptionDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Type</label>
                    <select
                      value={newExceptionType}
                      onChange={(e) => setNewExceptionType(e.target.value as ExceptionTypeEnum)}
                      className="px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={ExceptionTypeEnum.REMOVED}>No Service</option>
                      <option value={ExceptionTypeEnum.ADDED}>Added Service</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddException}
                    disabled={!newExceptionDate}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Exceptions list */}
                {schedule.exceptions.length > 0 ? (
                  <div className="space-y-1">
                    {schedule.exceptions.map((exception, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          {exception.exceptionType === ExceptionTypeEnum.REMOVED ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm">{exception.exceptionDate}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            exception.exceptionType === ExceptionTypeEnum.REMOVED
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {exception.exceptionType === ExceptionTypeEnum.REMOVED ? 'No Service' : 'Added'}
                          </span>
                        </div>
                        <button
                          onClick={() => removeScheduleException(scheduleIndex, idx)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No exceptions defined. Add exceptions for holidays or special service days.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
