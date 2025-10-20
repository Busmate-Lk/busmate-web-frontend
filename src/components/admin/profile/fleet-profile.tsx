"use client"

import { Button } from "@/components/admin/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table"
import { ArrowLeft, Download, Edit, RotateCcw, MessageSquare, FileText, Ban, Truck, Eye } from "lucide-react"
import Link from "next/link"

interface FleetProfileProps {
  userId: string
}

export function FleetProfile({ userId }: FleetProfileProps) {
  const fleetData = [
    {
      id: "LE-001",
      busNumber: "LE-001",
      model: "Tata LP 1613",
      year: "2022",
      capacity: "52",
      status: "Active",
      lastService: "Dec 15, 2024",
      route: "Colombo - Kandy",
      driver: "Kamal Perera",
      conductor: "Sunil Silva",
    },
    {
      id: "LE-002",
      busNumber: "LE-002",
      model: "Ashok Leyland",
      year: "2021",
      capacity: "48",
      status: "Maintenance",
      lastService: "Nov 28, 2024",
      route: "Colombo - Galle",
      driver: "Nimal Fernando",
      conductor: "Ravi Kumar",
    },
    {
      id: "LE-003",
      busNumber: "LE-003",
      model: "Tata LP 1613",
      year: "2023",
      capacity: "52",
      status: "Active",
      lastService: "Dec 20, 2024",
      route: "Colombo - Matara",
      driver: "Chaminda Dias",
      conductor: "Pradeep Mendis",
    },
    {
      id: "LE-004",
      busNumber: "LE-004",
      model: "Mahindra Tourister",
      year: "2020",
      capacity: "45",
      status: "Inactive",
      lastService: "Oct 15, 2024",
      route: "Not Assigned",
      driver: "Not Assigned",
      conductor: "Not Assigned",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:bg-transparent">
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Fleet Profile</h1>
            <p className="text-gray-600">Comprehensive Fleet management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-green-500/20 text-green-600 border-green-200 hover:bg-green-500/30 shadow-md">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="bg-blue-500/90 text-white hover:bg-blue-600 shadow-md">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <Truck className="h-10 w-10 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">Lanka Express Transport (Pvt) Ltd</h2>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Operator ID:</span>
                  <span className="ml-2 font-medium">OP-2024-001</span>
                </div>
                <div>
                  <span className="text-gray-600">Registration:</span>
                  <span className="ml-2">PV 12345</span>
                </div>
                <div>
                  <span className="text-gray-600">Registered:</span>
                  <span className="ml-2">Jan 15, 2024</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="ml-2">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Information */}
        <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-medium">Lanka Express Transport (Pvt) Ltd</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tax ID</p>
              <p className="font-medium">134-567-890</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">No. 123, Galle Road, Colombo 03, Sri Lanka</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Registration Number</p>
              <p className="font-medium">PV 12345</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Person</p>
              <p className="font-medium">Mr. Sunil Perera</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Fleet Stats */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">📞</span>
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">✉️</span>
                <span>info@lankaexpress.lk</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">🌐</span>
                <span>www.lankaexpress.lk</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Fleet Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-blue-600 mb-1">🚌</div>
                  <p className="text-2xl font-bold text-blue-600">45</p>
                  <p className="text-sm text-gray-600">Total Buses</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-green-600 mb-1">✅</div>
                  <p className="text-2xl font-bold text-green-600">42</p>
                  <p className="text-sm text-gray-600">Active Buses</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-yellow-600 mb-1">🔧</div>
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                  <p className="text-sm text-gray-600">Maintenance Due</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-green-600 mb-1">💰</div>
                  <p className="text-2xl font-bold text-green-600">Rs2.4M</p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Performance & Admin Actions */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Financial Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">Rs85,000</p>
                  <p className="text-sm text-gray-600">Daily Earnings</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">Rs2.4M</p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">Rs125,000</p>
                  <p className="text-sm text-gray-600">Outstanding Dues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle className="flex items-center">⚙️ Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start bg-blue-500/20 text-blue-600 border-blue-200 hover:bg-blue-500/30 shadow-md">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-green-500/20 text-green-600 border-green-200 hover:bg-green-500/30 shadow-md">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-gray-500/20 text-gray-600 border-gray-200 hover:bg-gray-500/30 shadow-md">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-red-500/20 text-red-600 border-red-200 hover:bg-red-500/30 shadow-md">
                <Ban className="h-4 w-4 mr-2" />
                Block User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Fleet Inventory */}
      <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <span>Fleet Inventory</span>
            <Badge variant="outline">{fleetData.length} Buses</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Bus Number</TableHead>
                  <TableHead className="font-semibold">Model & Year</TableHead>
                  <TableHead className="font-semibold">Capacity</TableHead>
                  <TableHead className="font-semibold">Current Route</TableHead>
                  <TableHead className="font-semibold">Driver</TableHead>
                  <TableHead className="font-semibold">Conductor</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Last Service</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fleetData.map((bus) => (
                  <TableRow
                    key={bus.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => (window.location.href = `/admin/users/fleet/${userId}/bus/${bus.id}`)}
                  >
                    <TableCell className="font-medium text-blue-600">{bus.busNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{bus.model}</p>
                        <p className="text-sm text-gray-500">{bus.year}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{bus.capacity} seats</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={bus.route === "Not Assigned" ? "text-gray-400" : "text-gray-900"}>
                        {bus.route}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={bus.driver === "Not Assigned" ? "text-gray-400" : "text-gray-900"}>
                        {bus.driver}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={bus.conductor === "Not Assigned" ? "text-gray-400" : "text-gray-900"}>
                        {bus.conductor}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          bus.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : bus.status === "Maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {bus.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{bus.lastService}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 shadow-md"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `/admin/users/fleet/${userId}/bus/${bus.id}`
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
