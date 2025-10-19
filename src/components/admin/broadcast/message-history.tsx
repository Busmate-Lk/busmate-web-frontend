"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/admin/ui/button"
import { Input } from "@/components/admin/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table"
import { Checkbox } from "@/components/admin/ui/checkbox"
import { Badge } from "@/components/admin/ui/badge"
import { Calendar, Search, Trash2, Send, Filter } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { listNotifications, deleteNotification as apiDeleteNotification, type NotificationListItem } from "@/lib/services/notificationService"
import { useAuth } from "@/context/AuthContext"

function formatDate(dt?: string) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleString()
}

export function MessageHistory() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [filterAudience, setFilterAudience] = useState("all")
  const [filterProvince, setFilterProvince] = useState("all")
  const [filterCity, setFilterCity] = useState("all")
  const [filterRoute, setFilterRoute] = useState("all")
  const [items, setItems] = useState<NotificationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          setLoading(true)
          const data = await listNotifications(100)
          if (mounted) setItems(data)
        } catch (e: any) {
          if (mounted) setError(e?.message || 'Failed to load sent notifications')
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => { mounted = false }
  }, [])

  const handleSendMessage = () => {
    const base = pathname?.startsWith('/mot') ? '/mot' : '/admin'
    router.push(`${base}/notifications/compose`)
  }

  const handleMessageClick = (messageId: string | number) => {
    const base = pathname?.startsWith('/mot') ? '/mot' : '/admin'
    router.push(`${base}/notifications/sent/${messageId}`)
  }

  const filtered = useMemo(() => {
    const mine = items.filter(m => !user?.id || !m.adminId ? true : m.adminId === user.id)
    return mine.filter(m => {
      const s = searchTerm.trim().toLowerCase()
      const matchesSearch = !s || m.title.toLowerCase().includes(s) || m.body.toLowerCase().includes(s)

      const type = (m.messageType || 'info').toLowerCase()
      const matchesType = filterType === 'all' || type === filterType

      const audience = (m.targetAudience || 'all').toLowerCase()
      const matchesAudience = filterAudience === 'all' || audience === filterAudience

      // Note: Location filters (province, city, route) would need to be added to NotificationListItem type
      // For now, we'll keep them in the UI but they won't filter unless backend provides these fields

      return matchesSearch && matchesType && matchesAudience
    })
  }, [items, searchTerm, user?.id, filterType, filterAudience])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return
    try {
      await apiDeleteNotification(id)
      setItems(prev => prev.filter(x => x.notificationId !== id))
    } catch (e: any) {
      alert(e?.message || 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 shadow-sm"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`shadow-sm ${showFilters ? "bg-blue-50" : ""}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
              <Select value={filterAudience} onValueChange={setFilterAudience}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="All Audiences" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="passengers">Passengers</SelectItem>
                  <SelectItem value="conductors">Conductors</SelectItem>
                  <SelectItem value="mot_officers">MoT Officers</SelectItem>
                  <SelectItem value="fleet_operators">Fleet Operators</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Province</label>
              <Select value={filterProvince} onValueChange={setFilterProvince}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="All Provinces" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="all">All Provinces</SelectItem>
                  <SelectItem value="Western">Western</SelectItem>
                  <SelectItem value="Central">Central</SelectItem>
                  <SelectItem value="Southern">Southern</SelectItem>
                  <SelectItem value="Northern">Northern</SelectItem>
                  <SelectItem value="Eastern">Eastern</SelectItem>
                  <SelectItem value="North Western">North Western</SelectItem>
                  <SelectItem value="North Central">North Central</SelectItem>
                  <SelectItem value="Uva">Uva</SelectItem>
                  <SelectItem value="Sabaragamuwa">Sabaragamuwa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="Colombo">Colombo</SelectItem>
                  <SelectItem value="Gampaha">Gampaha</SelectItem>
                  <SelectItem value="Kalutara">Kalutara</SelectItem>
                  <SelectItem value="Kandy">Kandy</SelectItem>
                  <SelectItem value="Galle">Galle</SelectItem>
                  <SelectItem value="Matara">Matara</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Route</label>
              <Select value={filterRoute} onValueChange={setFilterRoute}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="All Routes" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="all">All Routes</SelectItem>
                  <SelectItem value="001">Route 001</SelectItem>
                  <SelectItem value="138">Route 138</SelectItem>
                  <SelectItem value="177">Route 177</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4" />
            <div className="flex space-x-2">
              {/* <Button variant="outline" size="sm" onClick={handleSendMessage} className="shadow-sm">
                <Send className="h-4 w-4 mr-2" />
                Compose
              </Button> */}
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
            )}
            {error && !loading && (
              <TableRow><TableCell colSpan={5} className="text-red-600">{error}</TableCell></TableRow>
            )}
            {!loading && !error && filtered.length === 0 && (
              <TableRow><TableCell colSpan={5}>No sent notifications</TableCell></TableRow>
            )}
            {!loading && !error && filtered.map((m) => (
              <TableRow
                key={m.notificationId}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleMessageClick(m.notificationId)}
              >
                <TableCell className="font-medium">{formatDate(m.createdAt)}</TableCell>
                <TableCell>
                  <div className="font-semibold text-gray-900">{m.title}</div>
                </TableCell>
                <TableCell>
                  <Badge className={
                    (m.messageType === 'critical' && 'bg-red-100 text-red-800') ||
                    (m.messageType === 'warning' && 'bg-yellow-100 text-yellow-800') ||
                    (m.messageType === 'info' && 'bg-blue-100 text-blue-800') ||
                    'bg-gray-100 text-gray-800'}>
                    {m.messageType || 'info'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{m.targetAudience || 'all'}</Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(m.notificationId)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-b-lg flex items-center justify-between">
          <p className="text-sm text-gray-600 font-medium">Showing {filtered.length} result(s)</p>
          <div className="flex items-center space-x-2">
            {/* Pagination can be added when backend supports it */}
          </div>
        </div>
      </div>
    </div>
  )
}
