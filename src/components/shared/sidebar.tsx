'use client';

import {
  Bus,
  Users,
  BarChart3,
  Calendar,
  MapPin,
  Route,
  LayoutDashboard,
  FileText,
  Truck,
  MessageSquare,
  Navigation,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Menu,
  X,
  Clock,
  Settings,
  Pen,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface SidebarItem {
  icon: any;
  label: string;
  active: boolean;
  href: string;
}

interface SidebarProps {
  activeItem?: string;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  role?: string;
}

export function Sidebar({
  activeItem = 'dashboard',
  isCollapsed: externalIsCollapsed,
  setIsCollapsed: externalSetIsCollapsed,
  role,
}: SidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isCollapsed =
    externalIsCollapsed !== undefined
      ? externalIsCollapsed
      : internalIsCollapsed;
  const setIsCollapsed = externalSetIsCollapsed || setInternalIsCollapsed;

  const motSidebarItems: SidebarItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: activeItem === 'dashboard',
      href: '/mot/dashboard',
    },
    {
      icon: MapPin,
      label: 'Bus Stops',
      active: activeItem === 'bus-stops',
      href: '/mot/bus-stops',
    },
    {
      icon: Route,
      label: 'Routes Management',
      active: activeItem === 'routes',
      href: '/mot/routes',
    },
    {
      icon: Calendar,
      label: 'Schedule Management',
      active: activeItem === 'schedules',
      href: '/mot/schedules',
    },
    {
      icon: Bus,
      label: 'Trip Management',
      active: activeItem === 'trips',
      href: '/mot/trips',
    },
    {
      icon: Bus,
      label: 'Trip Assignment',
      active: activeItem === 'trip-assignment',
      href: '/mot/trip-assignment',
    },
    {
      icon: FileText,
      label: 'Operator Management',
      active: activeItem === 'operators',
      href: '/mot/users/operators',
    },
    {
      icon: Bus,
      label: 'Bus Management',
      active: activeItem === 'buses',
      href: '/mot/buses',
    },
    {
      icon: FileText,
      label: 'Permit Management',
      active: activeItem === 'passenger-service-permits',
      href: '/mot/passenger-service-permits',
    },
    {
      icon: Navigation,
      label: 'Location Tracking',
      active: activeItem === 'location-tracking',
      href: '/mot/location-tracking',
    },
    {
      icon: DollarSign,
      label: 'Fare Management',
      active: activeItem === 'bus-fare',
      href: '/mot/bus-fare',
    },
    {
      icon: FileText,
      label: 'Staff Management',
      active: activeItem === 'staff',
      href: '/mot/staff-management',
    },
    {
      icon: Bell,
      label: 'Notifications',
      active: activeItem === 'notifications',
      href: '/mot/notifications',
    },
    {
      icon: BarChart3,
      label: 'Insights & Analytics',
      active: activeItem === 'dataInsights',
      href: '/mot/insights-analytics',
    },
    {
      icon: FileText,
      label: 'Policy Update',
      active: activeItem === 'policy',
      href: '/mot/policy-update',
    },
  ];

  const timeKeeperSidebarItems: SidebarItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: activeItem === 'dashboard',
      href: '/timeKeeper/dashboard',
    },
    {
      icon: Calendar,
      label: 'Schedule Assignment',
      active: activeItem === 'schedule',
      href: '/timeKeeper/schedule',
    },
    // {
    //   icon: Clock,
    //   label: 'Time Tracking',
    //   active: activeItem === 'tracking',
    //   href: '/timeKeeper/time-tracking',
    // },
    // {
    //   icon: FileText,
    //   label: 'Reports',
    //   active: activeItem === 'reports',
    //   href: '/timeKeeper/reports',
    // },
    // {
    //   icon: BarChart3,
    //   label: 'Analytics',
    //   active: activeItem === 'analytics',
    //   href: '/timeKeeper/analytics',
    // },
    // {
    //   icon: Settings,
    //   label: 'Settings',
    //   active: activeItem === 'settings',
    //   href: '/timeKeeper/settings',
    // },
  ];

  let sidebarItems = null;
  switch (role) {
    case 'mot':
      sidebarItems = motSidebarItems;
      break;
    case 'timeKeeper':
      sidebarItems = timeKeeperSidebarItems;
      break;
    default:
      sidebarItems = motSidebarItems;
  }

  return (
    <div
      className={`${isCollapsed ? 'w-20' : 'w-68'
        } bg-blue-800 text-white transition-all duration-300 ease-in-out flex flex-col h-screen fixed left-0 top-0 z-40`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-blue-500 h-20 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div
            className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''
              }`}
          >
            {!isCollapsed && (
              <div className="bg-blue-800  rounded-lg flex-shrink-0">
                <Image
                  src="/Busmate Lk.svg"
                  alt="Busmate LK Logo"
                  width={24}
                  height={24}
                  className="w-16 h-16"
                />
              </div>
            )}
            {!isCollapsed && (
              <div className='w-full justify-center '>
                <h1 className="text-xl font-bold text-white">BUSMATE LK</h1>
                <p className="text-blue-200 text-sm">MoT Portal</p>
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
      <div
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3'
                } rounded-lg text-sm font-medium transition-all duration-200 group ${item.active
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${item.active ? 'text-blue-600' : ''
                  }`}
              />
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
    </div>
  );
}
