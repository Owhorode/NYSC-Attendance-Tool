/**
 * @file hooks/useGeofence.js
 * Custom React hook for GPS-based geofence verification.
 * Delegates distance math to utils/geo.js.
 *
 * @example
 * const { isInside, distance, loading, error, verifyLocation } = useGeofence(
 *   GEOFENCE.TARGET.lat,
 *   GEOFENCE.TARGET.lng,
 *   GEOFENCE.MAX_DISTANCE_METERS,
 * );
 */

import { useState } from 'react';
import { calculateHaversineDistance } from '../utils/geo';

/**
 * @param {number} targetLat       - Venue latitude
 * @param {number} targetLng       - Venue longitude
 * @param {number} maxRadiusMeters - Allowed radius in metres
 */
const useGeofence = (targetLat, targetLng, maxRadiusMeters) => {
  const [isInside,   setIsInside]   = useState(false);
  const [distance,   setDistance]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  const verifyLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: currentLat, longitude: currentLng } = position.coords;

        setUserCoords({ lat: currentLat, lng: currentLng });

        const dist = calculateHaversineDistance(
          currentLat, currentLng,
          targetLat,  targetLng,
        );

        setDistance(Math.round(dist));
        setIsInside(dist <= maxRadiusMeters);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Unable to retrieve location.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout:            15_000,
        maximumAge:         0,
      },
    );
  };

  return { isInside, distance, loading, error, userCoords, verifyLocation };
};

export default useGeofence;