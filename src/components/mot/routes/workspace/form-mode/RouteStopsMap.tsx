'use client';

import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouteWorkspace } from '@/context/RouteWorkspace/useRouteWorkspace';

interface RouteStopsMapProps {
    onToggle: () => void;
    collapsed: boolean;
    routeIndex: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.375rem', // rounded-md
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

export default function RouteStopsMap({ onToggle, collapsed, routeIndex }: RouteStopsMapProps) {
  const { data } = useRouteWorkspace();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Get route stops from context
  const route = data.routeGroup.routes[routeIndex];
  const routeStops = route?.routeStops || [];

  // Filter stops with valid coordinates
  const validStops = useMemo(() => {
    return routeStops
      .filter(rs => 
        rs.stop?.location?.latitude && 
        rs.stop?.location?.longitude &&
        typeof rs.stop.location.latitude === 'number' &&
        typeof rs.stop.location.longitude === 'number'
      )
      .map((rs, index) => ({
        id: rs.stop.id || `stop-${index}`,
        name: rs.stop.name || 'Unnamed Stop',
        lat: rs.stop.location!.latitude!,
        lng: rs.stop.location!.longitude!,
        type: index === 0 ? 'start' : (index === routeStops.length - 1 ? 'end' : 'intermediate')
      }));
  }, [routeStops]);

  // Calculate center based on valid stops
  const center = useMemo(() => {
    if (validStops.length === 0) {
      return { lat: 6.9271, lng: 79.8612 }; // Default to Colombo
    }
    
    const avgLat = validStops.reduce((sum, stop) => sum + stop.lat, 0) / validStops.length;
    const avgLng = validStops.reduce((sum, stop) => sum + stop.lng, 0) / validStops.length;
    
    return { lat: avgLat, lng: avgLng };
  }, [validStops]);

  const getMarkerIcon = (type: string) => {
    const icons = {
      start: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      end: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      intermediate: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    };
    return icons[type as keyof typeof icons];
  };

  const fetchDirections = useCallback(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      // Need at least 2 valid stops to create a route
      if (validStops.length < 2) {
        setIsLoading(false);
        return;
      }

      const directionsService = new google.maps.DirectionsService();

      const origin = { lat: validStops[0].lat, lng: validStops[0].lng };
      const destination = { lat: validStops[validStops.length - 1].lat, lng: validStops[validStops.length - 1].lng };
      const waypoints = validStops.slice(1, -1).map(stop => ({
        location: { lat: stop.lat, lng: stop.lng },
        stopover: true,
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
          } else {
            console.error('Directions request failed:', status);
          }
          setIsLoading(false);
        }
      );
    }
  }, [validStops]);

  // Refetch directions when valid stops change
  useEffect(() => {
    if (!collapsed) {
      setIsLoading(true);
      fetchDirections();
    }
  }, [validStops, collapsed, fetchDirections]);

  const onMapLoad = useCallback(() => {
    fetchDirections();
  }, [fetchDirections]);

  const directionsRendererOptions = {
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#2563eb',
      strokeOpacity: 0.8,
      strokeWeight: 4,
    },
  };

  return (
    <div className={`flex flex-col rounded-md px-0 pt-2 bg-gray-100 ${collapsed ? 'w-12 overflow-hidden' : ''}`}>
      <div className={`flex ${collapsed ? 'flex-col items-center' : 'justify-between items-center'} mb-2 px-2`}>
        {collapsed ? (
          <div className="flex flex-col gap-12">
            <button onClick={onToggle} className="text-white text-sm rounded flex items-center justify-center mb-2">
              <img src="/icons/Sidebar-Collapse--Streamline-Iconoir.svg" className="w-5 h-5" alt="Expand" />
            </button>
            <span className="transform -rotate-90 origin-center whitespace-nowrap text-sm">RouteStopsMap</span>
          </div>
        ) : (
          <>
            <span className="underline">RouteStopsMap</span>
            <span>
              <button onClick={onToggle} className="ml-2 text-white text-sm rounded flex items-center justify-center">
                <img src="/icons/Sidebar-Collapse--Streamline-Iconoir.svg" className="w-5 h-5 rotate-180" alt="Collapse" />
              </button>
            </span>
          </>
        )}
      </div>
      {!collapsed && (
        <>
          {loadError && (
            <div className="text-sm text-red-600 mb-2 px-2">Error loading Google Maps</div>
          )}
          {!isLoaded && (
            <div className="text-sm text-gray-600 mb-2 px-2">Loading Google Maps...</div>
          )}
          {isLoaded && (
            <>
              {validStops.length === 0 && (
                <div className="text-sm text-gray-600 mb-2 px-2">No stops with valid coordinates to display.</div>
              )}
              {validStops.length === 1 && (
                <div className="text-sm text-gray-600 mb-2 px-2">Add at least one more stop with coordinates to show route.</div>
              )}
              {validStops.length >= 2 && isLoading && (
                <div className="text-sm text-gray-600 mb-2 px-2">Loading route...</div>
              )}
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={validStops.length === 0 ? 8 : 9}
                options={mapOptions}
                onLoad={onMapLoad}
              >
                {directions && validStops.length >= 2 && (
                  <DirectionsRenderer
                    directions={directions}
                    options={directionsRendererOptions}
                  />
                )}
                {validStops.map((stop) => (
                  <Marker
                    key={stop.id}
                    position={{ lat: stop.lat, lng: stop.lng }}
                    title={stop.name}
                    icon={getMarkerIcon(stop.type)}
                  />
                ))}
              </GoogleMap>
            </>
          )}
        </>
      )}
    </div>
  );
}
