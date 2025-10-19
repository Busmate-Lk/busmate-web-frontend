"use client"
import { useState } from "react";
import { Sidebar } from "@/components/operator/sidebar";
import { usePathname } from "next/navigation";

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 64 : 256; // px
  const pathname = usePathname();

  // Map the current pathname to the corresponding active item
  const activeItem = (() => {
    if (pathname.startsWith("/operator/dashboard")) return "dashboard";
    if (pathname.startsWith("/operator/notifications")) return "notifications";
    if (pathname.startsWith("/operator/fleet-management")) return "fleetmanagement";
    if (pathname.startsWith("/operator/trips")) return "trips";
    if (pathname.startsWith("/operator/busTracking")) return "busTracking";
    if (pathname.startsWith("/operator/staffManagement")) return "staff";
    if (pathname.startsWith("/operator/addstaff")) return "staff";
    if (pathname.startsWith("/operator/staff-assignment")) return "staff-assignment";
    if (pathname.startsWith("/operator/passenger-service-permits")) return "passenger-service-permits";
    if (pathname.startsWith("/operator/revenueManagement")) return "revenue";
    if (pathname.startsWith("/operator/busSeatView")) return "busTracking";
    if (pathname.startsWith("/operator/busLocation")) return "busTracking";
    return undefined;
  })();

  return (
    <div>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} activeItem={activeItem} />
      <div
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s",
        }}
        className="min-h-screen bg-gray-50"
      >
        {children}
      </div>
    </div>
  );
}