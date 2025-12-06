'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { Layout } from '@/components/shared/layout';
import BusStopForm from '@/components/mot/bus-stops/bus-stop-form';
import { StopResponse } from '@/lib/api-client/route-management';

interface EditBusStopPageProps {
  params: { busStopId: string };
}

export default function EditBusStopPage({ params }: EditBusStopPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for resolved params
  const [busStopId, setBusStopId] = useState<string>('');
  
  // Resolve params asynchronously
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.busStopId || searchParams.get('id') || '';
      setBusStopId(id);
    };
    
    resolveParams();
  }, [params, searchParams]);

  const handleSuccess = (busStop: StopResponse) => {
    // Redirect to the bus stop details page
    router.push(`/mot/bus-stops/${busStop.id}`);
  };

  const handleCancel = () => {
    // Go back to details page or list page
    if (busStopId) {
      router.push(`/mot/bus-stops/${busStopId}`);
    } else {
      router.push('/mot/bus-stops');
    }
  };

  if (!busStopId) {
    return (
      <Layout
        activeItem="bus-stops"
        pageTitle="Edit Bus Stop"
        pageDescription="Edit bus stop information"
        role="mot"
      >
        <div className="mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-800">Invalid Bus Stop ID</h3>
              <p className="text-red-700 mt-1">
                No bus stop ID provided. Please go back and select a bus stop to edit.
              </p>
              <button
                onClick={() => router.push('/mot/bus-stops')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Bus Stops
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      activeItem="bus-stops"
      pageTitle="Edit Bus Stop"
      pageDescription="Update the bus stop information, location, and accessibility details"
      role="mot"
    >
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start gap-4">
          <button
            onClick={() => router.push(`/mot/bus-stops/${busStopId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Details
          </button>
          {/* <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Edit className="w-6 h-6 mr-2" />
              Edit Bus Stop
            </h1>
            <p className="text-gray-600 mt-1">
              Update the bus stop information, location, and accessibility details.
            </p>
          </div> */}
        </div>

        {/* Form */}
        <BusStopForm
          busStopId={busStopId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}