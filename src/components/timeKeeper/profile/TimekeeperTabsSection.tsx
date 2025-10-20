'use client';

import { useState } from 'react';
import {
  FileText,
  MoreHorizontal,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Settings,
  Calendar,
  MapPin,
  Users,
  Activity,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface TimekeeperResponse {
  id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  assign_stand: string;
  nic: string;
  province: string;
  user_id?: string;
  createdAt?: string;
}
interface TabType {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface TimekeeperTabsSectionProps {
  timekeeper: TimekeeperResponse;
  onRefresh: () => Promise<void>;
  loading?: boolean;
}

export function TimekeeperTabsSection({
  timekeeper,
  onRefresh,
  loading = false,
}: TimekeeperTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('assignment');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tabs: TabType[] = [
    { id: 'assignment', label: 'Stand Assignment', icon: <MapPin className="w-4 h-4" /> },
    { id: 'records', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'shifts', label: 'Shifts & Logs', icon: <Clock className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="w-4 h-4" /> },
    { id: 'more', label: 'More', icon: <MoreHorizontal className="w-4 h-4" /> },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return undefined;
    const base = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status.toLowerCase()) {
      case 'active':
        return `${base} bg-green-100 text-green-800`;
      case 'inactive':
        return `${base} bg-gray-100 text-gray-800`;
      case 'pending':
        return `${base} bg-yellow-100 text-yellow-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const renderAssignmentTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Stand Assignment</h3>
          <p className="text-sm text-gray-600">Details and actions for this timekeeper's assigned stand.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            href={`/mot/users/timekeepers/${timekeeper.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit2 className="w-4 h-4" />
            Edit Timekeeper
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Assigned Stand</h4>
            <p className="text-sm text-gray-900 mt-1">{timekeeper.assign_stand || 'Unassigned'}</p>
            <p className="text-xs text-gray-500 mt-1">Stand can be reassigned from the edit screen.</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Location</h4>
            <p className="text-sm text-gray-900 mt-1">{timekeeper.province || 'N/A'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Contact</h4>
            <p className="text-sm text-gray-900 mt-1">{timekeeper.phonenumber || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">{timekeeper.email || 'N/A'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">NIC</h4>
            <p className="text-sm text-gray-900 mt-1">{timekeeper.nic || 'N/A'}</p>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Status</div>
              
            </div>
          
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaceholderTab = (
    title: string,
    description: string,
    icon: React.ReactNode,
    features: string[]
  ) => (
    <div className="space-y-4">
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="w-16 h-16 text-gray-300 mx-auto mb-4">{icon}</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="text-sm text-gray-500 space-y-1 max-w-md mx-auto">
          {features.map((f, i) => <p key={i}>• {f}</p>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-1 p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'assignment' && renderAssignmentTab()}

        {activeTab === 'records' && renderPlaceholderTab(
          'Documents',
          'Manage timekeeper documents (licenses, ID copies, certificates).',
          <FileText className="w-16 h-16" />,
          ['View uploaded documents', 'Upload new documents', 'Track expiry and renewals']
        )}

        {activeTab === 'shifts' && renderPlaceholderTab(
          'Shifts & Logs',
          'View shift logs, check-ins and attendance for this timekeeper.',
          <Clock className="w-16 h-16" />,
          ['Shift history', 'Check-in/out timestamps', 'Manual adjustments']
        )}

        {activeTab === 'analytics' && renderPlaceholderTab(
          'Analytics',
          'Basic operational insights for this timekeeper.',
          <Activity className="w-16 h-16" />,
          ['Attendance summaries', 'Stand uptime', 'Assigned shift performance']
        )}

        {activeTab === 'more' && renderPlaceholderTab(
          'More',
          'Additional administrative options.',
          <Settings className="w-16 h-16" />,
          ['Change status', 'Archive timekeeper', 'System notes']
        )}
      </div>
    </div>
  );
}