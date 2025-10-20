'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/operator/ui/card";
import { Badge } from "@/components/operator/ui/badge";
import { Button } from "@/components/operator/ui/button";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Wrench,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { MaintenanceAlert } from "../../../app/operator/dashboard/data";

interface MaintenanceAlertsProps {
  alerts: MaintenanceAlert[];
}

const alertTypeConfig = {
  urgent: {
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-700 border-red-200',
    badge: 'bg-red-100 text-red-800',
    priority: 'HIGH'
  },
  scheduled: {
    icon: Calendar,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    priority: 'SCHEDULED'
  },
  overdue: {
    icon: Clock,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    priority: 'OVERDUE'
  }
};

const priorityConfig = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

export function MaintenanceAlerts({ alerts }: MaintenanceAlertsProps) {
  const urgentAlerts = alerts.filter(alert => alert.type === 'urgent' || alert.type === 'overdue');
  const scheduledAlerts = alerts.filter(alert => alert.type === 'scheduled');

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Maintenance Alerts
            {urgentAlerts.length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">
                {urgentAlerts.length} Urgent
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Vehicle maintenance schedule and alerts</p>
        </div>
        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 border-gray-300">
          <Wrench className="h-4 w-4 mr-2" />
          Maintenance Log
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">All vehicles are up to date with maintenance</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const config = alertTypeConfig[alert.type];
              const AlertIcon = config.icon;
              const priorityClass = priorityConfig[alert.priority];

              // Calculate days until due
              const dueDate = new Date(alert.dueDate);
              const today = new Date();
              const diffTime = dueDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              const isOverdue = diffDays < 0;
              const isDueSoon = diffDays <= 7 && diffDays >= 0;

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${config.color} bg-white hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Alert Icon */}
                    <div className={`p-2 rounded-full ${config.badge}`}>
                      <AlertIcon className="h-5 w-5" />
                    </div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          Bus {alert.busId}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={priorityClass}>
                            {alert.priority.toUpperCase()}
                          </Badge>
                          <Badge className={config.badge}>
                            {config.priority}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">
                        {alert.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                          </div>
                          {isOverdue && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {Math.abs(diffDays)} days overdue
                            </Badge>
                          )}
                          {isDueSoon && !isOverdue && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              Due in {diffDays} day{diffDays !== 1 ? 's' : ''}
                            </Badge>
                          )}
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
            })
          )}
        </div>

        {/* Summary Footer */}
        {alerts.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {urgentAlerts.length}
                </p>
                <p className="text-xs text-gray-600">Urgent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {scheduledAlerts.length}
                </p>
                <p className="text-xs text-gray-600">Scheduled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">
                  {alerts.length}
                </p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}