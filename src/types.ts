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
