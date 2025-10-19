'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/operator/header'
import { staffManagementService, StaffProfile } from '@/lib/services/staff-management-service'
import { getCookie } from '@/lib/utils/cookieUtils'
import {
    User,
    Mail,
    Phone,
    CreditCard,
    Calendar,
    MapPin,
    Briefcase,
    Shield,
    ArrowLeft,
    Edit,
    Trash2
} from 'lucide-react'
import Link from 'next/link'

export default function StaffProfilePage() {
    const params = useParams()
    const router = useRouter()
    const staffId = params?.staffId as string

    const [staff, setStaff] = useState<StaffProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    // editable fields (common subset)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [shiftStatus, setShiftStatus] = useState('available')

    useEffect(() => {
        const loadStaffProfile = async () => {
            try {
                setIsLoading(true)
                const token = getCookie('access_token') || ''

                // Try to load as conductor first, then driver
                let profile = await staffManagementService.getStaffById(token, staffId, 'Conductor')
                if (!profile) {
                    profile = await staffManagementService.getStaffById(token, staffId, 'Driver')
                }

                setStaff(profile)
                if (profile) {
                    setFullName(profile.fullName || '')
                    setEmail(profile.email || '')
                    setPhoneNumber(profile.phoneNumber || '')
                    setShiftStatus((profile.shift_status || 'available'))
                }
            } catch (err) {
                console.error('Error loading staff profile:', err)
                setError('Failed to load staff profile')
            } finally {
                setIsLoading(false)
            }
        }

        if (staffId) {
            loadStaffProfile()
        }
    }, [staffId])

    const handleDelete = async () => {
        if (!staff || !confirm('Are you sure you want to delete this staff member?')) {
            return
        }

        try {
            const token = getCookie('access_token') || ''
            await staffManagementService.deleteStaff(
                token,
                staff.userId,
                staff.role as 'Driver' | 'Conductor'
            )
            router.push('/operator/staffManagement')
        } catch (error) {
            console.error('Error deleting staff:', error)
            setError('Failed to delete staff member')
        }
    }

    const handleSave = async () => {
        if (!staff) return
        try {
            setError(null)
            const token = getCookie('access_token') || ''
            const payload = {
                fullName,
                email,
                phoneNumber,
                shift_status: shiftStatus,
            } as any
            if ((staff.role as string) === 'Conductor') {
                await staffManagementService.updateConductor(token, staff.userId, payload)
            } else {
                // driver update is mocked in service
                await staffManagementService.updateDriver(token, staff.userId, payload)
            }
            setIsEditing(false)
            // reload profile
            const updated = await staffManagementService.getStaffById(token, staff.userId, (staff.role as 'Driver' | 'Conductor'))
            if (updated) setStaff(updated)
        } catch (e: any) {
            console.error('Error updating staff', e)
            setError(e?.message || 'Failed to update staff')
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="flex-1">
                    <Header
                        pageTitle="Staff Profile"
                        pageDescription="View staff member details"
                    />
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!staff) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="flex-1">
                    <Header
                        pageTitle="Staff Profile"
                        pageDescription="View staff member details"
                    />
                    <div className="p-6">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <h3 className="text-sm font-medium text-red-800">Staff member not found</h3>
                            <Link
                                href="/operator/staffManagement"
                                className="text-sm text-red-600 hover:text-red-800 underline mt-2 inline-block"
                            >
                                Back to Staff Management
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="flex-1">
                <Header
                    pageTitle="Staff Profile"
                    pageDescription={`${staff.fullName} - ${staff.role}`}
                />

                <div className="p-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <div className="flex">
                                <div className="ml-3">
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

                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/operator/staffManagement"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Staff Management
                        </Link>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {/* Header with Actions */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900">{staff.fullName}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.role === 'Driver' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {staff.role}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {staff.accountStatus}
                                            </span>
                                            {staff.isVerified && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setIsEditing(false); /* reset fields to staff */ if (staff) { setFullName(staff.fullName || ''); setEmail(staff.email || ''); setPhoneNumber(staff.phoneNumber || ''); setShiftStatus(staff.shift_status || 'available'); } }}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                Update
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleDelete}
                                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Full Name</p>
                                                {!isEditing ? (
                                                    <p className="text-sm font-medium text-gray-900">{staff.fullName}</p>
                                                ) : (
                                                    <input
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <CreditCard className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">NIC Number</p>
                                                <p className="text-sm font-medium text-gray-900">{staff.nicNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Date of Birth</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(staff.dateOfBirth).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Gender</p>
                                                <p className="text-sm font-medium text-gray-900">{staff.gender}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                {!isEditing ? (
                                                    <p className="text-sm font-medium text-gray-900">{staff.email}</p>
                                                ) : (
                                                    <input
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Phone Number</p>
                                                {!isEditing ? (
                                                    <p className="text-sm font-medium text-gray-900">{staff.phoneNumber}</p>
                                                ) : (
                                                    <input
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Username</p>
                                                <p className="text-sm font-medium text-gray-900">{staff.username}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <Briefcase className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Employee ID</p>
                                                <p className="text-sm font-medium text-gray-900">{staff.employee_id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Shift Status</p>
                                                {!isEditing ? (
                                                    <p className="text-sm font-medium text-gray-900 capitalize">{staff.shift_status}</p>
                                                ) : (
                                                    <select
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                        value={shiftStatus}
                                                        onChange={(e) => setShiftStatus(e.target.value)}
                                                    >
                                                        <option value="assigned">Assigned</option>
                                                        <option value="available">Available</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <Briefcase className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Operator ID</p>
                                                <p className="text-sm font-medium text-gray-900">{staff.assign_operator_id}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* License Information (for Drivers) */}
                                {'licenseNumber' in staff && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">License Information</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">License Number</p>
                                                    <p className="text-sm font-medium text-gray-900">{staff.licenseNumber}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">License Expiry</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {staff.licenseExpiry ? new Date(staff.licenseExpiry).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
