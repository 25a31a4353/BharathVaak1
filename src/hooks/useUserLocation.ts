import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLocationState, LiveEnvironmentData } from '../types';
import { govApi } from '../services/govApi';

const DEFAULT_LOCATION: UserLocationState = {
  latitude: 16.8142,
  longitude: 81.5283,
  accuracyMeters: 15,
  altitudeMeters: null,
  heading: null,
  speed: null,
  displayName: 'Tadepalligudem, West Godavari, Andhra Pradesh',
  shortName: 'Tadepalligudem, AP',
  locality: 'Ward 8 - Jagannadhapuram',
  district: 'West Godavari',
  state: 'Andhra Pradesh',
  country: 'India',
  postcode: '534100',
  isLiveGps: false,
  status: 'idle',
  timestamp: Date.now(),
};

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<UserLocationState>(DEFAULT_LOCATION);
  const [telemetry, setTelemetry] = useState<LiveEnvironmentData | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Fetch telemetry for specific coordinates
  const fetchTelemetry = useCallback(async (lat: number, lon: number) => {
    setIsTelemetryLoading(true);
    try {
      const data = await govApi.getLiveTelemetry(lat, lon);
      if (data) {
        setTelemetry(data);
      }
    } catch (err) {
      console.warn('Live telemetry fetch error:', err);
    } finally {
      setIsTelemetryLoading(false);
    }
  }, []);

  // Handle position update from Geolocation API
  const handlePositionSuccess = useCallback(
    async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
      setLocationError(null);
      setIsLocating(false);

      // Trigger reverse geocoding
      let geoInfo = null;
      try {
        geoInfo = await govApi.reverseGeocode(latitude, longitude);
      } catch (e) {
        console.warn('Reverse geocode error:', e);
      }

      const shortName =
        geoInfo?.shortName ||
        (geoInfo?.locality ? `${geoInfo.locality}, ${geoInfo.district || 'AP'}` : `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`);

      const newLoc: UserLocationState = {
        latitude,
        longitude,
        accuracyMeters: Math.round(accuracy),
        altitudeMeters: altitude ? Math.round(altitude) : null,
        heading,
        speed,
        displayName: geoInfo?.displayName || `GPS (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
        shortName,
        locality: geoInfo?.locality || 'Current GPS Area',
        district: geoInfo?.district || 'District',
        state: geoInfo?.state || 'Andhra Pradesh',
        country: geoInfo?.country || 'India',
        postcode: (geoInfo as any)?.postcode || '',
        isLiveGps: true,
        status: 'granted',
        timestamp: Date.now(),
      };

      setUserLocation(newLoc);
      // Fetch telemetry for new coordinates
      fetchTelemetry(latitude, longitude);
    },
    [fetchTelemetry]
  );

  const handlePositionError = useCallback(
    (error: GeolocationPositionError) => {
      setIsLocating(false);
      let errMsg = 'Could not acquire GPS position.';
      if (error.code === error.PERMISSION_DENIED) {
        errMsg = 'Location permission was denied. Using regional emergency headquarters.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errMsg = 'GPS signal unavailable. Using regional default coordinates.';
      } else if (error.code === error.TIMEOUT) {
        errMsg = 'GPS acquisition timed out.';
      }
      setLocationError(errMsg);
      setUserLocation((prev) => ({
        ...prev,
        status: error.code === error.PERMISSION_DENIED ? 'denied' : 'error',
      }));

      // Still fetch telemetry for current fallback coordinates
      fetchTelemetry(userLocation.latitude, userLocation.longitude);
    },
    [fetchTelemetry, userLocation.latitude, userLocation.longitude]
  );

  // Request browser live GPS
  const requestLiveGps = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    setUserLocation((prev) => ({ ...prev, status: 'locating' }));

    navigator.geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });
  }, [handlePositionSuccess, handlePositionError]);

  // Set manual / predefined location
  const setPredefinedLocation = useCallback(
    async (label: string, lat: number, lon: number) => {
      // Clear live GPS watch if active
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      const newLoc: UserLocationState = {
        latitude: lat,
        longitude: lon,
        accuracyMeters: 50,
        altitudeMeters: null,
        heading: null,
        speed: null,
        displayName: `${label}, Andhra Pradesh`,
        shortName: label,
        locality: label.split(',')[0].trim(),
        district: label.split(',')[1]?.trim() || 'West Godavari',
        state: 'Andhra Pradesh',
        country: 'India',
        isLiveGps: false,
        status: 'granted',
        timestamp: Date.now(),
      };

      setUserLocation(newLoc);
      fetchTelemetry(lat, lon);
    },
    [fetchTelemetry]
  );

  // Initialize: attempt live GPS on mount
  useEffect(() => {
    requestLiveGps();

    // Set up continuous watch if supported
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          // Only update if moved more than minimal distance to avoid jitter
          const { latitude, longitude } = pos.coords;
          setUserLocation((prev) => {
            if (!prev.isLiveGps) return prev;
            return {
              ...prev,
              latitude,
              longitude,
              accuracyMeters: Math.round(pos.coords.accuracy),
              timestamp: Date.now(),
            };
          });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Periodic telemetry refresh every 45s
  useEffect(() => {
    const interval = setInterval(() => {
      if (userLocation.latitude && userLocation.longitude) {
        fetchTelemetry(userLocation.latitude, userLocation.longitude);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchTelemetry, userLocation.latitude, userLocation.longitude]);

  return {
    userLocation,
    telemetry,
    isLocating,
    isTelemetryLoading,
    locationError,
    requestLiveGps,
    setPredefinedLocation,
    refreshTelemetry: () => fetchTelemetry(userLocation.latitude, userLocation.longitude),
  };
}
