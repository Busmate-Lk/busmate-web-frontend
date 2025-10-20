"use client"

import { Bus, Users, BarChart3, Calendar, MapPin, Route, DollarSign, ChevronLeft, ChevronRight, FileText, Navigation, Bell, UserCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SidebarItem {
  icon: any
  label: string
  active: boolean
  href: string
}

interface SidebarProps {
  activeItem?: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ activeItem = "dashboard", isCollapsed, setIsCollapsed }: SidebarProps) {

  const sidebarItems: SidebarItem[] = [
    { icon: BarChart3, label: "Dashboard", active: activeItem === "dashboard", href: "/operator/dashboard" },
    { icon: FileText, label: "Service Permits", active: activeItem === "passenger-service-permits", href: "/operator/passenger-service-permits" },
    { icon: Bus, label: "Fleet management", active: activeItem === "fleetmanagement", href: "/operator/fleet-management" },
    { icon: Navigation, label: "Trip Management", active: activeItem === "trips", href: "/operator/trips" },
    { icon: MapPin, label: "Bus Tracking", active: activeItem === "busTracking", href: "/operator/busTracking" },
    { icon: Users, label: "Staff management", active: activeItem === "staff", href: "/operator/staffManagement" },
    { icon: UserCheck, label: "Staff Assignment", active: activeItem === "staff-assignment", href: "/operator/staff-assignment" },
    { icon: Bell, label: "Notifications", active: activeItem === "notifications", href: "/operator/notifications/received" },
    { icon: DollarSign, label: "Revenue Management", active: activeItem === "revenue", href: "/operator/revenueManagement" },
  ]

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-blue-800 text-white transition-all duration-300 ease-in-out flex flex-col h-screen fixed left-0 top-0 z-40`}>
      {/* Header Section */}
      <div className="p-4 border-b border-blue-500 h-20 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            {!isCollapsed && (
              <div className="bg-blue-800 rounded-lg flex-shrink-0">
                <Image
                  src="/Busmate Lk.svg"
                  alt="Busmate LK Logo"
                  width={24}
                  height={24}
                  className="w-12 h-12"
                />
              </div>
            )}
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">BUSMATE LK</h1>
                <p className="text-blue-200 text-sm">Operator Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-blue-500 rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3'} rounded-lg text-sm font-medium transition-all duration-200 group ${item.active
                ? "bg-white text-blue-600 shadow-sm"
                : "text-blue-100 hover:bg-blue-500 hover:text-white"
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${item.active ? 'text-blue-600' : ''}`} />
              {!isCollapsed && (
                <span className="truncate ml-3">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Profile Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-blue-200">admin@busmate.lk</p>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="p-4 border-t border-blue-500 flex justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">A</span>
          </div>
        </div>
      )}
    </div>
  )
}
