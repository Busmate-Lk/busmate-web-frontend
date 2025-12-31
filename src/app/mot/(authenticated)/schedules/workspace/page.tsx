'use client';

import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/shared/layout';
import { ScheduleWorkspaceProvider } from '@/context/ScheduleWorkspace/ScheduleWorkspaceProvider';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace/useScheduleWorkspace';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import ScheduleFormMode from '@/components/mot/schedules/workspace/form-mode/ScheduleFormMode';
import ScheduleTextualMode from '@/components/mot/schedules/workspace/textual-mode/ScheduleTextualMode';
import ScheduleSubmissionModal from '@/components/mot/schedules/workspace/ScheduleSubmissionModal';
import RouteSelector from '@/components/mot/schedules/workspace/RouteSelector';
import { Loader2, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ScheduleWorkspaceContent() {
  const [activeTab, setActiveTab] = useState<'form' | 'textual'>('form');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { 
    mode, 
    isLoading, 
    loadError, 
    route, 
    routeId,
    loadRoute, 
    loadSchedules,
    data,
    addSchedule,
  } = useScheduleWorkspace();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Load route and schedules from URL params
  useEffect(() => {
    const routeIdParam = searchParams.get('routeId');
    const scheduleIdsParam = searchParams.get('scheduleIds');

    const loadData = async () => {
      // Load route first
      if (routeIdParam && routeIdParam !== routeId) {
        const routeSuccess = await loadRoute(routeIdParam);
        if (!routeSuccess) {
          toast({
            title: 'Error',
            description: 'Failed to load route',
            variant: 'destructive',
          });
          return;
        }

        // If schedule IDs provided, load them
        if (scheduleIdsParam) {
          const ids = scheduleIdsParam.split(',').filter(id => id.trim());
          if (ids.length > 0) {
            const scheduleSuccess = await loadSchedules(ids);
            if (!scheduleSuccess) {
              toast({
                title: 'Warning',
                description: 'Some schedules could not be loaded',
                variant: 'destructive',
              });
            }
          }
        }
      }
    };

    loadData();
  }, [searchParams, routeId, loadRoute, loadSchedules, toast]);

  // Add first schedule when route is loaded and no schedules exist
  useEffect(() => {
    if (route && data.schedules.length === 0 && !isLoading) {
      addSchedule();
    }
  }, [route, data.schedules.length, isLoading, addSchedule]);

  const handleSubmit = () => {
    if (data.schedules.length === 0) {
      toast({
        title: 'No schedules',
        description: 'Please add at least one schedule before submitting',
        variant: 'destructive',
      });
      return;
    }
    setIsModalOpen(true);
  };

  // Show route selector if no route selected
  if (!route && !isLoading && !loadError) {
    return (
      <Layout
        activeItem="schedules"
        pageTitle="Schedule Workspace"
        pageDescription="Select a route to create schedules"
        role="mot"
        initialSidebarCollapsed={true}
        padding={0}
      >
        <div className="p-6">
          <div className="mb-4">
            <Link 
              href="/mot/schedules" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Schedules
            </Link>
          </div>
          <RouteSelector />
        </div>
      </Layout>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Layout
        activeItem="schedules"
        pageTitle="Schedule Workspace"
        pageDescription="Loading..."
        role="mot"
        initialSidebarCollapsed={true}
        padding={0}
      >
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading schedule workspace...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <Layout
        activeItem="schedules"
        pageTitle="Schedule Workspace"
        pageDescription="Error"
        role="mot"
        initialSidebarCollapsed={true}
        padding={0}
      >
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="text-red-600 text-lg font-semibold">Failed to load schedule workspace</div>
            <p className="text-gray-600">{loadError}</p>
            <div className="flex gap-4">
              <Link
                href="/mot/schedules/workspace"
                className="text-blue-600 hover:underline"
              >
                Try again
              </Link>
              <Link
                href="/mot/schedules"
                className="text-gray-600 hover:underline"
              >
                Back to schedules
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const getPageTitle = () => {
    if (mode === 'edit') return 'Edit Schedules';
    if (mode === 'mixed') return 'Manage Schedules';
    return 'Create Schedules';
  };

  const getPageDescription = () => {
    if (!route) return 'Select a route to begin';
    return `${route.name}${route.routeNumber ? ` (${route.routeNumber})` : ''}`;
  };

  const getModeLabel = () => {
    if (mode === 'edit') return 'Edit Mode';
    if (mode === 'mixed') return 'Mixed Mode';
    return 'Create Mode';
  };

  const getModeColor = () => {
    if (mode === 'edit') return 'bg-yellow-100 text-yellow-800';
    if (mode === 'mixed') return 'bg-purple-100 text-purple-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Layout
      activeItem="schedules"
      pageTitle={getPageTitle()}
      pageDescription={getPageDescription()}
      role="mot"
      initialSidebarCollapsed={true}
      padding={0}
    >
      <div className="flex flex-col h-full">
        {/* Header toolbar */}
        <div className="flex bg-gray-100 border-b pl-1 sticky top-20 z-10 justify-between">
          <div className="flex items-center">
            {/* Back button */}
            <Link 
              href="/mot/schedules" 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md mr-2"
              title="Back to schedules"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            
            {/* Mode tabs */}
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'form'
                  ? 'text-white bg-blue-800'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Form Mode
            </button>
            <button
              onClick={() => setActiveTab('textual')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'textual'
                  ? 'text-white bg-blue-800'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Textual Mode
            </button>
            
            {/* Mode indicator badge */}
            <span className={`px-3 py-1 text-xs font-medium rounded-full ml-2 ${getModeColor()}`}>
              {getModeLabel()}
            </span>
            
            {/* Schedule count */}
            <span className="px-3 py-1 text-xs font-medium rounded-full ml-2 bg-blue-100 text-blue-800">
              <Calendar className="h-3 w-3 inline mr-1" />
              {data.schedules.length} schedule{data.schedules.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={data.schedules.length === 0}
            className={`px-4 py-2 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'edit'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : mode === 'mixed'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {mode === 'edit' ? 'Update Schedules' : mode === 'mixed' ? 'Save Changes' : 'Create Schedules'}
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'form' && <ScheduleFormMode />}
          {activeTab === 'textual' && <ScheduleTextualMode />}
        </div>
      </div>

      {/* Submission modal */}
      <ScheduleSubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Layout>
  );
}

export default function ScheduleWorkspacePage() {
  return (
    <ScheduleWorkspaceProvider>
      <Suspense fallback={
        <div className="flex flex-col h-96 justify-center items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading schedule workspace...</p>
        </div>
      }>
        <ScheduleWorkspaceContent />
      </Suspense>
      <Toaster />
    </ScheduleWorkspaceProvider>
  );
}
