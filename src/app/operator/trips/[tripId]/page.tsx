'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/operator/header';
import { TripManagementService } from '@/lib/api-client/route-management/services/TripManagementService';
import { RouteManagementService } from '@/lib/api-client/route-management/services/RouteManagementService';
import { ScheduleManagementService } from '@/lib/api-client/route-management/services/ScheduleManagementService';
import { PermitManagementService } from '@/lib/api-client/route-management/services/PermitManagementService';
import type { TripResponse } from '@/lib/api-client/route-management/models/TripResponse';
import type { RouteResponse } from '@/lib/api-client/route-management/models/RouteResponse';
import type { ScheduleResponse } from '@/lib/api-client/route-management/models/ScheduleResponse';
import type { PassengerServicePermitResponse } from '@/lib/api-client/route-management/models/PassengerServicePermitResponse';
import {
    ArrowLeft,
    RefreshCw,
    XCircle,
    AlertCircle,
    Clock,
    CheckCircle,
    Play,
    Calendar,
    MapPin,
    Bus,
    FileText,
    User,
    Info
} from 'lucide-react';

export default function OperatorTripDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.tripId as string;

    // State
    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [route, setRoute] = useState<RouteResponse | null>(null);
    const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
    const [permit, setPermit] = useState<PassengerServicePermitResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load trip details and related data
    const loadTripDetails = useCallback(async () => {
        if (!tripId) return;

        try {
            setIsLoading(true);
            setError(null);

            // Load trip details
            const tripResponse = await TripManagementService.getTripById(tripId);
            setTrip(tripResponse);

            // Load related route if available
            if (tripResponse.routeId) {
                try {
                    const routeResponse = await RouteManagementService.getRouteById(tripResponse.routeId);
                    setRoute(routeResponse);
                } catch (routeError) {
                    console.warn('Failed to load route details:', routeError);
                }
            }

            // Load related schedule if available
            if (tripResponse.scheduleId) {
                try {
                    const scheduleResponse = await ScheduleManagementService.getScheduleById(tripResponse.scheduleId);
                    setSchedule(scheduleResponse);
                } catch (scheduleError) {
                    console.warn('Failed to load schedule details:', scheduleError);
                }
            }

            // Load related permit if available
            if (tripResponse.passengerServicePermitId) {
                try {
                    const permitResponse = await PermitManagementService.getPermitById(tripResponse.passengerServicePermitId);
                    setPermit(permitResponse);
                } catch (permitError) {
                    console.warn('Failed to load permit details:', permitError);
                }
            }

        } catch (err) {
            console.error('Failed to load trip details:', err);
            setError('Failed to load trip details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        loadTripDetails();
    }, [loadTripDetails]);

    // Handlers
    const handleBack = () => {
        router.push('/operator/trips');
    };

    const handleRefresh = () => {
        loadTripDetails();
    };

    // Helper functions
    const getStatusIcon = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'active':
            case 'in_transit':
            case 'boarding':
            case 'departed':
                return <Play className="h-5 w-5 text-blue-600" />;
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'delayed':
                return <AlertCircle className="h-5 w-5 text-orange-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'delayed':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'in_transit':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'boarding':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'departed':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status?: string) => {
        if (!status) return 'Unknown';
        return status.replace('_', ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    const formatTime = (timeString?: string) => {
        if (!timeString) return 'N/A';
        try {
            const timePart = timeString.includes('T') ? timeString.split('T')[1] : timeString;
            const [hours, minutes] = timePart.split(':');
            return `${hours}:${minutes}`;
        } catch {
            return 'Invalid time';
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header pageTitle="Trip Details" pageDescription="Loading trip details..." />
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-lg text-gray-600">Loading trip details...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !trip) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header pageTitle="Trip Details" pageDescription="Error loading trip details" />
                <div className="container mx-auto px-4 py-6">
                    <div className="text-center py-12">
                        <XCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {error || 'Trip not found'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            The requested trip could not be loaded. Please check the trip ID and try again.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                pageTitle={`Trip Details - ${trip.routeName || 'Unknown Route'}`}
                pageDescription={`${trip.tripDate ? formatDate(trip.tripDate) : 'No Date'}`}
            />

            <div className="container mx-auto px-4 py-6">
                <div className="space-y-6">
                    {/* Header with back button */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Trips
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </button>
                    </div>

                    {/* Trip Status Card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {getStatusIcon(trip.status)}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {trip.routeName || 'Unknown Route'}
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        {trip.scheduleName || 'No Schedule'}
                                    </p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(trip.status)}`}>
                                {getStatusIcon(trip.status)}
                                {getStatusLabel(trip.status)}
                            </span>
                        </div>
                    </div>

                    {/* Trip Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Info className="h-5 w-5 mr-2 text-blue-600" />
                                Basic Information
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Trip ID:</span>
                                    <span className="font-medium text-gray-900">{trip.id}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Trip Date:</span>
                                    <span className="font-medium text-gray-900">{formatDate(trip.tripDate)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Departure Time:</span>
                                    <span className="font-medium text-gray-900">{formatTime(trip.scheduledDepartureTime)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Arrival Time:</span>
                                    <span className="font-medium text-gray-900">{formatTime(trip.scheduledArrivalTime)}</span>
                                </div>
                                {trip.actualDepartureTime && (
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Actual Departure:</span>
                                        <span className="font-medium text-gray-900">{formatTime(trip.actualDepartureTime)}</span>
                                    </div>
                                )}
                                {trip.actualArrivalTime && (
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Actual Arrival:</span>
                                        <span className="font-medium text-gray-900">{formatTime(trip.actualArrivalTime)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Route & Schedule */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                                Route & Schedule
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Route:</span>
                                    <span className="font-medium text-gray-900">{trip.routeName || 'N/A'}</span>
                                </div>
                                {route && (
                                    <>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Route Group:</span>
                                            <span className="font-medium text-gray-900">{route.routeGroupName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Start Stop:</span>
                                            <span className="font-medium text-gray-900">{route.startStopName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">End Stop:</span>
                                            <span className="font-medium text-gray-900">{route.endStopName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Distance:</span>
                                            <span className="font-medium text-gray-900">{route.distanceKm ? `${route.distanceKm} km` : 'N/A'}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Schedule:</span>
                                    <span className="font-medium text-gray-900">{trip.scheduleName || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bus & Staff */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Bus className="h-5 w-5 mr-2 text-blue-600" />
                                Bus & Staff
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Bus Plate Number:</span>
                                    <span className="font-medium text-gray-900">{trip.busPlateNumber || 'Not Assigned'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Bus Model:</span>
                                    <span className="font-medium text-gray-900">{trip.busModel || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Driver:</span>
                                    <span className="font-medium text-gray-900">
                                        {trip.driverId ? 'Assigned' : 'Not Assigned'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Conductor:</span>
                                    <span className="font-medium text-gray-900">
                                        {trip.conductorId ? 'Assigned' : 'Not Assigned'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Permit Information */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                Service Permit
                            </h2>
                            <div className="space-y-3">
                                {permit ? (
                                    <>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Permit Number:</span>
                                            <span className="font-medium text-gray-900">{permit.permitNumber}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Permit Type:</span>
                                            <span className="font-medium text-gray-900">{permit.permitType || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${permit.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {permit.status || 'Unknown'}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        No service permit assigned to this trip
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    {trip.notes && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{trip.notes}</p>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                            Record Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trip.createdAt && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Created At:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(trip.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {trip.updatedAt && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(trip.updatedAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
