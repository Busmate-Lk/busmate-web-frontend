'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/operator/ui/card";
import { Button } from "@/components/operator/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ChartData } from "../../../app/operator/dashboard/data";
import { BarChart3, Download, RefreshCw } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  revenueData: ChartData;
  tripAnalyticsData: ChartData;
  fleetUtilizationData: ChartData;
  fuelConsumptionData: ChartData;
  onTimePerformanceData: ChartData;
}

export function DashboardCharts({
  revenueData,
  tripAnalyticsData,
  fleetUtilizationData,
  fuelConsumptionData,
  onTimePerformanceData
}: DashboardChartsProps) {

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Revenue Trends */}
      <Card className="lg:col-span-2 bg-white shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Revenue Trends</CardTitle>
            <p className="text-sm text-gray-600">Daily revenue performance</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Fleet Utilization */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Fleet Status</CardTitle>
          <p className="text-sm text-gray-600">Current fleet distribution</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={fleetUtilizationData} options={pieOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Trip Analytics */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Trip Analytics</CardTitle>
          <p className="text-sm text-gray-600">Weekly trip completion vs cancellation</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={tripAnalyticsData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* On-Time Performance */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">On-Time Performance</CardTitle>
          <p className="text-sm text-gray-600">Performance by route</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={onTimePerformanceData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  max: 100,
                  ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: function (value: any) {
                      return value + '%';
                    }
                  }
                }
              }
            }} />
          </div>
        </CardContent>
      </Card>

      {/* Fuel Consumption */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Fuel Efficiency</CardTitle>
          <p className="text-sm text-gray-600">Monthly fuel consumption trends</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={fuelConsumptionData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: function (value: any) {
                      return value + ' L/100km';
                    }
                  }
                }
              }
            }} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Analytics Actions */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Analytics Hub
          </CardTitle>
          <p className="text-sm text-gray-600">Quick access to detailed reports</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-blue-700 border-blue-200 hover:bg-blue-50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Detailed Revenue Report
            </Button>
            <Button variant="outline" className="w-full justify-start text-green-700 border-green-200 hover:bg-green-50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Fleet Performance Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start text-purple-700 border-purple-200 hover:bg-purple-50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Route Optimization
            </Button>
            <Button variant="outline" className="w-full justify-start text-orange-700 border-orange-200 hover:bg-orange-50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Fuel Efficiency Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}