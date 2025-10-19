"use client"

import { Header } from "@/components/operator/header"
// Use a relative import to avoid any ts-path alias resolution issues in nested route segments
import { NotificationDetail } from "../../../../../components/operator/notifications/notification-detail"

export default function OperatorNotificationDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                pageTitle="Notification Detail"
                pageDescription="View notification details"
            />
            <NotificationDetail notificationId={params.id} />
        </div>
    )
}
