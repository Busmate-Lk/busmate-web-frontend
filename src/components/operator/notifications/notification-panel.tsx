"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card"
import { Input } from "@/components/admin/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select"
import { Badge } from "@/components/admin/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table"
import { Bell, Search, Filter, Clock, Tag, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { listNotifications, type NotificationListItem } from "@/lib/services/notificationService"
import { useAuth } from "@/context/AuthContext"

export function NotificationPanel() {
    const router = useRouter()
    const { user, isLoading } = useAuth()
    const [notifications, setNotifications] = useState<NotificationListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [messageTypeFilter, setMessageTypeFilter] = useState<string>("all")
    const [targetAudienceFilter, setTargetAudienceFilter] = useState<string>("all")

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true)
                const data = await listNotifications(50)

                // Operator only sees messages targeted to fleet_operators or all
                const filtered = data.filter(n => {
                    const ta = (n.targetAudience || '').toLowerCase()
                    const targetOk = ta === 'fleet_operators' || ta === 'all'
                    return targetOk
                })

                setNotifications(filtered)
            } catch (error) {
                console.error("Failed to fetch notifications:", error)
            } finally {
                setLoading(false)
            }
        }

        if (user && !isLoading) {
            fetchNotifications()
        }
    }, [user, isLoading])

    // Filter notifications based on search and filters
    const filteredNotifications = useMemo(() => {
        return notifications.filter(notification => {
            const matchesSearch =
                notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.body.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesMessageType =
                messageTypeFilter === "all" ||
                (notification.messageType || '').toLowerCase() === messageTypeFilter.toLowerCase()

            const matchesTargetAudience =
                targetAudienceFilter === "all" ||
                (notification.targetAudience || '').toLowerCase() === targetAudienceFilter.toLowerCase()

            return matchesSearch && matchesMessageType && matchesTargetAudience
        })
    }, [notifications, searchQuery, messageTypeFilter, targetAudienceFilter])

    const getMessageTypeBadge = (type: string) => {
        const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            info: { label: "Info", variant: "default" },
            warning: { label: "Warning", variant: "secondary" },
            critical: { label: "Critical", variant: "destructive" },
            maintenance: { label: "Maintenance", variant: "outline" },
        }
        const config = typeMap[type?.toLowerCase()] || { label: type || "Unknown", variant: "outline" as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const getTargetAudienceBadge = (audience: string) => {
        const audienceMap: Record<string, string> = {
            all: "All Users",
            passengers: "Passengers",
            conductors: "Conductors",
            mot_officers: "MOT Officers",
            fleet_operators: "Fleet Operators",
        }
        return <Badge variant="outline">{audienceMap[audience?.toLowerCase()] || audience || "Unknown"}</Badge>
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleNotificationClick = (notificationId: string) => {
        router.push(`/operator/notifications/detail/${notificationId}`)
    }

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    {/* <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                All Notifications
                            </CardTitle>
                            <CardDescription>View and manage your received notifications</CardDescription>
                        </div>
                    </div> */}
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={messageTypeFilter} onValueChange={setMessageTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Message Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={targetAudienceFilter} onValueChange={setTargetAudienceFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Target Audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Audiences</SelectItem>
                                <SelectItem value="fleet_operators">Fleet Operators</SelectItem>
                                <SelectItem value="all">All Users</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notifications Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No notifications found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Audience</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredNotifications.map((notification) => (
                                        <TableRow
                                            key={notification.notificationId}
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleNotificationClick(notification.notificationId)}
                                        >
                                            <TableCell className="font-medium">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{notification.title}</p>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{notification.body}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getMessageTypeBadge(notification.messageType || '')}</TableCell>
                                            <TableCell>{getTargetAudienceBadge(notification.targetAudience || '')}</TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {formatDate(notification.createdAt || '')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
