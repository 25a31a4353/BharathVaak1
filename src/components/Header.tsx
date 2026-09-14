import React, { useState, useEffect } from 'react';
import { Language, GovStatus, UserLocationState } from '../types';
import { govApi } from '../services/govApi';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  userLocation: UserLocationState;
  onRequestLiveGps: () => void;
  onSelectPredefinedLocation: (label: string, lat: number, lon: number) => void;
  isLocating?: boolean;
  govStatus: GovStatus | null;
  onRefreshGovStatus: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenNotifications,
  onOpenProfile,
  userLocation,
  onRequestLiveGps,
  onSelectPredefinedLocation,
  isLocating,
  govStatus,
  onRefreshGovStatus,
}) => {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showGovModal, setShowGovModal] = useState(false);

  const availableLocations = [
    { label: 'Tadepalligudem, AP', lat: 16.8142, lon: 81.5283 },
    { label: 'Eluru, AP', lat: 16.7107, lon: 81.0952 },
    { label: 'Rajahmundry, AP', lat: 17.0005, lon: 81.8040 },
    { label: 'Tanuku, AP', lat: 16.7554, lon: 81.6811 },
    { label: 'Bhimavaram, AP', lat: 16.5449, lon: 81.5212 },
    { label: 'Vijayawada, AP', lat: 16.5062, lon: 80.6480 },
    { label: 'Visakhapatnam, AP', lat: 17.6868, lon: 83.2185 },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-[#faf8ff]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.05)] pt-safe">
        {/* Top Mini Government Bridge Bar */}
        <div className="bg-[#081534] text-white text-[10px] px-4 py-1 flex items-center justify-between max-w-2xl mx-auto font-medium">
          <button
            onClick={() => setShowGovModal(true)}
            className="flex items-center gap-1.5 hover:underline focus:outline-none"
            title="Click to view Government Command Bridge telemetry"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                govStatus?.connected ? 'bg-[#43a55d] animate-pulse' : 'bg-[#fe8c58]'
              }`}
            />
            <span className="font-semibold tracking-wide">
              {govStatus?.connected ? 'GOV SERVER LINKED' : 'CONNECTING TO GOV'}
            </span>
            <span className="text-[#dae2fd] opacity-80 hidden sm:inline">
              • akashvani-production.up.railway.app
            </span>
            {govStatus?.latencyMs && (
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#43a55d]">
                {govStatus.latencyMs}ms
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 text-[#dae2fd]">
            <span className="hidden xs:inline text-[9px] uppercase tracking-wider text-[#dae2fd]/70">
              DIVA Decision Engine v1.0
            </span>
            <button
              onClick={onRefreshGovStatus}
              className="hover:text-white transition-colors"
              title="Refresh government connection"
            >
              <span className="material-symbols-outlined text-[13px] align-middle">sync</span>
            </button>
          </div>
        </div>

        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-2xl mx-auto">
          {/* Logo and App Title */}
          <div className="flex items-center gap-2">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1XmPvKsVXJgVOD7BF_cGFc9ZA2nr5zf1WakYU50hlqXDcMWXIGkagU6DsoTASwrKMPotF23c2iOkPcTFvGaahK_HuaTmlsSD48e1cJNiJyZuNGHqhnqbIhZvDfELlV5SXvA_Df_cVqmQDCK-txEdk8IPqRLspVCBO0ogRWKFiXvcPzoxia4g9D7_E7Ub6p3E9ZnOUJECHGPf6OUrEuJMvHOrT17MULheMeBj0qT3FAB2spriwXQ1NhLuc8r"
              alt="Akashvani Civic Emblem"
              className="h-8 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-[19px] tracking-tight text-[#081534] leading-none">
                Akashvani
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  className="flex items-center gap-1 mt-0.5 text-left group focus:outline-none"
                  title="Switch District / Mandal or detect GPS"
                >
                  <span className="text-[11px] font-bold text-[#45464e] leading-none group-hover:text-[#081534] transition-colors flex items-center gap-1">
                    {userLocation.isLiveGps && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#43a55d] animate-ping inline-block" />
                    )}
                    <span className="max-w-[140px] truncate">{userLocation.shortName}</span>
                    <span className="material-symbols-outlined text-[13px] text-[#76777f]">
                      expand_more
                    </span>
                  </span>
                </button>

                {/* Location Switcher Dropdown */}
                {showLocationMenu && (
                  <div className="absolute top-6 left-0 w-64 bg-white rounded-xl shadow-2xl border border-[#c6c6cf]/50 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    {/* Live GPS Detector Action */}
                    <div className="p-2 border-b border-[#eaedff]">
                      <button
                        onClick={() => {
                          onRequestLiveGps();
                          setShowLocationMenu(false);
                        }}
                        disabled={isLocating}
                        className="w-full min-h-[38px] px-2.5 rounded-lg bg-[#081534] hover:bg-[#13234d] text-white text-[12px] font-bold flex items-center justify-between shadow transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-[17px] text-[#43a55d] ${isLocating ? 'animate-spin' : ''}`}>
                            {isLocating ? 'progress_activity' : 'my_location'}
                          </span>
                          <span>{isLocating ? 'Acquiring GPS Fix...' : 'Use My Live GPS'}</span>
                        </div>
                        {userLocation.isLiveGps && (
                          <span className="bg-[#43a55d] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                            Active
                          </span>
                        )}
                      </button>

                      {/* Current Fix Coordinates */}
                      <div className="mt-1.5 px-1 flex items-center justify-between text-[10px] text-[#76777f] font-mono">
                        <span>
                          {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
                        </span>
                        {userLocation.accuracyMeters && (
                          <span className="text-[#43a55d] font-sans font-semibold">
                            ±{userLocation.accuracyMeters}m
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#76777f] bg-[#faf8ff]">
                      {language === 'en' ? 'Regional Crisis Command Hubs' : 'ప్రాంతీయ కమాండ్ కేంద్రాలు'}
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                      {availableLocations.map((loc) => (
                        <button
                          key={loc.label}
                          onClick={() => {
                            onSelectPredefinedLocation(loc.label, loc.lat, loc.lon);
                            setShowLocationMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[12px] font-medium transition-colors flex items-center justify-between ${
                            userLocation.shortName === loc.label && !userLocation.isLiveGps
                              ? 'bg-[#eaedff] text-[#081534] font-bold'
                              : 'text-[#45464e] hover:bg-[#f2f3ff]'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{loc.label}</span>
                            <span className="text-[9px] text-[#76777f] font-mono">
                              {loc.lat.toFixed(2)}° N, {loc.lon.toFixed(2)}° E
                            </span>
                          </div>
                          {userLocation.shortName === loc.label && !userLocation.isLiveGps && (
                            <span className="material-symbols-outlined text-[14px] text-[#081534]">
                              check
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action icons: Language Toggle, Notifications, User Profile */}
          <div className="flex items-center gap-1.5">
            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              aria-label="Switch Language between English and Telugu"
              className="min-h-[38px] px-2.5 flex items-center justify-center rounded-lg bg-[#eaedff] text-[#081534] font-semibold text-[12px] hover:bg-[#dae2fd] active:scale-95 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] mr-1 text-[#1e2a4a]">
                translate
              </span>
              <span>{language === 'en' ? 'EN|తె' : 'తె|EN'}</span>
            </button>

            {/* Notifications Button with Red Indicator */}
            <button
              onClick={onOpenNotifications}
              aria-label="Disaster Notifications"
              className="relative min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#081534] hover:bg-[#eaedff] active:scale-95 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#faf8ff] animate-pulse"></span>
            </button>

            {/* User Profile Avatar */}
            <button
              onClick={onOpenProfile}
              aria-label="Responder Profile"
              className="w-8 h-8 rounded-full bg-[#081534] hover:bg-[#1e2a4a] text-white flex items-center justify-center shadow-sm ml-0.5 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[17px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* Government Bridge Telemetry Modal */}
      {showGovModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cf]/40 flex flex-col animate-in zoom-in-95">
            <div className="bg-[#081534] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#43a55d]">
                  cloud_done
                </span>
                <div>
                  <h3 className="font-display font-bold text-[16px]">
                    Akashvani Government Command Bridge
                  </h3>
                  <span className="text-[11px] text-[#dae2fd]">
                    Two-Way Disaster Intelligence Architecture
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowGovModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#45464e]">Target Government Host:</span>
                  <span className="font-mono font-bold text-[#081534] text-[11px]">
                    akashvani-production.up.railway.app
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#45464e]">Sync Connection Status:</span>
                  <span
                    className={`font-bold text-[11px] flex items-center gap-1 ${
                      govStatus?.connected ? 'text-[#43a55d]' : 'text-[#ba1a1a]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                    {govStatus?.connected ? 'ACTIVE & OPERATIONAL' : 'DISCONNECTED'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#45464e]">Latency & Response Time:</span>
                  <span className="font-mono text-[12px] font-bold text-[#081534]">
                    {govStatus?.latencyMs || '—'} ms
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#45464e]">Decision Model:</span>
                  <span className="font-mono text-[11px] font-bold text-[#081534]">
                    DIVA Deterministic Analytical Engine v1.0
                  </span>
                </div>
              </div>

              <div className="text-[12px] text-[#45464e] leading-relaxed">
                When you submit emergency SOS beacons or citizen hazard reports from this mobile
                application, the data is transmitted in real time to the government portal. The
                analytical decision-support engine processes coordinates, assesses risk, and
                returns escape directives, safe haven routes, and SDRF dispatch orders within seconds.
              </div>

              <div className="flex items-center gap-2 mt-1">
                <a
                  href="https://akashvani-production.up.railway.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[42px] px-3 rounded-xl bg-[#081534] hover:bg-[#1e2a4a] text-white font-bold text-[12px] shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Open Government Portal</span>
                </a>
                <button
                  onClick={() => {
                    onRefreshGovStatus();
                    setShowGovModal(false);
                  }}
                  className="min-h-[42px] px-3 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#081534] font-bold text-[12px] flex items-center justify-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Test Ping</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
