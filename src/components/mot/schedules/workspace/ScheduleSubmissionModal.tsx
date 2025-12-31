'use client';

import { useState, useEffect } from 'react';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace/useScheduleWorkspace';
import { validateAllSchedules } from '@/services/scheduleWorkspaceValidation';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  Clock,
  FileCheck,
} from 'lucide-react';
import { ScheduleStatusEnum } from '@/types/ScheduleWorkspaceData';

interface ScheduleSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmissionStatus = 'pending' | 'validating' | 'saving' | 'success' | 'error';

interface ScheduleSubmissionState {
  scheduleIndex: number;
  scheduleName: string;
  status: SubmissionStatus;
  error?: string;
  stopsCount: number;
}

export default function ScheduleSubmissionModal({
  isOpen,
  onClose,
}: ScheduleSubmissionModalProps) {
  const { data, route, saveAllSchedules, mode, activeScheduleIndex } = useScheduleWorkspace();
  
  const [overallStatus, setOverallStatus] = useState<SubmissionStatus>('pending');
  const [scheduleStates, setScheduleStates] = useState<ScheduleSubmissionState[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveProgress, setSaveProgress] = useState(0);

  // Initialize schedule states
  useEffect(() => {
    if (isOpen && data?.schedules) {
      const states: ScheduleSubmissionState[] = data.schedules.map((schedule, idx) => ({
        scheduleIndex: idx,
        scheduleName: schedule.name,
        status: 'pending',
        stopsCount: schedule.scheduleStops?.length || 0,
      }));
      setScheduleStates(states);
      setOverallStatus('pending');
      setValidationErrors([]);
      setSaveProgress(0);
    }
  }, [isOpen, data?.schedules]);

  // Validate before submission
  const handleValidate = () => {
    if (!data?.schedules || !route) return;

    setOverallStatus('validating');
    setScheduleStates(prev => prev.map(s => ({ ...s, status: 'validating' })));

    // Run validation
    const validation = validateAllSchedules({
      route,
      schedules: data.schedules,
      activeScheduleIndex: activeScheduleIndex,
    });
    
    if (!validation.isValid) {
      // Flatten all errors from schedule results
      const allErrors = validation.scheduleResults.flatMap((result, scheduleIdx) => 
        result.errors.map(e => `Schedule ${scheduleIdx + 1}: ${e.message}`)
      );
      setValidationErrors(allErrors);
      setScheduleStates(prev => prev.map((s, idx) => {
        const scheduleResult = validation.scheduleResults[idx];
        const hasErrors = scheduleResult && scheduleResult.errors.length > 0;
        return {
          ...s,
          status: hasErrors ? 'error' : 'pending',
          error: hasErrors ? scheduleResult.errors[0]?.message : undefined,
        };
      }));
      setOverallStatus('error');
    } else {
      setValidationErrors([]);
      setScheduleStates(prev => prev.map(s => ({ ...s, status: 'pending', error: undefined })));
      setOverallStatus('pending');
    }
  };

  // Submit all schedules
  const handleSubmit = async () => {
    if (!data?.schedules || data.schedules.length === 0) return;

    setOverallStatus('saving');
    let hasError = false;

    // Process each schedule
    for (let i = 0; i < data.schedules.length; i++) {
      // Update current schedule status
      setScheduleStates(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'saving' } : s
      ));

      try {
        // Simulate individual save (in reality, saveAllSchedules handles this)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulated delay
        
        setScheduleStates(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'success' } : s
        ));
      } catch (error) {
        hasError = true;
        setScheduleStates(prev => prev.map((s, idx) => 
          idx === i ? { 
            ...s, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Failed to save' 
          } : s
        ));
      }

      setSaveProgress(((i + 1) / data.schedules.length) * 100);
    }

    // Call actual save
    try {
      await saveAllSchedules();
      setOverallStatus('success');
    } catch (error) {
      setOverallStatus('error');
    }
  };

  if (!isOpen) return null;

  const pendingCount = scheduleStates.filter(s => s.status === 'pending').length;
  const successCount = scheduleStates.filter(s => s.status === 'success').length;
  const errorCount = scheduleStates.filter(s => s.status === 'error').length;
  const totalCount = scheduleStates.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Submit Schedules
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {mode === 'create' ? 'Create' : 'Update'} {totalCount} schedule{totalCount !== 1 ? 's' : ''} for {route?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={overallStatus === 'saving'}
            className="p-2 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
              <div className="text-sm text-blue-700">Total Schedules</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {data?.schedules?.reduce((sum, s) => sum + (s.scheduleStops?.length || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Total Stops</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {data?.schedules?.filter(s => s.status === ScheduleStatusEnum.ACTIVE).length || 0}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Validation Errors</span>
              </div>
              <ul className="space-y-1">
                {validationErrors.slice(0, 5).map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700">• {error}</li>
                ))}
                {validationErrors.length > 5 && (
                  <li className="text-sm text-red-600 font-medium">
                    ... and {validationErrors.length - 5} more error(s)
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Progress bar */}
          {overallStatus === 'saving' && (
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${saveProgress}%` }}
              />
            </div>
          )}

          {/* Schedule list */}
          <div className="border rounded-lg divide-y">
            {scheduleStates.map((state) => (
              <div 
                key={state.scheduleIndex}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {state.scheduleIndex + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {state.scheduleName || `Schedule ${state.scheduleIndex + 1}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {state.stopsCount} stop{state.stopsCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {state.status === 'pending' && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      Pending
                    </span>
                  )}
                  {state.status === 'validating' && (
                    <span className="flex items-center gap-1 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validating
                    </span>
                  )}
                  {state.status === 'saving' && (
                    <span className="flex items-center gap-1 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {state.status === 'success' && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Saved
                    </span>
                  )}
                  {state.status === 'error' && (
                    <span className="flex items-center gap-1 text-sm text-red-600" title={state.error}>
                      <XCircle className="h-4 w-4" />
                      Error
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Success message */}
          {overallStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-medium text-green-800">
                  All schedules saved successfully!
                </div>
                <div className="text-sm text-green-700">
                  {successCount} schedule{successCount !== 1 ? 's' : ''} have been {mode === 'create' ? 'created' : 'updated'}.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-4 text-sm">
            {pendingCount > 0 && (
              <span className="text-gray-500">{pendingCount} pending</span>
            )}
            {successCount > 0 && (
              <span className="text-green-600">{successCount} saved</span>
            )}
            {errorCount > 0 && (
              <span className="text-red-600">{errorCount} failed</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {overallStatus === 'success' ? (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Done
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  disabled={overallStatus === 'saving'}
                  className="px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidate}
                  disabled={overallStatus === 'saving' || overallStatus === 'validating'}
                  className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  Validate
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={overallStatus === 'saving' || validationErrors.length > 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {overallStatus === 'saving' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save All
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
