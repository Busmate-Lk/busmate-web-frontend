import { getCookie } from '@/lib/utils/cookieUtils';

const API_BASE = '/api/user-management';

export interface BusPermitAssignment {
    id?: string;
    busId: string;
    passengerServicePermitId: string;
    startDate: string;
    endDate: string;
    requestStatus: string;
    status: string;
    permitNumber?: string;
    permitType?: string;
}

/**
 * Get all permit assignments for a specific bus
 */
export async function getBusPermitAssignments(busId: string): Promise<BusPermitAssignment[]> {
    try {
        const token = getCookie('access_token') || '';

        const response = await fetch(`${API_BASE}/api/bus-permit-assignments/bus/${busId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch bus permit assignments:', response.status);
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching bus permit assignments:', error);
        return [];
    }
}

/**
 * Get permit assignments for all buses (operator-specific)
 * Returns a map of busId -> permit info
 */
export async function getAllBusPermitAssignments(): Promise<Record<string, { permitNumber: string; permitType?: string } | null>> {
    try {
        const token = getCookie('access_token') || '';

        const response = await fetch(`${API_BASE}/api/bus-permit-assignments/operator`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch operator permit assignments:', response.status);
            return {};
        }

        const data = await response.json();

        // Transform array of assignments into a map by busId
        // If multiple assignments per bus, take the active one or most recent
        const permitMap: Record<string, { permitNumber: string; permitType?: string } | null> = {};

        if (Array.isArray(data)) {
            data.forEach((assignment: BusPermitAssignment) => {
                // Only include active assignments
                if (assignment.status === 'ACTIVE' && assignment.busId) {
                    permitMap[assignment.busId] = {
                        permitNumber: assignment.permitNumber || assignment.passengerServicePermitId,
                        permitType: assignment.permitType
                    };
                }
            });
        }

        return permitMap;
    } catch (error) {
        console.error('Error fetching operator permit assignments:', error);
        return {};
    }
}

/**
 * Create a new bus permit assignment
 */
export async function createBusPermitAssignment(
    assignment: Omit<BusPermitAssignment, 'id'>
): Promise<BusPermitAssignment | null> {
    try {
        const token = getCookie('access_token') || '';

        const response = await fetch(`${API_BASE}/api/bus-permit-assignments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignment)
        });

        if (!response.ok) {
            throw new Error('Failed to create permit assignment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating permit assignment:', error);
        throw error;
    }
}

/**
 * Update an existing bus permit assignment
 */
export async function updateBusPermitAssignment(
    assignmentId: string,
    assignment: Partial<BusPermitAssignment>
): Promise<BusPermitAssignment | null> {
    try {
        const token = getCookie('access_token') || '';

        const response = await fetch(`${API_BASE}/api/bus-permit-assignments/${assignmentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignment)
        });

        if (!response.ok) {
            throw new Error('Failed to update permit assignment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating permit assignment:', error);
        throw error;
    }
}

/**
 * Delete a bus permit assignment
 */
export async function deleteBusPermitAssignment(assignmentId: string): Promise<boolean> {
    try {
        const token = getCookie('access_token') || '';

        const response = await fetch(`${API_BASE}/api/bus-permit-assignments/${assignmentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Error deleting permit assignment:', error);
        throw error;
    }
}
