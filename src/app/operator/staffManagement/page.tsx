"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/operator/sidebar"
import { Header } from "@/components/operator/header"
import { MetricCard } from "@/components/operator/metric-card"
import { StaffTable } from "@/components/operator/staff-table"
import { Users, Car, Ticket, Calendar, Plus, Search } from "lucide-react"
import Link from "next/link"
import { staffManagementService, StaffListItem, StaffStats } from "@/lib/services/staff-management-service"
import { getCookie } from "@/lib/utils/cookieUtils"

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

export default function StaffManagement() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const [staffList, setStaffList] = useState<StaffListItem[]>([])
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    totalDrivers: 0,
    totalConductors: 0,
    assignedToday: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load staff data from API
  const loadStaffData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = getCookie('access_token') || ''

      const [staffData, statsData] = await Promise.all([
        staffManagementService.getAllStaff(token),
        staffManagementService.getStaffStats(token),
      ])

      setStaffList(staffData)
      setStats(statsData)
    } catch (err) {
      console.error('Error loading staff data:', err)
      setError('Failed to load staff data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStaffData()
  }, [loadStaffData])

  // Convert API data to table format (exclude inactive accounts)
  const staffData: StaffMember[] = staffList
    .filter((s) => (s as any).status?.toLowerCase?.() !== 'inactive')
    .map(staff => ({
      id: staff.id,
      name: staff.name,
      role: staff.role,
      nic: staff.nic,
      phone: staff.phone,
      address: '', // Not available in API
      assignment: staff.shiftStatus === 'assigned' ? 'Assigned to Trip' : '-',
      status: staff.shiftStatus === 'assigned' ? 'Assigned' : 'Available',
      avatar: staff.avatar,
    }))

  const filteredStaff = staffData.filter((staff) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !query ||
      (staff.name || '').toLowerCase().includes(query) ||
      (staff.nic || '').toLowerCase().includes(query) ||
      (staff.phone || '').toLowerCase().includes(query)
    // Tabs use keys: all | driver | conductor
    const matchesTab = activeTab === "all" || staff.role.toLowerCase() === activeTab
    const matchesRole = roleFilter === "all" || staff.role.toLowerCase() === roleFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || staff.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesTab && matchesRole && matchesStatus
  })

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, roleFilter, statusFilter, searchQuery])

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      const staff = staffList.find(s => s.id === staffId)
      if (!staff) return

      const token = getCookie('access_token') || ''
      await staffManagementService.deleteStaff(token, staffId, staff.role)

      // Reload data after deletion
      await loadStaffData()
    } catch (error) {
      console.error('Error deleting staff:', error)
      setError('Failed to delete staff member. Please try again.')
    }
  }

  const handleView = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId)
    if (staff) {
      router.push(`/operator/staffManagement/${staffId}`)
    }
  }

  if (isLoading && staffList.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1">
          <Header
            pageTitle="Staff Management"
            pageDescription="Manage drivers, conductors, assignments, and staff performance"
          />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <Sidebar activeItem="staff" /> */}

      <div className="flex-1">
        <Header
          pageTitle="Staff Management"
          pageDescription="Manage drivers, conductors, assignments, and staff performance"
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

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</p>
                </div>
                <Car className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conductors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalConductors}</p>
                </div>
                <Ticket className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assigned Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.assignedToday}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Add Staff Button */}
          <div className="mb-6">
            <Link href="/operator/addstaff" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add New Staff
            </Link>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="p-4">
              {/* Header with Count */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">
                    {filteredStaff.length}
                  </span>
                  <> of {staffData.length} staff members</>
                </div>
              </div>

              {/* Tab Filters */}
              <div className="flex items-center gap-4 mb-3">
                <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
                  {([
                    { key: "all", label: "All Staff" },
                    { key: "driver", label: "Drivers" },
                    { key: "conductor", label: "Conductors" },
                  ]).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${activeTab === key ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or NIC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Plus className="h-4 w-4 rotate-45" />
                    </button>
                  )}
                </div>

                {/* Filter Row */}
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="block w-full lg:w-48 pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="driver">Driver</option>
                      <option value="conductor">Conductor</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full lg:w-48 pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="assigned">Assigned</option>
                      <option value="available">Available</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <StaffTable
              staff={filteredStaff}
              currentPage={currentPage}
              totalStaff={filteredStaff.length}
              onPageChange={setCurrentPage}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
