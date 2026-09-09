import React, { useState } from 'react';
import { Language, AlertItem } from '../types';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  location: string;
  onAddAlert: (newAlert: AlertItem) => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  language,
  location,
  onAddAlert,
}) => {
  const [category, setCategory] = useState<'flood' | 'tree' | 'power' | 'water' | 'road'>('flood');
  const [ward, setWard] = useState('Ward 8 - Jagannadhapuram');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Generate simulated camera frame
    setPhotoPreview(
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      let titleEn = 'Waterlogging & Flood Inflow Reported';
      let titleTe = 'వరద నీరు నిల్వ మరియు ప్రవాహం నివేదించబడింది';
      let tagEn = 'COMMUNITY REPORTED • FLOOD';
      let tagTe = 'పౌరులు నివేదించిన సమాచారం • వరద';

      if (category === 'tree') {
        titleEn = 'Tree or Debris Road Blockage';
        titleTe = 'చెట్టు లేదా శిథిలాల వల్ల రోడ్డు దిగ్బంధం';
        tagEn = 'COMMUNITY REPORTED • TREE FALL';
        tagTe = 'పౌరులు నివేదించిన సమాచారం • చెట్టు పడటం';
      } else if (category === 'power') {
        titleEn = 'Snapped Live Electric Wire Risk';
        titleTe = 'తెగిపడిన విద్యుత్ తీగలు - ప్రమాదం';
        tagEn = 'COMMUNITY REPORTED • GRID HAZARD';
        tagTe = 'పౌరులు నివేదించిన సమాచారం • విద్యుత్ తీగలు';
      } else if (category === 'water') {
        titleEn = 'Muddy Water Pipeline Contamination';
        titleTe = 'పైప్‌లైన్ ద్వారా మురికి నీటి సరఫరా';
        tagEn = 'COMMUNITY REPORTED • HEALTH';
        tagTe = 'పౌరులు నివేదించిన సమాచారం • తాగునీరు';
      } else if (category === 'road') {
        titleEn = 'Road Washout & Culvert Breach';
        titleTe = 'రోడ్డు కొట్టుకుపోవడం & కల్వర్టు దెబ్బతినడం';
        tagEn = 'COMMUNITY REPORTED • CIVIL';
        tagTe = 'పౌరులు నివేదించిన సమాచారం • రోడ్డు రవాణా';
      }

      const newAlert: AlertItem = {
        id: `user-${Date.now()}`,
        category: ['civil', 'nearby'],
        severity: 'community',
        tagEn,
        tagTe,
        agency: 'CITIZEN VERIFIED',
        agencyType: 'community',
        timeAgoEn: 'Just now',
        timeAgoTe: 'ఇప్పుడే',
        titleEn: `${titleEn} — ${ward}`,
        titleTe: `${titleTe} — ${ward}`,
        distanceEn: '150m away',
        distanceTe: '150 మీటర్ల దూరంలో',
        locationEn: landmark || ward,
        locationTe: landmark || ward,
        descriptionEn: description || 'Hazard observed and verified by local resident. Dispatched to SDRF Ward Team for clearance.',
        descriptionTe: description || 'స్థానిక పౌరుడు గుర్తించి నివేదించిన ప్రమాదం. పరిష్కారం కొరకు మున్సిపల్ బృందానికి పంపబడింది.',
        communityInfo: {
          upvotes: 1,
          verifiedLabelEn: 'Citizens Upvoted & Verified on Ground',
          verifiedLabelTe: 'స్థానిక పౌరులచే ధృవీకరించబడింది',
          isConfirmedByUser: true,
        },
      };

      onAddAlert(newAlert);
      setIsSubmitting(false);
      onClose();
    }, 600);
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
                {language === 'en' ? 'Direct Dispatch to SDRF & Municipality' : 'ఎస్.డి.ఆర్.ఎఫ్ & మున్సిపల్ బృందాలకు సమాచారం'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

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

          {/* Photo Attachment (Real upload + simulated camera) */}
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
              <span>GPS Tag: 16.8142° N, 81.5283° E</span>
            </span>
            <span>Accuracy: ±4.2m</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[46px] rounded-xl bg-[#081534] hover:bg-[#1e2a4a] text-white font-bold text-[13px] shadow flex items-center justify-center gap-2 active:scale-95 transition-all mt-1 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Publishing to DDMA Stream...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>
                  {language === 'en'
                    ? 'Publish Geo-Tagged Incident'
                    : 'ప్రమాద నివేదికను పంపండి'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
