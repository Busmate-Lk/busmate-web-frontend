'use client';

import RouteFormMode from '@/components/mot/routes/workspace/form-mode/RouteFormMode';
import RouteTextualMode from '@/components/mot/routes/workspace/textual-mode/RouteTextualMode';
import { Layout } from '@/components/shared/layout';
import { RouteWorkspaceProvider } from '@/context/RouteWorkspace/RouteWorkspaceProvider';
import { useState } from 'react';

export default function RoutesWorkspacePage() {
    const [activeTab, setActiveTab] = useState<'form' | 'textual'>('form');

    return (
        <RouteWorkspaceProvider>
            <Layout
                activeItem="routes"
                pageTitle="Routes Workspace"
                pageDescription="Create or edit bus routes efficiently"
                role="mot"
                initialSidebarCollapsed={true}
                padding={0}
            >
                <div>
                    <div className="flex bg-gray-100 border-b pl-1 sticky top-20 justify-between">
                        <div className="flex">
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
                            onClick={() => console.log('Submitted')}
                            className="px-4 py-2 font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                    <div className="p-4">
                        {activeTab === 'form' && <RouteFormMode />}
                        {activeTab === 'textual' && <RouteTextualMode />}
                    </div>
                </div>
            </Layout>
        </RouteWorkspaceProvider>
    );
}