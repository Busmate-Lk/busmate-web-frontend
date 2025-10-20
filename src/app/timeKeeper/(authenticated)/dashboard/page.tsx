'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/shared/layout';
// import { TimeKeeperLayout } from "@/components/timeKeeper/layout";
import { ScheduleStatsCards } from '@/components/timeKeeper/dashboard/schedule-stats-cards';
import { RealTimeClock } from '@/components/timeKeeper/dashboard/real-time-clock';
import { CalendarNavigator } from '@/components/timeKeeper/dashboard/calendar-navigator';
import { TodaysBusesTable } from '@/components/timeKeeper/dashboard/todays-buses-table';
import { TripManagementService } from '@/lib/api-client/route-management/services/TripManagementService';
import { BusStopManagementService } from '@/lib/api-client/route-management/services/BusStopManagementService';
import { TripResponse } from '@/lib/api-client/route-management';
import { getUserFromToken } from '@/lib/utils/jwtHandler';
import { getCookie } from '@/lib/utils/cookieUtils';
import { userManagementClient } from '@/lib/api/client';

export default function TimeKeeperDashboard() {
  const [todaysTrips, setTodaysTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedBusStopName, setAssignedBusStopName] =
    useState<string>('Loading...');

  const stats = {
    activeSchedules: 156,
    onTimePerformance: 98.5,
    routesCovered: 42,
    busesAssigned: 89,
  };

  // Load assigned bus stop
  useEffect(() => {
    const fetchAssignedBusStop = async () => {
      try {
        // Step 1: Get access token from cookies
        const accessToken = getCookie('access_token');

        if (!accessToken) {
          throw new Error('No access token found. Please log in again.');
        }

        // Step 2: Extract user ID from JWT token
        const userFromToken = getUserFromToken(accessToken);

        if (!userFromToken?.id) {
          throw new Error('Invalid access token. Please log in again.');
        }

        const extractedUserId = userFromToken.id;

        // Step 3: Fetch timekeeper profile to get assigned_stand
        const timekeeperResponse = await userManagementClient.get(
          `/api/timekeeper/profile/${extractedUserId}`
        );

        const timekeeperData = timekeeperResponse.data;

        // Extract assigned_stand from the response
        const assignedStandId = timekeeperData.assign_stand;
        if (!assignedStandId) {
          throw new Error('No bus stop assigned to this timekeeper');
        }

        // Step 4: Fetch bus stop details using the BusStopManagementService
        const busStop = await BusStopManagementService.getStopById(
          assignedStandId
        );
        setAssignedBusStopName(busStop.name || 'Unknown Stop');
      } catch (err: any) {
        console.error('Failed to load assigned bus stop:', err);
        setAssignedBusStopName('Unknown Stop');
      }
    };

    fetchAssignedBusStop();
  }, []);

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
      pageDescription={`Assigned Bus Stop: ${assignedBusStopName}`}
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
