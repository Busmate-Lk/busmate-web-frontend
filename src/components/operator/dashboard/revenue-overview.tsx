'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/operator/ui/card";
import { Badge } from "@/components/operator/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Target
} from "lucide-react";
import { RevenueMetrics } from "../../../app/operator/dashboard/data";

interface RevenueOverviewProps {
  revenueMetrics: RevenueMetrics;
}

export function RevenueOverview({ revenueMetrics }: RevenueOverviewProps) {
  // Calculate percentage changes
  const dailyChange = ((revenueMetrics.today - revenueMetrics.yesterday) / revenueMetrics.yesterday) * 100;
  const weeklyChange = ((revenueMetrics.thisWeek - revenueMetrics.lastWeek) / revenueMetrics.lastWeek) * 100;
  const monthlyChange = ((revenueMetrics.thisMonth - revenueMetrics.lastMonth) / revenueMetrics.lastMonth) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return {
      value: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? TrendingUp : TrendingDown,
      bgColor: isPositive ? 'bg-green-100' : 'bg-red-100'
    };
  };

  const revenueCards = [
    {
      title: 'Today\'s Revenue',
      amount: revenueMetrics.today,
      change: formatChange(dailyChange),
      icon: DollarSign,
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'This Week',
      amount: revenueMetrics.thisWeek,
      change: formatChange(weeklyChange),
      icon: Calendar,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'This Month',
      amount: revenueMetrics.thisMonth,
      change: formatChange(monthlyChange),
      icon: Target,
      color: 'bg-purple-50 border-purple-200'
    }
  ];

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Revenue Overview</CardTitle>
        <p className="text-sm text-gray-600">Financial performance and earnings summary</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueCards.map((card, index) => {
              const IconComponent = card.icon;
              const ChangeIcon = card.change.icon;

              return (
                <div key={index} className={`p-4 rounded-lg border ${card.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className={`flex items-center space-x-1 ${card.change.color}`}>
                      <ChangeIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{card.change.value}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(card.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Metrics */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Revenue per Trip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Average Revenue per Trip</span>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(revenueMetrics.averagePerTrip)}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target per trip:</span>
                    <span className="font-medium">{formatCurrency(1500)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Performance:</span>
                    <Badge className={
                      revenueMetrics.averagePerTrip >= 1500
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }>
                      {revenueMetrics.averagePerTrip >= 1500 ? 'Above Target' : 'Below Target'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tickets Sold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Tickets Sold Today</span>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-purple-500" />
                    <span className="text-lg font-bold text-purple-600">
                      {revenueMetrics.ticketsSold.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily target:</span>
                    <span className="font-medium">2,000 tickets</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">
                      {((revenueMetrics.ticketsSold / 2000) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((revenueMetrics.ticketsSold / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Revenue Actions */}
          <div className="border-t pt-6">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50 cursor-pointer"
              >
                Revenue Report
              </Badge>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
              >
                Ticket Analysis
              </Badge>
              <Badge
                variant="outline"
                className="text-purple-600 border-purple-200 hover:bg-purple-50 cursor-pointer"
              >
                Route Profitability
              </Badge>
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-200 hover:bg-orange-50 cursor-pointer"
              >
                Expense Tracking
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}