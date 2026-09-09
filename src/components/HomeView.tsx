import React, { useState } from 'react';
import { Language, NavTab } from '../types';
import { EMERGENCY_CONTACTS, SHELTERS_DATA } from '../data/mockData';

interface HomeViewProps {
  language: Language;
  onNavigateTab: (tab: NavTab) => void;
  onOpenSOS: () => void;
  location: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onNavigateTab,
  onOpenSOS,
  location,
}) => {
  const [isSafeMarked, setIsSafeMarked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleMarkSafe = () => {
    setIsSafeMarked(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Optional share to family via WhatsApp
    const safeText = `I have marked myself SAFE during the Godavari Flood advisory in ${location}. Recorded via Akashvani DPI Public Safety.`;
    if (navigator.share) {
      navigator.share({ title: 'Safety Confirmation', text: safeText }).catch(() => {});
    }
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 gap-4 max-w-2xl mx-auto">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#003313] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 border border-[#43a55d]">
          <span className="material-symbols-outlined text-[18px] text-[#43a55d]">verified</span>
          <span>
            {language === 'en'
              ? 'Safety status updated and logged with DDMA.'
              : 'మీరు సురక్షితంగా ఉన్నట్లు నమోదు చేయబడింది.'}
          </span>
        </div>
      )}

      {/* Critical Threat Overview Card */}
      <div className="bg-gradient-to-br from-[#081534] to-[#1e2a4a] text-white rounded-xl p-4 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#ba1a1a] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              {language === 'en' ? 'FLOOD LEVEL 2 WARNING' : 'వరద 2వ ప్రమాద హెచ్చరిక'}
            </span>
            <span className="text-[11px] text-[#dae2fd]">
              {language === 'en' ? 'Dowleswaram Barrage' : 'ధవళేశ్వరం బ్యారేజీ'}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#fe8c58] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">water</span>
            15.2L Cusecs
          </span>
        </div>

        <h2 className="font-display text-[22px] font-bold mt-2 leading-tight">
          {language === 'en'
            ? 'Godavari Inundation Staging Active'
            : 'గోదావరి వరద సహాయక చర్యలు ముమ్మరం'}
        </h2>
        <p className="text-[13px] text-[#dae2fd] mt-1 leading-snug">
          {language === 'en'
            ? `Canal discharge impacting lowlands across ${location}. 3 designated relief shelters and 4 SDRF boat units deployed.`
            : `కాలువ ఉధృతి వల్ల ${location} లోతట్టు ప్రాంతాలు ప్రభావితం. 3 పునరావాస కేంద్రాలు మరియు 4 బోట్ యూనిట్లు అందుబాటులో ఉన్నాయి.`}
        </p>

        {/* River Level Progress Meter */}
        <div className="mt-3 bg-white/10 p-2.5 rounded-lg">
          <div className="flex justify-between text-[11px] text-[#dae2fd] mb-1 font-medium">
            <span>{language === 'en' ? 'Current River Gauge: 14.8 ft' : 'ప్రస్తుత నీటిమట్టం: 14.8 అడుగులు'}</span>
            <span className="text-[#fe8c58] font-bold">
              {language === 'en' ? 'Danger Mark: 17.75 ft' : 'ప్రమాద స్థాయి: 17.75 అడుగులు'}
            </span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#fe8c58] to-[#ba1a1a] h-full rounded-full transition-all duration-1000"
              style={{ width: '83%' }}
            ></div>
          </div>
        </div>

        {/* Quick CTA to Alerts feed */}
        <div className="flex items-center gap-2 mt-3 pt-1">
          <button
            onClick={() => onNavigateTab('alerts')}
            className="flex-1 min-h-[40px] px-3 rounded-lg bg-white text-[#081534] text-[12px] font-bold shadow hover:bg-[#eaedff] active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <span>{language === 'en' ? 'View Public Safety Feed' : 'హెచ్చరికల ఫీడ్ చూడండి'}</span>
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
                ? 'Are you in a safe zone?'
                : 'మీరు సురక్షితమైన ప్రాంతంలో ఉన్నారా?'}
            </span>
            <span className="text-[11px] text-[#45464e] truncate">
              {language === 'en'
                ? 'Let local disaster teams & family know'
                : 'కుటుంబ సభ్యులకు సమాచారం అందించండి'}
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
                ? 'Shared'
                : 'పంపబడింది'
              : language === 'en'
              ? "I'm Safe"
              : 'నేను సురక్షితం'}
          </span>
        </button>
      </div>

      {/* Weather Radar Snapshot */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cf]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#081534]">cloud_sync</span>
            <h3 className="text-[14px] font-bold text-[#081534]">
              {language === 'en' ? 'Live Meteorological Radar' : 'వాతావరణ రాడార్ సమాచారం'}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
            IMD Amaravati
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-[#f2f3ff] p-2.5 rounded-lg">
            <span className="material-symbols-outlined text-[18px] text-[#081534]">rainy</span>
            <div className="text-[15px] font-bold text-[#131b2e] mt-0.5">38 mm/h</div>
            <div className="text-[10px] text-[#45464e]">
              {language === 'en' ? 'Precipitation' : 'వర్షపాతం'}
            </div>
          </div>
          <div className="bg-[#f2f3ff] p-2.5 rounded-lg">
            <span className="material-symbols-outlined text-[18px] text-[#9d4314]">air</span>
            <div className="text-[15px] font-bold text-[#131b2e] mt-0.5">54 km/h</div>
            <div className="text-[10px] text-[#45464e]">
              {language === 'en' ? 'Wind Gusts' : 'ఈదురుగాలులు'}
            </div>
          </div>
          <div className="bg-[#f2f3ff] p-2.5 rounded-lg">
            <span className="material-symbols-outlined text-[18px] text-[#43a55d]">waves</span>
            <div className="text-[15px] font-bold text-[#131b2e] mt-0.5">Vector #4</div>
            <div className="text-[10px] text-[#45464e]">
              {language === 'en' ? 'Flood Surge' : 'వరద వేగం'}
            </div>
          </div>
        </div>
      </div>

      {/* Nearest Relief Shelters Summary */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cf]/40 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#081534]">shelter</span>
            <h3 className="text-[14px] font-bold text-[#081534]">
              {language === 'en' ? 'Active Evacuation Shelters' : 'పునరావాస కేంద్రాల స్థితి'}
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('map')}
            className="text-[11px] font-bold text-[#9d4314] hover:underline flex items-center gap-0.5"
          >
            <span>{language === 'en' ? 'View Map' : 'మ్యాప్‌లో చూడండి'}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          {SHELTERS_DATA.map((shelter) => {
            const occupancyPct = Math.round((shelter.capacityOccupied / shelter.capacityTotal) * 100);
            return (
              <div
                key={shelter.id}
                className="bg-[#f2f3ff] p-2.5 rounded-lg flex flex-col gap-1 border border-[#eaedff]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#131b2e] truncate">
                    {language === 'en' ? shelter.nameEn : shelter.nameTe}
                  </span>
                  <span className="text-[11px] font-semibold text-[#45464e] flex-shrink-0">
                    {shelter.distance}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#45464e]">
                  <span>{shelter.medicalOfficer}</span>
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
