"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/admin/ui/button"
import { Card, CardContent } from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import { ArrowLeft, Clock, AlertTriangle, Info, CheckCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { getNotificationDetails, type NotificationDetails } from "@/lib/services/notificationService"

interface SentNotificationDetailProps {
    notificationId: string
}

export function SentNotificationDetail({ notificationId }: SentNotificationDetailProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [notification, setNotification] = useState<NotificationDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    setLoading(true)
                    const data = await getNotificationDetails(notificationId)
                    if (mounted) setNotification(data)
                } catch (e: any) {
                    if (mounted) setError(e?.message || 'Failed to load notification')
                } finally {
                    if (mounted) setLoading(false)
                }
            })()
        return () => { mounted = false }
    }, [notificationId])

    if (loading) {
        return (
            <div className="text-center py-12">Loading...</div>
        )
    }

    if (error || !notification) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Notification Not Found</h2>
                <p className="text-gray-600 mb-4">{error || "The notification you're looking for doesn't exist or has been removed."}</p>
                <Button onClick={() => router.push(`${pathname?.startsWith('/mot') ? '/mot' : '/admin'}/notifications/sent`)} className="bg-blue-500/90 text-white hover:bg-blue-600 shadow-md">
                    Back to Sent Notifications
                </Button>
            </div>
        )
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "warning":
                return <AlertTriangle className="h-6 w-6 text-yellow-600" />
            case "success":
                return <CheckCircle className="h-6 w-6 text-green-600" />
            default:
                return <Info className="h-6 w-6 text-blue-600" />
        }
    }

    const getNotificationBadge = (type: string) => {
        switch (type) {
            case "warning":
                return "bg-yellow-100 text-yellow-800"
            case "success":
                return "bg-green-100 text-green-800"
            case "info":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const sentTime = notification?.createdAt || ''

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" asChild className="bg-gray-500/20 text-gray-600 hover:bg-gray-500/30 shadow-md">
                        <Link href={`${pathname?.startsWith('/mot') ? '/mot' : '/admin'}/notifications/sent`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Sent Notifications
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Notification Detail Card */}
            <Card className="shadow-lg">
                <CardContent className="p-8 bg-gradient-to-br from-white to-gray-50/30">
                    {/* Title and Icon */}
                    <div className="flex items-start space-x-4 mb-6">
                        <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.messageType)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{notification.title}</h1>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Badge className={getNotificationBadge(notification.messageType)}>
                                            {notification.messageType.charAt(0).toUpperCase() + notification.messageType.slice(1)}
                                        </Badge>
                                        {notification.targetAudience && (
                                            <Badge variant="outline" className="shadow-sm">
                                                {notification.targetAudience}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="shadow-sm">
                                            {notification.subject}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Message</h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-gray-700 leading-relaxed mb-4">
                                {notification.body}
                            </p>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Date & Time</p>
                                        <p className="text-sm text-gray-600">{sentTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                                    <Clock className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Sent At</p>
                                        <p className="text-sm text-gray-600">{sentTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
