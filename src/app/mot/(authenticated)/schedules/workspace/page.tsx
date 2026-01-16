'use client';

import { useState } from 'react';
import { Layout } from '@/components/shared/layout';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import ScheduleFormMode from '@/components/mot/schedules/workspace/form-mode/ScheduleFormMode';
import { ScheduleWorkspaceProvider, useScheduleWorkspace } from '@/context/ScheduleWorkspace';

function ScheduleWorkspaceContent() {
    const [activeTab, setActiveTab] = useState<'form' | 'textual'>('form');
    const { mode, validateSchedule, submitSchedule, getScheduleData, resetToCreateMode } = useScheduleWorkspace();
    const { toast } = useToast();

    const handleSubmit = async () => {
        const validation = validateSchedule();
        
        if (!validation.valid) {
            toast({
                title: 'Validation Failed',
                description: (
                    <ul className="list-disc pl-4 mt-2">
                        {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                ),
                variant: 'destructive',
            });
            return;
        }

        try {
            await submitSchedule();
            toast({
                title: 'Schedule Data Ready',
                description: 'Check the browser console to see the final schedule data object that would be sent to the API.',
            });
        } catch (error) {
            toast({
                title: 'Submission Error',
                description: error instanceof Error ? error.message : 'An error occurred',
                variant: 'destructive',
            });
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all changes and start fresh?')) {
            resetToCreateMode();
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
                        <span className="ml-4 text-sm text-gray-500 flex items-center gap-2">
                            Mode: <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                mode === 'create' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>{mode.toUpperCase()}</span>
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
                    {activeTab === 'textual' && (
                        <div className="bg-gray-100 rounded-lg p-8 text-center">
                            <p className="text-gray-500">Schedule Textual Mode - Coming Soon</p>
                            <p className="text-sm text-gray-400 mt-2">This mode will allow you to view and edit schedule data in YAML/JSON format.</p>
                        </div>
                    )}
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
