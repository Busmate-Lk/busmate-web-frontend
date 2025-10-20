'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/shared/layout';
import { TimekeeperControllerService } from '@/lib/api-client/user-management/services/TimekeeperControllerService';
import { BusStopManagementService } from '@/lib/api-client/route-management/services/BusStopManagementService';
import {
  Loader2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  IdCard,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// ---------------- Types ----------------
interface TimekeeperDetails {
  id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  assign_stand: string; // store stop ID
  nic: string;
  province: string;
  status?: string;
  createdAt?: string;
}

// ---------------- Page Component ----------------
export default function TimekeeperDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [timekeeper, setTimekeeper] = useState<TimekeeperDetails | null>(null);
  const [standName, setStandName] = useState<string>(''); // resolved stand name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    if (!id) return;

    const fetchTimekeeper = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch timekeeper details
        const response = await TimekeeperControllerService.getTimekeeperById(id as string);
        if (!response) throw new Error('Timekeeper not found');

        const normalized: TimekeeperDetails = {
          id: response.id ?? response.timekeeperId ?? response.userId ?? '',
          fullname: response.fullname ?? response.name ?? '',
          phonenumber: response.phonenumber ?? response.phone ?? '',
          email: response.email ?? '',
          assign_stand: response.assign_stand ?? response.assignStand ?? '',
          nic: response.nic ?? '',
          province: response.province ?? '',
          status: response.status ?? 'active',
        };

        setTimekeeper(normalized);

        // Fetch assigned stand name
        if (normalized.assign_stand) {
          try {
            const stop = await BusStopManagementService.getStopById(normalized.assign_stand);
            setStandName(stop.name || 'Unknown Stand');
          } catch (stopErr) {
            console.warn('Could not fetch stand name:', stopErr);
            setStandName('Unknown Stand');
          }
        }
      } catch (err) {
        console.error('Error fetching timekeeper:', err);
        setError('Failed to load timekeeper details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimekeeper();
  }, [id]);

  // ---------------- Loading State ----------------
  if (loading) {
    return (
      <Layout activeItem="timekeepers" pageTitle="Loading...">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          <p className="mt-3 text-gray-600 font-medium">Fetching timekeeper details...</p>
        </div>
      </Layout>
    );
  }

  // ---------------- Error State ----------------
  if (error || !timekeeper) {
    return (
      <Layout activeItem="timekeepers" pageTitle="Error">
        <div className="flex flex-col items-center justify-center py-16">
          <XCircle className="text-red-500 w-10 h-10 mb-2" />
          <p className="text-red-600 font-semibold">{error || 'Timekeeper not found.'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  // ---------------- Main UI ----------------
  return (
    <Layout
      activeItem="timekeepers"
      pageTitle={`Timekeeper - ${timekeeper.fullname}`}
      pageDescription="Detailed profile and assignment information"
      role="mot"
    >
      <div className="bg-white shadow-xl rounded-2xl p-8 space-y-8 border border-gray-100">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Timekeepers
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {timekeeper.fullname.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{timekeeper.fullname}</h2>
            <p className="text-gray-500">{timekeeper.email || 'No email provided'}</p>
            <p className="text-sm mt-2">
              Status:{' '}
              <span
                className={`font-medium ${
                  timekeeper.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {timekeeper.status === 'active' ? (
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                ) : (
                  <XCircle className="inline w-4 h-4 mr-1" />
                )}
                {timekeeper.status}
              </span>
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <Info label="Full Name" icon={<User />} value={timekeeper.fullname} />
          <Info label="Phone Number" icon={<Phone />} value={timekeeper.phonenumber} />
          <Info label="Email" icon={<Mail />} value={timekeeper.email} />
          <Info label="NIC" icon={<IdCard />} value={timekeeper.nic} />
          <Info label="Province" icon={<MapPin />} value={timekeeper.province} />
          <Info label="Assigned Stand" icon={<Building />} value={standName || 'Unknown'} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={() => router.push(`/mot/users/timekeepers/${timekeeper.id}/edit`)}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Edit Timekeeper
          </button>
        </div>
      </div>
    </Layout>
  );
}

// ---------------- Reusable Info Component ----------------
function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 text-indigo-500 mt-0.5">{icon}</div>
      <div>
        <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{label}</h4>
        <p className="text-gray-800 text-sm font-medium mt-0.5">
          {value || <span className="text-gray-400">—</span>}
        </p>
      </div>
    </div>
  );
}
