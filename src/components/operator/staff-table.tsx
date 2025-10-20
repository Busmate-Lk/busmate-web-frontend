"use client"

import { useState } from "react"
import { Eye, Trash2, User, X, Phone, CreditCard, MapPin, CheckCircle, Clock } from "lucide-react"

interface StaffMember {
  id: string
  name: string
  role: "Driver" | "Conductor"
  nic: string
  phone: string
  address: string
  assignment: string
  status: "Assigned" | "Available"
  avatar: string
}

interface StaffTableProps {
  staff: StaffMember[]
  currentPage: number
  totalStaff: number
  onPageChange: (page: number) => void
  onEdit?: (staffId: string) => void
  onDelete?: (staffId: string) => void
  onView?: (staffId: string) => void
}

export function StaffTable({ staff, currentPage, totalStaff, onPageChange, onEdit, onDelete, onView }: StaffTableProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [showModal, setShowModal] = useState(false)

  const getRoleColor = (role: string) => {
    return role === "Driver" ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"
  }

  const getProfileIconColor = (role: string) => {
    return role === "Driver" ? "bg-green-100" : "bg-purple-100"
  }

  const getProfileIconTextColor = (role: string) => {
    return role === "Driver" ? "text-green-600" : "text-purple-600"
  }

  const getStatusIcon = (status: string) => {
    return status === "Assigned" ? <Clock className="w-4 h-4 text-yellow-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />
  }

  const getStatusColor = (status: string) => {
    return status === "Assigned" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-green-100 text-green-800 border-green-200"
  }

  const handleViewStaff = (staff: StaffMember) => {
    if (onView) {
      onView(staff.id)
    } else {
      setSelectedStaff(staff)
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedStaff(null)
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Member
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className={`h-8 w-8 rounded-lg ${getProfileIconColor(member.role)} flex items-center justify-center`}>
                        <User className={`h-4 w-4 ${getProfileIconTextColor(member.role)}`} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {member.nic}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center mb-1">
                      <Phone className="h-3 w-3 text-gray-400 mr-2" />
                      {member.phone}
                    </div>
                    {member.address && (
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                        {member.address}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.assignment || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(member.status)}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewStaff(member)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      title="View details"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button
                      onClick={() => onDelete?.(member.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                      title={`Delete ${member.role.toLowerCase()}`}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">Showing 1-10 of {totalStaff} staff members</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">{currentPage}</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">2</button>
          <button
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedStaff && (
        <div className="fixed inset-0 bg-[#000000b8] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Staff Details</h2>
              <button
                onClick={closeModal}
                className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getProfileIconColor(selectedStaff.role)}`}>
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedStaff.name}</h3>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleColor(selectedStaff.role)}`}>
                    {selectedStaff.role}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">NIC Number</label>
                  <p className="text-gray-900">{selectedStaff.nic}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-900">{selectedStaff.phone}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{selectedStaff.address}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned Bus</label>
                  <p className="text-gray-900">{selectedStaff.assignment}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(selectedStaff.status)}`}>
                      {selectedStaff.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
