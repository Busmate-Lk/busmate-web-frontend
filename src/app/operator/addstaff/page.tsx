"use client"
import { ArrowLeft } from "lucide-react"
import { AddStaffForm } from "@/components/operator/add-staff-form"
import { useRouter } from "next/navigation"

export default function AddStaff() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/operator/staffManagement')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Add New Staff</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Step 1 of 4</span>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="w-1/4 h-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <AddStaffForm />
        </div>
      </div>
    </div>
  )
}
