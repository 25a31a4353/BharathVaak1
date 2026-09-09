import React, { useState } from 'react';
import { Language, ShelterItem } from '../types';
import { SHELTERS_DATA } from '../data/mockData';

interface MapViewProps {
  language: Language;
  onOpenSOS: () => void;
}

type MapLayer = 'all' | 'flood' | 'shelters' | 'boats' | 'hazards';

export const MapView: React.FC<MapViewProps> = ({ language, onOpenSOS }) => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('all');
  const [selectedPoint, setSelectedPoint] = useState<{
    id: string;
    type: 'flood_vector' | 'shelter' | 'boat' | 'hazard';
    title: string;
    subtitle: string;
    status: string;
    phone?: string;
    actionLabel?: string;
  } | null>({
    id: 'vec4',
    type: 'flood_vector',
    title: 'Flood Zone Vector #04 (Tadepalligudem Lowlands)',
    subtitle: 'Wards 8, 9 & Jagannadhapuram • Evacuation Active',
    status: 'SDRF Boat Unit #1 En Route • Water depth: 3.8 ft',
    phone: '08818-222108',
    actionLabel: 'Call SDRF Boat Command',
  });

  const handleShelterClick = (shelter: ShelterItem) => {
    setSelectedPoint({
      id: shelter.id,
      type: 'shelter',
      title: language === 'en' ? shelter.nameEn : shelter.nameTe,
      subtitle: `${shelter.addressEn} • ${shelter.distance}`,
      status: `Capacity: ${shelter.capacityOccupied}/${shelter.capacityTotal} Beds Occupied • ${shelter.medicalOfficer}`,
      phone: shelter.phone,
      actionLabel: 'Call Camp Officer',
    });
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 gap-3 max-w-2xl mx-auto">
      {/* Map Header and Active Layers */}
      <div className="flex items-center justify-between bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#081534]">
            map
          </span>
          <div>
            <h2 className="font-display text-[16px] font-bold text-[#081534] leading-tight">
              {language === 'en' ? 'Tadepalligudem GIS Disaster Map' : 'తాడేపల్లిగూడెం విపత్తు సహాయ మ్యాప్'}
            </h2>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#45464e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
              <span>Live Inundation &amp; Relief Corridors</span>
            </div>
          </div>
        </div>

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
          className="px-2.5 py-1 rounded-lg bg-[#081534] text-white text-[11px] font-bold shadow flex items-center gap-1 active:scale-95"
        >
          <span className="material-symbols-outlined text-[14px]">directions_boat</span>
          <span>{language === 'en' ? 'Track Boat' : 'బోట్ ట్రాక్'}</span>
        </button>
      </div>

      {/* Layer Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all' as MapLayer, labelEn: 'All Markers', labelTe: 'అన్నీ' },
          { id: 'flood' as MapLayer, labelEn: 'Flood Zones', labelTe: 'వరద ప్రాంతాలు' },
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

      {/* Interactive GIS Vector Map Canvas */}
      <div className="relative w-full h-[380px] bg-[#dbe4ff] rounded-2xl overflow-hidden border border-[#c6c6cf]/40 shadow-inner select-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 500 400"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Background land grid */}
          <rect width="500" height="400" fill="#eef2fb" />

          {/* Grid lines */}
          <line x1="0" y1="100" x2="500" y2="100" stroke="#dae2fd" strokeWidth="1" />
          <line x1="0" y1="200" x2="500" y2="200" stroke="#dae2fd" strokeWidth="1" />
          <line x1="0" y1="300" x2="500" y2="300" stroke="#dae2fd" strokeWidth="1" />
          <line x1="100" y1="0" x2="100" y2="400" stroke="#dae2fd" strokeWidth="1" />
          <line x1="250" y1="0" x2="250" y2="400" stroke="#dae2fd" strokeWidth="1" />
          <line x1="400" y1="0" x2="400" y2="400" stroke="#dae2fd" strokeWidth="1" />

          {/* Godavari Irrigation Main Canal */}
          <path
            d="M -20 80 Q 150 140 280 180 T 520 230"
            fill="none"
            stroke="#688eed"
            strokeWidth="24"
            opacity="0.75"
          />
          <path
            d="M -20 80 Q 150 140 280 180 T 520 230"
            fill="none"
            stroke="#3b66d4"
            strokeWidth="14"
            opacity="0.9"
          />

          {/* Branch canal to Pentapadu */}
          <path
            d="M 280 180 Q 320 260 420 380"
            fill="none"
            stroke="#688eed"
            strokeWidth="12"
            opacity="0.7"
          />

          {/* Roads & Railway Network */}
          <path
            d="M 50 380 L 160 220 L 320 120 L 480 50"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="6"
          />
          {/* Railway line */}
          <path
            d="M 20 280 L 480 320"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="8 6"
          />

          {/* FLOOD INUNDATION LAYER */}
          {(activeLayer === 'all' || activeLayer === 'flood') && (
            <>
              {/* Flood Zone Vector #04 (Critical Inundation - Red Zone) */}
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() =>
                  setSelectedPoint({
                    id: 'vec4',
                    type: 'flood_vector',
                    title: 'Flood Zone Vector #04 (Wards 8, 9 & Jagannadhapuram)',
                    subtitle: 'Water Depth: 3.8 - 4.5 ft • High Inflow Surge',
                    status: 'Mandatory evacuation active toward ZP Boys High School',
                    phone: '08818-222108',
                    actionLabel: 'SDRF Rescue Dispatch',
                  })
                }
              >
                <path
                  d="M 120 130 C 180 110, 240 160, 230 220 C 220 270, 140 260, 110 220 Z"
                  fill="#ba1a1a"
                  fillOpacity="0.35"
                  stroke="#ba1a1a"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                <circle cx="170" cy="180" r="28" fill="#ba1a1a" fillOpacity="0.2">
                  <animate
                    attributeName="r"
                    values="20;32;20"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="170" cy="180" r="14" fill="#ba1a1a" />
                <text
                  x="170"
                  y="184"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  #04
                </text>
                <text
                  x="170"
                  y="204"
                  fill="#93000a"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Vector #04 (RED)
                </text>
              </g>

              {/* Flood Zone Vector #02 (Amber Zone) */}
              <g
                className="cursor-pointer"
                onClick={() =>
                  setSelectedPoint({
                    id: 'vec2',
                    type: 'flood_vector',
                    title: 'Flood Vector #02 (Sub-division 3 & Canal Bund)',
                    subtitle: 'Water Depth: 1.5 ft • Rising Margin',
                    status: 'Precautionary alert • Sandbags deployed by ward team',
                    phone: '1077',
                    actionLabel: 'Call Ward Officer',
                  })
                }
              >
                <path
                  d="M 270 190 C 330 180, 380 230, 360 280 C 330 310, 280 270, 260 230 Z"
                  fill="#fe8c58"
                  fillOpacity="0.3"
                  stroke="#fe8c58"
                  strokeWidth="2"
                />
                <circle cx="310" cy="240" r="10" fill="#fe8c58" />
                <text
                  x="310"
                  y="244"
                  fill="#712800"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  #02
                </text>
              </g>
            </>
          )}

          {/* SDRF RESCUE BOAT */}
          {(activeLayer === 'all' || activeLayer === 'boats') && (
            <g
              className="cursor-pointer"
              onClick={() =>
                setSelectedPoint({
                  id: 'boat1',
                  type: 'boat',
                  title: 'SDRF Rescue Boat Unit #1',
                  subtitle: 'Inflatable Zodiac 40HP • 6 Rescue Technicians',
                  status: 'Patrolling Ward 8 Lowlands • 18 Citizens evacuated so far',
                  phone: '08818-222108',
                  actionLabel: 'Call Boat Commander',
                })
              }
            >
              <circle cx="215" cy="165" r="16" fill="#081534" fillOpacity="0.2">
                <animate
                  attributeName="r"
                  values="12;22;12"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <rect x="203" y="153" width="24" height="24" rx="6" fill="#081534" />
              <text
                x="215"
                y="169"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                🚤
              </text>
              <text
                x="215"
                y="190"
                fill="#081534"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                SDRF Boat #1
              </text>
            </g>
          )}

          {/* SHELTERS */}
          {(activeLayer === 'all' || activeLayer === 'shelters') &&
            SHELTERS_DATA.map((shelter, idx) => {
              const xPos = idx === 0 ? 95 : idx === 1 ? 380 : 220;
              const yPos = idx === 0 ? 90 : idx === 1 ? 330 : 320;
              return (
                <g
                  key={shelter.id}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => handleShelterClick(shelter)}
                >
                  <circle cx={xPos} cy={yPos} r="18" fill="#43a55d" fillOpacity="0.25" />
                  <circle cx={xPos} cy={yPos} r="12" fill="#003313" />
                  <text
                    x={xPos}
                    y={yPos + 4}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    🏠
                  </text>
                  <text
                    x={xPos}
                    y={yPos + 22}
                    fill="#00210a"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {shelter.id === 's1' ? 'ZP Boys School' : shelter.id === 's2' ? 'Govt College' : 'Town Hall'}
                  </text>
                </g>
              );
            })}

          {/* HAZARDS LAYER */}
          {(activeLayer === 'all' || activeLayer === 'hazards') && (
            <>
              {/* Fallen Banyan Tree */}
              <g
                className="cursor-pointer"
                onClick={() =>
                  setSelectedPoint({
                    id: 'tree',
                    type: 'hazard',
                    title: 'Fallen Banyan Tree Obstruction',
                    subtitle: 'Old Bus Stand Dual Carriageway near Sai Baba Temple',
                    status: 'Municipal woodcutters clearing trunk • Diversion active',
                    phone: '112',
                    actionLabel: 'Call Traffic Help',
                  })
                }
              >
                <circle cx="280" cy="115" r="12" fill="#9d4314" />
                <text
                  x="280"
                  y="119"
                  fill="#ffffff"
                  fontSize="11"
                  textAnchor="middle"
                >
                  ⚠️
                </text>
                <text
                  x="280"
                  y="136"
                  fill="#712800"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Tree Fall
                </text>
              </g>

              {/* Power Grid Outage */}
              <g
                className="cursor-pointer"
                onClick={() =>
                  setSelectedPoint({
                    id: 'grid',
                    type: 'hazard',
                    title: '33kV Substation Precautionary Shutdown',
                    subtitle: 'Feeder lines #2 & #7 Isolated for flood safety',
                    status: 'Expected power restoration: 18:30 IST',
                    phone: '1912',
                    actionLabel: 'Call Electricity 1912',
                  })
                }
              >
                <circle cx="390" cy="150" r="11" fill="#fe8c58" />
                <text
                  x="390"
                  y="154"
                  fill="#360f00"
                  fontSize="10"
                  textAnchor="middle"
                >
                  ⚡
                </text>
                <text
                  x="390"
                  y="170"
                  fill="#7d2d00"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Grid Cut
                </text>
              </g>
            </>
          )}
        </svg>

        {/* Map Legend Overlay */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs p-2 rounded-lg text-[10px] shadow-sm border border-[#c6c6cf]/50 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ba1a1a]"></span>
            <span className="font-semibold text-[#131b2e]">Red Flood Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#003313]"></span>
            <span className="font-semibold text-[#131b2e]">Safe Shelter Camp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#081534]"></span>
            <span className="font-semibold text-[#131b2e]">SDRF Rescue Boat</span>
          </div>
        </div>

        {/* Center Target Marker */}
        <button
          onClick={() =>
            setSelectedPoint({
              id: 'vec4',
              type: 'flood_vector',
              title: 'Flood Zone Vector #04 (Tadepalligudem Lowlands)',
              subtitle: 'Wards 8, 9 & Jagannadhapuram • Evacuation Active',
              status: 'SDRF Boat Unit #1 En Route • Water depth: 3.8 ft',
              phone: '08818-222108',
              actionLabel: 'Call SDRF Boat Command',
            })
          }
          className="absolute bottom-3 right-3 bg-white p-2 rounded-xl shadow-md text-[#081534] hover:bg-[#eaedff] active:scale-90"
          title="Recenter Map"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
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
                <span>{selectedPoint.actionLabel || 'Call Hotline'}</span>
              </a>
            )}
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
    </div>
  );
};
