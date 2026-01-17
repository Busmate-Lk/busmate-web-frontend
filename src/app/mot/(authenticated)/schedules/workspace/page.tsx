'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/shared/layout';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import ScheduleFormMode from '@/components/mot/schedules/workspace/form-mode/ScheduleFormMode';
import ScheduleTextualMode from '@/components/mot/schedules/workspace/textual-mode/ScheduleTextualMode';
import { ScheduleAIStudio } from '@/components/mot/schedules/workspace/ai-studio';
import { ScheduleWorkspaceProvider, useScheduleWorkspace } from '@/context/ScheduleWorkspace';
import { Sparkles } from 'lucide-react';

function ScheduleWorkspaceContent() {
    const [activeTab, setActiveTab] = useState<'form' | 'textual' | 'ai-studio'>('form');
    const { mode, validateAllSchedules, submitAllSchedules, resetToCreateMode, data, setSelectedRoute, isLoading } = useScheduleWorkspace();
    const { toast } = useToast();
    const { schedules } = data;
    const searchParams = useSearchParams();

    // Load route from query param on mount
    useEffect(() => {
        const routeIdParam = searchParams.get('routeId');
        if (routeIdParam && !isLoading && data.availableRoutes.length > 0 && !data.selectedRouteId) {
            // Check if route exists in available routes
            const routeExists = data.availableRoutes.some(route => route.id === routeIdParam);
            if (routeExists) {
                setSelectedRoute(routeIdParam);
            }
        }
    }, [searchParams, setSelectedRoute, isLoading, data.availableRoutes, data.selectedRouteId]);

    const handleSubmit = async () => {
        const validation = validateAllSchedules();
        
        if (!validation.valid) {
            // Show validation errors with schedule information
            const errorMessages = validation.scheduleErrors.flatMap((scheduleError, idx) => 
                scheduleError.errors.map(error => `Schedule ${idx + 1} (${schedules[idx]?.name || 'Unnamed'}): ${error}`)
            );
            
            toast({
                title: `Validation Failed (${validation.invalidCount} of ${schedules.length} schedules have errors)`,
                description: (
                    <ul className="list-disc pl-4 mt-2 max-h-48 overflow-y-auto">
                        {errorMessages.slice(0, 10).map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                        ))}
                        {errorMessages.length > 10 && (
                            <li className="text-sm text-muted-foreground">...and {errorMessages.length - 10} more errors</li>
                        )}
                    </ul>
                ),
                variant: 'destructive',
            });
            return;
        }

        try {
            await submitAllSchedules();
            toast({
                title: 'All Schedules Data Ready',
                description: `${schedules.length} schedule(s) validated. Check the browser console to see the final data that would be sent to the API.`,
            });
        } catch (error) {
            toast({
                title: 'Submission Error',
                description: error instanceof Error ? error.message : 'An error occurred',
                variant: 'destructive',
            });
        }
    };

    const handleReset = async () => {
        if (confirm('Are you sure you want to reset all changes and start fresh?')) {
            await resetToCreateMode();
            toast({
                title: 'Workspace Reset',
                description: 'The schedule workspace has been reset.',
            });
        }
    };

    return (
        <Layout
            activeItem="schedules"
            pageTitle="Schedules Workspace"
            pageDescription="Create and manage bus schedules"
            role="mot"
            initialSidebarCollapsed={true}
            padding={0}
        >
            <div>
                <div className="flex bg-gray-100 border-b pl-1 sticky top-20 justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => setActiveTab('form')}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'form'
                                ? 'text-white bg-blue-800'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Form Mode
                        </button>
                        <button
                            onClick={() => setActiveTab('textual')}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'textual'
                                ? 'text-white bg-blue-800'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Textual Mode
                        </button>
                        <button
                            onClick={() => setActiveTab('ai-studio')}
                            className={`px-4 py-2 font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'ai-studio'
                                ? 'text-white bg-purple-700'
                                : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Studio
                        </button>
                        <span className="ml-4 text-sm text-gray-500 flex items-center gap-2">
                            Mode: <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                mode === 'create' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>{mode.toUpperCase()}</span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                {schedules.length} Schedule{schedules.length !== 1 ? 's' : ''}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-200"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 font-medium text-white transition-colors bg-green-600 hover:bg-green-700"
                        >
                            Submit
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    {activeTab === 'form' && <ScheduleFormMode />}
                    {activeTab === 'textual' && <ScheduleTextualMode />}
                    {activeTab === 'ai-studio' && <ScheduleAIStudio />}
                </div>
            </div>
        </Layout>
    );
}

export default function ScheduleWorkspacePage() {
    return (
        <ScheduleWorkspaceProvider>
            <ScheduleWorkspaceContent />
            <Toaster />
        </ScheduleWorkspaceProvider>
    );
}
