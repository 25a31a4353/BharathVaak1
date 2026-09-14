import { GovStatus, GovDecision, LiveEnvironmentData } from '../types';

export const govApi = {
  // Check live connection to the Government Portal
  async getStatus(): Promise<GovStatus> {
    try {
      const res = await fetch('/api/gov/status');
      if (!res.ok) throw new Error('Status check failed');
      return await res.json();
    } catch (err: any) {
      return {
        connected: false,
        serverUrl: 'https://akashvani-production.up.railway.app',
        latencyMs: 999,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Fetch real-time environmental telemetry (weather, precipitation, AQI, forecast)
  async getEnvironment(lat = 16.8142, lon = 81.5283): Promise<LiveEnvironmentData | null> {
    try {
      const res = await fetch(`/api/gov/environment?lat=${lat}&lon=${lon}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // Fetch verified high-resolution live meteorological & air quality telemetry for user GPS
  async getLiveTelemetry(lat: number, lon: number): Promise<LiveEnvironmentData | null> {
    try {
      const res = await fetch(`/api/geo/live-telemetry?lat=${lat}&lon=${lon}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json : null;
    } catch (e) {
      console.warn('Telemetry fetch error:', e);
      return null;
    }
  },

  // Reverse geocode user coordinates into real administrative address and locality
  async reverseGeocode(lat: number, lon: number): Promise<{
    displayName: string;
    shortName: string;
    locality: string;
    city: string;
    district: string;
    state: string;
    country: string;
  } | null> {
    try {
      const res = await fetch(`/api/geo/reverse-geocode?lat=${lat}&lon=${lon}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json : null;
    } catch (e) {
      console.warn('Geocoding error:', e);
      return null;
    }
  },

  // Fetch verified OSRM emergency evacuation road route from Government Server
  async getEvacuationRoute(
    originLat = 16.8142,
    originLon = 81.5283,
    destLat = 16.8285,
    destLon = 81.5393
  ) {
    try {
      const res = await fetch(
        `/api/gov/evacuation-route?originLat=${originLat}&originLon=${originLon}&destinationLat=${destLat}&destinationLon=${destLon}`
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // Submit Citizen Incident / Hazard Report and receive instant Government Decision
  async reportIncident(payload: {
    title: string;
    category: string;
    ward: string;
    locationName?: string;
    landmark?: string;
    description: string;
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    citizenName?: string;
    citizenPhone?: string;
  }): Promise<{ success: boolean; case?: any; decision?: GovDecision; error?: string }> {
    try {
      const res = await fetch('/api/gov/report-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Submit High-Priority SOS Distress Beacon and receive instant Escape & Rescue Decision
  async sendSOSBeacon(payload: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    ward: string;
    locationName?: string;
    victimStatus?: string;
    medicalEmergency?: boolean;
  }): Promise<{ success: boolean; case?: any; decision?: GovDecision; error?: string }> {
    try {
      const res = await fetch('/api/gov/sos-beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Fetch government dashboard metrics & critical areas
  async getDashboard() {
    try {
      const res = await fetch('/api/gov/dashboard');
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // Fetch registered cases
  async getCases() {
    try {
      const res = await fetch('/api/gov/cases');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  // Fetch active Red Zone hazard areas declared on the government website
  async getRedZones(): Promise<import('../types').GovRedZoneCase[]> {
    try {
      const res = await fetch('/api/gov/red-zones');
      if (!res.ok) return [];
      const json = await res.json();
      return json.redZones || [];
    } catch {
      return [];
    }
  },
};
