'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/shared/layout';
// import { TimeKeeperLayout } from "@/components/timeKeeper/layout";
import { ScheduleStatsCards } from '@/components/timeKeeper/dashboard/schedule-stats-cards';
import { RealTimeClock } from '@/components/timeKeeper/dashboard/real-time-clock';
import { CalendarNavigator } from '@/components/timeKeeper/dashboard/calendar-navigator';
import { TodaysBusesTable } from '@/components/timeKeeper/dashboard/todays-buses-table';
import { TripManagementService } from '@/lib/api-client/route-management/services/TripManagementService';
import { TripResponse } from '@/lib/api-client/route-management';

export default function TimeKeeperDashboard() {
  const [todaysTrips, setTodaysTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = {
    activeSchedules: 156,
    onTimePerformance: 98.5,
    routesCovered: 42,
    busesAssigned: 89,
  };

  // Load today's trips
  const loadTodaysTrips = useCallback(async () => {
    try {
      setLoading(true);

      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      // Fetch trips for today
      const response = await TripManagementService.getAllTrips(
        0, // page
        100, // size - get more to show all today's trips
        'scheduledDepartureTime', // sortBy
        'asc', // sortDir - earliest first
        undefined, // search
        undefined, // status
        undefined, // routeId
        undefined, // operatorId
        undefined, // scheduleId
        undefined, // passengerServicePermitId
        undefined, // busId
        formattedDate, // fromDate - today
        formattedDate, // toDate - today
        undefined, // hasPsp
        true, // hasBus - only show trips with assigned buses
        undefined, // hasDriver
        undefined // hasConductor
      );

      setTodaysTrips(response.content || []);
    } catch (err) {
      console.error("Failed to load today's trips:", err);
      setTodaysTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodaysTrips();
  }, [loadTodaysTrips]);

  return (
    <Layout
      activeItem="dashboard"
      pageTitle="Dashboard"
      pageDescription="Overview of schedule management activities"
      role="timeKeeper"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <ScheduleStatsCards stats={stats} />

        {/* Time and Calendar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clock and Calendar Stack */}
          <div className="space-y-6">
            {/* Real-time Clock */}
            <RealTimeClock />

            {/* Calendar Navigator */}
            <CalendarNavigator />
          </div>

          {/* Today's Buses - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <TodaysBusesTable trips={todaysTrips} loading={loading} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
