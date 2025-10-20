import { Button } from "@/components/admin/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/admin/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table"
import { ArrowLeft, Download, Edit, RotateCcw, MessageSquare, FileText, Ban } from "lucide-react"
import Link from "next/link"

interface PassengerProfileProps {
  userId: string
}

export function PassengerProfile({ userId }: PassengerProfileProps) {
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
            <h1 className="text-2xl font-bold">Passenger Profile</h1>
            <p className="text-gray-600">Comprehensive passenger management</p>
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
                <AvatarFallback>PP</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">Priya Perera</h2>
                <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Passenger ID:</span>
                  <span className="ml-2 font-medium">BM-2024-001547</span>
                </div>
                <div>
                  <span className="text-gray-600">Registration:</span>
                  <span className="ml-2">March 15, 2024</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Login:</span>
                  <span className="ml-2">2 hours ago</span>
                </div>
                <div>
                  <span className="text-gray-600">Account Type:</span>
                  <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                    Passenger
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">👤 Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-medium">+94 77 123 4567</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email Address</p>
              <p className="font-medium">priya.perera@email.com</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Emergency Contact</p>
              <p className="font-medium">+94 71 987 6543 (Mother)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">NIC Number</p>
              <div className="flex items-center space-x-2">
                <p className="font-medium">200012345678</p>
                <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age & Gender</p>
              <p className="font-medium">24 years, Female</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preferred Language</p>
              <p className="font-medium">Sinhala</p>
            </div>

            <div className="pt-4 mt-4 bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium mb-3 flex items-center">📍 Address Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">🏠 Home Address</p>
                  <p className="text-sm">No. 45, Galle Road, Colombo 03, Western Province</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">🏢 Workplace Address</p>
                  <p className="text-sm">University of Colombo, Colombo 07, Western Province</p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium mb-3 flex items-center">📱 Device Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">App Version</span>
                  <span>v2.1.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Device</span>
                  <span>iPhone 14 Pro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">OS Version</span>
                  <span>iOS 17.2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Statistics & Payment */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle className="flex items-center">📊 Travel Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">247</p>
                  <p className="text-sm text-gray-600">Total Trips</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">18</p>
                  <p className="text-sm text-gray-600">Monthly Average</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">Rs 12,450</p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">5</p>
                  <p className="text-sm text-gray-600">Favorite Routes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle className="flex items-center">💳 Payment & Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">Rs 1,250.00</p>
                <p className="text-sm text-gray-600">Wallet Balance</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Linked Methods</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Visa **** 4532</span>
                    <span className="text-blue-600 text-xs">💳</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">eZ Cash</span>
                    <span className="text-green-600 text-xs">📱</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Payment Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Failed Transactions</span>
                    <span>3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Admin Actions */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle className="flex items-center">📋 Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Route</TableHead>
                    <TableHead className="text-xs">Bus #</TableHead>
                    <TableHead className="text-xs">Fare</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs">Dec 18</TableCell>
                    <TableCell className="text-xs">Colombo - Kandy</TableCell>
                    <TableCell className="text-xs">BM-4521</TableCell>
                    <TableCell className="text-xs">Rs 320</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">Dec 17</TableCell>
                    <TableCell className="text-xs">Kandy - Colombo</TableCell>
                    <TableCell className="text-xs">BM-4522</TableCell>
                    <TableCell className="text-xs">Rs 320</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">Dec 15</TableCell>
                    <TableCell className="text-xs">Colombo - Galle</TableCell>
                    <TableCell className="text-xs">BM-3401</TableCell>
                    <TableCell className="text-xs">Rs 180</TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800 text-xs">Cancelled</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle className="flex items-center">📈 Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">App Sessions</span>
                <span className="font-medium">124 this month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Session</span>
                <span className="font-medium">4.2 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Support Tickets</span>
                <span className="font-medium">2 resolved</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reviews Given</span>
                <span className="font-medium">15 (Avg: 4.2⭐)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referrals</span>
                <span className="font-medium">3 successful</span>
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
    </div>
  )
}
