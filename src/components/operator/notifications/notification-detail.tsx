"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/admin/ui/badge"
import { ArrowLeft, Clock, AlertTriangle, Info, CheckCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getNotificationDetails, type NotificationDetails } from "@/lib/services/notificationService"

interface NotificationDetailProps {
    notificationId: string
}

export function NotificationDetail({ notificationId }: NotificationDetailProps) {
    const router = useRouter()
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
            <div className="p-6 text-center py-12">Loading...</div>
        )
    }

    if (error || !notification) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Notification Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || "The notification you're looking for doesn't exist or has been removed."}</p>
                    <Link
                        href="/operator/notifications/received"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Notifications
                    </Link>
                </div>
            </div>
        )
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "error":
            case "critical":
                return <AlertTriangle className="h-6 w-6 text-red-600" />
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
            case "error":
            case "critical":
                return "bg-red-100 text-red-800"
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
        <div className="p-6 max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href="/operator/notifications/received"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Notifications
                </Link>
            </div>

            {/* Notification Detail Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
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
                                            <Badge variant="outline" className="border-gray-300">
                                                {notification.targetAudience}
                                            </Badge>
                                        )}
                                        {notification.subject && (
                                            <Badge variant="outline" className="border-gray-300">
                                                {notification.subject}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Message</h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-700 leading-relaxed">
                                {notification.body}
                            </p>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <Calendar className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Date & Time</p>
                                    <p className="text-sm text-gray-600">{sentTime}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <Clock className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Received</p>
                                    <p className="text-sm text-gray-600">{sentTime}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
