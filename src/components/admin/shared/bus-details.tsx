"use client"

import { useState } from "react"
import { Button } from "@/components/admin/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table"
import { Tabs, TabsContent } from "@/components/admin/ui/tabs"
import {
  ArrowLeft,
  Bus,
  User,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  DollarSign,
  TrendingUp,
  Clock,
  Route,
  Fuel,
  Shield,
  Star,
  Edit,
  MessageSquare,
  Download,
} from "lucide-react"
import Link from "next/link"

interface BusDetailsProps {
  fleetId: string
  busId: string
}

export function BusDetails({ fleetId, busId }: BusDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - in real app, this would come from API
  const busData = {
    id: busId,
    busNumber: busId,
    model: "Tata LP 1613",
    year: "2022",
    capacity: 52,
    status: "Active",
    registrationNumber: "WP CAB-1234",
    chassisNumber: "MAT621234567890",
    engineNumber: "497TCIC123456",
    insuranceExpiry: "2025-03-15",
    lastService: "2024-12-15",
    nextService: "2025-01-15",
    mileage: "125,450 km",
    fuelType: "Diesel",
    currentRoute: "Colombo - Kandy",
    averageSpeed: "45 km/h",
    fuelEfficiency: "8.5 km/l",
    monthlyRevenue: "Rs 485,000",
    dailyTrips: 6,
    driver: {
      id: "D001",
      name: "Kamal Perera",
      phone: "+94 77 123 4567",
      email: "kamal.perera@email.com",
      licenseNumber: "B1234567",
      licenseExpiry: "2026-08-20",
      experience: "12 years",
      rating: 4.8,
      address: "No. 45, Temple Road, Kandy",
      emergencyContact: "+94 71 987 6543",
      joinedDate: "2020-03-15",
      totalTrips: 2450,
      safetyRecord: "Excellent",
    },
    conductor: {
      id: "C001",
      name: "Sunil Silva",
      phone: "+94 76 234 5678",
      email: "sunil.silva@email.com",
      experience: "8 years",
      rating: 4.6,
      address: "No. 78, Main Street, Peradeniya",
      emergencyContact: "+94 72 876 5432",
      joinedDate: "2021-06-10",
      totalTrips: 1850,
      customerRating: 4.7,
    },
  }

  const maintenanceHistory = [
    {
      date: "2024-12-15",
      type: "Regular Service",
      description: "Oil change, brake inspection, tire rotation",
      cost: "Rs 25,000",
      mechanic: "Auto Care Center",
      status: "Completed",
    },
    {
      date: "2024-11-20",
      type: "Repair",
      description: "Air conditioning system repair",
      cost: "Rs 45,000",
      mechanic: "Cool Tech Services",
      status: "Completed",
    },
    {
      date: "2024-10-10",
      type: "Regular Service",
      description: "Engine tune-up, filter replacement",
      cost: "Rs 30,000",
      mechanic: "Auto Care Center",
      status: "Completed",
    },
  ]

  const recentTrips = [
    {
      date: "2024-12-24",
      route: "Colombo - Kandy",
      departure: "06:00 AM",
      arrival: "09:30 AM",
      passengers: 48,
      revenue: "Rs 12,000",
      fuelUsed: "35L",
    },
    {
      date: "2024-12-24",
      route: "Kandy - Colombo",
      departure: "02:00 PM",
      arrival: "05:30 PM",
      passengers: 52,
      revenue: "Rs 13,000",
      fuelUsed: "38L",
    },
    {
      date: "2024-12-23",
      route: "Colombo - Kandy",
      departure: "06:00 AM",
      arrival: "09:30 AM",
      passengers: 45,
      revenue: "Rs 11,250",
      fuelUsed: "36L",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button className="text-gray-600 hover:bg-transparent" variant="ghost" size="sm" asChild>
            <Link href={`/admin/users/fleet/${fleetId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fleet
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bus {busData.busNumber}</h1>
            <p className="text-gray-600">
              {busData.model} • {busData.currentRoute}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
        </div>
      </div>

      {/* Bus Overview Card */}
      <Card className="shadow-sm border border-gray-200 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bus className="h-12 w-12 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h2 className="text-2xl font-bold">{busData.busNumber}</h2>
                <Badge
                  className={
                    busData.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {busData.status}
                </Badge>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Model:</span>
                  <span className="ml-2 font-medium">{busData.model}</span>
                </div>
                <div>
                  <span className="text-gray-600">Year:</span>
                  <span className="ml-2 font-medium">{busData.year}</span>
                </div>
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <span className="ml-2 font-medium">{busData.capacity} seats</span>
                </div>
                <div>
                  <span className="text-gray-600">Mileage:</span>
                  <span className="ml-2 font-medium">{busData.mileage}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{busData.monthlyRevenue}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mb-6">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === "overview" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Wrench className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("crew")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === "crew" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <User className="h-4 w-4" />
              <span>Driver & Conductor</span>
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === "maintenance" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Wrench className="h-4 w-4" />
              <span>Maintenance</span>
            </button>
            <button
              onClick={() => setActiveTab("trips")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === "trips" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Route className="h-4 w-4" />
              <span>Recent Trips</span>
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === "performance" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Performance</span>
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Technical Specifications */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="bg-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-blue-600" />
                  Technical Specs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration:</span>
                  <span className="font-medium">{busData.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chassis No:</span>
                  <span className="font-medium text-xs">{busData.chassisNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engine No:</span>
                  <span className="font-medium text-xs">{busData.engineNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Type:</span>
                  <span className="font-medium">{busData.fuelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Efficiency:</span>
                  <span className="font-medium">{busData.fuelEfficiency}</span>
                </div>
              </CardContent>
            </Card>

            {/* Route Information */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="bg-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Route className="h-5 w-5 mr-2 text-green-600" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Route:</span>
                  <span className="font-medium">{busData.currentRoute}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Trips:</span>
                  <span className="font-medium">{busData.dailyTrips}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Speed:</span>
                  <span className="font-medium">{busData.averageSpeed}</span>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{busData.monthlyRevenue}</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance & Compliance */}
            <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  Insurance & Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Insurance:</span>
                  <Badge className="bg-green-100 text-green-800">Valid</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">{busData.insuranceExpiry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Service:</span>
                  <span className="font-medium">{busData.lastService}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Service:</span>
                  <span className="font-medium text-orange-600">{busData.nextService}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Driver & Conductor Tab */}
        <TabsContent value="crew" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver Information */}
            <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Driver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{busData.driver.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{busData.driver.rating}</span>
                      <span className="text-sm text-gray-600">({busData.driver.totalTrips} trips)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{busData.driver.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{busData.driver.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{busData.driver.address}</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">License No:</span>
                    <span className="font-medium">{busData.driver.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">License Expiry:</span>
                    <span className="font-medium">{busData.driver.licenseExpiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{busData.driver.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Safety Record:</span>
                    <Badge className="bg-green-100 text-green-800">{busData.driver.safetyRecord}</Badge>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Conductor Information */}
            <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                  Conductor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{busData.conductor.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{busData.conductor.rating}</span>
                      <span className="text-sm text-gray-600">({busData.conductor.totalTrips} trips)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{busData.conductor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{busData.conductor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{busData.conductor.address}</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{busData.conductor.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined Date:</span>
                    <span className="font-medium">{busData.conductor.joinedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Rating:</span>
                    <span className="font-medium">{busData.conductor.customerRating}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency Contact:</span>
                    <span className="font-medium text-sm">{busData.conductor.emergencyContact}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                  Maintenance History
                </span>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Service
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Service Provider</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell>
                        <Badge variant={record.type === "Repair" ? "destructive" : "default"}>{record.type}</Badge>
                      </TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>{record.mechanic}</TableCell>
                      <TableCell className="font-medium">{record.cost}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{record.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Trips Tab */}
        <TabsContent value="trips" className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Recent Trips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Passengers</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Fuel Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrips.map((trip, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{trip.date}</TableCell>
                      <TableCell>{trip.route}</TableCell>
                      <TableCell>{trip.departure}</TableCell>
                      <TableCell>{trip.arrival}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-medium">{trip.passengers}</span>
                          <span className="text-gray-500 ml-1">/{busData.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">{trip.revenue}</TableCell>
                      <TableCell>{trip.fuelUsed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{busData.monthlyRevenue}</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 text-center">
                <Fuel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{busData.fuelEfficiency}</div>
                <div className="text-sm text-gray-600">Fuel Efficiency</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{busData.averageSpeed}</div>
                <div className="text-sm text-gray-600">Average Speed</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{busData.dailyTrips}</div>
                <div className="text-sm text-gray-600">Daily Trips</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
