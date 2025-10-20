'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Wrench, AlertCircle, RefreshCw, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { Header } from '@/components/operator/header';
import { OperatorBusSummary, OperatorBusTabsSection } from '@/components/operator/fleet';
import {
  BusOperatorOperationsService,
  BusResponse,
  TripResponse
} from '@/lib/api-client/route-management';
import { useAuth } from '@/context/AuthContext';

export default function OperatorBusDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const busId = params.busId as string;
  const operatorId = user?.id || '11111111-1111-1111-1111-111111111112';

  // State
  const [bus, setBus] = useState<BusResponse | null>(null);
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bus details
  const loadBusDetails = useCallback(async () => {
    if (!busId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use operator-specific service to get bus details
      const response = await BusOperatorOperationsService.getOperatorBuses(
        operatorId,
        0, // page
        100, // size - get more to search through
        'ntcRegistrationNumber', // sortBy
        'asc', // sortDir
        undefined, // status
        undefined // no text search
      );

      if (response.content && response.content.length > 0) {
        const busData = response.content.find(b => b.id === busId);
        if (busData) {
          setBus(busData);
        } else {
          setError('Bus not found or you do not have permission to view this bus.');
        }
      } else {
        setError('Bus not found or you do not have permission to view this bus.');
      }

    } catch (err) {
      console.error('Error loading bus details:', err);
      setError('Failed to load bus details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [busId, operatorId]);

  // Load bus trips - placeholder for now
  const loadBusTrips = useCallback(async () => {
    if (!busId) return;

    try {
      setTripsLoading(true);
      // TODO: Implement trip loading when trip service is available
      // For now, set empty array
      setTrips([]);
    } catch (err) {
      console.error('Error loading bus trips:', err);
    } finally {
      setTripsLoading(false);
    }
  }, [busId]);

  useEffect(() => {
    loadBusDetails();
    loadBusTrips();
  }, [loadBusDetails, loadBusTrips]);

  // Handlers
  const handleEdit = () => {
    router.push(`/operator/fleet-management/${busId}/edit`);
  };

  const handleScheduleMaintenance = () => {
    router.push(`/operator/fleet-management/${busId}/maintenance`);
  };

  const handleAssignDriver = () => {
    router.push(`/operator/fleet-management/${busId}/assign-driver`);
  };

  const handleViewLocation = () => {
    router.push(`/operator/busTracking?busId=${busId}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = async () => {
    await Promise.all([loadBusDetails(), loadBusTrips()]);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-6">
          <div className="mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  <div className="h-8 bg-gray-300 rounded w-64"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-24 h-10 bg-gray-300 rounded"></div>
                  <div className="w-32 h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !bus) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-6">
          <div className="max-w-md mx-auto text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Bus not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The bus you're looking for doesn't exist or there was an error loading the details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleBack}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
              <button
                onClick={() => router.push('/operator/fleet-management')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Fleet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6">
        <div className="mx-auto space-y-6">
          {/* Back Button */}
          <div className="mb-4">
            <Link
              href="/operator/fleet-management"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Fleet Management
            </Link>
          </div>

          {/* Header with Navigation and Actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={() => router.push('/operator/dashboard')}
                className="hover:text-blue-600 transition-colors"
              >
                Dashboard
              </button>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => router.push('/operator/fleet-management')}
                className="hover:text-blue-600 transition-colors"
              >
                Fleet Management
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">
                {bus.plateNumber || bus.ntcRegistrationNumber || 'Bus Details'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleViewLocation}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                View Location
              </button>
              <button
                onClick={handleAssignDriver}
                className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Assign Driver
              </button>
              <button
                onClick={handleScheduleMaintenance}
                className="flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <Wrench className="w-4 h-4" />
                Schedule Maintenance
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Bus
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-sm text-red-600 hover:text-red-800 underline mt-2"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bus Summary */}
          <OperatorBusSummary
            bus={bus}
            onEdit={handleEdit}
            onScheduleMaintenance={handleScheduleMaintenance}
            onAssignDriver={handleAssignDriver}
            onViewLocation={handleViewLocation}
          />

          {/* Tabs Section */}
          <OperatorBusTabsSection
            bus={bus}
            trips={trips}
            tripsLoading={tripsLoading}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </div>
  );
}
