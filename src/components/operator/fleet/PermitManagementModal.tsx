'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2, FileText, Calendar, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BusPermitAssignmentService } from '@/lib/api-client/route-management/services/BusPermitAssignmentService';
import { BusOperatorOperationsService } from '@/lib/api-client/route-management/services/BusOperatorOperationsService';
import type { BusPassengerServicePermitAssignmentResponse } from '@/lib/api-client/route-management/models/BusPassengerServicePermitAssignmentResponse';
import type { PassengerServicePermitResponse } from '@/lib/api-client/route-management/models/PassengerServicePermitResponse';

interface PermitManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    busId: string;
    busRegistration: string;
    onChanged?: () => void;
}

export function PermitManagementModal({ isOpen, onClose, busId, busRegistration, onChanged }: PermitManagementModalProps) {
    const { user } = useAuth();
    const operatorId = user?.id;

    const [assignments, setAssignments] = useState<BusPassengerServicePermitAssignmentResponse[]>([]);
    const [availablePermits, setAvailablePermits] = useState<PassengerServicePermitResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && busId) {
            loadAssignments();
            loadAvailablePermits();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, busId, operatorId]);

    const loadAssignments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await BusPermitAssignmentService.getAllAssignments();
            const list = (data || []).filter(a => a.busId === busId);
            setAssignments(list);
        } catch (err: any) {
            console.error('Error loading assignments:', err);
            setError(err.message || 'Failed to load permit assignments');
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAvailablePermits = async () => {
        if (!operatorId) return;
        try {
            const resp = await BusOperatorOperationsService.getOperatorPermits(operatorId, 0, 100, 'permitNumber', 'asc');
            const permits = resp.content || [];
            setAvailablePermits(permits as PassengerServicePermitResponse[]);
        } catch (err) {
            console.error('Error loading available permits:', err);
            setAvailablePermits([]);
        }
    };

    const assignedPermitIds = useMemo(() => new Set(assignments.map(a => a.passengerServicePermitId)), [assignments]);
    const assignablePermits = useMemo(
        () => availablePermits.filter(p => !assignedPermitIds.has(p.id)),
        [availablePermits, assignedPermitIds]
    );

    const handleAssign = async (permitId: string) => {
        try {
            setLoading(true);
            setError(null);
            // Minimal payload with sensible defaults
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            // Send only required fields; let backend set defaults to avoid 409 on status
            await BusPermitAssignmentService.createAssignment({
                busId,
                passengerServicePermitId: permitId,
                startDate: today,
            });
            await loadAssignments();
            onChanged?.();
        } catch (err: any) {
            console.error('Error assigning permit:', err);
            setError(err.message || 'Failed to assign permit to bus');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (assignmentId?: string) => {
        if (!assignmentId) return;
        if (!confirm('Remove this permit from the bus?')) return;
        try {
            setLoading(true);
            setError(null);
            await BusPermitAssignmentService.deleteAssignment(assignmentId);
            await loadAssignments();
            onChanged?.();
        } catch (err: any) {
            console.error('Error removing assignment:', err);
            setError(err.message || 'Failed to remove permit assignment');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getStatusBadge = (status?: string) => {
        const colors: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-800 border-green-200',
            INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            EXPIRED: 'bg-red-100 text-red-800 border-red-200',
        };
        if (!status) return colors.PENDING;
        return colors[status] || colors.PENDING;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Manage Bus Permits</h2>
                        <p className="text-sm text-gray-500 mt-1">Bus: {busRegistration}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Assigned permits */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Assigned to this bus</h3>
                        {loading && assignments.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No permits are assigned to this bus.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {assignments.map((a) => (
                                    <div key={a.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{a.permitNumber || a.passengerServicePermitId}</span>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(a.status)}`}>
                                                    {a.status || 'PENDING'}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-sm text-gray-600 flex gap-4">
                                                <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> Start: {formatDate(a.startDate)}</span>
                                                <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> End: {formatDate(a.endDate)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(a.id)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Available permits to assign */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Available permits</h3>
                        {availablePermits.length === 0 ? (
                            <p className="text-sm text-gray-500">No permits available to assign.</p>
                        ) : (
                            <div className="space-y-2">
                                {assignablePermits.map((p) => (
                                    <div key={p.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">{p.permitNumber}</div>
                                            <div className="text-xs text-gray-500">{p.permitType}</div>
                                        </div>
                                        <button
                                            disabled={loading}
                                            onClick={() => p.id && handleAssign(p.id)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                                        >
                                            <PlusCircle className="w-4 h-4" /> Assign
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Close</button>
                </div>
            </div>
        </div>
    );
}
