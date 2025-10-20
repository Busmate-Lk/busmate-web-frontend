"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table"
import { Button } from "@/components/admin/ui/button"
import { Checkbox } from "@/components/admin/ui/checkbox"
import { Badge } from "@/components/admin/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/admin/ui/avatar"
import { Eye, Edit, Ban } from "lucide-react"
import { useRouter } from "next/navigation"

const users = [
  {
    id: 1,
    name: "Nimal Perera",
    email: "nimal.perera@gmail.com",
    type: "Passenger",
    status: "Active",
    lastLogin: "30 minutes ago",
    avatar: "/avatars/nimal.png",
  },
  {
    id: 2,
    name: "Pradeep Kumara Silva",
    email: "kumara.silva@slbus.lk",
    type: "Conductor",
    status: "Active",
    lastLogin: "3 hours ago",
    avatar: "/avatars/sunil.png",
  },
  {
    id: 3,
    name: "Lanka Express Transport (Pvt) Ltd",
    email: "lankaxpress.transport@yahoo.com",
    type: "Fleet",
    status: "Suspended",
    lastLogin: "2 days ago",
    avatar: "/avatars/kumari.png",
  },
  {
    id: 4,
    name: "Chaminda Bandara",
    email: "chaminda.p@busmate.lk",
    type: "Time Keeper",
    status: "Active",
    lastLogin: "1 hour ago",
    avatar: "/avatars/ruwan.png",
  },
  {
    id: 5,
    name: "Sunimal Nimantha",
    email: "samantha.perera@mot.lk",
    type: "MOT",
    status: "Active",
    lastLogin: "5 hours ago",
    avatar: "/avatars/samanthi.png",
  },
]

export function UserTable() {
  const router = useRouter()

  const handleRowClick = (user: any) => {
    const userType = user.type.toLowerCase()
    switch (userType) {
      case "passenger":
        router.push(`/admin/users/passenger/${user.id}`)
        break
      case "conductor":
        router.push(`/admin/users/conductor/${user.id}`)
        break
      case "mot":
        router.push(`/admin/users/mot/${user.id}`)
        break
      case "time keeper":
        router.push(`/admin/users/timekeeper/${user.id}`)
        break
      case "fleet":
        router.push(`/admin/users/fleet/${user.id}`)
        break
      default:
        break
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 bg-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Checkbox />
            <span className="text-sm text-gray-600 font-medium">Select All</span>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="bg-yellow-500/20 text-yellow-600 border-yellow-200 hover:bg-yellow-500/30">
              Suspend
            </Button>
            <Button variant="outline" size="sm" className="bg-green-500/20 text-green-600 border-green-200 hover:bg-green-500/30">
              Activate
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-500/20 text-blue-600 border-blue-200 hover:bg-blue-500/30 shadow-md">
              Send Message
            </Button>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>User Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(user)}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <span className="font-medium">{user.name}</span>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.type === "Passenger"
                      ? "default"
                      : user.type === "Conductor"
                        ? "secondary"
                        : user.type === "Fleet"
                          ? "outline"
                          : user.type === "MOT"
                            ? "destructive"
                            : "default"
                  }
                  className={
                    user.type === "Passenger"
                      ? "bg-blue-100 text-blue-800"
                      : user.type === "Conductor"
                        ? "bg-green-100 text-green-800"
                        : user.type === "Fleet"
                          ? "bg-yellow-100 text-yellow-800"
                          : user.type === "MOT"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-teal-100 text-teal-800"
                  }
                >
                  {user.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">{user.lastLogin}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 shadow-md">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="bg-green-500/20 text-green-600 hover:bg-green-500/30 shadow-md">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="bg-red-500/20 text-red-600 hover:bg-red-500/30 shadow-md">
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-b-lg flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">Showing 1 to 10 of 13,302 results</p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-gray-500/20 text-gray-600 border-gray-200 hover:bg-gray-500/30 shadow-md">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-500/90 text-white border-blue-500 hover:bg-blue-600 shadow-md">
            1
          </Button>
          <Button variant="outline" size="sm" className="bg-gray-500/20 text-gray-600 border-gray-200 hover:bg-gray-500/30 shadow-md">
            2
          </Button>
          <Button variant="outline" size="sm" className="bg-gray-500/20 text-gray-600 border-gray-200 hover:bg-gray-500/30 shadow-md">
            3
          </Button>
          <Button variant="outline" size="sm" className="bg-gray-500/20 text-gray-600 border-gray-200 hover:bg-gray-500/30 shadow-md">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
