import { Button } from "@/components/admin/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/admin/ui/avatar"
import { ArrowLeft, Download, Edit, RotateCcw, MessageSquare, FileText, Ban } from "lucide-react"
import Link from "next/link"

interface MotAdminProfileProps {
  userId: string
}

export function MotAdminProfile({ userId }: MotAdminProfileProps) {
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
            <h1 className="text-2xl font-bold">MOT Admin Profile</h1>
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
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">Dr. Samantha Perera</h2>
                  <Badge className="bg-orange-100 text-orange-800">DIRECTOR</Badge>
                </div>
                <p className="text-gray-600 mb-2">Director - Transport Regulation Division</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="ml-2 font-medium">MOT-2019-0147</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Security Level:</span>
                    <span className="ml-2">LEVEL 4 - CONFIDENTIAL</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Appointed:</span>
                    <span className="ml-2">March 15, 2019</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Access:</span>
                    <span className="ml-2">Today, 09:15 AM</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800 mb-2">ACTIVE</Badge>
              <p className="text-sm text-gray-600">Session expires in 45 min</p>
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

        {/* Security & System Access */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Security Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">2FA Authentication</span>
                  <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Security Clearance</span>
                  <Badge className="bg-blue-100 text-blue-800">LEVEL 4</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Security Review</span>
                  <span className="text-sm">Dec 15, 2023</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Access Violations</span>
                  <Badge className="bg-green-100 text-green-800">NONE</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>System Access Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-gray-600">Total Logins</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">89</p>
                  <p className="text-sm text-gray-600">Reports Generated</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">156</p>
                  <p className="text-sm text-gray-600">Decisions Made</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">23</p>
                  <p className="text-sm text-gray-600">Policies Updated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Admin Actions */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle>Recent System Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Approved Bus Route License - Route 138</p>
                  <p className="text-xs text-gray-500">Today, 11:30 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Generated Monthly Compliance Report</p>
                  <p className="text-xs text-gray-500">Today, 10:15 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Updated Safety Regulation Policy</p>
                  <p className="text-xs text-gray-500">Yesterday, 4:45 PM</p>
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
    </div>
  )
}
