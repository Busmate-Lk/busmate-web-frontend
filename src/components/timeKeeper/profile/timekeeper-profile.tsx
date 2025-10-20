"use client"
import { ChangeEvent, useRef, useState } from "react"
import { Button } from "@/components/operator/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/operator/ui/card"
import { Badge } from "@/components/operator/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/operator/ui/avatar"
import { Input } from "@/components/operator/ui/input"
import { Label } from "@/components/operator/ui/label"
import { Switch } from "@/components/operator/ui/switch"
import { ArrowLeft, Edit, Save, Shield, Clock, Activity, Settings, Users, MapPin } from "lucide-react"
import { uploadImage } from "@/supabase/storage/clients"



export function TimekeeperProfile() {
  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder.svg");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const { imageUrl, error } = await uploadImage({ file, bucket: "profile-photos", folder: "profile_photo" });
      setUploading(false);
      if (imageUrl) {
        setAvatarUrl(imageUrl);
      } else {
        alert(error || "Upload failed");
      }
    }
  };
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timekeeper Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input id="fullname" defaultValue="John Perera" />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="timekeeper@example.lk" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+94 71 234 5678" />
                </div>
                <div>
                  <Label htmlFor="assignStand">Assigned Stand</Label>
                  <Input id="assignStand" defaultValue="Colombo Central Stand" />
                </div>
                <div>
                  <Label htmlFor="nic">NIC</Label>
                  <Input id="nic" defaultValue="901234567V" />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" defaultValue="Western Province" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Stand Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified about stand changes and assignments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Shift Reminders</Label>
                  <p className="text-sm text-gray-600">Receive reminders for shift start and end</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">System Notices</Label>
                  <p className="text-sm text-gray-600">Important system and policy updates</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">

          <Card>
            <CardContent className="p-6 text-center">
              {uploading ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <span className="text-blue-600 font-medium">Uploading...</span>
                </div>
              ) : (
                <>
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={avatarUrl} key={avatarUrl} />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">TK</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-2">Timekeeper</h3>
                  <p className="text-gray-600 mb-4">Assigned Stand: Colombo Central</p>
                  <div className="flex justify-center space-x-2 mb-4">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    ref={fileInputRef}
                    className="mb-2"
                    hidden
                  />
                  <Button
                    variant="outline"
                    className="w-full bg-blue-500/20 text-blue-600 border-blue-200 hover:bg-blue-500/30 shadow-md"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Avatar
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Assigned Stand</span>
                </div>
                <span className="text-sm font-medium">Colombo Central Stand</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Managed Shifts</span>
                </div>
                <span className="text-sm font-medium">3</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-600">Last Login</span>
                </div>
                <span className="text-sm font-medium">1 hour ago</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">On-Time Performance</span>
                </div>
                <span className="text-sm font-medium text-green-600">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Safety Rating</span>
                </div>
                <span className="text-sm font-medium text-blue-600">Good</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                </div>
                <span className="text-sm font-medium">&lt; 2 min</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Checked in to stand</p>
                    <p className="text-xs text-gray-500">Today, 10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Shift updated</p>
                    <p className="text-xs text-gray-500">Yesterday, 3:15 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Policy acknowledgement</p>
                    <p className="text-xs text-gray-500">Dec 20, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1 bg-gray-500/20 text-gray-600 border-gray-200 hover:bg-gray-500/30 shadow-md">
              Cancel
            </Button>
            <Button className="flex-1 bg-blue-500/90 text-white hover:bg-blue-600 shadow-md">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
