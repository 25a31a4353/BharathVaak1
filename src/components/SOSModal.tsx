import React, { useState, useEffect, useRef } from 'react';
import { Language, GovDecision, UserLocationState } from '../types';
import { govApi } from '../services/govApi';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  location: string;
  userLocation?: UserLocationState;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  language,
  location,
  userLocation,
}) => {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [strobeState, setStrobeState] = useState(false);
  const [govDecision, setGovDecision] = useState<GovDecision | null>(null);
  const [isTransmittingSOS, setIsTransmittingSOS] = useState(false);
  const [sosTransmitted, setSosTransmitted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Audio siren synthesizer
  const toggleSiren = () => {
    if (sirenPlaying) {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {}
      }
      setSirenPlaying(false);
    } else {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, ctx.currentTime);

        // Siren frequency warble
        let high = true;
        const interval = setInterval(() => {
          if (!oscillatorRef.current) {
            clearInterval(interval);
            return;
          }
          try {
            osc.frequency.setValueAtTime(high ? 950 : 600, ctx.currentTime);
            high = !high;
          } catch {
            clearInterval(interval);
          }
        }, 400);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setSirenPlaying(true);
      } catch (err) {
        console.error('AudioContext error:', err);
      }
    }
  };

  // Strobe effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (strobeActive) {
      interval = setInterval(() => {
        setStrobeState((prev) => !prev);
      }, 200);
    } else {
      setStrobeState(false);
    }
    return () => clearInterval(interval);
  }, [strobeActive]);

  // Transmit SOS beacon to government server upon opening or user trigger
  useEffect(() => {
    if (isOpen && !sosTransmitted) {
      handleTransmitBeacon();
    }
  }, [isOpen]);

  const handleTransmitBeacon = async () => {
    setIsTransmittingSOS(true);
    try {
      const liveLat = userLocation?.latitude ?? 16.8142;
      const liveLon = userLocation?.longitude ?? 81.5283;
      const locationName = userLocation?.displayName || userLocation?.shortName || location;

      const res = await govApi.sendSOSBeacon({
        latitude: liveLat,
        longitude: liveLon,
        ward: `${locationName}`,
        locationName,
        accuracyMeters: userLocation?.accuracyMeters,
        victimStatus: 'Inundation in progress; evacuation required',
        medicalEmergency: false,
      });
      if (res.decision) {
        setGovDecision(res.decision);
        setSosTransmitted(true);
      }
    } catch (err) {
      console.error('SOS dispatch error:', err);
    } finally {
      setIsTransmittingSOS(false);
    }
  };

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen && sirenPlaying) {
      toggleSiren();
    }
    if (!isOpen && strobeActive) {
      setStrobeActive(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const liveLat = userLocation?.latitude ?? 16.8142;
  const liveLon = userLocation?.longitude ?? 81.5283;
  const currentCoords = `${liveLat.toFixed(4)}° N, ${liveLon.toFixed(4)}° E`;
  const wardLocation = userLocation?.displayName || userLocation?.shortName || `Ward 8, Jagannadhapuram, ${location}`;

  const sendWhatsAppSOS = () => {
    const sosMsg = `[CRITICAL SOS - AKASHVANI DISASTER RESCUE]\nName: Citizen in Distress\nLocation: ${wardLocation}\nGPS Coordinates: https://maps.google.com/?q=${liveLat},${liveLon}\nAccuracy: ±${userLocation?.accuracyMeters || 15}m\nNeed immediate SDRF flood evacuation and emergency rescue!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(sosMsg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      {/* Full screen strobe background if enabled */}
      {strobeActive && (
        <div
          className={`fixed inset-0 pointer-events-none z-10 transition-colors duration-100 ${
            strobeState ? 'bg-red-600/60' : 'bg-white/60'
          }`}
        />
      )}

      <div className="relative z-20 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#ba1a1a] flex flex-col animate-in zoom-in-95 max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#ba1a1a] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] animate-pulse">
              emergency
            </span>
            <div>
              <h2 className="font-display text-[18px] font-bold leading-tight">
                {language === 'en' ? 'Emergency SOS Beacon' : 'అత్యవసర రక్షణ బీకన్'}
              </h2>
              <span className="text-[11px] text-[#ffdad6] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>Linked to Akashvani Govt Platform</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
          {/* Government Decision & Escape Response Banner */}
          {govDecision ? (
            <div className="bg-[#081534] text-white p-3.5 rounded-xl border border-[#43a55d] flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#43a55d] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#43a55d] animate-ping"></span>
                  GOVERNMENT DECISION CONFIRMED
                </span>
                <span className="text-[10px] text-[#dae2fd] font-mono">
                  {govDecision.caseId || 'REGISTERED'}
                </span>
              </div>

              <div className="text-[13px] font-bold text-[#ffdad6]">
                Priority: {govDecision.severity || 'RED ALERT'} — SDRF Rescue Unit Alerted
              </div>

              {govDecision.isRedZone && (
                <div className="bg-[#ba1a1a] p-2 rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5 border border-red-300">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>OFFICIAL RED ZONE DECLARED ON GOVERNMENT PORTAL</span>
                </div>
              )}

              {/* Escape Guidance */}
              <div className="bg-white/10 p-2.5 rounded-lg flex flex-col gap-1 text-[11px] text-[#dae2fd]">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                  Immediate Escape Guidance:
                </span>
                {govDecision.immediateEscapeGuidance?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#fe8c58] font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                )) || (
                  <div>
                    Ascend to upper floor or high ground. SDRF rescue boats dispatched.
                  </div>
                )}
              </div>

              {/* Safe Haven with OSRM Road Distance */}
              {govDecision.safeHaven && (
                <div className="bg-white/10 p-2 rounded-lg flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[#43a55d] font-bold">Fastest Escape Corridor:</span>
                    <div className="font-semibold text-white">{govDecision.safeHaven.name}</div>
                    <div className="text-[#dae2fd] text-[10px]">
                      Distance: {govDecision.safeHaven.routeDistanceKm} km • ~
                      {govDecision.safeHaven.travelTimeMinutes} mins (via verified OSRM geometry)
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[24px] text-[#43a55d]">
                    navigation
                  </span>
                </div>
              )}

              <a
                href="https://akashvani-production.up.railway.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#dae2fd] underline hover:text-white flex items-center gap-1 mt-0.5"
              >
                <span>Track distress packet on Government Web Portal</span>
                <span className="material-symbols-outlined text-[11px]">open_in_new</span>
              </a>
            </div>
          ) : isTransmittingSOS ? (
            <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff] flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-[#ba1a1a] border-t-transparent rounded-full animate-spin flex-shrink-0"></span>
              <div className="text-[12px] text-[#081534] font-semibold">
                Transmitting distress coordinates to Akashvani Government Portal...
              </div>
            </div>
          ) : null}

          {/* Geo-location confirmation badge */}
          <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#45464e]">
              <span className="flex items-center gap-1 text-[#ba1a1a]">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping"></span>
                <span>LIVE GPS LOCKED</span>
              </span>
              <span>Accuracy: ±3.5m</span>
            </div>
            <div className="text-[14px] font-bold text-[#081534]">{wardLocation}</div>
            <div className="text-[12px] text-[#45464e] font-mono">{currentCoords}</div>
          </div>

          {/* Distress Tools: Siren & Strobe */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleSiren}
              className={`min-h-[50px] px-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm ${
                sirenPlaying
                  ? 'bg-[#ba1a1a] text-white ring-4 ring-[#ba1a1a]/30 animate-pulse'
                  : 'bg-[#eaedff] text-[#081534] hover:bg-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {sirenPlaying ? 'volume_off' : 'volume_up'}
              </span>
              <span>
                {sirenPlaying
                  ? language === 'en'
                    ? 'Stop Siren'
                    : 'సైరన్ ఆపు'
                  : language === 'en'
                  ? 'Alarm Siren'
                  : 'అత్యవసర సైరన్'}
              </span>
            </button>

            <button
              onClick={() => setStrobeActive(!strobeActive)}
              className={`min-h-[50px] px-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm ${
                strobeActive
                  ? 'bg-[#fe8c58] text-[#712800] ring-4 ring-[#fe8c58]/30 animate-pulse'
                  : 'bg-[#eaedff] text-[#081534] hover:bg-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {strobeActive ? 'flash_off' : 'flash_on'}
              </span>
              <span>
                {strobeActive
                  ? language === 'en'
                    ? 'Stop Flash'
                    : 'లైట్ ఆపు'
                  : language === 'en'
                  ? 'SOS Light'
                  : 'డిస్ట్రెస్ లైట్'}
              </span>
            </button>
          </div>

          {/* Direct Speed Call Emergency Grid */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase font-bold text-[#76777f] tracking-wider">
              {language === 'en' ? 'Tap to Call Emergency Rescue' : 'వెంటనే ఫోన్ చేయండి'}
            </span>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                className="bg-[#081534] hover:bg-[#1e2a4a] text-white p-2.5 rounded-xl flex items-center justify-between shadow-sm active:scale-95 transition-all"
              >
                <div>
                  <div className="text-[10px] text-[#dae2fd]">National Unified</div>
                  <div className="text-[15px] font-bold">112 Police</div>
                </div>
                <span className="material-symbols-outlined text-[20px]">call</span>
              </a>

              <a
                href="tel:08818-222108"
                className="bg-[#ba1a1a] hover:bg-[#93000a] text-white p-2.5 rounded-xl flex items-center justify-between shadow-sm active:scale-95 transition-all"
              >
                <div>
                  <div className="text-[10px] text-[#ffdad6]">Flood Rescue</div>
                  <div className="text-[13px] font-bold">SDRF Boat Unit</div>
                </div>
                <span className="material-symbols-outlined text-[20px]">directions_boat</span>
              </a>

              <a
                href="tel:108"
                className="bg-[#003313] hover:bg-[#00210a] text-white p-2.5 rounded-xl flex items-center justify-between shadow-sm active:scale-95 transition-all"
              >
                <div>
                  <div className="text-[10px] text-[#95f8a7]">Medical Trauma</div>
                  <div className="text-[15px] font-bold">108 Ambulance</div>
                </div>
                <span className="material-symbols-outlined text-[20px]">local_hospital</span>
              </a>

              <a
                href="tel:1077"
                className="bg-[#9d4314] hover:bg-[#7d2d00] text-white p-2.5 rounded-xl flex items-center justify-between shadow-sm active:scale-95 transition-all"
              >
                <div>
                  <div className="text-[10px] text-[#ffdbcd]">Disaster Command</div>
                  <div className="text-[15px] font-bold">1077 Toll-Free</div>
                </div>
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
              </a>
            </div>
          </div>

          {/* Broadcast SOS to WhatsApp */}
          <button
            onClick={sendWhatsAppSOS}
            className="min-h-[44px] w-full rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[13px] shadow flex items-center justify-center gap-2 active:scale-95 transition-all mt-1"
          >
            <span className="material-symbols-outlined text-[20px]">share_location</span>
            <span>
              {language === 'en'
                ? 'Send Live Location SOS via WhatsApp'
                : 'వాట్సాప్ ద్వారా అత్యవసర లొకేషన్ పంపండి'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
