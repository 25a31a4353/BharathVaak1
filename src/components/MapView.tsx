import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Language, ShelterItem, UserLocationState } from '../types';
import { SHELTERS_DATA } from '../data/mockData';
import { govApi } from '../services/govApi';

interface MapViewProps {
  language: Language;
  onOpenSOS: () => void;
  userLocation: UserLocationState;
  onRequestLiveGps?: () => void;
}

type MapLayer = 'all' | 'redzone' | 'flood' | 'shelters' | 'boats' | 'hazards' | 'evacuation';
type MapStyle = 'streets' | 'satellite' | 'tactical';

const TILE_PROVIDERS = {
  streets: {
    name: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  tactical: {
    name: 'Tactical',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
};

// Known critical hazard coordinates in Tadepalligudem disaster sector
const MOCK_HAZARDS = [
  {
    id: 'h1',
    title: 'Banyan Tree Fall Blockage',
    subtitle: 'Old Bus Stand Road near Sai Baba Temple Junction, Ward 4',
    status: 'Municipal woodcutters dispatched. Road completely impassable for four-wheelers.',
    lat: 16.8155,
    lon: 81.5310,
    category: 'tree',
    phone: '08818-223001',
  },
  {
    id: 'h2',
    title: 'Canal Bund Culvert Reinforcement',
    subtitle: 'Ward 12 Bund Road Crossing',
    status: 'High water overflow over culvert. Speed limit 20km/h; heavy vehicles diverted.',
    lat: 16.8080,
    lon: 81.5330,
    category: 'civil',
    phone: '1077',
  },
];

// SDRF Rescue Boat staging patrol coordinates
const RESCUE_BOATS = [
  {
    id: 'boat1',
    name: 'SDRF Boat Unit #1',
    subtitle: 'Inflatable Zodiac 40HP • 6 Rescue Divers',
    status: 'Patrolling Ward 8 Jagannadhapuram canal breach point. Evacuated 14 citizens.',
    lat: 16.8175,
    lon: 81.5245,
    phone: '08818-222108',
  },
  {
    id: 'boat2',
    name: 'NDRF Boat Unit #4',
    subtitle: 'Hard-Hull Rescue Craft • Medical Paramedic Onboard',
    status: 'Stationed near Pentapadu confluence. Providing emergency medical transport.',
    lat: 16.8115,
    lon: 81.5180,
    phone: '08818-222108',
  },
];

// Lowland Flood Inundation polygon coordinates (along Yerrakaluva basin)
const FLOOD_INUNDATION_POLYGON: [number, number][] = [
  [16.8060, 81.5160],
  [16.8140, 81.5210],
  [16.8210, 81.5270],
  [16.8250, 81.5340],
  [16.8190, 81.5360],
  [16.8120, 81.5280],
  [16.8050, 81.5200],
];

export const MapView: React.FC<MapViewProps> = ({
  language,
  onOpenSOS,
  userLocation,
  onRequestLiveGps,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayer>('all');
  const [mapStyle, setMapStyle] = useState<MapStyle>('tactical');
  const [isExpanded, setIsExpanded] = useState(false);
  const [govRoute, setGovRoute] = useState<any | null>(null);
  const [redZones, setRedZones] = useState<any[]>([]);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [showEvacModal, setShowEvacModal] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<{
    id: string;
    type: 'flood_vector' | 'shelter' | 'boat' | 'hazard' | 'evacuation';
    title: string;
    subtitle: string;
    status: string;
    phone?: string;
    actionLabel?: string;
    isGovRedZone?: boolean;
  } | null>({
    id: 'vec4',
    type: 'flood_vector',
    title: '🚨 OFFICIAL RED ZONE: Ward 8 - Jagannadhapuram',
    subtitle: 'Analyzed & Declared by Government DIVA Decision Engine',
    status: 'High inundation risk. Area designated as an active RED ZONE on Government Portal. Evacuation underway.',
    phone: '1077',
    actionLabel: 'Call DDMA Disaster Control',
    isGovRedZone: true,
  });

  // Fetch live route whenever user location updates
  useEffect(() => {
    fetchLiveRoute();
  }, [userLocation.latitude, userLocation.longitude]);

  // Poll registered red zones from government backend
  useEffect(() => {
    fetchRedZones();
    const interval = setInterval(fetchRedZones, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchRedZones = async () => {
    try {
      const rz = await govApi.getRedZones();
      if (rz && rz.length > 0) {
        setRedZones(rz);
      }
    } catch (e) {
      console.warn('Red zones fetch error:', e);
    }
  };

  const fetchLiveRoute = async () => {
    setIsRouteLoading(true);
    try {
      const data = await govApi.getEvacuationRoute(
        userLocation.latitude,
        userLocation.longitude,
        16.8285,
        81.5393
      );
      if (data) setGovRoute(data);
    } catch (e) {
      console.warn('Evacuation route fetch error:', e);
    } finally {
      setIsRouteLoading(false);
    }
  };

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.latitude, userLocation.longitude],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    const tile = L.tileLayer(TILE_PROVIDERS[mapStyle].url, {
      attribution: TILE_PROVIDERS[mapStyle].attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tile;

    const group = L.layerGroup().addTo(map);
    layersGroupRef.current = group;
    mapRef.current = map;

    // Trigger size adjustment once container is mounted
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      layersGroupRef.current = null;
    };
  }, []);

  // 2. Change Tile Provider when mapStyle changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_PROVIDERS[mapStyle].url);
  }, [mapStyle]);

  // 3. Trigger map resize when expanding/collapsing
  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 200);
  }, [isExpanded]);

  // 4. Render All Map Layers & Pins on Leaflet Canvas
  useEffect(() => {
    if (!mapRef.current || !layersGroupRef.current) return;
    const group = layersGroupRef.current;
    group.clearLayers();

    const shouldShow = (type: MapLayer) => activeLayer === 'all' || activeLayer === type;

    // --- A. FLOOD INUNDATION POLYGON ---
    if (shouldShow('flood')) {
      const floodPoly = L.polygon(FLOOD_INUNDATION_POLYGON, {
        color: '#0284c7',
        fillColor: '#0284c7',
        fillOpacity: 0.25,
        weight: 2,
        dashArray: '4, 4',
      });

      floodPoly.on('click', () => {
        setSelectedPoint({
          id: 'flood_basin',
          type: 'flood_vector',
          title: 'Yerrakaluva Inundation Zone',
          subtitle: 'Active Flood Water Spread Basin • Lowland Wards 8 & 9',
          status: 'Water level measured at 3.8 feet above warning threshold. Discharge from Dowleswaram barrage continuing.',
          phone: '1077',
          actionLabel: 'Call Flood Control (1077)',
        });
      });

      floodPoly.bindTooltip('🌊 Flood Inundation Zone (Yerrakaluva Basin)', {
        permanent: false,
        direction: 'center',
        className: 'bg-[#081534] text-white text-[11px] font-bold px-2 py-1 rounded shadow-md border-0',
      });

      group.addLayer(floodPoly);
    }

    // --- B. GOVERNMENT DECLARED RED ZONES ---
    if (shouldShow('redzone')) {
      // 1. Primary Ward 8 Red Zone
      const ward8Circle = L.circle([16.8142, 81.5283], {
        radius: 460,
        color: '#ba1a1a',
        fillColor: '#ba1a1a',
        fillOpacity: 0.28,
        weight: 2.5,
        dashArray: '6, 6',
      });

      ward8Circle.on('click', () => {
        setSelectedPoint({
          id: 'vec4',
          type: 'flood_vector',
          title: '🚨 OFFICIAL RED ZONE: Ward 8 - Jagannadhapuram',
          subtitle: 'Analyzed & Declared by Government DIVA Decision Engine',
          status: 'High inundation risk. Area designated as an active RED ZONE on Government Portal. Evacuation underway.',
          phone: '1077',
          actionLabel: 'Call DDMA Disaster Control',
          isGovRedZone: true,
        });
      });
      group.addLayer(ward8Circle);

      // Ward 8 Red Zone Label Icon
      const redZoneMarker = L.marker([16.8142, 81.5283], {
        icon: L.divIcon({
          className: 'rz-marker-icon',
          html: `
            <div class="cursor-pointer flex flex-col items-center">
              <div class="w-8 h-8 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                <span class="material-symbols-outlined text-[18px]">warning</span>
              </div>
              <div class="bg-[#ba1a1a] text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide whitespace-nowrap mt-1 border border-white/50">
                RED ZONE: W-8
              </div>
            </div>
          `,
          iconSize: [80, 48],
          iconAnchor: [40, 24],
        }),
      });

      redZoneMarker.on('click', () => {
        setSelectedPoint({
          id: 'vec4',
          type: 'flood_vector',
          title: '🚨 OFFICIAL RED ZONE: Ward 8 - Jagannadhapuram',
          subtitle: 'Analyzed & Declared by Government DIVA Decision Engine',
          status: 'High inundation risk. Area designated as an active RED ZONE on Government Portal. Evacuation underway.',
          phone: '1077',
          actionLabel: 'Call DDMA Disaster Control',
          isGovRedZone: true,
        });
      });
      group.addLayer(redZoneMarker);

      // 2. Dynamic Red Zones from backend
      redZones.forEach((rz, idx) => {
        if (!rz.latitude || !rz.longitude) return;
        const dynamicCircle = L.circle([rz.latitude, rz.longitude], {
          radius: rz.radiusMeters || 400,
          color: '#ba1a1a',
          fillColor: '#ba1a1a',
          fillOpacity: 0.25,
          weight: 2,
        });
        dynamicCircle.on('click', () => {
          setSelectedPoint({
            id: rz.caseId || `rz-${idx}`,
            type: 'flood_vector',
            title: `🚨 RED ZONE: ${rz.name || rz.ward}`,
            subtitle: `Declared on Govt Portal • Case ${rz.caseId}`,
            status: rz.actionRequired || 'Mandatory Evacuation in effect.',
            phone: '1077',
            actionLabel: 'Call Disaster Command',
            isGovRedZone: true,
          });
        });
        group.addLayer(dynamicCircle);
      });
    }

    // --- C. OSRM ESCAPE CORRIDOR POLYLINE ---
    if (shouldShow('evacuation')) {
      let routeCoords: [number, number][] = [];

      if (govRoute?.geometry && Array.isArray(govRoute.geometry) && govRoute.geometry.length > 0) {
        routeCoords = govRoute.geometry;
      } else {
        // Fallback road corridor from user location to ZP High School shelter
        routeCoords = [
          [userLocation.latitude, userLocation.longitude],
          [userLocation.latitude + 0.004, userLocation.longitude + 0.003],
          [16.8220, 81.5340],
          [16.8255, 81.5375],
          [16.8285, 81.5393],
        ];
      }

      // Route Casing (Dark outline for high contrast)
      const casing = L.polyline(routeCoords, {
        color: '#081534',
        weight: 8,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      });
      group.addLayer(casing);

      // Glowing Green Escape Line
      const routeLine = L.polyline(routeCoords, {
        color: '#22c55e',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '8, 8',
      });

      routeLine.on('click', () => {
        setSelectedPoint({
          id: 'gov_route',
          type: 'evacuation',
          title: 'Akashvani OSRM Evacuation Corridor',
          subtitle: `Verified Escape Route to ZP High School Shelter (${govRoute?.routeDistanceKm || 2.5} km)`,
          status: `Estimated Transit Time: ~${govRoute?.travelTimeMinutes || 5} mins. High-clearance police escort posted at crossings.`,
          phone: '1077',
          actionLabel: 'Call Disaster Command (1077)',
        });
      });

      routeLine.bindTooltip(`⚡ ESCAPE CORRIDOR: ${govRoute?.routeDistanceKm || 2.5} km (~${govRoute?.travelTimeMinutes || 5} min)`, {
        permanent: false,
        direction: 'top',
        className: 'bg-[#081534] text-[#86efac] text-[11px] font-bold px-2 py-1 rounded shadow-md border-0',
      });

      group.addLayer(routeLine);
    }

    // --- D. RELIEF SHELTERS ---
    if (shouldShow('shelters')) {
      SHELTERS_DATA.forEach((shelter) => {
        const lat = shelter.lat || 16.8285;
        const lon = shelter.lon || 81.5393;
        const occupancyPct = Math.round((shelter.capacityOccupied / shelter.capacityTotal) * 100);
        const isCrowded = occupancyPct > 80;

        const shelterMarker = L.marker([lat, lon], {
          icon: L.divIcon({
            className: 'shelter-marker-icon',
            html: `
              <div class="cursor-pointer flex flex-col items-center">
                <div class="w-8 h-8 rounded-full ${isCrowded ? 'bg-[#ea580c]' : 'bg-[#15803d]'} text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110">
                  <span class="material-symbols-outlined text-[18px]">shelter</span>
                </div>
                <div class="bg-[#081534] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap mt-1 border border-white/40">
                  ${shelter.capacityOccupied}/${shelter.capacityTotal} Beds
                </div>
              </div>
            `,
            iconSize: [70, 48],
            iconAnchor: [35, 24],
          }),
        });

        shelterMarker.on('click', () => {
          setSelectedPoint({
            id: shelter.id,
            type: 'shelter',
            title: language === 'en' ? shelter.nameEn : shelter.nameTe,
            subtitle: `${shelter.addressEn} • ${shelter.distance}`,
            status: `Capacity: ${shelter.capacityOccupied}/${shelter.capacityTotal} Beds • Medical In-charge: ${shelter.medicalOfficer}`,
            phone: shelter.phone,
            actionLabel: 'Call Shelter Officer',
          });
        });

        group.addLayer(shelterMarker);
      });
    }

    // --- E. SDRF RESCUE BOATS ---
    if (shouldShow('boats')) {
      RESCUE_BOATS.forEach((boat) => {
        const boatMarker = L.marker([boat.lat, boat.lon], {
          icon: L.divIcon({
            className: 'boat-marker-icon',
            html: `
              <div class="cursor-pointer flex flex-col items-center">
                <div class="w-8 h-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110">
                  <span class="material-symbols-outlined text-[18px]">directions_boat</span>
                </div>
                <div class="bg-[#081534] text-[#38bdf8] text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap mt-1 border border-white/40">
                  ${boat.name}
                </div>
              </div>
            `,
            iconSize: [80, 48],
            iconAnchor: [40, 24],
          }),
        });

        boatMarker.on('click', () => {
          setSelectedPoint({
            id: boat.id,
            type: 'boat',
            title: boat.name,
            subtitle: boat.subtitle,
            status: boat.status,
            phone: boat.phone,
            actionLabel: 'Radio Rescue Unit',
          });
        });

        group.addLayer(boatMarker);
      });
    }

    // --- F. CITIZEN HAZARDS ---
    if (shouldShow('hazards')) {
      MOCK_HAZARDS.forEach((hazard) => {
        const hazardMarker = L.marker([hazard.lat, hazard.lon], {
          icon: L.divIcon({
            className: 'hazard-marker-icon',
            html: `
              <div class="cursor-pointer flex flex-col items-center">
                <div class="w-7 h-7 rounded-full bg-[#d97706] text-white flex items-center justify-center shadow-md border-2 border-white">
                  <span class="material-symbols-outlined text-[16px]">report_problem</span>
                </div>
                <div class="bg-[#081534] text-[#fde68a] text-[8.5px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap mt-0.5">
                  ${hazard.category.toUpperCase()}
                </div>
              </div>
            `,
            iconSize: [60, 44],
            iconAnchor: [30, 22],
          }),
        });

        hazardMarker.on('click', () => {
          setSelectedPoint({
            id: hazard.id,
            type: 'hazard',
            title: hazard.title,
            subtitle: hazard.subtitle,
            status: hazard.status,
            phone: hazard.phone,
            actionLabel: 'Call Municipal Squad',
          });
        });

        group.addLayer(hazardMarker);
      });
    }

    // --- G. USER LIVE GPS POSITION PIN & ACCURACY RADIUS ---
    const userAccuracy = L.circle([userLocation.latitude, userLocation.longitude], {
      radius: userLocation.accuracyMeters || 50,
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.18,
      weight: 1.5,
      dashArray: '3, 3',
    });
    group.addLayer(userAccuracy);

    const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
      icon: L.divIcon({
        className: 'user-gps-icon',
        html: `
          <div class="cursor-pointer flex flex-col items-center">
            <div class="relative flex items-center justify-center">
              <span class="absolute w-8 h-8 rounded-full bg-[#0284c7]/40 animate-ping"></span>
              <div class="w-5 h-5 rounded-full bg-[#0284c7] border-2 border-white shadow-xl flex items-center justify-center text-white">
                <span class="w-2 h-2 rounded-full bg-white"></span>
              </div>
            </div>
            <div class="bg-[#081534] text-[#38bdf8] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap border border-white/50">
              ${userLocation.isLiveGps ? 'YOU (GPS LOCK)' : 'YOUR LOCATION'}
            </div>
          </div>
        `,
        iconSize: [90, 46],
        iconAnchor: [45, 23],
      }),
    });

    userMarker.on('click', () => {
      setSelectedPoint({
        id: 'user_live_pos',
        type: 'evacuation',
        title: `📍 YOUR LOCATION: ${userLocation.shortName}`,
        subtitle: `Coordinates: ${userLocation.latitude.toFixed(4)}° N, ${userLocation.longitude.toFixed(4)}° E`,
        status: userLocation.isLiveGps
          ? `High-accuracy GPS active (accuracy: ±${userLocation.accuracyMeters}m). Live OSRM evacuation corridor is mapped to ZP High School Shelter.`
          : `Positioned at local command coordinates. Tap 'Locate' to enable browser GPS.`,
        phone: '1077',
        actionLabel: 'Call Disaster Control (1077)',
      });
    });

    group.addLayer(userMarker);
  }, [activeLayer, userLocation, redZones, govRoute, language]);

  // Recenter map smoothly onto user's location
  const handleRecenter = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, {
      duration: 1.2,
    });
  };

  // Zoom to encompass all emergency assets
  const handleFitAll = () => {
    if (!mapRef.current) return;
    const bounds = L.latLngBounds([
      [userLocation.latitude, userLocation.longitude],
      [16.8142, 81.5283], // Ward 8 Red Zone
      [16.8285, 81.5393], // ZP High School
      [16.8040, 81.5230], // Town Hall
    ]);
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 gap-3 max-w-2xl mx-auto">
      {/* Map Header and Active Telemetry */}
      <div className="flex flex-col gap-2 bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#081534]">
              map
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-[16px] font-bold text-[#081534] leading-tight">
                  {userLocation.shortName} GIS Disaster Map
                </h2>
                {userLocation.isLiveGps && (
                  <span className="bg-[#43a55d] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                    GPS LOCK
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#45464e] font-mono">
                <span>
                  {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
                </span>
                {userLocation.accuracyMeters && (
                  <span className="text-[#43a55d] font-sans font-medium">
                    (±{userLocation.accuracyMeters}m)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onRequestLiveGps && (
              <button
                onClick={onRequestLiveGps}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#c6c6cf]/60 hover:bg-[#eaedff] text-[#081534] text-[11px] font-bold shadow-xs flex items-center gap-1 active:scale-95 transition-all"
                title="Locate device GPS position"
              >
                <span className="material-symbols-outlined text-[15px] text-[#0284c7]">
                  my_location
                </span>
                <span className="hidden xs:inline">Locate</span>
              </button>
            )}

            <button
              onClick={() =>
                setSelectedPoint({
                  id: 'boat1',
                  type: 'boat',
                  title: 'SDRF Boat Unit #1',
                  subtitle: 'Inflatable Zodiac 40HP • 6 Rescue Personnel',
                  status: 'Heading to Ward 8 canal breach point',
                  phone: '08818-222108',
                  actionLabel: 'Radio Boat Commander',
                })
              }
              className="px-2.5 py-1.5 rounded-lg bg-[#081534] text-white text-[11px] font-bold shadow-xs flex items-center gap-1 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">directions_boat</span>
              <span>{language === 'en' ? 'Track Boat' : 'బోట్ ట్రాక్'}</span>
            </button>
          </div>
        </div>

        {/* Live Evacuation Route telemetry strip */}
        <div className="bg-white px-2.5 py-1.5 rounded-lg border border-[#eaedff] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-[#003313] font-bold">
            <span className="material-symbols-outlined text-[15px] text-[#43a55d]">
              route
            </span>
            <span>Escape Route from Your GPS:</span>
            <span className="text-[#081534]">
              {govRoute ? `${govRoute.routeDistanceKm} km (~${govRoute.travelTimeMinutes} mins)` : '2.5 km (~5 mins)'}
            </span>
          </div>
          <button
            onClick={() => setShowEvacModal(true)}
            className="text-[#9d4314] hover:underline font-bold text-[10px] uppercase"
          >
            Turn-by-turn →
          </button>
        </div>
      </div>

      {/* Map Layer Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all' as MapLayer, labelEn: 'All Layers', labelTe: 'అన్నీ' },
          { id: 'redzone' as MapLayer, labelEn: '🚨 Red Zones (Gov)', labelTe: '🚨 రెడ్ జోన్లు' },
          { id: 'evacuation' as MapLayer, labelEn: '⚡ OSRM Escape Corridor', labelTe: '⚡ తప్పించుకునే మార్గం' },
          { id: 'flood' as MapLayer, labelEn: 'Flood Inundation', labelTe: 'వరద ప్రాంతాలు' },
          { id: 'shelters' as MapLayer, labelEn: 'Safe Shelters', labelTe: 'పునరావాసాలు' },
          { id: 'boats' as MapLayer, labelEn: 'SDRF Boats', labelTe: 'బోట్లు' },
          { id: 'hazards' as MapLayer, labelEn: 'Hazards', labelTe: 'రోడ్డు ప్రమాదాలు' },
        ].map((layer) => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
              activeLayer === layer.id
                ? 'bg-[#081534] text-white shadow-xs'
                : 'bg-[#eaedff] text-[#45464e] hover:bg-[#dae2fd]'
            }`}
          >
            {language === 'en' ? layer.labelEn : layer.labelTe}
          </button>
        ))}
      </div>

      {/* REAL LEAFLET MAP CONTAINER */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-[#c6c6cf]/50 shadow-md transition-all duration-300 ${
          isExpanded ? 'h-[540px]' : 'h-[400px]'
        }`}
      >
        {/* Leaflet DOM Anchor */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Real Map Floating Controls */}
        {/* Top-Right: Map Style Switcher (Streets, Satellite, Tactical) */}
        <div className="absolute top-2 right-2 z-[400] flex bg-white/90 backdrop-blur-xs p-1 rounded-xl shadow-md border border-[#c6c6cf]/40 gap-1 text-[11px] font-bold">
          {(['tactical', 'streets', 'satellite'] as MapStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className={`px-2 py-1 rounded-lg capitalize transition-all ${
                mapStyle === style
                  ? 'bg-[#081534] text-white shadow-xs'
                  : 'text-[#45464e] hover:bg-[#f2f3ff]'
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        {/* Top-Left: Live Map Legend */}
        <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-xs p-2 rounded-xl text-[10px] shadow-md border border-[#c6c6cf]/40 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold text-[#081534]">
            <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-ping"></span>
            <span>REAL GIS MAP VIEW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-[#22c55e]"></span>
            <span className="font-medium text-[#131b2e]">OSRM Escape Corridor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
            <span className="font-medium text-[#131b2e]">Gov Red Flood Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]"></span>
            <span className="font-medium text-[#131b2e]">Safe Relief Shelters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
            <span className="font-medium text-[#131b2e]">SDRF Rescue Patrol</span>
          </div>
        </div>

        {/* Bottom-Right: Navigation Action Buttons (Recenter, Fit All, Expand) */}
        <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-9 h-9 bg-white hover:bg-[#f2f3ff] text-[#081534] rounded-xl shadow-md border border-[#c6c6cf]/40 flex items-center justify-center active:scale-90 transition-all"
            title={isExpanded ? 'Collapse Map' : 'Expand Map View'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isExpanded ? 'close_fullscreen' : 'open_in_full'}
            </span>
          </button>

          <button
            onClick={handleFitAll}
            className="w-9 h-9 bg-white hover:bg-[#f2f3ff] text-[#081534] rounded-xl shadow-md border border-[#c6c6cf]/40 flex items-center justify-center active:scale-90 transition-all"
            title="Fit All Emergency Assets"
          >
            <span className="material-symbols-outlined text-[20px]">crop_free</span>
          </button>

          <button
            onClick={handleRecenter}
            className="w-9 h-9 bg-white hover:bg-[#f2f3ff] text-[#0284c7] rounded-xl shadow-md border border-[#c6c6cf]/40 flex items-center justify-center active:scale-90 transition-all"
            title="Center on My Location"
          >
            <span className="material-symbols-outlined text-[20px]">my_location</span>
          </button>
        </div>

        {/* Bottom-Left: Map attribution note */}
        <div className="absolute bottom-1.5 left-2 z-[400] text-[9px] text-[#45464e] bg-white/70 backdrop-blur-xs px-1.5 py-0.5 rounded pointer-events-none">
          OpenStreetMap &bull; OSRM Navigation &bull; DIVA Engine
        </div>
      </div>

      {/* Government Escape Decision & OSRM Routing HUD */}
      <div className="bg-[#081534] text-white p-3.5 rounded-xl border border-[#43a55d] flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#43a55d] animate-ping"></span>
            <span className="text-[11px] font-bold text-[#43a55d] uppercase tracking-wider">
              Official Escape Decision • Akashvani DIVA
            </span>
          </div>
          <button
            onClick={fetchLiveRoute}
            disabled={isRouteLoading}
            className="text-[10px] bg-white/10 hover:bg-white/20 text-[#dae2fd] px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
          >
            <span className={`material-symbols-outlined text-[12px] ${isRouteLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Recalculate</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[14px] font-bold text-white">
              Green Corridor ➔ ZP Boys High School Campus
            </div>
            <div className="text-[11px] text-[#dae2fd]">
              Verified Road Network: <strong>{govRoute?.routeDistanceKm || 2.5} km</strong> • ETA: <strong>~{govRoute?.travelTimeMinutes || 5} mins</strong>
            </div>
          </div>
          <button
            onClick={() => setShowEvacModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#43a55d] text-[#00210a] text-[11px] font-bold shadow hover:bg-[#3b9352] active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">turn_right</span>
            <span>Directions</span>
          </button>
        </div>
      </div>

      {/* Selected Marker Bottom Card */}
      {selectedPoint && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-[#c6c6cf]/40 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[14px] ${
                  selectedPoint.type === 'flood_vector'
                    ? 'bg-[#ba1a1a]'
                    : selectedPoint.type === 'shelter'
                    ? 'bg-[#003313]'
                    : selectedPoint.type === 'boat'
                    ? 'bg-[#081534]'
                    : 'bg-[#9d4314]'
                }`}
              >
                {selectedPoint.type === 'flood_vector'
                  ? '🌊'
                  : selectedPoint.type === 'shelter'
                  ? '🏠'
                  : selectedPoint.type === 'boat'
                  ? '🚤'
                  : '⚠️'}
              </span>
              <h3 className="text-[14px] font-bold text-[#131b2e] leading-snug">
                {selectedPoint.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-[#76777f] hover:text-[#081534] p-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <p className="text-[12px] text-[#45464e] leading-snug">{selectedPoint.subtitle}</p>
          <div className="bg-[#f2f3ff] p-2.5 rounded-lg text-[12px] text-[#131b2e] font-medium border border-[#eaedff]">
            {selectedPoint.status}
          </div>

          <div className="flex items-center gap-2 pt-1">
            {selectedPoint.phone && (
              <a
                href={`tel:${selectedPoint.phone}`}
                className="flex-1 min-h-[40px] px-3 rounded-lg bg-[#081534] text-white text-[12px] font-bold shadow hover:bg-[#1e2a4a] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>{selectedPoint.actionLabel || 'Call Contact'}</span>
              </a>
            )}
            <button
              onClick={() => setShowEvacModal(true)}
              className="min-h-[40px] px-3 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#081534] text-[12px] font-bold flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">route</span>
              <span>Route</span>
            </button>
            <button
              onClick={onOpenSOS}
              className="min-h-[40px] px-3.5 rounded-lg bg-[#ba1a1a] text-white text-[12px] font-bold shadow hover:bg-[#93000a] active:scale-95 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">emergency</span>
              <span>SOS</span>
            </button>
          </div>
        </div>
      )}

      {/* Turn-by-Turn Evacuation Route Modal */}
      {showEvacModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 shadow-xl border border-[#c6c6cf]/40 flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#43a55d] text-[#00210a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">directions_walk</span>
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-[#081534]">
                    Emergency Escape Route (OSRM)
                  </h3>
                  <p className="text-[11px] text-[#45464e]">
                    Distance: <strong>{govRoute?.routeDistanceKm || 2.5} km</strong> &bull; ETA: <strong>~{govRoute?.travelTimeMinutes || 5} mins</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEvacModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#f2f3ff] text-[#45464e] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff] flex flex-col gap-1.5 text-[12px]">
              <div className="flex items-center justify-between font-bold text-[#081534]">
                <span>Destination Shelter:</span>
                <span className="text-[#43a55d]">Zilla Parishad Boys High School</span>
              </div>
              <div className="text-[11px] text-[#45464e]">
                Location: Subba Rao Road, Near Gandhi Park, Tadepalligudem
              </div>
              <div className="text-[11px] text-[#45464e]">
                Capacity Status: 450/800 Beds &bull; Doctor & Drinking Water Operational
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-[12px] font-bold text-[#081534] uppercase tracking-wider">
                Step-by-Step Directions
              </h4>
              <div className="flex flex-col gap-2">
                {(govRoute?.turnByTurnSteps || [
                  'Proceed away from canal lowlands towards Main Bypass Arterial Road',
                  'Follow green lighted safety corridor markers past Railway Crossing',
                  'Turn right onto Subba Rao Road at Municipal Junction',
                  'Enter front gate of Zilla Parishad High School Relief Complex'
                ]).map((step: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-[#faf8ff] border border-[#eaedff] text-[12px]"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#081534] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[#131b2e] leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=16.8285,81.5393`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[42px] px-3 rounded-xl bg-[#081534] hover:bg-[#1e2a4a] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <span className="material-symbols-outlined text-[16px]">navigation</span>
                <span>Open in Google Maps App</span>
              </a>
              <button
                onClick={() => setShowEvacModal(false)}
                className="px-4 min-h-[42px] rounded-xl bg-[#eaedff] text-[#081534] text-[12px] font-bold hover:bg-[#dae2fd]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
