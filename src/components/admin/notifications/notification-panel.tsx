"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/admin/ui/button"
import { Input } from "@/components/admin/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select"
import { Card, CardContent } from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import { ArrowLeft, Search, Filter, Bell, AlertTriangle, Info, CheckCircle, Clock } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { listNotifications, type NotificationListItem } from "@/lib/services/notificationService"
import Link from "next/link"
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
  const pathname = usePathname()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterAudience, setFilterAudience] = useState("all")
  const [items, setItems] = useState<NotificationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          setLoading(true)
          const data = await listNotifications(50)
          if (mounted) setItems(data)
        } catch (e: any) {
          if (mounted) setError(e?.message || 'Failed to load notifications')
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => { mounted = false }
  }, [])

  const handleNotificationClick = (notificationId: string | number) => {
    const base = pathname?.startsWith("/mot") ? "/mot" : "/admin"
    router.push(`${base}/notifications/detail/${notificationId}`)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
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
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "success":
        return "bg-green-100 text-green-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getAudienceBadge = (audience?: string) => {
    switch ((audience || 'all').toLowerCase()) {
      case 'passengers':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'conductors':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200'
      case 'mot_officers':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'fleet_operators':
        return 'bg-purple-50 text-purple-700 border border-purple-200'
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  const getCardBorderColor = (type?: string) => {
    switch ((type || 'info').toLowerCase()) {
      case 'error':
      case 'critical':
        return 'border-l-red-400'
      case 'warning':
        return 'border-l-yellow-400'
      case 'success':
        return 'border-l-green-400'
      case 'maintenance':
        return 'border-l-purple-400'
      default:
        return 'border-l-blue-400'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filtered = useMemo(() => {
    const isMot = pathname?.startsWith("/mot")
    const isAdmin = pathname?.startsWith("/admin")

    return items
      // Apply MoT-specific visibility rules
      .filter(n => {
        if (isMot) {
          const senderOk = (n.senderRole || '').toLowerCase() === 'admin'
          const ta = (n.targetAudience || '').toLowerCase()
          // Only admin-sent intended to MoT or All (no generic 'mot' alias)
          const targetOk = ta === 'mot_officers' || ta === 'all'
          return senderOk && targetOk
        }
        if (isAdmin) {
          // In Admin received, do not show messages sent by admins (any admin),
          // and also hide messages sent by the current user id if available
          const isAdminSender = (n.senderRole || '').toLowerCase() === 'admin'
          const isMine = n.adminId && user?.id ? n.adminId === user.id : false
          return !isAdminSender && !isMine
        }
        return true
      })
      // Apply search and filters
      .filter(n => {
        const matchesSearch = !searchTerm
          || n.title.toLowerCase().includes(searchTerm.toLowerCase())
          || n.body.toLowerCase().includes(searchTerm.toLowerCase())

        const type = (n.messageType || 'info').toLowerCase()
        const matchesType = filterType === 'all' || type === filterType

        const audience = (n.targetAudience || 'all').toLowerCase()
        const matchesAudience = filterAudience === 'all' || audience === filterAudience

        return matchesSearch && matchesType && matchesAudience
      })
  }, [items, pathname, user?.id, searchTerm, filterType, filterAudience])

  return (
    <div>
      {/* Filters */}
      <Card className="mb-6 shadow-sm border border-gray-200">
        <CardContent className="p-6 bg-white rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterAudience} onValueChange={setFilterAudience}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filter by audience" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="passengers">Passengers</SelectItem>
                  <SelectItem value="conductors">Conductors</SelectItem>
                  <SelectItem value="mot_officers">MoT Officers</SelectItem>
                  <SelectItem value="fleet_operators">Fleet Operators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading && (
          <Card className="shadow-sm border border-gray-200"><CardContent className="p-6">Loading notifications...</CardContent></Card>
        )}
        {error && (
          <Card className="shadow-sm border border-gray-200"><CardContent className="p-6 text-red-600">{error}</CardContent></Card>
        )}
        {!loading && !error && filtered.length === 0 && (
          <Card className="shadow-sm border border-gray-200"><CardContent className="p-6">No notifications found.</CardContent></Card>
        )}
        {filtered.map((n) => (
          <Card
            key={n.notificationId}
            className={`cursor-pointer hover:shadow-md transition-all duration-200 shadow-sm border border-gray-200 border-l-4 ${getCardBorderColor(n.messageType)}`}
            onClick={() => handleNotificationClick(n.notificationId)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${(n.messageType || 'info').toLowerCase() === 'error' || (n.messageType || 'info').toLowerCase() === 'critical'
                      ? 'bg-red-100 text-red-600'
                      : (n.messageType || 'info').toLowerCase() === 'warning'
                        ? 'bg-yellow-100 text-yellow-600'
                        : (n.messageType || 'info').toLowerCase() === 'success'
                          ? 'bg-green-100 text-green-600'
                          : (n.messageType || 'info').toLowerCase() === 'maintenance'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-blue-100 text-blue-600'
                    }`}>
                    {getNotificationIcon((n.messageType || 'info'))}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-lg font-semibold text-gray-900`}>
                          {n.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3">{n.body}</p>
                      <div className="flex items-center space-x-3">
                        <Badge className={getNotificationBadge((n.messageType || 'info'))}>
                          {(n.messageType || 'info').charAt(0).toUpperCase() + (n.messageType || 'info').slice(1)}
                        </Badge>
                        <Badge className={getAudienceBadge(n.targetAudience)}>
                          {(n.targetAudience || 'All').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
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
                        className="hover:bg-gray-100"
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
      <div className="text-center mt-6">
        <Button variant="outline" className="bg-gray-500/20 text-gray-600 border-gray-200 hover:bg-gray-500/30 shadow-md">Load More Notifications</Button>
      </div>
    </div>
  )
}
