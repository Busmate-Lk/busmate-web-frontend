"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import { Button } from "@/components/admin/ui/button"
import { ArrowLeft, Bell, Calendar, Tag, Users, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { getNotificationDetails, type NotificationDetails } from "@/lib/services/notificationService"

interface NotificationDetailProps {
    notificationId: string
}

export function NotificationDetail({ notificationId }: NotificationDetailProps) {
    const router = useRouter()
    const [notification, setNotification] = useState<NotificationDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                setLoading(true)
                const data = await getNotificationDetails(notificationId)
                setNotification(data)
            } catch (error) {
                console.error("Failed to fetch notification:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotification()
    }, [notificationId])

    const getMessageTypeBadge = (type: string) => {
        const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            info: { label: "Info", variant: "default" },
            warning: { label: "Warning", variant: "secondary" },
            critical: { label: "Critical", variant: "destructive" },
            maintenance: { label: "Maintenance", variant: "outline" },
        }
        const config = typeMap[type?.toLowerCase()] || { label: type || "Unknown", variant: "outline" as const }
        return <Badge variant={config.variant} className="text-sm">{config.label}</Badge>
    }

    const getTargetAudienceBadge = (audience: string) => {
        const audienceMap: Record<string, string> = {
            all: "All Users",
            passengers: "Passengers",
            conductors: "Conductors",
            mot_officers: "MOT Officers",
            fleet_operators: "Fleet Operators",
        }
        return <Badge variant="outline" className="text-sm">{audienceMap[audience?.toLowerCase()] || audience || "Unknown"}</Badge>
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!notification) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Notification not found</p>
                    <Button
                        onClick={() => router.push("/operator/notifications/received")}
                        className="mt-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Notifications
                    </Button>
                </div>
            </div>
        )
    }

    const sentTime = formatDate(notification.createdAt)

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/operator/notifications/received")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">{notification.title}</CardTitle>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {getMessageTypeBadge(notification.messageType || '')}
                                {getTargetAudienceBadge(notification.targetAudience || '')}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Message Subject */}
                    {notification.subject && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Subject
                            </h3>
                            <p className="text-gray-900 font-medium">{notification.subject}</p>
                        </div>
                    )}

                    {/* Message Body */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Message
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-800 whitespace-pre-wrap">{notification.body}</p>
                        </div>
                    </div>

                    {/* Location Information */}
                    {(notification.province || notification.city || notification.route) && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Location Details
                            </h3>
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-2">
                                {notification.province && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Province:</span>
                                        <span className="text-sm text-gray-900">{notification.province}</span>
                                    </div>
                                )}
                                {notification.city && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">City:</span>
                                        <span className="text-sm text-gray-900">{notification.city}</span>
                                    </div>
                                )}
                                {notification.route && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Route:</span>
                                        <span className="text-sm text-gray-900">{notification.route}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Date and Time */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Received Date & Time
                        </h3>
                        <p className="text-gray-600">{sentTime}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
