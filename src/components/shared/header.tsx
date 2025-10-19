"use client"

import { Bus, ChevronDown, Bell, User, LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { usePathname, useRouter } from "next/navigation"
import { listNotifications, type NotificationListItem } from "@/lib/services/notificationService"

interface HeaderProps {
  pageTitle?: string
  pageDescription?: string
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'info' | 'warning' | 'success' | 'error' | 'critical' | 'maintenance'
  redirectUrl?: string
  isRead: boolean
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

export function Header({ pageTitle, pageDescription }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

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
          // Filter based on role and map to our Notification interface
          const isMot = pathname?.startsWith("/mot")
          const isAdmin = pathname?.startsWith("/admin")

          let filtered = data
          if (isMot) {
            // MoT only sees admin-sent messages to mot or all
            filtered = data.filter(n => {
              const senderOk = (n.senderRole || '').toLowerCase() === 'admin'
              const ta = (n.targetAudience || '').toLowerCase()
              const targetOk = ta === 'mot_officers' || ta === 'all'
              return senderOk && targetOk
            })
          } else if (isAdmin) {
            // Admin doesn't see their own messages or admin-sent messages in received
            filtered = data.filter(n => {
              const isAdminSender = (n.senderRole || '').toLowerCase() === 'admin'
              const isMine = n.adminId && user?.id ? n.adminId === user.id : false
              return !isAdminSender && !isMine
            })
          }

          const mapped: Notification[] = filtered.map(n => ({
            id: n.notificationId,
            title: n.title,
            message: n.body,
            time: toRelativeTime(n.createdAt),
            type: (n.messageType || 'info') as any,
            redirectUrl: `${pathname?.startsWith('/mot') ? '/mot' : '/admin'}/notifications/detail/${n.notificationId}`,
            isRead: false // We can track this locally or from backend if available
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
      const interval = setInterval(fetchNotifications, 5000)
      return () => {
        mounted = false
        clearInterval(interval)
      }
    }
    return () => { mounted = false }
  }, [user, isLoading, pathname])

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close dropdowns on Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) {
      return "Good morning"
    } else if (hour < 17) {
      return "Good afternoon"
    } else {
      return "Good evening"
    }
  }

  const getUserDisplayName = () => {
    if (!user) return "User"

    // Extract first name from email or use email
    const emailName = user.email.split('@')[0]
    return emailName.charAt(0).toUpperCase() + emailName.slice(1)
  }

  const getUserInitials = () => {
    if (!user) return "U"

    const displayName = getUserDisplayName()
    const parts = displayName.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return displayName.substring(0, 2).toUpperCase()
  }

  const getRoleDisplayName = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'systemadmin':
      case 'system-admin':
        return 'System Administrator'
      case 'fleetoperator':
      case 'operator':
        return 'Fleet Operator'
      case 'timekeeper':
        return 'Timekeeper'
      case 'mot':
        return 'MOT Official'
      default:
        return role || 'User'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read locally
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    )

    // Navigate to detail page
    if (notification.redirectUrl) {
      router.push(notification.redirectUrl)
    }

    setIsNotificationOpen(false)
  }

  const handleViewAllNotifications = () => {
    const base = pathname?.startsWith('/mot') ? '/mot' : '/admin'
    router.push(`${base}/notifications/received`)
    setIsNotificationOpen(false)
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'critical': return '🚨'
      case 'maintenance': return '🔧'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-50/30'
      case 'warning': return 'border-yellow-500 bg-yellow-50/30'
      case 'critical': return 'border-red-500 bg-red-50/30'
      case 'maintenance': return 'border-purple-500 bg-purple-50/30'
      case 'error': return 'border-red-500 bg-red-50/30'
      default: return 'border-blue-500 bg-blue-50/30'
    }
  }

  const handleLogout = async () => {
    try {
      // Close dropdown first
      setIsDropdownOpen(false)

      // Use the logout function from AuthContext
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Show loading state if auth is still loading
  if (isLoading) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4 h-20 flex items-center sticky top-0 z-50">
        <div className="flex items-center justify-between w-full">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 h-20 flex items-center sticky top-0 z-50">
      <div className="flex items-center justify-between w-full">
        <div>
          {pageTitle ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              {pageDescription && <p className="text-sm text-slate-600 mt-0.5">{pageDescription}</p>}
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {getUserDisplayName()}!
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">Welcome back to BUSMATE LK Transportation Dashboard</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">

          {/* Toggle to switch between real API and mock data - for demo purposes */}
          {pageTitle === "MOT Admin Dashboard" && (
            <div className="flex items-center">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  // checked={useRealApi}
                  // onChange={(e) => setUseRealApi(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Use Real API</span>
              </label>
            </div>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen)
                setIsDropdownOpen(false) // Close other dropdown
              }}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>

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
                  <div className="py-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${notification.isRead
                          ? 'border-transparent bg-gray-50/50'
                          : getNotificationColor(notification.type)
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium line-clamp-1 ${notification.isRead ? 'text-gray-600' : 'text-gray-900'
                                }`}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                              )}
                            </div>
                            <p className={`text-xs mt-1 line-clamp-2 ${notification.isRead ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button
                      onClick={handleViewAllNotifications}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen)
                setIsNotificationOpen(false) // Close other dropdown
              }}
              aria-label="User menu"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">{getUserInitials()}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                <div className="text-xs text-slate-500">
                  {user ? getRoleDisplayName(user.user_role) : 'User'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{getUserInitials()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-500">{user?.email || "user@busmate.lk"}</p>
                    </div>
                  </div>
                </div>

                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                <button
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}