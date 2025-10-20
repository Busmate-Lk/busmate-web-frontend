'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ChevronRight,
    AlertCircle,
    RefreshCw,
    Download,
    Eye
} from 'lucide-react';
import { OperatorPermitSummary } from '@/components/operator/permits/OperatorPermitSummary';
import { OperatorPermitTabsSection } from '@/components/operator/permits/OperatorPermitTabsSection';
import {
    BusOperatorOperationsService,
    RouteManagementService,
    PassengerServicePermitResponse,
    OperatorResponse,
    RouteGroupResponse,
    BusResponse
} from '@/lib/api-client/route-management';
import { Header } from '@/components/operator/header';

// Mock operator ID - In real implementation, this would come from auth context
const MOCK_OPERATOR_ID = "8e886a71-445c-4e3a-8bc5-a17b5b2dad24";

export default function OperatorPermitDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const permitId = params.permitId as string;

    // State
    const [permit, setPermit] = useState<PassengerServicePermitResponse | null>(null);
    const [operator, setOperator] = useState<OperatorResponse | null>(null);
    const [routeGroup, setRouteGroup] = useState<RouteGroupResponse | null>(null);
    const [assignedBuses, setAssignedBuses] = useState<BusResponse[]>([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [operatorLoading, setOperatorLoading] = useState(false);
    const [routeGroupLoading, setRouteGroupLoading] = useState(false);
    const [busesLoading, setBusesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load permit details - operator-specific
    const loadPermitDetails = useCallback(async () => {
        if (!permitId) return;

        try {
            setIsLoading(true);
            setError(null);

            // Use operator-specific API to get permit details
            const permitData = await BusOperatorOperationsService.getOperatorPermitById(
                MOCK_OPERATOR_ID,
                permitId
            );
            setPermit(permitData);

            return permitData;
        } catch (err) {
            console.error('Error loading permit details:', err);
            setError('Failed to load permit details. Please try again.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [permitId]);

    // Load operator profile
    const loadOperatorDetails = useCallback(async () => {
        try {
            setOperatorLoading(true);
            const operatorData = await BusOperatorOperationsService.getOperatorProfile(MOCK_OPERATOR_ID);
            setOperator(operatorData);
        } catch (err) {
            console.error('Error loading operator details:', err);
            // Don't set main error for operator loading failure
        } finally {
            setOperatorLoading(false);
        }
    }, []);

    // Load route group details
    const loadRouteGroupDetails = useCallback(async (routeGroupId: string) => {
        try {
            setRouteGroupLoading(true);
            const routeGroupData = await RouteManagementService.getRouteGroupById(routeGroupId);
            setRouteGroup(routeGroupData);
        } catch (err) {
            console.error('Error loading route group details:', err);
            // Don't set main error for route group loading failure
        } finally {
            setRouteGroupLoading(false);
        }
    }, []);

    // Load assigned buses for this operator
    const loadAssignedBuses = useCallback(async () => {
        try {
            setBusesLoading(true);
            // Get operator's buses (filtered by permit assignment in real implementation)
            const busesResponse = await BusOperatorOperationsService.getOperatorBuses(
                MOCK_OPERATOR_ID,
                0, // page
                100, // size
                'ntcRegistrationNumber', // sortBy
                'asc', // sortDir
                'active' // status - only active buses
            );

            setAssignedBuses(busesResponse.content || []);
        } catch (err) {
            console.error('Error loading assigned buses:', err);
            // Don't set main error for buses loading failure
        } finally {
            setBusesLoading(false);
        }
    }, []);

    // Load related data when permit is loaded
    useEffect(() => {
        if (permit) {
            // Load route group details if routeGroupId exists
            if (permit.routeGroupId) {
                loadRouteGroupDetails(permit.routeGroupId);
            }
        }
    }, [permit, loadRouteGroupDetails]);

    // Initial load
    useEffect(() => {
        Promise.all([
            loadPermitDetails(),
            loadOperatorDetails(),
            loadAssignedBuses()
        ]);
    }, [loadPermitDetails, loadOperatorDetails, loadAssignedBuses]);

    // Handlers
    const handleBack = () => {
        router.push('/operator/passenger-service-permits');
    };

    const handleRefresh = async () => {
        const permitData = await loadPermitDetails();
        if (permitData) {
            await Promise.all([
                loadOperatorDetails(),
                loadAssignedBuses()
            ]);

            if (permitData.routeGroupId) {
                await loadRouteGroupDetails(permitData.routeGroupId);
            }
        }
    };

    const handleExportPermit = () => {
        // TODO: Implement permit export functionality
        console.log('Export permit:', permitId);
    };

    const handleViewInPortal = () => {
        // Navigate to MoT portal view if operator has access
        window.open(`/mot/passenger-service-permits/${permitId}`, '_blank');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading permit details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !permit) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <div className="text-red-600 text-lg mb-4">
                            {error || 'Permit not found'}
                        </div>
                        <button
                            onClick={handleBack}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                pageTitle="Permit Details"
                pageDescription="View detailed information about your passenger service permit, including route coverage, fleet assignment, and compliance status"
            />
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="space-y-6">
                    {/* Back Button */}
                    <div className="mb-4">
                        <Link
                            href="/operator/passenger-service-permits"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Service Permits
                        </Link>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                    <button
                                        onClick={() => setError(null)}
                                        className="text-sm text-red-600 hover:text-red-800 underline mt-2"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header Section - Breadcrumbs + Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Breadcrumbs */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <button
                                onClick={() => router.push('/operator/dashboard')}
                                className="hover:text-blue-600 transition-colors"
                            >
                                Dashboard
                            </button>
                            <ChevronRight className="w-4 h-4" />
                            <button
                                onClick={() => router.push('/operator/passenger-service-permits')}
                                className="hover:text-blue-600 transition-colors"
                            >
                                Service Permits
                            </button>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">
                                {permit.permitNumber || 'Permit Details'}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            <button
                                onClick={handleExportPermit}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            {/* Operator can view in MoT portal if they have access */}
                            <button
                                onClick={handleViewInPortal}
                                className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                View in Portal
                            </button>
                        </div>
                    </div>

                    {/* Permit Summary Card */}
                    <OperatorPermitSummary
                        permit={permit}
                        operator={operator}
                        routeGroup={routeGroup}
                        assignedBuses={assignedBuses}
                    />

                    {/* Permit Tabs Section */}
                    <OperatorPermitTabsSection
                        permit={permit}
                        operator={operator}
                        routeGroup={routeGroup}
                        assignedBuses={assignedBuses}
                        operatorLoading={operatorLoading}
                        routeGroupLoading={routeGroupLoading}
                        busesLoading={busesLoading}
                        onRefresh={handleRefresh}
                    />
                </div>
            </div>
        </div>
    );
}
