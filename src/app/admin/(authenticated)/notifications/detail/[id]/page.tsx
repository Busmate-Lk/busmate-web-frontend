import { NotificationDetail } from "@/components/admin/notifications/notification-detail"

export default function NotificationDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="p-6">
            <NotificationDetail notificationId={params.id} />
        </div>
    )
}
