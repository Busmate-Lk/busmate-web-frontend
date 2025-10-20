'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/operator/ui/card";
import { Badge } from "@/components/operator/ui/badge";
import { Button } from "@/components/operator/ui/button";
import {
  MapPin,
  Fuel,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pause,
  XCircle
} from "lucide-react";
import { BusStatus } from "../../../app/operator/dashboard/data";

interface LiveFleetStatusProps {
  buses: BusStatus[];
}

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    badge: 'bg-green-500',
    label: 'Active'
  },
  maintenance: {
    icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-800',
    badge: 'bg-yellow-500',
    label: 'Maintenance'
  },
  idle: {
    icon: Pause,
    color: 'bg-blue-100 text-blue-800',
    badge: 'bg-blue-500',
    label: 'Idle'
  },
  offline: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    badge: 'bg-red-500',
    label: 'Offline'
  }
};

export function LiveFleetStatus({ buses }: LiveFleetStatusProps) {
  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold text-gray-900">Live Fleet Status</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Real-time bus locations and status</p>
        </div>
        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 border-gray-300">
          View All Buses
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {buses.map((bus) => {
            const config = statusConfig[bus.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={bus.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {/* Status Indicator */}
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${config.badge}`}></div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{bus.registrationNumber}</span>
                    <span className="text-sm text-gray-600">{bus.route}</span>
                  </div>
                </div>

                {/* Bus Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
                  {/* Location */}
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{bus.location}</span>
                  </div>

                  {/* Fuel Level */}
                  <div className="flex items-center space-x-2">
                    <Fuel className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${bus.fuelLevel > 50
                              ? 'bg-green-500'
                              : bus.fuelLevel > 25
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          style={{ width: `${bus.fuelLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{bus.fuelLevel}%</span>
                    </div>
                  </div>

                  {/* Staff */}
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="text-sm text-gray-700 truncate">
                      {bus.driver && bus.conductor
                        ? `${bus.driver.split(' ')[0]} / ${bus.conductor.split(' ')[0]}`
                        : 'Not assigned'
                      }
                    </div>
                  </div>
                </div>

                {/* Status Badge and Last Update */}
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={config.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{bus.lastUpdate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}