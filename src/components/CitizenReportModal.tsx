import React, { useState, useEffect } from 'react';
import { Language, AlertItem, GovDecision, UserLocationState } from '../types';
import { govApi } from '../services/govApi';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  location: string;
  userLocation?: UserLocationState;
  onAddAlert: (newAlert: AlertItem) => void;
  onViewEscapeRoute?: (decision: GovDecision) => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  language,
  location,
  userLocation,
  onAddAlert,
  onViewEscapeRoute,
}) => {
  const [category, setCategory] = useState<'flood' | 'tree' | 'power' | 'water' | 'road'>('flood');
  const [ward, setWard] = useState(userLocation?.displayName || 'Ward 8 - Jagannadhapuram');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [markAsRedZone, setMarkAsRedZone] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivedDecision, setReceivedDecision] = useState<GovDecision | null>(null);
  const [persistedCaseId, setPersistedCaseId] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation?.displayName) {
      setWard(userLocation.displayName);
    }
  }, [userLocation?.displayName]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateCamera = () => {
    setPhotoPreview(
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let titleEn = 'Waterlogging & Flood Inflow Hazard';
    let titleTe = 'వరద నీరు నిల్వ మరియు ప్రవాహం ప్రమాదం';
    let tagEn = '🚨 RED ZONE DECLARED';
    let tagTe = '🚨 రెడ్ జోన్ ప్రకటించబడింది';

    if (category === 'tree') {
      titleEn = 'Tree or Debris Road Blockage';
      titleTe = 'చెట్టు లేదా శిథిలాల వల్ల రోడ్డు దిగ్బంధం';
      tagEn = '🚨 RED ZONE • TREE FALL';
      tagTe = '🚨 రెడ్ జోన్ • చెట్టు పడటం';
    } else if (category === 'power') {
      titleEn = 'Snapped Live Electric Wire Risk';
      titleTe = 'తెగిపడిన విద్యుత్ తీగలు - ప్రమాదం';
      tagEn = '🚨 RED ZONE • GRID HAZARD';
      tagTe = '🚨 రెడ్ జోన్ • విద్యుత్ తీగలు';
    } else if (category === 'water') {
      titleEn = 'Muddy Water Pipeline Contamination';
      titleTe = 'పైప్‌లైన్ ద్వారా మురికి నీటి సరఫరా';
      tagEn = '🚨 RED ZONE • HEALTH';
      tagTe = '🚨 రెడ్ జోన్ • తాగునీరు';
    } else if (category === 'road') {
      titleEn = 'Road Washout & Culvert Breach';
      titleTe = 'రోడ్డు కొట్టుకుపోవడం & కల్వర్టు దెబ్బతినడం';
      tagEn = '🚨 RED ZONE • CIVIL';
      tagTe = '🚨 రెడ్ జోన్ • రోడ్డు రవాణా';
    }

    try {
      const liveLat = userLocation?.latitude ?? 16.8142;
      const liveLon = userLocation?.longitude ?? 81.5283;
      const locationLabel = userLocation?.displayName || userLocation?.shortName || ward;

      // Send incident to user's real Government Platform backend to trigger analysis & Red Zone designation
      const res = await govApi.reportIncident({
        title: titleEn,
        category,
        ward: locationLabel,
        landmark: landmark || (userLocation?.isLiveGps ? `GPS: ${liveLat.toFixed(4)}, ${liveLon.toFixed(4)}` : ''),
        description: description || `${category.toUpperCase()} hazard discovered and recorded at ${locationLabel}. Analyzed and registered as active Red Zone on Government website.`,
        latitude: liveLat,
        longitude: liveLon,
        locationName: locationLabel,
        accuracyMeters: userLocation?.accuracyMeters,
        citizenName: 'Citizen Field Responder (Live GPS User)',
        citizenPhone: 'AP-TDP-98442',
      });

      const caseId = res.case?.id || `CASE-RZ-${Date.now().toString(36).toUpperCase()}`;
      setPersistedCaseId(caseId);

      if (res.decision) {
        setReceivedDecision(res.decision);
      }

      // Add to live alert feed with Red Zone severity
      const newAlert: AlertItem = {
        id: caseId,
        category: ['civil', 'nearby'],
        severity: 'critical',
        tagEn: `${tagEn} • #${caseId}`,
        tagTe: `${tagTe} • #${caseId}`,
        agency: 'GOVT DIVA CRISIS ENGINE',
        agencyType: 'official',
        timeAgoEn: 'Just now',
        timeAgoTe: 'ఇప్పుడే',
        titleEn: `🚨 RED ZONE: ${titleEn} — ${locationLabel}`,
        titleTe: `🚨 రెడ్ జోన్: ${titleTe} — ${locationLabel}`,
        distanceEn: userLocation?.accuracyMeters ? `±${userLocation.accuracyMeters}m GPS Fix` : '150m away',
        distanceTe: 'సమీప ప్రాంతం',
        locationEn: landmark ? `${locationLabel} (${landmark}) [RED ZONE]` : `${locationLabel} [RED ZONE]`,
        locationTe: landmark ? `${locationLabel} (${landmark}) [రెడ్ జోన్]` : `${locationLabel} [రెడ్ జోన్]`,
        descriptionEn: `Hazard analyzed by Akashvani DIVA Decision-Support Engine. Area officially declared and marked as an active RED ZONE on the government portal. Cordon and evacuation in effect.`,
        descriptionTe: `ఆకాశవాణి విపత్తు వ్యవస్థ ద్వారా విశ్లేషించబడి, ప్రభుత్వ పోర్టల్‌లో ఈ ప్రాంతం రెడ్ జోన్‌గా ప్రకటించబడింది.`,
        mandatoryActionEn: res.decision?.actionRequired || 'Mandatory Evacuation: Follow marked OSRM green corridor to ZP High School Relief Shelter.',
        mandatoryActionTe: 'సురక్షిత ఎత్తైన ప్రాంతానికి వెంటనే తరలివెళ్ళండి. రోడ్డు మార్గాన్ని అనుసరించండి.',
        protocol: {
          shelterName: 'ZP High School Relief & Transit Campus',
          shelterAddress: 'Bypass Road, Ward 4, Tadepalligudem',
          capacityTotal: 650,
          capacityOccupied: 230,
          medicalOfficer: 'Dr. K. Srinivas, MBBS (94401 22891)',
          rationStatus: 'Dry Rations & Potable Water Active',
          helplines: ['112', '1077', '08818-222108'],
        },
        communityInfo: {
          upvotes: 1,
          verifiedLabelEn: `Active Red Zone on Govt Web Portal (${caseId})`,
          verifiedLabelTe: `ప్రభుత్వ పోర్టల్‌లో రెడ్ జోన్‌గా నమోదైనది (${caseId})`,
          isConfirmedByUser: true,
        },
      };

      onAddAlert(newAlert);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setReceivedDecision(null);
    setPersistedCaseId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cf]/40 flex flex-col animate-in zoom-in-95 max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#081534] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#fe8c58]">
              campaign
            </span>
            <div>
              <h2 className="font-display text-[16px] font-bold leading-tight">
                {language === 'en' ? 'Report a Civic Hazard' : 'ప్రమాదాన్ని నివేదించండి'}
              </h2>
              <span className="text-[11px] text-[#dae2fd]">
                {language === 'en'
                  ? 'Transmitted to Akashvani Government Portal'
                  : 'ఆకాశవాణి ప్రభుత్వ సర్వర్‌కు సమాచారం'}
              </span>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* DECISION SCREEN: If decision was returned from Government Platform */}
        {receivedDecision ? (
          <div className="p-4 flex flex-col gap-3.5 overflow-y-auto animate-in fade-in">
            {/* Success Banner */}
            <div className="bg-[#003313] text-white p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#95f8a7] text-[#00210a] flex items-center justify-center font-bold flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[14px]">
                  Government Decision Received in Seconds!
                </span>
                <span className="text-[11px] text-[#95f8a7] font-mono">
                  Saved Case ID: {persistedCaseId}
                </span>
              </div>
            </div>

            {/* Red Zone Announcement */}
            {receivedDecision.isRedZone && (
              <div className="bg-[#ba1a1a] text-white p-3.5 rounded-xl border border-red-300 shadow-md flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                    <span className="font-bold text-[13px] tracking-wide uppercase">
                      🚨 ACTIVE RED ZONE DECLARED ON GOVT WEBSITE
                    </span>
                  </div>
                  <span className="bg-white/20 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    DIVA ENGINE
                  </span>
                </div>
                <div className="text-[12px] text-white leading-snug">
                  {receivedDecision.redZoneNotice ||
                    'This area has been officially analyzed and declared as an active RED ZONE on the government web portal.'}
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg text-[11px] font-mono flex flex-col gap-1 border border-white/10">
                  <div>
                    <span className="text-red-200 font-bold">Government Case:</span>{' '}
                    {receivedDecision.portalCaseName}
                  </div>
                  <div>
                    <span className="text-red-200 font-bold">Official Location:</span>{' '}
                    {receivedDecision.portalCaseLocation}
                  </div>
                  <div>
                    <span className="text-red-200 font-bold">Designation:</span> CRITICAL RED ZONE
                    DANGER CORRIDOR
                  </div>
                </div>
              </div>
            )}

            {/* Decision Directive Card */}
            <div className="bg-[#f2f3ff] p-3.5 rounded-xl border-2 border-[#081534] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#ba1a1a] uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping"></span>
                  Official Decision Directive
                </span>
                <span className="text-[10px] text-[#76777f] font-mono">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="text-[14px] font-bold text-[#081534] leading-snug">
                {receivedDecision.actionRequired}
              </div>

              {/* Assigned Shelter & Evacuation route */}
              {receivedDecision.assignedShelter && (
                <div className="bg-white p-2.5 rounded-lg border border-[#eaedff] flex items-center justify-between mt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#76777f] block">
                      Assigned Safe Haven Shelter
                    </span>
                    <span className="text-[13px] font-bold text-[#081534]">
                      {receivedDecision.assignedShelter.name}
                    </span>
                    <span className="text-[11px] text-[#45464e] block">
                      Distance: {receivedDecision.assignedShelter.distanceKm} km • Est. Time: ~
                      {receivedDecision.assignedShelter.travelTimeMinutes} mins (via OSRM)
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[24px] text-[#43a55d]">
                    directions_run
                  </span>
                </div>
              )}

              {/* Dispatched Units */}
              {receivedDecision.dispatchUnits && (
                <div className="text-[11px] text-[#45464e] flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[15px] text-[#081534]">
                    local_shipping
                  </span>
                  <span>
                    <strong>Dispatched:</strong> {receivedDecision.dispatchUnits.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <a
                href="https://akashvani-production.up.railway.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] rounded-xl bg-[#081534] hover:bg-[#1e2a4a] text-white font-bold text-[13px] shadow flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                <span>View Registered Case on Government Web Portal</span>
              </a>

              <button
                onClick={handleResetAndClose}
                className="min-h-[44px] rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#081534] font-bold text-[13px] flex items-center justify-center transition-all"
              >
                Done &amp; View in Alerts Feed
              </button>
            </div>
          </div>
        ) : (
          /* INPUT FORM */
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 overflow-y-auto">
            {/* Category Selector */}
            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                {language === 'en' ? 'Hazard Classification' : 'ప్రమాద రకం'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'flood' as const, label: 'Flood / Inundation', icon: 'flood' },
                  { id: 'tree' as const, label: 'Fallen Tree / Block', icon: 'nature_people' },
                  { id: 'power' as const, label: 'Snapped Electric Wire', icon: 'bolt' },
                  { id: 'road' as const, label: 'Road / Culvert Breach', icon: 'alt_route' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setCategory(item.id)}
                    className={`p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border ${
                      category === item.id
                        ? 'bg-[#081534] text-white border-[#081534] shadow-xs'
                        : 'bg-[#f2f3ff] text-[#45464e] border-[#eaedff] hover:bg-[#eaedff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recorded Location & Live GPS Fix */}
            <div className="bg-[#f2f3ff] p-2.5 rounded-lg border border-[#eaedff] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-[#081534]">
                <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">pin_drop</span>
                <div>
                  <div className="font-bold">
                    {userLocation?.isLiveGps ? 'Live Device GPS Fix' : 'Recorded Place GPS Coordinate'}
                  </div>
                  <div className="text-[#45464e] font-mono text-[10px]">
                    {(userLocation?.latitude ?? 16.8142).toFixed(4)}° N, {(userLocation?.longitude ?? 81.5283).toFixed(4)}° E
                    {userLocation?.accuracyMeters ? ` (±${userLocation.accuracyMeters}m)` : ''} • {userLocation?.shortName || ward}
                  </div>
                </div>
              </div>
              <span className="bg-[#003313] text-[#95f8a7] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#95f8a7] animate-ping"></span>
                {userLocation?.isLiveGps ? 'Live GPS' : 'GPS Locked'}
              </span>
            </div>

            {/* Ward Selector */}
            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                {language === 'en' ? 'Tadepalligudem Ward Location' : 'వార్డు ఎంచుకోండి'}
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#c6c6cf] text-[13px] bg-white focus:outline-none focus:border-[#081534]"
              >
                <option>Ward 8 - Jagannadhapuram</option>
                <option>Ward 9 - Lowlands Canal Bund</option>
                <option>Ward 4 - Sai Baba Temple / Old Bus Stand</option>
                <option>Ward 6 - Subba Rao Road / Gandhi Park</option>
                <option>Ward 12 - Railway Feeder Crossing</option>
                <option>Ward 15 - RTC Complex / Bypass Road</option>
                <option>Pentapadu Rural Area</option>
              </select>
            </div>

            {/* Landmark / Street */}
            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                {language === 'en' ? 'Specific Landmark or Street' : 'సమీప ల్యాండ్‌మార్క్'}
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Ramalayam Temple / Door 8-12"
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#c6c6cf] text-[13px] focus:outline-none focus:border-[#081534]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                {language === 'en' ? 'Details & Severity' : 'వివరాలు మరియు తీవ్రత'}
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe situation (e.g., water level rising, wire sparking, vehicles blocked)..."
                className="w-full p-2.5 rounded-lg border border-[#c6c6cf] text-[13px] focus:outline-none focus:border-[#081534]"
              />
            </div>

            {/* Red Zone Option Checkbox */}
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="redzone-toggle"
                checked={markAsRedZone}
                onChange={(e) => setMarkAsRedZone(e.target.checked)}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="redzone-toggle"
                className="text-[11px] text-[#712800] leading-snug cursor-pointer"
              >
                <strong>Analyze &amp; Declare as RED ZONE on Government Website:</strong> Submitting
                this report feeds your location coordinates into the Akashvani DIVA Decision Engine,
                officially designating this area as an active <strong>RED ZONE</strong> on the
                live Government Portal (<code>akashvani-production.up.railway.app</code>).
              </label>
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                {language === 'en' ? 'Attach Photo Evidence' : 'ఫోటో జోడించండి'}
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 min-h-[38px] px-3 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#eaedff] text-[#081534] text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>{language === 'en' ? 'Select File' : 'ఫైల్ ఎంచుకోండి'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSimulateCamera}
                  className="min-h-[38px] px-3 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#081534] text-[12px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>{language === 'en' ? 'Camera' : 'కెమెరా'}</span>
                </button>
              </div>

              {photoPreview && (
                <div className="relative mt-2 rounded-lg overflow-hidden h-28 border border-[#c6c6cf]/50">
                  <img
                    src={photoPreview}
                    alt="Hazard preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-[12px]"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* GPS Auto-tag Stamp */}
            <div className="bg-[#f2f3ff] p-2.5 rounded-lg flex items-center justify-between text-[11px] text-[#45464e] border border-[#eaedff]">
              <span className="flex items-center gap-1 text-[#43a55d] font-semibold">
                <span className="material-symbols-outlined text-[15px]">my_location</span>
                <span>GPS: 16.8142° N, 81.5283° E</span>
              </span>
              <span className="text-[#081534] font-semibold font-mono">
                Server: akashvani-production
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[46px] rounded-xl bg-[#081534] hover:bg-[#1e2a4a] text-white font-bold text-[13px] shadow flex items-center justify-center gap-2 active:scale-95 transition-all mt-1 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Transmitting to Govt Server &amp; Generating Decision...</span>
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  <span>
                    {language === 'en'
                      ? 'Submit to Govt Server & Get Instant Decision'
                      : 'ప్రభుత్వ సర్వర్‌కు పంపండి (తక్షణ నిర్ణయం)'}
                  </span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
