import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card"
import { Button } from "@/components/admin/ui/button"

const activities = [
  {
    type: "user",
    message: "New user registration",
    location: "Colombo",
    time: "2 minutes ago",
    color: "green",
  },
  {
    type: "bus",
    message: "Bus B-247 departed from Kandy",
    location: "Route 001",
    time: "5 minutes ago",
    color: "blue",
  },
  {
    type: "payment",
    message: "Payment processed successfully",
    location: "Rs 450",
    time: "8 minutes ago",
    color: "yellow",
  },
  {
    type: "alert",
    message: "System alert: High traffic detected",
    location: "Network",
    time: "12 minutes ago",
    color: "red",
  },
  {
    type: "route",
    message: "Route update completed",
    location: "Route 045",
    time: "15 minutes ago",
    color: "purple",
  },
  {
    type: "system",
    message: "Database backup completed",
    location: "System",
    time: "20 minutes ago",
    color: "green",
  },
]

export function ActivityFeed() {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Activity Feed</CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${activity.color === "green"
                  ? "bg-green-500"
                  : activity.color === "blue"
                    ? "bg-blue-500"
                    : activity.color === "yellow"
                      ? "bg-yellow-500"
                      : activity.color === "red"
                        ? "bg-red-500"
                        : "bg-purple-500"
                  }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">
                  {activity.location} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
