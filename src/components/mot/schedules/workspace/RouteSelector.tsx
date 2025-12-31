'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteManagementService } from '@/lib/api-client/route-management';
import { RouteResponse } from '@/lib/api-client/route-management/models/RouteResponse';
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react';

export default function RouteSelector() {
  const router = useRouter();
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load routes on mount
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        const response = await RouteManagementService.getAllRoutesAsList();
        setRoutes(response || []);
        setFilteredRoutes(response || []);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch routes:', err);
        setError(err.message || 'Failed to load routes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // Filter routes based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRoutes(routes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = routes.filter(route => 
      route.name?.toLowerCase().includes(query) ||
      route.routeNumber?.toLowerCase().includes(query) ||
      route.routeGroupName?.toLowerCase().includes(query) ||
      route.description?.toLowerCase().includes(query)
    );
    setFilteredRoutes(filtered);
  }, [searchQuery, routes]);

  const handleRouteSelect = (route: RouteResponse) => {
    if (route.id) {
      router.push(`/mot/schedules/workspace?routeId=${route.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading routes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-600 mb-4">Failed to load routes</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-2">Select a Route</h2>
        <p className="text-gray-600 mb-6">
          Choose a route to create or manage schedules. Schedules define when buses operate on a specific route.
        </p>

        {/* Search input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search routes by name, number, or route group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Routes list */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredRoutes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No routes match your search' : 'No routes available'}
            </div>
          ) : (
            filteredRoutes.map((route) => (
              <button
                key={route.id}
                onClick={() => handleRouteSelect(route)}
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-700">
                        {route.name}
                        {route.routeNumber && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            #{route.routeNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {route.routeGroupName && (
                          <span className="mr-3">{route.routeGroupName}</span>
                        )}
                        {route.direction && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            {route.direction}
                          </span>
                        )}
                        {route.distanceKm && (
                          <span className="ml-2 text-gray-400">
                            {route.distanceKm.toFixed(1)} km
                          </span>
                        )}
                        {route.estimatedDurationMinutes && (
                          <span className="ml-2 text-gray-400">
                            ~{route.estimatedDurationMinutes} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500" />
              </button>
            ))
          )}
        </div>

        {/* Summary */}
        {routes.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            {filteredRoutes.length} of {routes.length} routes shown
          </div>
        )}
      </div>
    </div>
  );
}
