import { Input } from "@/components/admin/ui/input"
import { Button } from "@/components/admin/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select"
import { Download, FileText } from "lucide-react"

export function UserFilters() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Input placeholder="Search users..." className="shadow-sm" />
        <Select>
          <SelectTrigger className="shadow-sm">
            <SelectValue placeholder="User Type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="passenger">Passengers</SelectItem>
            <SelectItem value="conductor">Conductors</SelectItem>
            <SelectItem value="fleet">Fleet Operators</SelectItem>
            <SelectItem value="mot">MoT Officials</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="shadow-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="shadow-sm">
            <SelectValue placeholder="Registration" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-blue-500/20 text-blue-600 border-blue-200 hover:bg-blue-500/30">Apply Filters</Button>
          <Button variant="ghost" className="bg-gray-500/20 text-gray-600 hover:bg-gray-500/30">Clear All</Button>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" className="bg-green-500/20 text-green-600 border-green-200 hover:bg-green-500/30 shadow-md">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" className="bg-red-500/20 text-red-600 border-red-200 hover:bg-red-500/30 shadow-md">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
