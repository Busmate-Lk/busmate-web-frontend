"use client"

import { SentNotificationDetail } from "@/components/admin/notifications/sent-notification-detail"
import { use } from "react"

export default function SentNotificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    return (
        <div>
            <SentNotificationDetail notificationId={resolvedParams.id} />
        </div>
    )
}
