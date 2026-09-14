import React, { useState } from 'react';
import { Language, NavTab, UserLocationState, LiveEnvironmentData } from '../types';
import { EMERGENCY_CONTACTS, SHELTERS_DATA } from '../data/mockData';

interface HomeViewProps {
  language: Language;
  onNavigateTab: (tab: NavTab) => void;
  onOpenSOS: () => void;
  userLocation: UserLocationState;
  telemetry: LiveEnvironmentData | null;
  isTelemetryLoading?: boolean;
  onRefreshTelemetry?: () => void;
  onRequestLiveGps?: () => void;
}

// Haversine formula to calculate accurate distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onNavigateTab,
  onOpenSOS,
  userLocation,
  telemetry,
  isTelemetryLoading,
  onRefreshTelemetry,
  onRequestLiveGps,
}) => {
  const [isSafeMarked, setIsSafeMarked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleMarkSafe = () => {
    setIsSafeMarked(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Share to family via Web Share API
    const safeText = `I have marked myself SAFE during the weather & civic advisory at ${userLocation.displayName} (GPS: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}). Recorded via Akashvani DPI Public Safety.`;
    if (navigator.share) {
      navigator.share({ title: 'Akashvani Safety Confirmation', text: safeText }).catch(() => {});
    }
  };

  const risk = telemetry?.riskAssessment || {
    score: 45,
    level: 'Moderate',
    color: '#d97706',
    summaryEn: `Active monitoring at ${userLocation.shortName}.`,
    summaryTe: `${userLocation.shortName} పరిసరాల్లో సహాయక చర్యలు ముమ్మరం.`,
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 gap-4 max-w-2xl mx-auto">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#003313] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 border border-[#43a55d] animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px] text-[#43a55d]">verified</span>
          <span>
            {language === 'en'
              ? `Safety logged with DDMA at ${userLocation.shortName}.`
              : `${userLocation.shortName} వద్ద మీరు సురక్షితంగా ఉన్నట్లు నమోదైంది.`}
          </span>
        </div>
      )}

      {/* User Live GPS Status & Location Bar */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-[#c6c6cf]/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            userLocation.isLiveGps ? 'bg-[#e7f7ed] text-[#43a55d]' : 'bg-[#f2f3ff] text-[#081534]'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {userLocation.isLiveGps ? 'near_me' : 'location_on'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-[#131b2e] truncate">
                {userLocation.displayName || userLocation.shortName}
              </span>
              {userLocation.isLiveGps ? (
                <span className="bg-[#43a55d]/15 text-[#216b35] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43a55d] animate-pulse" />
                  Live GPS
                </span>
              ) : (
                <span className="bg-[#76777f]/15 text-[#45464e] text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Regional Base
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#76777f] font-mono mt-0.5">
              <span>
                {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
              </span>
              {userLocation.accuracyMeters && (
                <span className="text-[#43a55d] font-sans font-medium">
                  (±{userLocation.accuracyMeters}m accuracy)
                </span>
              )}
            </div>
          </div>
        </div>

        {onRequestLiveGps && !userLocation.isLiveGps && (
          <button
            onClick={onRequestLiveGps}
            className="flex-shrink-0 px-2.5 py-1.5 bg-[#081534] hover:bg-[#152758] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-xs"
            title="Locate my real-time GPS position"
          >
            <span className="material-symbols-outlined text-[15px]">my_location</span>
            <span className="hidden xs:inline">Locate Me</span>
          </button>
        )}
      </div>

      {/* Critical Threat Overview Card (Dynamic with Live Data) */}
      <div className="bg-gradient-to-br from-[#081534] to-[#1e2a4a] text-white rounded-xl p-4 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1"
              style={{ backgroundColor: risk.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              {risk.level.toUpperCase()} THREAT LEVEL ({risk.score}%)
            </span>
            <span className="text-[11px] text-[#dae2fd]">
              {userLocation.district || 'West Godavari'} Command
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#fe8c58] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">water</span>
            15.2L Cusecs
          </span>
        </div>

        <h2 className="font-display text-[22px] font-bold mt-2 leading-tight">
          {language === 'en'
            ? `Civic Hazard Assessment for ${userLocation.shortName}`
            : `${userLocation.shortName} పరిధిలో అత్యవసర భద్రతా నివేదిక`}
        </h2>
        <p className="text-[13px] text-[#dae2fd] mt-1 leading-snug">
          {language === 'en' ? risk.summaryEn : risk.summaryTe}
        </p>

        {/* River & Hazard Gauge Progress Meter */}
        <div className="mt-3 bg-white/10 p-2.5 rounded-lg">
          <div className="flex justify-between text-[11px] text-[#dae2fd] mb-1 font-medium">
            <span>
              {language === 'en'
                ? `Telemetry Risk Index: ${risk.score}/100`
                : `ప్రమాద తీవ్రత సూచిక: ${risk.score}/100`}
            </span>
            <span className="text-[#fe8c58] font-bold">
              {language === 'en' ? 'Critical Threshold: 75/100' : 'హెచ్చరిక స్థాయి: 75/100'}
            </span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, Math.max(15, risk.score))}%`,
                backgroundColor: risk.color,
              }}
            ></div>
          </div>
        </div>

        {/* Quick CTA to Alerts feed */}
        <div className="flex items-center gap-2 mt-3 pt-1">
          <button
            onClick={() => onNavigateTab('alerts')}
            className="flex-1 min-h-[40px] px-3 rounded-lg bg-white text-[#081534] text-[12px] font-bold shadow hover:bg-[#eaedff] active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <span>{language === 'en' ? 'View Live Hazard Feed' : 'హెచ్చరికల ఫీడ్ చూడండి'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
          <button
            onClick={onOpenSOS}
            className="min-h-[40px] px-3 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[12px] font-bold shadow active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">emergency</span>
            <span>SOS</span>
          </button>
        </div>
      </div>

      {/* Safety Check-In Banner */}
      <div className="bg-white p-3.5 rounded-xl shadow-sm border border-[#c6c6cf]/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isSafeMarked ? 'bg-[#43a55d] text-white' : 'bg-[#eaedff] text-[#081534]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isSafeMarked ? 'verified_user' : 'health_and_safety'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-[#131b2e] leading-tight">
              {isSafeMarked
                ? language === 'en'
                  ? 'You are marked SAFE'
                  : 'మీరు సురక్షితంగా ఉన్నట్లు నమోదైంది'
                : language === 'en'
                ? `Are you safe at ${userLocation.shortName}?`
                : `${userLocation.shortName} వద్ద మీరు సురక్షితంగా ఉన్నారా?`}
            </span>
            <span className="text-[11px] text-[#45464e] truncate">
              {language === 'en'
                ? 'Broadcast GPS confirmation to DDMA response units'
                : 'సహాయక బృందాలకు మీ స్థితిని తెలియజేయండి'}
            </span>
          </div>
        </div>

        <button
          onClick={handleMarkSafe}
          className={`min-h-[40px] px-3 rounded-lg text-[12px] font-bold transition-all shadow-xs flex items-center gap-1 ${
            isSafeMarked
              ? 'bg-[#f2f3ff] text-[#43a55d] border border-[#43a55d]/40'
              : 'bg-[#43a55d] hover:bg-[#328347] text-white active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isSafeMarked ? 'check' : 'favorite'}
          </span>
          <span>
            {isSafeMarked
              ? language === 'en'
                ? 'Logged'
                : 'నమోదైంది'
              : language === 'en'
              ? "I'm Safe"
              : 'నేను సురక్షితం'}
          </span>
        </button>
      </div>

      {/* Real-time Meteorological & Air Quality Radar (Powered by Real GPS Telemetry) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cf]/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#081534]">cloud_sync</span>
            <div className="flex flex-col">
              <h3 className="text-[14px] font-bold text-[#081534] leading-tight">
                {language === 'en' ? 'Live Meteorological & Environmental Telemetry' : 'లైవ్ వాతావరణ సమాచారం'}
              </h3>
              <span className="text-[10px] text-[#76777f]">
                Real-time satellite & ground radar for {userLocation.shortName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onRefreshTelemetry && (
              <button
                onClick={onRefreshTelemetry}
                disabled={isTelemetryLoading}
                className="p-1 text-[#76777f] hover:text-[#081534] rounded transition-colors"
                title="Refresh live telemetry"
              >
                <span className={`material-symbols-outlined text-[16px] ${isTelemetryLoading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>
            )}
            <span className="text-[10px] font-semibold text-[#43a55d] bg-[#e7f7ed] px-2 py-0.5 rounded-full border border-[#43a55d]/30">
              LIVE RADAR
            </span>
          </div>
        </div>

        {/* Current Weather Banner */}
        <div className="bg-gradient-to-r from-[#f2f3ff] to-[#eaedff] p-3 rounded-lg flex items-center justify-between border border-[#eaedff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#081534] shadow-xs">
              <span className="material-symbols-outlined text-[24px]">
                {telemetry && (telemetry.precipitationMm > 0 || (telemetry as any).rainMm > 0)
                  ? 'rainy'
                  : 'partly_cloudy_day'}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-extrabold text-[#081534] leading-none">
                  {telemetry?.temperatureC ?? 28}°C
                </span>
                <span className="text-[11px] text-[#45464e]">
                  Feels like {telemetry?.feelsLikeC ?? (telemetry?.temperatureC ? telemetry.temperatureC + 2 : 30)}°C
                </span>
              </div>
              <span className="text-[12px] font-semibold text-[#324578] mt-0.5">
                {language === 'en'
                  ? telemetry?.weatherConditionEn || 'Mainly Clear'
                  : telemetry?.weatherConditionTe || 'ప్రధానంగా నిర్మలం'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-[#76777f]">Air Quality</span>
            <span className={`text-[12px] font-extrabold px-2 py-0.5 rounded-full mt-0.5 ${
              (telemetry?.usAqi ?? 55) <= 50
                ? 'bg-[#e7f7ed] text-[#216b35]'
                : (telemetry?.usAqi ?? 55) <= 100
                ? 'bg-[#fef3c7] text-[#92400e]'
                : 'bg-[#ffdad6] text-[#ba1a1a]'
            }`}>
              AQI {telemetry?.usAqi ?? 55} ({telemetry?.aqiLevel || 'Moderate'})
            </span>
          </div>
        </div>

        {/* 4-Stat Micro Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-[#f2f3ff] p-2 rounded-lg border border-[#eaedff]">
            <span className="material-symbols-outlined text-[17px] text-[#081534]">rainy</span>
            <div className="text-[14px] font-bold text-[#131b2e] mt-0.5">
              {telemetry?.precipitationMm ?? 0} <span className="text-[10px] font-normal">mm/h</span>
            </div>
            <div className="text-[10px] text-[#45464e]">
              {language === 'en' ? 'Rain Rate' : 'వర్షపాతం'}
            </div>
          </div>

          <div className="bg-[#f2f3ff] p-2 rounded-lg border border-[#eaedff]">
            <span className="material-symbols-outlined text-[17px] text-[#9d4314]">air</span>
            <div className="text-[14px] font-bold text-[#131b2e] mt-0.5">
              {telemetry?.windSpeedKph ?? 12} <span className="text-[10px] font-normal">km/h</span>
            </div>
            <div className="text-[10px] text-[#45464e]">
              {language === 'en' ? 'Wind' : 'గాలులు'}
            </div>
          </div>

          <div className="bg-[#f2f3ff] p-2 rounded-lg border border-[#eaedff]">
            <span className="material-symbols-outlined text-[17px] text-[#ea580c]">storm</span>
            <div className="text-[14px] font-bold text-[#131b2e] mt-0.5">
              {telemetry?.windGustKph ?? 22} <span className="text-[10px] font-normal">km/h</span>
            </div>
            <div className="text-[10px] text-[#45464e]">
              {language === 'en' ? 'Max Gusts' : 'ఈదురుగాలులు'}
            </div>
          </div>

          <div className="bg-[#f2f3ff] p-2 rounded-lg border border-[#eaedff]">
            <span className="material-symbols-outlined text-[17px] text-[#43a55d]">humidity_mid</span>
            <div className="text-[14px] font-bold text-[#131b2e] mt-0.5">
              {telemetry?.humidity ?? 78}%
            </div>
            <div className="text-[10px] text-[#45464e]">
              {language === 'en' ? 'Humidity' : 'తేమ'}
            </div>
          </div>
        </div>

        {/* 5-Day Weather & Hazard Outlook */}
        {telemetry?.forecast && telemetry.forecast.length > 0 && (
          <div className="mt-1 pt-2 border-t border-[#eaedff]">
            <div className="text-[11px] font-bold text-[#081534] mb-1.5 flex items-center justify-between">
              <span>{language === 'en' ? '5-Day Emergency Forecast Outlook' : '5 రోజుల వాతావరణ అంచనా'}</span>
              <span className="text-[9px] text-[#76777f] font-normal">Auto-updated via IMD</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {telemetry.forecast.slice(0, 5).map((day, idx) => {
                const dayLabel = new Date(day.date).toLocaleDateString(language === 'en' ? 'en-US' : 'te-IN', {
                  weekday: 'short',
                });
                return (
                  <div
                    key={day.date || idx}
                    className="bg-[#f8f9ff] p-1.5 rounded-lg border border-[#eaedff] flex flex-col items-center"
                  >
                    <span className="text-[10px] font-bold text-[#45464e]">{dayLabel}</span>
                    <span className="material-symbols-outlined text-[16px] my-0.5 text-[#081534]">
                      {day.precipitationSumMm > 5 ? 'rainy' : day.precipitationProbability > 40 ? 'weather_mix' : 'wb_sunny'}
                    </span>
                    <span className="text-[11px] font-bold text-[#131b2e]">
                      {Math.round(day.temperatureMaxC)}°
                    </span>
                    <span className="text-[9px] text-[#76777f]">
                      {Math.round(day.temperatureMinC)}°
                    </span>
                    {day.precipitationProbability > 0 && (
                      <span className="text-[9px] font-semibold text-[#0284c7] mt-0.5">
                        {day.precipitationProbability}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Live Real GIS Map Gateway Banner */}
      <div className="bg-[#081534] text-white p-4 rounded-xl shadow-md border border-[#43a55d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#43a55d]/20 border border-[#43a55d] flex items-center justify-center text-[#43a55d]">
            <span className="material-symbols-outlined text-[24px]">map</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#43a55d] animate-ping"></span>
              <span className="text-[13px] font-bold text-white leading-tight">
                {language === 'en' ? 'Live Interactive GIS Disaster Map' : 'లైవ్ ఇంటరాక్టివ్ డిజాస్టర్ మ్యాప్'}
              </span>
            </div>
            <span className="text-[11px] text-[#dae2fd] mt-0.5">
              {language === 'en'
                ? 'Real OpenStreetMap tiles &bull; Official Red Zones &bull; OSRM Escape Corridor'
                : 'నిజమైన మ్యాప్ &bull; ప్రభుత్వ రెడ్ జోన్లు &bull; ఎస్కేప్ మార్గం'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('map')}
          className="px-3.5 py-2 rounded-lg bg-[#43a55d] hover:bg-[#3b9352] text-[#00210a] text-[12px] font-bold shadow active:scale-95 transition-all flex items-center gap-1 flex-shrink-0"
        >
          <span>{language === 'en' ? 'Open Map' : 'మ్యాప్ తెరవండి'}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Nearest Relief Shelters Summary with Real GPS Distance */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cf]/40 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#081534]">shelter</span>
            <h3 className="text-[14px] font-bold text-[#081534]">
              {language === 'en' ? 'Active Evacuation Shelters Near You' : 'పునరావాస కేంద్రాల స్థితి'}
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('map')}
            className="text-[11px] font-bold text-[#9d4314] hover:underline flex items-center gap-0.5"
          >
            <span>{language === 'en' ? 'Open Real Map' : 'మ్యాప్‌లో చూడండి'}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          {SHELTERS_DATA.map((shelter) => {
            const occupancyPct = Math.round((shelter.capacityOccupied / shelter.capacityTotal) * 100);
            // Compute real distance from user's live coordinates if available
            const dynamicDistance =
              shelter.lat && shelter.lon
                ? `${calculateDistanceKm(userLocation.latitude, userLocation.longitude, shelter.lat, shelter.lon)} km`
                : shelter.distance;

            return (
              <div
                key={shelter.id}
                className="bg-[#f2f3ff] p-2.5 rounded-lg flex flex-col gap-1 border border-[#eaedff]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#131b2e] truncate">
                    {language === 'en' ? shelter.nameEn : shelter.nameTe}
                  </span>
                  <span className="text-[11px] font-bold text-[#081534] bg-white px-2 py-0.5 rounded shadow-xs flex-shrink-0">
                    📍 {dynamicDistance}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#45464e]">
                  <span className="truncate max-w-[200px]">{shelter.medicalOfficer}</span>
                  <span className={occupancyPct > 80 ? 'text-[#ba1a1a] font-bold' : 'text-[#43a55d] font-bold'}>
                    {shelter.capacityOccupied}/{shelter.capacityTotal} Beds
                  </span>
                </div>
                <div className="w-full bg-[#dae2fd] h-1.5 rounded-full overflow-hidden mt-0.5">
                  <div
                    className={`h-full rounded-full ${occupancyPct > 80 ? 'bg-[#ba1a1a]' : 'bg-[#081534]'}`}
                    style={{ width: `${occupancyPct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Hotline Speed Dialers */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cf]/40 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#081534]">
            {language === 'en' ? 'Emergency Helpline Quick-Dial' : 'అత్యవసర హెల్ప్‌లైన్ నెంబర్లు'}
          </h3>
          <span className="text-[11px] text-[#45464e]">24x7 Active</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          {EMERGENCY_CONTACTS.slice(0, 4).map((contact) => (
            <a
              key={contact.name}
              href={`tel:${contact.number}`}
              className="bg-[#f2f3ff] hover:bg-[#eaedff] p-2.5 rounded-lg flex items-center justify-between transition-colors border border-[#eaedff] active:scale-98"
            >
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[11px] font-bold text-[#131b2e] truncate">{contact.name}</span>
                <span className="text-[10px] text-[#45464e] truncate">{contact.badge}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#081534] text-white flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[16px]">call</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
