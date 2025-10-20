'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/operator/ui/card";
import { Badge } from "@/components/operator/ui/badge";
import {
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { TripSummary } from "../../../app/operator/dashboard/data";

interface TripAnalyticsProps {
  tripSummary: TripSummary;
}

export function TripAnalytics({ tripSummary }: TripAnalyticsProps) {
  const completionRate = (tripSummary.completedTrips / tripSummary.totalTrips) * 100;
  const cancellationRate = (tripSummary.cancelledTrips / tripSummary.totalTrips) * 100;

  const stats = [
    {
      label: 'Total Trips',
      value: tripSummary.totalTrips,
      icon: BarChart3,
      color: 'text-blue-600 bg-blue-100',
      trend: null
    },
    {
      label: 'Completed',
      value: tripSummary.completedTrips,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
      trend: `${completionRate.toFixed(1)}%`
    },
    {
      label: 'Active',
      value: tripSummary.activeTrips,
      icon: Circle,
      color: 'text-orange-600 bg-orange-100',
      trend: 'ongoing'
    },
    {
      label: 'Cancelled',
      value: tripSummary.cancelledTrips,
      icon: XCircle,
      color: 'text-red-600 bg-red-100',
      trend: `${cancellationRate.toFixed(1)}%`
    }
  ];

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Trip Analytics</CardTitle>
        <p className="text-sm text-gray-600">Today's trip performance overview</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trip Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.color} mb-3`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  {stat.trend && (
                    <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Performance Metrics */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* On-Time Performance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">On-Time Performance</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">
                      {tripSummary.onTimePerformance.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${tripSummary.onTimePerformance}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Target: 85%</span>
                  <span>
                    {tripSummary.onTimePerformance >= 85 ? 'Above Target' : 'Below Target'}
                  </span>
                </div>
              </div>

              {/* Average Delay */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Average Delay</span>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600">
                      {tripSummary.averageDelay.toFixed(1)} min
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${tripSummary.averageDelay <= 5
                        ? 'bg-green-500'
                        : tripSummary.averageDelay <= 10
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min((tripSummary.averageDelay / 20) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Target: &lt; 5 min</span>
                  <span>
                    {tripSummary.averageDelay <= 5
                      ? 'Within Target'
                      : tripSummary.averageDelay <= 10
                        ? 'Moderate'
                        : 'High Delay'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-6">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
              >
                View Trip Details
              </Badge>
              <Badge
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50 cursor-pointer"
              >
                Schedule New Trip
              </Badge>
              <Badge
                variant="outline"
                className="text-purple-600 border-purple-200 hover:bg-purple-50 cursor-pointer"
              >
                Route Analysis
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}