'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/operator/header';
import { TripManagementService } from '@/lib/api-client/route-management/services/TripManagementService';
import { BusOperatorOperationsService } from '@/lib/api-client/route-management/services/BusOperatorOperationsService';
import type { TripResponse } from '@/lib/api-client/route-management/models/TripResponse';
import { staffManagementService, type ConductorProfile } from '@/lib/services/staff-management-service';
import { getCookie } from '@/lib/utils/cookieUtils';
import {
    Calendar,
    Search,
    Filter,
    UserCheck,
    UserX,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';

interface StaffAssignmentFilters {
    search: string;
    dateFrom: string;
    dateTo: string;
    status: string;
    assignmentStatus: 'all' | 'assigned' | 'unassigned';
}

export default function StaffAssignmentPage() {
    const { user } = useAuth();
    const operatorId = user?.id;

    // State
    const [trips, setTrips] = useState<TripResponse[]>([]);
    const [conductors, setConductors] = useState<ConductorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filters, setFilters] = useState<StaffAssignmentFilters>({
        search: '',
        dateFrom: '', // Empty = no filter
        dateTo: '',   // Empty = no filter
        status: 'all',
        assignmentStatus: 'all'
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Assignment modal
    const [assigningTrip, setAssigningTrip] = useState<TripResponse | null>(null);
    const [selectedConductor, setSelectedConductor] = useState<string>('');
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState(false);

    // Load trips for operator
    const loadTrips = useCallback(async () => {
        if (!operatorId) {
            setError('Operator ID not found. Please log in again.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Loading trips with filters:', {
                operatorId,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                status: filters.status
            });

            // Try to get operator's trips with filters
            try {
                const response = await BusOperatorOperationsService.getOperatorTrips(
                    operatorId,
                    0,
                    500, // Load more to filter locally
                    'tripDate',
                    'asc',
                    filters.status !== 'all' ? filters.status as any : undefined,
                    filters.dateFrom || undefined,
                    filters.dateTo || undefined
                );

                setTrips(response.content || []);
            } catch (operatorErr: any) {
                console.warn('getOperatorTrips failed, trying general getAllTrips:', operatorErr);

                // Fallback: Use general getAllTrips with operatorId filter
                const response = await TripManagementService.getAllTrips(
                    0,
                    500,
                    'tripDate',
                    'asc',
                    undefined, // search
                    filters.status !== 'all' ? filters.status as any : undefined,
                    undefined, // routeId
                    operatorId, // operatorId filter
                    undefined, // scheduleId
                    undefined, // passengerServicePermitId
                    undefined, // busId
                    filters.dateFrom || undefined,
                    filters.dateTo || undefined
                );

                setTrips(response.content || []);
            }
        } catch (err: any) {
            console.error('Error loading trips:', err);
            setError(err?.message || 'Failed to load trips. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [operatorId, filters.dateFrom, filters.dateTo, filters.status]);

    // Load conductors
    const loadConductors = useCallback(async () => {
        try {
            const token = getCookie('access_token') || '';
            const conductorList = await staffManagementService.getConductors(token);
            setConductors(conductorList.filter((c: ConductorProfile) => c.accountStatus?.toLowerCase() === 'active'));
        } catch (err) {
            console.error('Error loading conductors:', err);
        }
    }, []);

    useEffect(() => {
        loadTrips();
        loadConductors();
    }, [loadTrips, loadConductors]);

    // Filter and search trips
    const filteredTrips = useMemo(() => {
        let result = trips;

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(trip =>
                trip.routeName?.toLowerCase().includes(searchLower) ||
                trip.scheduleName?.toLowerCase().includes(searchLower) ||
                trip.busPlateNumber?.toLowerCase().includes(searchLower) ||
                trip.passengerServicePermitNumber?.toLowerCase().includes(searchLower)
            );
        }

        // Assignment status filter
        if (filters.assignmentStatus === 'assigned') {
            result = result.filter(trip => trip.conductorId);
        } else if (filters.assignmentStatus === 'unassigned') {
            result = result.filter(trip => !trip.conductorId);
        }

        return result;
    }, [trips, filters]);

    // Paginate
    const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
    const paginatedTrips = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTrips.slice(start, start + itemsPerPage);
    }, [filteredTrips, currentPage]);

    // Assign/Update conductor
    const handleAssignConductor = async () => {
        if (!assigningTrip) return;

        try {
            setIsAssigning(true);

            // Update trip with conductor (and driver if provided)
            await TripManagementService.updateTrip(assigningTrip.id!, {
                scheduleId: assigningTrip.scheduleId!,
                tripDate: assigningTrip.tripDate!,
                scheduledDepartureTime: assigningTrip.scheduledDepartureTime!,
                scheduledArrivalTime: assigningTrip.scheduledArrivalTime!,
                passengerServicePermitId: assigningTrip.passengerServicePermitId,
                busId: assigningTrip.busId,
                driverId: selectedDriver || assigningTrip.driverId || undefined,
                conductorId: selectedConductor || undefined,
                actualDepartureTime: assigningTrip.actualDepartureTime,
                actualArrivalTime: assigningTrip.actualArrivalTime,
                status: assigningTrip.status as any,
                notes: assigningTrip.notes
            });

            // Refresh trips
            await loadTrips();
            setAssigningTrip(null);
            setSelectedConductor('');
            setSelectedDriver('');
        } catch (err: any) {
            console.error('Error assigning staff:', err);
            alert('Failed to assign staff. Please try again.');
        } finally {
            setIsAssigning(false);
        }
    };

    // Remove conductor
    const handleRemoveConductor = async (trip: TripResponse) => {
        if (!confirm('Remove conductor from this trip?')) return;

        try {
            await TripManagementService.updateTrip(trip.id!, {
                scheduleId: trip.scheduleId!,
                tripDate: trip.tripDate!,
                scheduledDepartureTime: trip.scheduledDepartureTime!,
                scheduledArrivalTime: trip.scheduledArrivalTime!,
                passengerServicePermitId: trip.passengerServicePermitId,
                busId: trip.busId,
                driverId: trip.driverId,
                conductorId: undefined, // Remove conductor
                actualDepartureTime: trip.actualDepartureTime,
                actualArrivalTime: trip.actualArrivalTime,
                status: trip.status as any,
                notes: trip.notes
            });

            await loadTrips();
        } catch (err) {
            console.error('Error removing conductor:', err);
            alert('Failed to remove conductor');
        }
    };

    // Remove driver
    const handleRemoveDriver = async (trip: TripResponse) => {
        if (!confirm('Remove driver from this trip?')) return;

        try {
            await TripManagementService.updateTrip(trip.id!, {
                scheduleId: trip.scheduleId!,
                tripDate: trip.tripDate!,
                scheduledDepartureTime: trip.scheduledDepartureTime!,
                scheduledArrivalTime: trip.scheduledArrivalTime!,
                passengerServicePermitId: trip.passengerServicePermitId,
                busId: trip.busId,
                driverId: undefined, // Remove driver
                conductorId: trip.conductorId,
                actualDepartureTime: trip.actualDepartureTime,
                actualArrivalTime: trip.actualArrivalTime,
                status: trip.status as any,
                notes: trip.notes
            });

            await loadTrips();
        } catch (err) {
            console.error('Error removing driver:', err);
            alert('Failed to remove driver');
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getConductorName = (conductorId?: string) => {
        const conductor = conductors.find(c => c.userId === conductorId);
        return conductor?.fullName || 'Unknown';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                pageTitle="Staff Assignment"
                pageDescription="Assign conductors to trips"
            />

            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Staff Assignment</h1>
                    <p className="text-gray-600 mt-1">Assign conductors to trips</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Trips</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredTrips.length}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Assigned</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {filteredTrips.filter(t => t.conductorId).length}
                                </p>
                            </div>
                            <UserCheck className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unassigned</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {filteredTrips.filter(t => !t.conductorId).length}
                                </p>
                            </div>
                            <UserX className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Available Conductors</p>
                                <p className="text-2xl font-bold text-gray-900">{conductors.length}</p>
                            </div>
                            <UserCheck className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    placeholder="Route, bus, permit..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Date <span className="text-xs text-gray-500">(optional)</span>
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                To Date <span className="text-xs text-gray-500">(optional)</span>
                            </label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
                            <select
                                value={filters.assignmentStatus}
                                onChange={(e) => setFilters({ ...filters, assignmentStatus: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Trips</option>
                                <option value="assigned">Assigned</option>
                                <option value="unassigned">Unassigned</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Trips Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <p className="text-gray-900 font-medium mb-2">Failed to load trips</p>
                            <p className="text-gray-600 text-sm mb-4">{error}</p>
                            <button
                                onClick={loadTrips}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : paginatedTrips.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No trips found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departure</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedTrips.map((trip) => (
                                            <tr key={trip.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                    {trip.tripDate ? new Date(trip.tripDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{trip.routeName || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{trip.scheduleName || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{trip.scheduledDepartureTime || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{trip.busPlateNumber || 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                                                        {getStatusIcon(trip.status)}
                                                        {trip.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {trip.driverId ? (
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm text-gray-900">Driver Assigned</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <UserX className="w-4 h-4 text-orange-400" />
                                                            <span className="text-sm text-gray-400">Not assigned</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {trip.conductorId ? (
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm text-gray-900">{getConductorName(trip.conductorId)}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <UserX className="w-4 h-4 text-orange-400" />
                                                            <span className="text-sm text-gray-400">Not assigned</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setAssigningTrip(trip);
                                                                setSelectedConductor(trip.conductorId || '');
                                                                setSelectedDriver(trip.driverId || '');
                                                            }}
                                                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 flex items-center gap-1"
                                                            title="Assign or update staff"
                                                        >
                                                            <UserCheck className="w-3.5 h-3.5" />
                                                            Assign
                                                        </button>
                                                        {(trip.conductorId || trip.driverId) && (
                                                            <button
                                                                onClick={() => {
                                                                    if (trip.conductorId && trip.driverId) {
                                                                        if (confirm('Remove both driver and conductor?')) {
                                                                            handleRemoveConductor(trip);
                                                                            handleRemoveDriver(trip);
                                                                        }
                                                                    } else if (trip.conductorId) {
                                                                        handleRemoveConductor(trip);
                                                                    } else if (trip.driverId) {
                                                                        handleRemoveDriver(trip);
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                                                title="Remove staff"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTrips.length)} of {filteredTrips.length} trips
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Assignment Modal */}
            {assigningTrip && (
                <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Assign Staff to Trip
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {assigningTrip.routeName} • {assigningTrip.tripDate}
                            </p>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            {/* Driver Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Driver <span className="text-xs text-gray-500">(No backend available)</span>
                                </label>
                                <select
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    disabled
                                >
                                    <option value="">-- Driver selection coming soon --</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Driver management feature will be available soon</p>
                            </div>

                            {/* Conductor Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Conductor
                                </label>
                                <select
                                    value={selectedConductor}
                                    onChange={(e) => setSelectedConductor(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Select a conductor --</option>
                                    {conductors.map((conductor) => (
                                        <option key={conductor.userId} value={conductor.userId}>
                                            {conductor.fullName} - {conductor.nicNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setAssigningTrip(null);
                                    setSelectedConductor('');
                                    setSelectedDriver('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignConductor}
                                disabled={isAssigning}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isAssigning ? 'Saving...' : 'Assign Staff'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
