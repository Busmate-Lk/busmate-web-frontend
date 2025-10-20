import { Button } from "@/components/admin/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/admin/ui/avatar"
import { ArrowLeft, Download, Edit, MapPin } from "lucide-react"
import Link from "next/link"

interface TimeKeeperProfileProps {
  userId: string
}

export function TimekeeperProfile({ userId }: TimeKeeperProfileProps) {
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
            <h1 className="text-2xl font-bold">Time Keeper Profile</h1>
            <p className="text-gray-600">Comprehensive MOT management</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>CP</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">Chaminda Perera</h2>
                  <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">TK:</span>
                    <span className="ml-2 font-medium">2024-0087</span>
                  </div>
                  <div>
                    <span className="text-gray-600">📍 Colombo Central Station</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Employed:</span>
                    <span className="ml-2">Jan 15, 2024</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Check-in:</span>
                    <span className="ml-2">Today 7:45 AM</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">On Duty</span>
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
                  <span className="ml-2">chaminda.p@busmate.lk</span>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2">123 Galle Road, Colombo</span>
                </div>
                <div>
                  <span className="text-gray-600">Emergency:</span>
                  <span className="ml-2">+94 71 987 6543</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Employment Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Position:</span>
                  <span className="ml-2">Senior Time Keeper</span>
                </div>
                <div>
                  <span className="text-gray-600">Depot:</span>
                  <span className="ml-2">Colombo Central</span>
                </div>
                <div>
                  <span className="text-gray-600">Supervisor:</span>
                  <span className="ml-2">Sunil Fernando</span>
                </div>
                <div>
                  <span className="text-gray-600">Shift:</span>
                  <span className="ml-2">7:00 AM - 3:00 PM</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 mb-1">🎓</div>
                <p className="text-xs text-gray-600">Training</p>
                <p className="text-xs font-medium">Certified</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 mb-1">📅</div>
                <p className="text-xs text-gray-600">Schedule</p>
                <p className="text-xs font-medium">Regular</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-yellow-600 mb-1">⭐</div>
                <p className="text-xs text-gray-600">Rating</p>
                <p className="text-xs font-medium">4.8/5.0</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-purple-600 mb-1">⚙️</div>
                <p className="text-xs text-gray-600">Equipment</p>
                <p className="text-xs font-medium">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Station Assignment & Performance */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Station Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Colombo Central Station</h3>
                <p className="text-sm text-gray-600">Primary Assignment</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage Area:</span>
                  <span>Central District</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Routes Monitored:</span>
                  <span>12 Routes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Buses:</span>
                  <span>45-60 Buses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers/Day:</span>
                  <span>~2,400</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">On-time Performance:</span>
                  <span className="text-green-600 font-medium">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Accuracy:</span>
                  <span className="text-green-600 font-medium">98.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="text-green-600 font-medium">2.3 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Management & Recent Activity */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Time Management Duties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">24</p>
                  <p className="text-sm text-gray-600">Buses Tracked</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">96%</p>
                  <p className="text-sm text-gray-600">Schedule Adherence</p>
                  <p className="text-xs text-gray-500">Rate</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                  <p className="text-sm text-gray-600">Delays Recorded</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">12</p>
                  <p className="text-sm text-gray-600">Reports Generated</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Route Monitoring Assignments</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Routes:</span>
                    <span>Route 101, 102, 138</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Checkpoints:</span>
                    <span>8 Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage:</span>
                    <span>Central District</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Schedule entry recorded for Bus LB-1234</p>
                  <p className="text-xs text-gray-500">Route 101 • 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Delay reported for Route 102</p>
                  <p className="text-xs text-gray-500">Traffic congestion • 15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Passenger count updated</p>
                  <p className="text-xs text-gray-500">Morning rush statistics • 32 minutes ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
