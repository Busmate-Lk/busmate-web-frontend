import { Button } from "@/components/admin/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/admin/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table"
import { ArrowLeft, Download, Edit, RotateCcw, MessageSquare, FileText, Ban } from "lucide-react"
import Link from "next/link"

interface ConductorProfileProps {
  userId: string
}

export function ConductorProfile({ userId }: ConductorProfileProps) {
  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:bg-transparent">
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Conductor Profile</h1>
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
      <Card className="mb-6 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>PS</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">Pradeep Kumara Silva</h2>
                <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Conductor ID:</span>
                  <span className="ml-2 font-medium">CON-2024-1847</span>
                </div>
                <div>
                  <span className="text-gray-600">License No:</span>
                  <span className="ml-2">LIC-SL-9876543</span>
                </div>
                <div>
                  <span className="text-gray-600">Hire Date:</span>
                  <span className="ml-2">March 15, 2022</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="ml-2">Today, 2:45 PM</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employment Information */}
        <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Personal Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2">+94 77 123 4567</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2">pradeep.silva@busmate.lk</span>
                </div>
                <div>
                  <span className="text-gray-600">Emergency:</span>
                  <span className="ml-2">+94 71 987 6543</span>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2">123, Galle Road, Colombo 03</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Employment Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Employee ID:</span>
                  <span className="ml-2">EMP-2022-0847</span>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2">Route Operations</span>
                </div>
                <div>
                  <span className="text-gray-600">Supervisor:</span>
                  <span className="ml-2">Nimal Perera</span>
                </div>
                <div>
                  <span className="text-gray-600">Work Location:</span>
                  <span className="ml-2">Colombo Central Depot</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance & Financial */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-gray-600">Total Trips</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">Rs2.4M</p>
                  <p className="text-sm text-gray-600">Revenue Collected</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">4.8</p>
                  <p className="text-sm text-gray-600">Customer Rating</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">96%</p>
                  <p className="text-sm text-gray-600">Punctuality</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">Rs85,000</p>
                <p className="text-sm text-gray-600">Monthly Revenue Target</p>
                <p className="text-xs text-green-600">92% Achieved</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Salary:</span>
                  <span>Rs45,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Performance Bonus:</span>
                  <span className="text-green-600">Rs8,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overtime:</span>
                  <span>Rs12,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Current Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <h4 className="font-medium">Primary Route</h4>
                <p className="text-sm text-gray-600">Colombo - Kandy Express</p>
                <p className="text-xs text-gray-500">Mon, Wed, Fri</p>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium">Secondary Route</h4>
                <p className="text-sm text-gray-600">Galle - Colombo Local</p>
                <p className="text-xs text-gray-500">Tue, Thu, Sat</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Admin Actions */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Recent Trip Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Route</TableHead>
                    <TableHead className="text-xs">Bus No.</TableHead>
                    <TableHead className="text-xs">Passengers</TableHead>
                    <TableHead className="text-xs">Revenue</TableHead>
                    <TableHead className="text-xs">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs">Jan 15, 2025</TableCell>
                    <TableCell className="text-xs">Colombo - Kandy</TableCell>
                    <TableCell className="text-xs">NC-4567</TableCell>
                    <TableCell className="text-xs">42</TableCell>
                    <TableCell className="text-xs">Rs8,400</TableCell>
                    <TableCell className="text-xs">4.9</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">Jan 14, 2025</TableCell>
                    <TableCell className="text-xs">Galle - Colombo</TableCell>
                    <TableCell className="text-xs">NC-4567</TableCell>
                    <TableCell className="text-xs">38</TableCell>
                    <TableCell className="text-xs">Rs7,600</TableCell>
                    <TableCell className="text-xs">4.7</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
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
    </div>
  )
}
