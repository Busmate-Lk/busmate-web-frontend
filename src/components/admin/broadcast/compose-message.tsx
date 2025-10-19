"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/admin/ui/button"
import { Input } from "@/components/admin/ui/input"
import { Label } from "@/components/admin/ui/label"
import { Textarea } from "@/components/admin/ui/textarea"
import { Checkbox } from "@/components/admin/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/admin/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select"
import { Bold, Italic, Underline, Link, List, Calendar, Clock, Send, Save, ArrowLeft, Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { sendNotification } from "@/lib/services/notificationService"
import type { SendNotificationRequest } from "@/lib/services/notificationService"

export function ComposeMessage() {
  const router = useRouter()
  const pathname = usePathname()
  const [messageType, setMessageType] = useState<"info" | "warning" | "critical" | "maintenance">("info")
  const [scheduling, setScheduling] = useState("now")
  const [allUsers, setAllUsers] = useState(false)
  const [subject, setSubject] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Target audience checkboxes
  const [targetPassengers, setTargetPassengers] = useState(false)
  const [targetConductors, setTargetConductors] = useState(false)
  const [targetFleetOps, setTargetFleetOps] = useState(false)
  const [targetMotOfficials, setTargetMotOfficials] = useState(false)

  // Location filters
  const [province, setProvince] = useState<string>("all")
  const [city, setCity] = useState<string>("all")
  const [route, setRoute] = useState<string>("all")

  // Sri Lanka provinces and cities mapping
  const sriLankaProvinces = [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
  ] as const
  const sriLankaCitiesByProvince: Record<string, string[]> = {
    'Western': ['Colombo', 'Gampaha', 'Kalutara', 'Moratuwa', 'Dehiwala', 'Maharagama'],
    'Central': ['Kandy', 'Matale', 'Nuwara Eliya', 'Gampola', 'Hatton'],
    'Southern': ['Galle', 'Matara', 'Hambantota', 'Ambalangoda'],
    'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
    'Eastern': ['Trincomalee', 'Batticaloa', 'Ampara', 'Kalmunai'],
    'North Western': ['Kurunegala', 'Puttalam', 'Chilaw'],
    'North Central': ['Anuradhapura', 'Polonnaruwa'],
    'Uva': ['Badulla', 'Monaragala', 'Bandarawela'],
    'Sabaragamuwa': ['Ratnapura', 'Kegalle']
  }
  const cityOptions = useMemo(() => {
    if (!province || province === 'all') return []
    return sriLankaCitiesByProvince[province] || []
  }, [province])

  // Determine target audience based on selections
  const getTargetAudience = (): SendNotificationRequest['targetAudience'] => {
    if (allUsers) return 'all'
    if (targetPassengers) return 'passengers'
    if (targetConductors) return 'conductors'
    if (targetFleetOps) return 'fleet_operators'
    if (targetMotOfficials) return 'mot_officers'
    return 'all'
  }

  const handleSendMessage = async () => {
    // Validation
    if (!subject.trim()) {
      alert("Please enter a subject")
      return
    }
    if (!messageContent.trim()) {
      alert("Please enter message content")
      return
    }

    setIsSending(true)
    try {
      const request: SendNotificationRequest = {
        title: subject,
        subject: subject,
        body: messageContent,
        messageType: messageType,
        targetAudience: getTargetAudience(),
      }

      // Add optional location filters if set
      // Always include location filters: when 'all' is chosen, send the string 'all'
      request.province = province || 'all'
      request.city = city || 'all'
      request.route = route || 'all'

      const response = await sendNotification(request)

      alert(
        `Message sent successfully!\n\n` +
        `Notification ID: ${response.notificationId}\n` +
        `Total Sent: ${response.stats.totalSent}\n` +
        `Successful: ${response.stats.successful}\n` +
        `Failed: ${response.stats.failed}\n\n` +
        `Web: ${response.stats.web.successful} successful, ${response.stats.web.failed} failed\n` +
        `Mobile: ${response.stats.mobile.successful} successful, ${response.stats.mobile.failed} failed`
      )

      // Reset form
      setSubject("")
      setMessageContent("")
      setMessageType("info")
      setAllUsers(true)
      setTargetPassengers(false)
      setTargetConductors(false)
      setTargetFleetOps(false)
      setTargetMotOfficials(false)
      setProvince('all')
      setCity('all')
      setRoute('all')

      // Navigate back after short delay
      setTimeout(() => {
        const base = pathname?.startsWith('/mot') ? '/mot' : '/admin'
        router.push(`${base}/notifications/sent`)
      }, 2000)

    } catch (error: any) {
      console.error("Error sending notification:", error)
      alert(`Failed to send message: ${error.message || 'Unknown error occurred'}`)
    } finally {
      setIsSending(false)
    }
  }

  const estimatedRecipients = allUsers ? 12847 : Math.floor(Math.random() * 5000) + 1000

  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button className="bg-gray-500/20 text-gray-600 hover:bg-gray-500/30 shadow-md" variant="ghost" size="sm" onClick={() => router.push(`${pathname?.startsWith('/mot') ? '/mot' : '/admin'}/notifications/sent`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
              <p className="text-sm text-gray-600">Configure your broadcast message settings</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Message Type */}
              <div>
                <Label className="text-base font-medium">Message Type</Label>
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <button
                    onClick={() => setMessageType("info")}
                    className={`p-4 rounded-lg shadow text-center transition-colors ${messageType === "info"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-white hover:bg-gray-50"
                      }`}
                  >
                    <div className="text-blue-600 mb-2">ℹ️</div>
                    <span className="text-sm font-medium">Info</span>
                  </button>
                  <button
                    onClick={() => setMessageType("warning")}
                    className={`p-4 rounded-lg shadow text-center transition-colors ${messageType === "warning"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-white hover:bg-gray-50"
                      }`}
                  >
                    <div className="text-yellow-600 mb-2">⚠️</div>
                    <span className="text-sm font-medium">Warning</span>
                  </button>
                  <button
                    onClick={() => setMessageType("critical")}
                    className={`p-4 rounded-lg shadow text-center transition-colors ${messageType === "critical"
                      ? "bg-red-50 text-red-700"
                      : "bg-white hover:bg-gray-50"
                      }`}
                  >
                    <div className="text-red-600 mb-2">🚨</div>
                    <span className="text-sm font-medium">Critical</span>
                  </button>
                  <button
                    onClick={() => setMessageType("maintenance")}
                    className={`p-4 rounded-lg shadow text-center transition-colors ${messageType === "maintenance"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-white hover:bg-gray-50"
                      }`}
                  >
                    <div className="text-purple-600 mb-2">🔧</div>
                    <span className="text-sm font-medium">Maintenance</span>
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter message subject..."
                  className="mt-2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Target Audience */}
              <div>
                <Label className="text-base font-medium">Target Audience</Label>
                <div className="grid grid-cols-2 gap-6 mt-3">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-users"
                        checked={allUsers}
                        onCheckedChange={(checked) => {
                          const v = checked === true;
                          setAllUsers(v);
                          if (v) {
                            // Clear specific selections when All Users is selected
                            setTargetPassengers(false);
                            setTargetConductors(false);
                            setTargetFleetOps(false);
                            setTargetMotOfficials(false);
                          }
                        }}
                      />
                      <Label htmlFor="all-users">All Users</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="passengers"
                        checked={targetPassengers}
                        onCheckedChange={checked => {
                          setAllUsers(false);
                          setTargetPassengers(checked === true);
                        }}
                      />
                      <Label htmlFor="passengers">Passengers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="conductors"
                        checked={targetConductors}
                        onCheckedChange={checked => {
                          setAllUsers(false);
                          setTargetConductors(checked === true);
                        }}
                      />
                      <Label htmlFor="conductors">Conductors</Label>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fleet-operators"
                        checked={targetFleetOps}
                        onCheckedChange={checked => {
                          setAllUsers(false);
                          setTargetFleetOps(checked === true);
                        }}
                      />
                      <Label htmlFor="fleet-operators">Fleet Operators</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mot-officials"
                        checked={targetMotOfficials}
                        onCheckedChange={checked => {
                          setAllUsers(false);
                          setTargetMotOfficials(checked === true);
                        }}
                      />
                      <Label htmlFor="mot-officials">MoT Officials</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="custom" disabled />
                      <Label htmlFor="custom">Custom Selection</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Filters */}
              <div>
                <Label className="text-base font-medium">Location Filters (Optional)</Label>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Select value={province} onValueChange={(v) => { setProvince(v); setCity('') }}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="All Provinces" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white text-gray-900">
                        <SelectItem value="all">All Provinces</SelectItem>
                        {sriLankaProvinces.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select value={city} onValueChange={setCity} disabled={!province || province === 'all'}>
                      <SelectTrigger className="bg-white disabled:opacity-70">
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white text-gray-900">
                        <SelectItem value="all">All Cities</SelectItem>
                        {cityOptions.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="route">Route</Label>
                    <Select value={route} onValueChange={setRoute}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="All Routes" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white text-gray-900">
                        <SelectItem value="all">All Routes</SelectItem>
                        <SelectItem value="001">Route 001</SelectItem>
                        <SelectItem value="138">Route 138</SelectItem>
                        <SelectItem value="177">Route 177</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <Label>Message Content</Label>
                <div className="mt-2">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50">
                    <Button variant="ghost" size="sm">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Underline className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Type your message here..."
                    className="min-h-32 resize-none focus-visible:ring-0 shadow border-none"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Characters: {messageContent.length}/1000</span>
                  <span>Estimated recipients: {estimatedRecipients.toLocaleString()}</span>
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <Label className="text-base font-medium">Scheduling</Label>
                <RadioGroup value={scheduling} onValueChange={setScheduling} className="mt-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="now" id="send-now" />
                    <Label htmlFor="send-now">Send Now</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="later" id="schedule-later" />
                    <Label htmlFor="schedule-later">Schedule Later</Label>
                  </div>
                </RadioGroup>

                {scheduling === "later" && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="relative">
                      <Input type="text" placeholder="mm/dd/yyyy" />
                      <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    <div className="relative">
                      <Input type="text" placeholder="--:-- --" />
                      <Clock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t">
                <Button variant="outline" disabled={isSending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" disabled={isSending}>Preview</Button>
                  <Button
                    className="bg-blue-500/90 text-white hover:bg-blue-600 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                    onClick={handleSendMessage}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Message Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Message Preview</CardTitle>
              <p className="text-sm text-gray-600">How it appears on mobile</p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    BM
                  </div>
                  <div>
                    <p className="font-medium text-sm">BUSMATE LK</p>
                    <p className="text-xs text-gray-500">now</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${messageType === "info" ? "bg-blue-500" :
                      messageType === "warning" ? "bg-yellow-500" :
                        messageType === "critical" ? "bg-red-500" :
                          "bg-purple-500"
                      }`}></span>
                    <span className={`text-xs font-medium uppercase ${messageType === "info" ? "text-blue-600" :
                      messageType === "warning" ? "text-yellow-600" :
                        messageType === "critical" ? "text-red-600" :
                          "text-purple-600"
                      }`}>{messageType}</span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">
                    {subject || "Message Subject"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {messageContent || "Your message content will appear here..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-medium">25,694</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Today</span>
                <span className="font-medium">12,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Open Rate</span>
                <span className="font-medium text-green-600">84.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Delivery</span>
                <span className="font-medium text-blue-600">~2 minutes</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
