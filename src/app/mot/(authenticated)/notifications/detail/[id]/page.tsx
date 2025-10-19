import { NavigationBreadcrumb } from "@/components/admin/shared"
import { NotificationDetail } from "@/components/admin/notifications/notification-detail"

export default function NotificationDetailPage({ params }: { params: { id: string } }) {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/mot" },
        { label: "Notification Center", href: "/mot/notifications" },
        { label: "Received Notifications", href: "/mot/notifications/received" },
        { label: "Notification Details" },
    ]

    return (
        <div className="p-6">
            {/* <NavigationBreadcrumb items={breadcrumbItems} /> */}
            <NotificationDetail notificationId={params.id} />
        </div>
    )
}
