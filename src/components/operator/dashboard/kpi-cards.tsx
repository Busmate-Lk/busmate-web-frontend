'use client';

import { Card, CardContent } from "@/components/operator/ui/card";
import {
  Bus,
  DollarSign,
  Route,
  Clock,
  Fuel,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { OperatorKPI } from "../../../app/operator/dashboard/data";

interface KPICardsProps {
  kpis: OperatorKPI[];
}

const iconMap = {
  'bus': Bus,
  'dollar-sign': DollarSign,
  'route': Route,
  'clock': Clock,
  'fuel': Fuel,
  'wrench': Wrench,
};

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
    border: 'border-green-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-indigo-100 text-indigo-600',
    text: 'text-indigo-600',
    border: 'border-indigo-200'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    text: 'text-orange-600',
    border: 'border-orange-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
    border: 'border-red-200'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-600',
    border: 'border-yellow-200'
  },
};

export function KPICards({ kpis }: KPICardsProps) {
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
      {kpis.map((kpi, index) => {
        const IconComponent = iconMap[kpi.icon as keyof typeof iconMap];
        const colors = colorMap[kpi.color as keyof typeof colorMap];

        return (
          <div
            key={index}
            className={`${colors.bg} ${colors.border} rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
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
                  {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                </p>
                <div className="flex items-center">
                  {getTrendIcon(kpi.trend)}
                  <span className={`ml-1 text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                    {kpi.change}
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