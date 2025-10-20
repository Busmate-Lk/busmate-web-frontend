'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/operator/ui/card";
import { Badge } from "@/components/operator/ui/badge";
import { Button } from "@/components/operator/ui/button";
import {
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  ExternalLink,
  Bell
} from "lucide-react";
import { LiveAlert } from "../../../app/operator/dashboard/data";

interface LiveAlertsProps {
  alerts: LiveAlert[];
  onResolveAlert?: (alertId: string) => void;
}

const alertTypeConfig = {
  emergency: {
    icon: AlertTriangle,
    color: 'bg-red-50 border-red-200 text-red-700',
    badge: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600'
  },
  maintenance: {
    icon: AlertTriangle,
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    badge: 'bg-orange-100 text-orange-800',
    iconColor: 'text-orange-600'
  },
  traffic: {
    icon: Info,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  fuel: {
    icon: AlertTriangle,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  schedule: {
    icon: Info,
    color: 'bg-green-50 border-green-200 text-green-700',
    badge: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600'
  }
};

const priorityConfig = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200'
};

export function LiveAlerts({ alerts, onResolveAlert }: LiveAlertsProps) {
  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-600" />
            Live Alerts
            {activeAlerts.length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">
                {activeAlerts.length} Active
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Real-time system alerts and notifications</p>
        </div>
        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 border-gray-300">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No active alerts</p>
              <p className="text-sm text-gray-500">All systems are running normally</p>
            </div>
          ) : (
            <>
              {/* Active Alerts */}
              {activeAlerts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Active Alerts ({activeAlerts.length})
                  </h4>
                  {activeAlerts.map((alert) => {
                    const config = alertTypeConfig[alert.type];
                    const AlertIcon = config.icon;
                    const priorityClass = priorityConfig[alert.priority];

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${config.color} relative`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Alert Icon */}
                          <div className={`p-2 rounded-full bg-white shadow-sm`}>
                            <AlertIcon className={`h-5 w-5 ${config.iconColor}`} />
                          </div>

                          {/* Alert Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold text-gray-900">
                                {alert.title}
                              </h5>
                              <div className="flex items-center space-x-2">
                                <Badge className={priorityClass}>
                                  {alert.priority.toUpperCase()}
                                </Badge>
                                {onResolveAlert && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onResolveAlert(alert.id)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-3">
                              {alert.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                {alert.busId && (
                                  <span className="bg-white px-2 py-1 rounded border border-gray-300">
                                    Bus: {alert.busId}
                                  </span>
                                )}
                                <span>{formatTimeAgo(alert.timestamp)}</span>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 p-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Resolved Alerts */}
              {resolvedAlerts.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Recent Resolved ({resolvedAlerts.length})
                  </h4>
                  {resolvedAlerts.slice(0, 3).map((alert) => {
                    const config = alertTypeConfig[alert.type];
                    const AlertIcon = config.icon;

                    return (
                      <div
                        key={alert.id}
                        className="p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-75"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-1.5 rounded-full bg-green-100">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h6 className="text-sm font-medium text-gray-700">
                                {alert.title}
                              </h6>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(alert.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Alert Summary */}
        {alerts.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-red-600">
                  {activeAlerts.filter(a => a.priority === 'critical').length}
                </p>
                <p className="text-xs text-gray-600">Critical</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-600">
                  {activeAlerts.filter(a => a.priority === 'warning').length}
                </p>
                <p className="text-xs text-gray-600">Warning</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">
                  {activeAlerts.filter(a => a.priority === 'info').length}
                </p>
                <p className="text-xs text-gray-600">Info</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">
                  {resolvedAlerts.length}
                </p>
                <p className="text-xs text-gray-600">Resolved</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}