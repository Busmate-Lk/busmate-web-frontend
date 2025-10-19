"use client"

import { useState } from "react"
import { Eye, RotateCcw, Trash2, User, X } from "lucide-react"

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
    return role === "Driver" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
  }

  const getProfileIconColor = (role: string) => {
    return role === "Driver" ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"
  }

  const getStatusColor = (status: string) => {
    return status === "Assigned" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
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
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Staff</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Role</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">NIC</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Phone</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Address</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Assigned Bus</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-gray-50">
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getProfileIconColor(member.role)}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleColor(member.role)}`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="p-4 align-middle text-gray-900">{member.nic}</td>
                <td className="p-4 align-middle text-gray-900">{member.phone}</td>
                <td className="p-4 align-middle text-gray-900">{member.address}</td>
                <td className="p-4 align-middle text-gray-900">{member.assignment}</td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(member.status)}`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                      onClick={() => handleViewStaff(member)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    {/* <button className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
                      <RotateCcw className="w-4 h-4 text-green-600" />
                    </button> */}
                    <button
                      className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                      onClick={() => onDelete?.(member.id)}
                      title={`Delete ${member.role.toLowerCase()}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
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
