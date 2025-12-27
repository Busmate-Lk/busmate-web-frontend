'use client';

import { useState } from "react";
import RouteStopsEditor from "./RouteStopsEditor";
import { useRouteWorkspace } from "@/context/RouteWorkspace/useRouteWorkspace";

export default function RouteFormMode() {
    const [activeTab, setActiveTab] = useState<'outbound' | 'inbound'>('outbound');

    return (
        <div className="space-y-4">
            <RouteGroupInfo />

            <div className="flex bg-gray-100 border-b pl-1">
                <button
                    onClick={() => setActiveTab('outbound')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'outbound'
                        ? 'text-white bg-blue-800'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Outbound Route
                </button>
                <button
                    onClick={() => setActiveTab('inbound')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'inbound'
                        ? 'text-white bg-blue-800'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Inbound Route
                </button>
            </div>
            <RouteInfo />
        </div>
    )
}

function RouteGroupInfo() {
    const { data, updateRouteGroup } = useRouteWorkspace();

    return (
        <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
            <span className="mb-2 underline">Route Group Info</span>
            <form className="space-y-4">
                <div className="flex">
                    <label className="block text-sm font-medium w-32">Name (English) <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        className="w-200 border border-gray-400 rounded px-2 bg-white"
                        value={data.routeGroup.nameEnglish}
                        onChange={(e) => updateRouteGroup({ nameEnglish: e.target.value })}
                    />
                </div>
                <div className="flex">
                    <label className="block text-sm font-medium w-32">Name (Sinhala)</label>
                    <input 
                        type="text" 
                        className="w-200 border border-gray-400 rounded px-2 bg-white"
                        value={data.routeGroup.nameSinhala}
                        onChange={(e) => updateRouteGroup({ nameSinhala: e.target.value })}
                    />
                </div>
                <div className="flex">
                    <label className="block text-sm font-medium w-32">Name (Tamil)</label>
                    <input 
                        type="text" 
                        className="w-200 border border-gray-400 rounded px-2 bg-white"
                        value={data.routeGroup.nameTamil}
                        onChange={(e) => updateRouteGroup({ nameTamil: e.target.value })}
                    />
                </div>
                <div className="flex">
                    <label className="block text-sm font-medium w-32">Description</label>
                    <textarea 
                        className="w-200 border border-gray-400 rounded px-2 bg-white" 
                        rows={3}
                        value={data.routeGroup.description}
                        onChange={(e) => updateRouteGroup({ description: e.target.value })}
                    ></textarea>
                </div>
            </form>
        </div>
    );
}

function RouteInfo() {
    return (
        <>
            <div className="flex flex-col rounded-md px-6 py-4 bg-gray-200">
                <span className="mb-2 underline">Route Info</span>
                <form className="space-y-4">
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Name (English) <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full border border-gray-400 rounded px-2 bg-white" />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Name (Sinhala)</label>
                            <input type="text" className="w-full border border-gray-400 rounded px-2 bg-white" />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Name (Tamil)</label>
                            <input type="text" className="w-full border border-gray-400 rounded px-2 bg-white" />
                        </div>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Route Number</label>
                            <input type="text" className="w-full border border-gray-400 rounded px-2 bg-white" />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Road Type</label>
                            <select className="w-full border border-gray-400 rounded px-2 bg-white">
                                <option value="">Select road type</option>
                            </select>
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Direction</label>
                            <select className="w-full border border-gray-400 rounded px-2 bg-white">
                                <option value="">Select direction</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Route Through (English)</label>
                            <input type="text" className="w-full border border-gray-400 rounded px-2 bg-white" />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Route Through (Sinhala)</label>
                            <input type="text" className="w-full border border-gray-400 rounded px-2 bg-white" />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Route Through (Tamil)</label>
                            <input type="text" className="w-full border border-gray-400 rounded px-2 bg-white" />
                        </div>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Distance (km)</label>
                            <input type="number" step="0.01" className="w-full border border-gray-400 rounded px-2 bg-white" />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Estimated Duration (minutes)</label>
                            <input type="number" className="w-full border border-gray-400 rounded px-2 bg-white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium w-32">Description</label>
                        <textarea className="w-full border border-gray-400 rounded px-2 bg-white" rows={3}></textarea>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">Start Stop</label>
                            <select className="w-full border border-gray-400 rounded px-2 bg-white">
                                <option value="">Select start stop</option>
                            </select>
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium mb-2">End Stop</label>
                            <select className="w-full border border-gray-400 rounded px-2 bg-white">
                                <option value="">Select end stop</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>

            <RouteStopsEditor />
        </>
    );
}
