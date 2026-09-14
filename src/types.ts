export type Language = 'en' | 'te';

export type NavTab = 'home' | 'alerts' | 'sos' | 'map' | 'community';

export type AlertCategory = 'all' | 'critical' | 'weather' | 'nearby' | 'civil';

export interface AlertItem {
  id: string;
  category: ('critical' | 'weather' | 'nearby' | 'civil')[];
  severity: 'critical' | 'high' | 'advisory' | 'community';
  tagEn: string;
  tagTe: string;
  agency: string;
  agencyType: 'official' | 'community' | 'health';
  timeAgoEn: string;
  timeAgoTe: string;
  titleEn: string;
  titleTe: string;
  distanceEn: string;
  distanceTe: string;
  locationEn: string;
  locationTe: string;
  mandatoryActionEn?: string;
  mandatoryActionTe?: string;
  descriptionEn: string;
  descriptionTe: string;
  mapVector?: {
    vectorId: string;
    labelEn: string;
    labelTe: string;
    statusEn: string;
    statusTe: string;
    coordinates: [number, number];
  };
  protocol?: {
    shelterName: string;
    shelterAddress: string;
    capacityTotal: number;
    capacityOccupied: number;
    medicalOfficer: string;
    rationStatus: string;
    helplines: string[];
  };
  feederInfo?: {
    outageSectorsEn: string;
    outageSectorsTe: string;
    estRemainingEn: string;
    estRemainingTe: string;
  };
  healthInfo?: {
    chlorineEn: string;
    chlorineTe: string;
    phcStatusEn: string;
    phcStatusTe: string;
  };
  communityInfo?: {
    upvotes: number;
    verifiedLabelEn: string;
    verifiedLabelTe: string;
    isConfirmedByUser: boolean;
  };
}

export interface ShelterItem {
  id: string;
  nameEn: string;
  nameTe: string;
  addressEn: string;
  addressTe: string;
  capacityTotal: number;
  capacityOccupied: number;
  distance: string;
  medicalOfficer: string;
  phone: string;
  coordinates: { x: number; y: number };
  lat?: number;
  lon?: number;
  status: 'active' | 'nearing_capacity' | 'full';
}

export interface HazardReport {
  id: string;
  title: string;
  category: string;
  ward: string;
  description: string;
  imageUrl?: string;
  timestamp: string;
  upvotes: number;
  status: 'verified' | 'under_review' | 'resolved';
}

export interface GovStatus {
  connected: boolean;
  serverUrl: string;
  latencyMs: number;
  statusCode?: number;
  timestamp: string;
}

export interface GovDecision {
  decisionId: string;
  caseId?: string;
  timestamp: string;
  governmentStatus: string;
  decisionEngine?: string;
  severity: string;
  actionRequired: string;
  immediateEscapeGuidance?: string[];
  assignedShelter?: {
    name: string;
    distanceKm: number;
    travelTimeMinutes: number;
    capacityAvailable?: string;
  };
  safeHaven?: {
    name: string;
    routeDistanceKm: number;
    travelTimeMinutes: number;
    routeGeometry?: [number, number][];
  };
  evacuationRoute?: {
    coordinates: [number, number][];
    routeDistanceKm: number;
    travelTimeMinutes: number;
    distanceType?: string;
    source?: string;
    status?: string;
    note?: string;
  };
  dispatchUnits?: string[];
  emergencyBroadcast?: string;
  trackingUrl?: string;
  isRedZone?: boolean;
  redZoneStatus?: string;
  redZoneNotice?: string;
  portalCaseName?: string;
  portalCaseLocation?: string;
}

export interface GovRedZoneCase {
  id: string;
  title: string;
  location: string;
  hazardType: string;
  eventDate: string;
  description: string;
  createdAt: string;
}

export interface UserLocationState {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number | null;
  heading?: number | null;
  speed?: number | null;
  displayName: string;
  shortName: string;
  locality?: string;
  district?: string;
  state?: string;
  country?: string;
  postcode?: string;
  isLiveGps: boolean;
  status: 'idle' | 'locating' | 'granted' | 'denied' | 'error';
  timestamp: number;
}

export interface LiveEnvironmentData {
  temperatureC: number;
  feelsLikeC?: number;
  humidity?: number;
  precipitationMm: number;
  rainMm?: number;
  weatherCode: number;
  weatherConditionEn?: string;
  weatherConditionTe?: string;
  windSpeedKph?: number;
  windGustKph?: number;
  usAqi: number;
  aqiLevel?: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10?: number;
  observedAt: string;
  riskAssessment?: {
    score: number;
    level: 'Low' | 'Moderate' | 'High' | 'Critical';
    color: string;
    summaryEn: string;
    summaryTe: string;
  };
  forecast?: {
    date: string;
    temperatureMinC: number;
    temperatureMaxC: number;
    precipitationProbability: number;
    precipitationSumMm: number;
    windSpeedMaxKph: number;
    windGustMaxKph: number;
    weatherCode: number;
  }[];
  source?: string;
  status?: string;
}
