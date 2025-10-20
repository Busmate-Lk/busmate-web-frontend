"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/admin/ui/card"
import { Input } from "@/components/admin/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select"
import { Badge } from "@/components/admin/ui/badge"
import { Button } from "@/components/admin/ui/button"
import { Search, Clock, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { listNotifications, type NotificationListItem } from "@/lib/services/notificationService"
import { useAuth } from "@/context/AuthContext"

function toRelativeTime(dateStr?: string) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const diff = Date.now() - d.getTime()
    const sec = Math.floor(diff / 1000)
    if (sec < 60) return `${sec}s ago`
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    const day = Math.floor(hr / 24)
    return `${day}d ago`
}

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

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "error":
            case "critical":
                return <AlertTriangle className="h-5 w-5 text-red-600" />
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-600" />
            default:
                return <Info className="h-5 w-5 text-blue-600" />
        }
    }

    const getNotificationBadge = (type: string) => {
        switch (type) {
            case "error":
            case "critical":
                return "bg-red-100 text-red-800"
            case "warning":
                return "bg-yellow-100 text-yellow-800"
            case "success":
                return "bg-green-100 text-green-800"
            default:
                return "bg-blue-100 text-blue-800"
        }
    }

    const handleNotificationClick = (notificationId: string) => {
        router.push(`/operator/notifications/detail/${notificationId}`)
    }

    return (
        <div className="p-6 space-y-6">
            {/* Filters */}
            <Card className="shadow-lg">
                <CardContent className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Input
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 shadow-sm"
                            />
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                            <Select value={messageTypeFilter} onValueChange={setMessageTypeFilter}>
                                <SelectTrigger className="shadow-sm bg-white">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent className="shadow-lg bg-white">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="info">Information</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={targetAudienceFilter} onValueChange={setTargetAudienceFilter}>
                                <SelectTrigger className="shadow-sm bg-white">
                                    <SelectValue placeholder="Filter by audience" />
                                </SelectTrigger>
                                <SelectContent className="shadow-lg bg-white">
                                    <SelectItem value="all">All Audiences</SelectItem>
                                    <SelectItem value="fleet_operators">Fleet Operators</SelectItem>
                                    <SelectItem value="all">All Users</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-4">
                {loading && (
                    <Card className="shadow-md"><CardContent className="p-6">Loading notifications...</CardContent></Card>
                )}
                {!loading && filteredNotifications.length === 0 && (
                    <Card className="shadow-md"><CardContent className="p-6">No notifications found.</CardContent></Card>
                )}
                {filteredNotifications.map((n) => (
                    <Card
                        key={n.notificationId}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 shadow-md"
                        onClick={() => handleNotificationClick(n.notificationId)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 mt-1">{getNotificationIcon((n.messageType || 'info'))}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {n.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 mb-3">{n.body}</p>
                                            <div className="flex items-center space-x-3">
                                                <Badge className={getNotificationBadge((n.messageType || 'info'))}>
                                                    {(n.messageType || 'info').charAt(0).toUpperCase() + (n.messageType || 'info').slice(1)}
                                                </Badge>
                                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{toRelativeTime(n.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shadow-md"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleNotificationClick(n.notificationId)
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Load More */}
            {!loading && filteredNotifications.length > 0 && (
                <div className="text-center mt-6">
                    <Button variant="outline" className="bg-gray-500/20 text-gray-600 border-gray-200 hover:bg-gray-500/30 shadow-md">
                        Load More Notifications
                    </Button>
                </div>
            )}
        </div>
    )
}
