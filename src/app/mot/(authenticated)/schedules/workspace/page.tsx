'use client';

import { useState } from 'react';
import { Layout } from '@/components/shared/layout';
import { Toaster } from '@/components/ui/toaster';
import ScheduleFormMode from '@/components/mot/schedules/workspace/form-mode/ScheduleFormMode';

function ScheduleWorkspaceContent() {
    const [activeTab, setActiveTab] = useState<'form' | 'textual'>('form');

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
                    </div>
                    <button
                        onClick={() => {}}
                        className="px-4 py-2 font-medium text-white transition-colors bg-green-600 hover:bg-green-700"
                    >
                        Submit
                    </button>
                </div>
                <div className="p-4">
                    {activeTab === 'form' && <ScheduleFormMode />}
                    {activeTab === 'textual' && <div>Schedule Textual Mode - Coming Soon</div>}
                </div>
            </div>
        </Layout>
    );
}

export default function ScheduleWorkspacePage() {
    return (
        <>
            <ScheduleWorkspaceContent />
            <Toaster />
        </>
    );
}
