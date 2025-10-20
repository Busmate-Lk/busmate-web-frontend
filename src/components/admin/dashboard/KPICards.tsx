'use client';

import React from 'react';
import {
  Bus,
  Users,
  Route,
  Shield,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { DashboardKPI } from '@/app/mot/(authenticated)/dashboard/data';

interface KPICardsProps {
  kpiData: DashboardKPI[];
  loading?: boolean;
}

const iconMap = {
  bus: Bus,
  users: Users,
  route: Route,
  shield: Shield,
  calendar: Calendar,
  activity: Activity
};

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    borderLeft: 'border-l-blue-500'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
    border: 'border-green-200',
    borderLeft: 'border-l-green-500'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-200',
    borderLeft: 'border-l-purple-500'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    text: 'text-orange-600',
    border: 'border-orange-200',
    borderLeft: 'border-l-orange-500'
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'bg-teal-100 text-teal-600',
    text: 'text-teal-600',
    border: 'border-teal-200',
    borderLeft: 'border-l-teal-500'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-indigo-100 text-indigo-600',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    borderLeft: 'border-l-indigo-500'
  }
};

export function KPICards({ kpiData, loading = false }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {kpiData.map((kpi, index) => {
        const IconComponent = iconMap[kpi.icon as keyof typeof iconMap];
        const colors = colorMap[kpi.color as keyof typeof colorMap];

        return (
          <div
            key={index}
            className={`rounded-xl border-2 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${colors.bg} ${colors.border}`}
          >
            <div className="flex items-center">
              <div className={`${colors.icon} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {kpi.value.toLocaleString()}
                </p>
                <div className="flex items-center">
                  {getTrendIcon(kpi.trend)}
                  <span className={`ml-1 text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                    {Math.abs(kpi.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}