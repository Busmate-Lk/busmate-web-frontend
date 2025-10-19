"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/admin/ui/button"
import { Badge } from "@/components/admin/ui/badge"
import { Bell, AlertTriangle, Info, CheckCircle, Clock, ArrowRight, AlertCircle, Wrench } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/admin/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { listNotifications, type NotificationListItem } from "@/lib/services/notificationService"
import { useAuth } from "@/context/AuthContext"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'critical' | 'maintenance'
  time: string
  read: boolean
}

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

export function NotificationDropdown() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch notifications from backend
  useEffect(() => {
    let mounted = true
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const data = await listNotifications(5) // Get latest 5 notifications
        if (mounted) {
          // Admin doesn't see their own messages or other admin-sent messages in received
          const filtered = data.filter(n => {
            const isAdminSender = (n.senderRole || '').toLowerCase() === 'admin'
            const isMine = n.adminId && user?.id ? n.adminId === user.id : false
            return !isAdminSender && !isMine
          })

          const mapped: Notification[] = filtered.map(n => ({
            id: n.notificationId,
            title: n.title,
            message: n.body,
            time: toRelativeTime(n.createdAt),
            type: (n.messageType || 'info') as any,
            read: false // We can track this locally or from backend if available
          }))

          setNotifications(mapped)
        }
      } catch (e) {
        console.error('Failed to load notifications:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (user && !isLoading) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => {
        mounted = false
        clearInterval(interval)
      }
    }
    return () => { mounted = false }
  }, [user, isLoading])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (notificationId: string) => {
    // Mark as read locally
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setIsOpen(false)
    router.push(`/admin/notifications/detail/${notificationId}`)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "maintenance":
        return <Wrench className="h-4 w-4 text-purple-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "success":
        return "bg-green-50 border-green-200"
      case "critical":
        return "bg-red-50 border-red-200"
      case "maintenance":
        return "bg-purple-50 border-purple-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full bg-gray-500/10 hover:bg-gray-500/20 shadow-md">
          <Bell className="h-4 w-4 text-slate-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-xs text-gray-400 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">We'll notify you when something important happens</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-slate-50 hover:bg-slate-25 transition-colors cursor-pointer ${!notification.read ? "bg-blue-25" : ""
                  }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getNotificationBg(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className={`text-sm font-medium line-clamp-1 ${!notification.read ? "text-slate-900" : "text-slate-700"}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{notification.time}</span>
                        </div>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-100">
          <Link href="/admin/notifications/received">
            <Button variant="ghost" className="w-full justify-between bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 shadow-md">
              View all notifications
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
