'use client';

import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useMemo, useState, useCallback } from 'react';

// Sample route stops data for demonstration
const sampleRouteStops = [
  { id: 1, name: 'Embilipitiya', lat: 6.3431, lng: 80.8485, type: 'start' },
  { id: 2, name: 'Ratnapura', lat: 6.6828, lng: 80.4015, type: 'intermediate' },
  { id: 3, name: 'Kuruwita', lat: 6.7706, lng: 80.3653, type: 'intermediate' },
  { id: 4, name: 'Avissawella', lat: 6.9522, lng: 80.2097, type: 'intermediate' },
  { id: 5, name: 'Colombo', lat: 6.9271, lng: 79.8612, type: 'end' },
];

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

export default function RouteStopsMap() {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const center = useMemo(() => ({
    lat: 6.6355,
    lng: 80.1325,
  }), []);

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
      const directionsService = new google.maps.DirectionsService();
      
      const origin = { lat: sampleRouteStops[0].lat, lng: sampleRouteStops[0].lng };
      const destination = { lat: sampleRouteStops[sampleRouteStops.length - 1].lat, lng: sampleRouteStops[sampleRouteStops.length - 1].lng };
      const waypoints = sampleRouteStops.slice(1, -1).map(stop => ({
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
  }, []);

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
    <div className="col-span-2 flex flex-col rounded-md px-0 pt-0 bg-gray-100">
      {/* <span className="underline my-2 block">RouteStopsMap</span> */}
      {isLoading && <div className="text-sm text-gray-600 mb-2">Loading route...</div>}
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={9}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={directionsRendererOptions}
            />
          )}
          {sampleRouteStops.map((stop) => (
            <Marker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              title={stop.name}
              icon={getMarkerIcon(stop.type)}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
