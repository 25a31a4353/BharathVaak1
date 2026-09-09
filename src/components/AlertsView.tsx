import React, { useState } from 'react';
import { AlertItem, AlertCategory, Language, NavTab } from '../types';

interface AlertsViewProps {
  alerts: AlertItem[];
  language: Language;
  onNavigateTab: (tab: NavTab) => void;
  onOpenReportModal: () => void;
  onConfirmCommunityAlert: (id: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  language,
  onNavigateTab,
  onOpenReportModal,
  onConfirmCommunityAlert,
}) => {
  const [activeFilter, setActiveFilter] = useState<AlertCategory>('all');
  const [expandedProtocols, setExpandedProtocols] = useState<Record<string, boolean>>({});
  const [expandedFeeders, setExpandedFeeders] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleProtocol = (id: string) => {
    setExpandedProtocols((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFeeder = (id: string) => {
    setExpandedFeeders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const speakAlert = (alert: AlertItem) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak =
        language === 'te'
          ? `${alert.titleTe}. ${alert.mandatoryActionTe || alert.descriptionTe}`
          : `${alert.titleEn}. ${alert.mandatoryActionEn || alert.descriptionEn}`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      showToast(language === 'te' ? 'ఆడియో హెచ్చరిక ప్లే అవుతోంది...' : 'Playing voice alert...');
    } else {
      showToast(language === 'te' ? 'ఆడియో సపోర్ట్ అందుబాటులో లేదు' : 'Audio speech not supported');
    }
  };

  const shareAlert = (alert: AlertItem) => {
    const title = language === 'te' ? alert.titleTe : alert.titleEn;
    const text = language === 'te' ? alert.descriptionTe : alert.descriptionEn;
    if (navigator.share) {
      navigator
        .share({
          title: `Akashvani Emergency: ${title}`,
          text: `[CIVIC CRISIS BULLETIN] ${title} - ${text}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(`[Akashvani Emergency Alert]\n${title}\n${text}`);
      showToast(language === 'te' ? 'హెచ్చరిక వివరాలు కాపీ చేయబడ్డాయి!' : 'Alert bulletin copied to clipboard!');
    }
  };

  // Filter logic
  const filteredAlerts = alerts.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category.includes(activeFilter);
  });

  const getFilterCount = (cat: AlertCategory) => {
    if (cat === 'all') return alerts.length;
    return alerts.filter((a) => a.category.includes(cat)).length;
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 gap-4 max-w-2xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#081534] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 border border-[#43a55d]">
          <span className="material-symbols-outlined text-[16px] text-[#43a55d]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Sub-bar */}
      <div className="flex items-center justify-between bg-[#f2f3ff] px-4 py-2 rounded-xl shadow-sm border border-[#eaedff]">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="absolute inline-flex w-full h-full rounded-full bg-[#ba1a1a] opacity-75 animate-ping"></span>
            <span className="relative inline-flex w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
          </div>
          <h2 className="font-display text-[20px] font-semibold text-[#081534] tracking-tight">
            {language === 'en' ? 'Live Public Safety Feed' : 'లైవ్ ప్రజా భద్రతా సమాచారం'}
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-[#dae2fd] px-2 py-0.5 rounded-full">
          <span
            className="material-symbols-outlined text-[14px] text-[#081534]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            sensors
          </span>
          <span className="text-[11px] font-bold text-[#081534] tracking-wider uppercase">
            {language === 'en' ? 'Active Radar' : 'యాక్టివ్ రాడార్'}
          </span>
        </div>
      </div>

      {/* Verification Confidence Banner */}
      <div className="flex items-start gap-2 bg-[#1e2a4a] text-white rounded-xl p-3 shadow-sm relative overflow-hidden">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#dae2fd]/20 flex items-center justify-center text-[#dae2ff] mt-0.5">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
        </div>
        <div className="flex flex-col min-w-0 pr-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-white">
              {language === 'en' ? 'Multi-Agency Verified' : 'బహుళ ప్రభుత్వ విభాగాలచే ధృవీకరించబడింది'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#43a55d]"></span>
          </div>
          <p className="text-[13px] text-[#dae2fd] line-clamp-2 mt-0.5 leading-snug">
            {language === 'en'
              ? 'Bulletins synchronized in real-time with District Disaster Management Authority (DDMA) & SDRF Command Tadepalligudem.'
              : 'జిల్లా విపత్తు నిర్వహణ సంస్థ (DDMA) & ఎస్.డి.ఆర్.ఎఫ్ కమాండ్ తాడేపల్లిగూడెంతో క్షణక్షణం అనుసంధానించబడిన బులెటిన్లు.'}
          </p>
        </div>
        <div className="absolute -right-3 -bottom-3 opacity-10 text-white pointer-events-none">
          <span className="material-symbols-outlined text-[64px]">shield</span>
        </div>
      </div>

      {/* Filter Pills (Scrollable Horizontal Strip) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" id="filter-container">
        {/* All */}
        <button
          onClick={() => setActiveFilter('all')}
          className={`min-h-[38px] px-3.5 py-1 rounded-full font-semibold text-[12px] flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeFilter === 'all'
              ? 'bg-[#081534] text-white shadow-sm'
              : 'bg-[#eaedff] text-[#45464e] hover:bg-[#dae2fd]'
          }`}
        >
          <span>{language === 'en' ? 'All Bulletins' : 'అన్ని బులెటిన్లు'}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              activeFilter === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-[#dae2fd] text-[#131b2e]'
            }`}
          >
            {getFilterCount('all')}
          </span>
        </button>

        {/* Critical */}
        <button
          onClick={() => setActiveFilter('critical')}
          className={`min-h-[38px] px-3.5 py-1 rounded-full font-semibold text-[12px] flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeFilter === 'critical'
              ? 'bg-[#081534] text-white shadow-sm'
              : 'bg-[#eaedff] text-[#45464e] hover:bg-[#dae2fd]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
          <span>{language === 'en' ? 'Critical' : 'తీవ్రమైనవి'}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              activeFilter === 'critical'
                ? 'bg-white/20 text-white'
                : 'bg-[#dae2fd] text-[#131b2e]'
            }`}
          >
            {getFilterCount('critical')}
          </span>
        </button>

        {/* Weather */}
        <button
          onClick={() => setActiveFilter('weather')}
          className={`min-h-[38px] px-3.5 py-1 rounded-full font-semibold text-[12px] flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeFilter === 'weather'
              ? 'bg-[#081534] text-white shadow-sm'
              : 'bg-[#eaedff] text-[#45464e] hover:bg-[#dae2fd]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">cyclone</span>
          <span>{language === 'en' ? 'Weather' : 'వాతావరణం'}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              activeFilter === 'weather'
                ? 'bg-white/20 text-white'
                : 'bg-[#dae2fd] text-[#131b2e]'
            }`}
          >
            {getFilterCount('weather')}
          </span>
        </button>

        {/* Nearby */}
        <button
          onClick={() => setActiveFilter('nearby')}
          className={`min-h-[38px] px-3.5 py-1 rounded-full font-semibold text-[12px] flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeFilter === 'nearby'
              ? 'bg-[#081534] text-white shadow-sm'
              : 'bg-[#eaedff] text-[#45464e] hover:bg-[#dae2fd]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">near_me</span>
          <span>{language === 'en' ? 'Nearby (<10km)' : 'సమీపంలో (<10km)'}</span>
        </button>

        {/* Civil */}
        <button
          onClick={() => setActiveFilter('civil')}
          className={`min-h-[38px] px-3.5 py-1 rounded-full font-semibold text-[12px] flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeFilter === 'civil'
              ? 'bg-[#081534] text-white shadow-sm'
              : 'bg-[#eaedff] text-[#45464e] hover:bg-[#dae2fd]'
          }`}
        >
          <span>{language === 'en' ? 'Civil' : 'పౌర రవాణా'}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              activeFilter === 'civil'
                ? 'bg-white/20 text-white'
                : 'bg-[#dae2fd] text-[#131b2e]'
            }`}
          >
            {getFilterCount('civil')}
          </span>
        </button>
      </div>

      {/* Incident Feeds Stream */}
      <div className="flex flex-col gap-4" id="feed-list">
        {filteredAlerts.map((item) => {
          // Determine styling based on severity / type
          let topColor = 'bg-[#525d80]';
          if (item.severity === 'critical') topColor = 'bg-[#ba1a1a]';
          else if (item.severity === 'high') topColor = 'bg-[#fe8c58]';
          else if (item.severity === 'community') topColor = 'bg-[#9d4314]';

          const isProtocolExpanded = !!expandedProtocols[item.id];
          const isFeederExpanded = !!expandedFeeders[item.id];

          return (
            <article
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-[#c6c6cf]/30 transition-all hover:shadow-lg"
            >
              {/* Color Accent Bar */}
              <div className={`h-1.5 w-full ${topColor}`} />

              <div className="p-4 flex flex-col gap-2">
                {/* Metadata Header */}
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* Tag */}
                    {item.severity === 'critical' ? (
                      <span className="bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
                        {language === 'en' ? item.tagEn : item.tagTe}
                      </span>
                    ) : item.severity === 'high' ? (
                      <span className="bg-[#ffdbcd] text-[#7d2d00] px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9d4314]"></span>
                        {language === 'en' ? item.tagEn : item.tagTe}
                      </span>
                    ) : item.severity === 'community' ? (
                      <span className="bg-[#ffdbcd] text-[#360f00] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">group</span>
                        {language === 'en' ? item.tagEn : item.tagTe}
                      </span>
                    ) : (
                      <span className="bg-[#e2e7ff] text-[#081534] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#081534]"></span>
                        {language === 'en' ? item.tagEn : item.tagTe}
                      </span>
                    )}

                    {/* Agency Badge */}
                    {item.severity === 'community' ? (
                      <span className="bg-[#eaedff] text-[#9d4314] text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">hourglass_empty</span>
                        {language === 'en' ? 'Under Civic Review' : 'పరిశీలనలో ఉంది'}
                      </span>
                    ) : (
                      <span className="bg-[#081534] text-white px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        {item.agency}
                      </span>
                    )}
                  </div>

                  {/* Timestamp / Distance info */}
                  <div className="flex items-center gap-1 text-[#45464e] text-[11px]">
                    {item.severity === 'community' ? (
                      <span>{language === 'en' ? item.distanceEn : item.distanceTe}</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        <span>{language === 'en' ? item.timeAgoEn : item.timeAgoTe}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-[17px] text-[#131b2e] font-bold leading-snug">
                  {language === 'en' ? item.titleEn : item.titleTe}
                </h3>

                {/* Geo & Scope */}
                {item.severity !== 'community' && (
                  <div className="flex items-center gap-2 text-[#45464e] text-[13px]">
                    <span className="flex items-center gap-0.5 font-semibold text-[#9d4314]">
                      <span className="material-symbols-outlined text-[16px]">
                        {item.severity === 'high' ? 'location_on' : 'distance'}
                      </span>
                      {language === 'en' ? item.distanceEn : item.distanceTe}
                    </span>
                    <span>•</span>
                    <span className="truncate">{language === 'en' ? item.locationEn : item.locationTe}</span>
                  </div>
                )}

                {/* Evacuation Advisory Box if mandatoryAction exists */}
                {(item.mandatoryActionEn || item.mandatoryActionTe) && (
                  <div className="bg-[#ffdad6]/40 p-3 rounded-lg flex items-start gap-2 my-1 border-l-3 border-[#ba1a1a]">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] flex-shrink-0 mt-0.5">
                      warning
                    </span>
                    <p className="text-[13px] text-[#131b2e] leading-relaxed">
                      <strong>{language === 'en' ? 'Mandatory Action: ' : 'తక్షణ చర్య: '}</strong>
                      {language === 'en' ? item.mandatoryActionEn : item.mandatoryActionTe}
                    </p>
                  </div>
                )}

                {/* Interactive Map Preview Slice if mapVector exists */}
                {item.mapVector && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden my-1 bg-[#eaedff] border border-[#c6c6cf]/50">
                    {/* Visual simulated water/contour vector background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1e2a4a] to-[#283044] opacity-90"></div>
                    <svg
                      className="absolute inset-0 w-full h-full opacity-20"
                      viewBox="0 0 400 100"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 40 Q 100 80 200 40 T 400 50 L 400 100 L 0 100 Z"
                        fill="#fe8c58"
                      />
                      <path
                        d="M0 60 Q 80 20 180 70 T 400 65 L 400 100 L 0 100 Z"
                        fill="#ba1a1a"
                      />
                      <circle cx="120" cy="50" r="18" fill="#ba1a1a" opacity="0.4" />
                      <circle cx="120" cy="50" r="6" fill="#ba1a1a" />
                    </svg>

                    <div className="absolute inset-0 bg-[#081534]/30 backdrop-blur-[1px] flex items-center justify-between px-4 text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-[#ba1a1a] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                          <span className="material-symbols-outlined text-[18px]">waves</span>
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[13px]">
                            {language === 'en' ? item.mapVector.labelEn : item.mapVector.labelTe}
                          </span>
                          <span className="text-[11px] text-[#dae2fd]">
                            {language === 'en' ? item.mapVector.statusEn : item.mapVector.statusTe}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateTab('map');
                        }}
                        className="min-h-[36px] px-3 rounded-lg bg-white text-[#081534] text-[12px] font-bold shadow hover:bg-[#eaedff] active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span>{language === 'en' ? 'View Map' : 'మ్యాప్ చూడండి'}</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Description for standard cards */}
                {!item.mapVector && (
                  <p className="text-[13px] text-[#45464e] leading-relaxed">
                    {language === 'en' ? item.descriptionEn : item.descriptionTe}
                  </p>
                )}

                {/* Community verification upvote row for community items */}
                {item.communityInfo && (
                  <div className="flex items-center justify-between bg-[#f2f3ff] p-2.5 rounded-lg my-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#fe8c58] text-[#712800] flex items-center justify-center text-[11px] font-bold">
                        {item.communityInfo.upvotes}
                      </div>
                      <span className="text-[12px] text-[#131b2e] font-medium">
                        {language === 'en'
                          ? item.communityInfo.verifiedLabelEn
                          : item.communityInfo.verifiedLabelTe}
                      </span>
                    </div>
                    <button
                      onClick={() => onConfirmCommunityAlert(item.id)}
                      disabled={item.communityInfo.isConfirmedByUser}
                      className={`min-h-[32px] px-2.5 rounded-lg text-[12px] font-semibold flex items-center gap-1 transition-all ${
                        item.communityInfo.isConfirmedByUser
                          ? 'bg-[#43a55d] text-white opacity-90'
                          : 'bg-white text-[#081534] shadow-sm hover:bg-[#eaedff] active:scale-95'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {item.communityInfo.isConfirmedByUser ? 'done' : 'thumb_up'}
                      </span>
                      <span>
                        {item.communityInfo.isConfirmedByUser
                          ? language === 'en'
                            ? `Confirmed (${item.communityInfo.upvotes})`
                            : `ధృవీకరించబడింది (${item.communityInfo.upvotes})`
                          : language === 'en'
                          ? 'Confirm'
                          : 'నిర్ధారించు'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Health info pills */}
                {item.healthInfo && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <div className="flex items-center gap-1 bg-[#f2f3ff] px-2.5 py-1 rounded-md text-[#081534] text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-[#43a55d]">
                        sanitizer
                      </span>
                      <span>
                        {language === 'en'
                          ? item.healthInfo.chlorineEn
                          : item.healthInfo.chlorineTe}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#f2f3ff] px-2.5 py-1 rounded-md text-[#081534] text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-[#ba1a1a]">
                        local_hospital
                      </span>
                      <span>
                        {language === 'en'
                          ? item.healthInfo.phcStatusEn
                          : item.healthInfo.phcStatusTe}
                      </span>
                    </div>
                  </div>
                )}

                {/* Power Grid Feeder Outage Toggle Button & Estimate */}
                {item.feederInfo && (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => toggleFeeder(item.id)}
                      className="min-h-[40px] px-3.5 rounded-lg bg-[#eaedff] text-[#081534] text-[12px] font-semibold flex items-center gap-1 active:scale-95 transition-transform hover:bg-[#dae2fd]"
                    >
                      <span>
                        {language === 'en' ? 'Feeder Outage List' : 'ఫీడర్ అంతరాయాల జాబితా'}
                      </span>
                      <span
                        className={`material-symbols-outlined text-[16px] transition-transform ${
                          isFeederExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    <span className="text-[11px] text-[#45464e] flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-[#43a55d]">
                        power_off
                      </span>
                      {language === 'en'
                        ? item.feederInfo.estRemainingEn
                        : item.feederInfo.estRemainingTe}
                    </span>
                  </div>
                )}

                {/* Feeder Outage Details Tray */}
                {item.feederInfo && isFeederExpanded && (
                  <div className="mt-2 bg-[#f2f3ff] p-3 rounded-lg text-[13px] text-[#45464e] leading-normal border border-[#eaedff] animate-in fade-in">
                    {language === 'en'
                      ? item.feederInfo.outageSectorsEn
                      : item.feederInfo.outageSectorsTe}
                  </div>
                )}

                {/* Card 1 & Main Actions (View Protocol, Audio, Share) */}
                {item.protocol && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => toggleProtocol(item.id)}
                      className="min-h-[42px] px-4 rounded-lg bg-[#081534] hover:bg-[#1e2a4a] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                    >
                      <span>
                        {isProtocolExpanded
                          ? language === 'en'
                            ? 'Hide Protocol'
                            : 'ప్రోటోకాల్ దాచు'
                          : language === 'en'
                          ? 'View Protocol'
                          : 'ప్రోటోకాల్ చూడండి'}
                      </span>
                      <span
                        className={`material-symbols-outlined text-[18px] transition-transform ${
                          isProtocolExpanded ? 'rotate-90' : ''
                        }`}
                      >
                        chevron_right
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => speakAlert(item)}
                        aria-label="Listen in Telugu or English"
                        className="min-h-[42px] min-w-[42px] rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#081534] active:scale-95 transition-all shadow-xs"
                        title={language === 'te' ? 'ఆడియో హెచ్చరిక వినండి' : 'Listen audio bulletin'}
                      >
                        <span className="material-symbols-outlined text-[20px]">volume_up</span>
                      </button>
                      <button
                        onClick={() => shareAlert(item)}
                        aria-label="Forward via WhatsApp or Copy"
                        className="min-h-[42px] min-w-[42px] rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#081534] active:scale-95 transition-all shadow-xs"
                        title="Forward / Share notice"
                      >
                        <span className="material-symbols-outlined text-[20px]">share</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Expandable Protocol Tray */}
                {item.protocol && isProtocolExpanded && (
                  <div className="mt-2 pt-2 bg-[#f2f3ff] p-3 rounded-lg flex flex-col gap-2 text-[13px] border border-[#eaedff] animate-in fade-in">
                    <div className="flex items-center justify-between text-[12px] text-[#081534] font-bold">
                      <span>{language === 'en' ? 'SHELTER CAMP DETAILS' : 'పునరావాస శిబిర వివరాలు'}</span>
                      <span className="text-[#43a55d]">
                        {language === 'en'
                          ? `Capacity: ${item.protocol.capacityOccupied}/${item.protocol.capacityTotal}`
                          : `సామర్థ్యం: ${item.protocol.capacityOccupied}/${item.protocol.capacityTotal}`}
                      </span>
                    </div>
                    <div className="w-full bg-[#dae2fd] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#081534] h-full rounded-full"
                        style={{
                          width: `${(item.protocol.capacityOccupied / item.protocol.capacityTotal) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-[#45464e] leading-snug">
                      <strong>{item.protocol.shelterName}</strong>. {item.protocol.medicalOfficer}. {item.protocol.rationStatus}.
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[12px] text-[#081534] font-semibold flex-wrap">
                      <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">call</span>
                      <span>
                        {language === 'en' ? 'Helpline: ' : 'హెల్ప్‌లైన్: '}
                        {item.protocol.helplines.join(' / ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty State if Filter has no items */}
      {filteredAlerts.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-[#f2f3ff] rounded-xl gap-2 border border-[#eaedff]">
          <div className="w-12 h-12 rounded-full bg-[#dae2fd] flex items-center justify-center text-[#081534]">
            <span className="material-symbols-outlined text-[28px]">task_alt</span>
          </div>
          <h4 className="font-display font-semibold text-[18px] text-[#081534]">
            {language === 'en' ? 'All Clear in this Category' : 'ఈ విభాగంలో ఎలాంటి ప్రమాదాలు లేవు'}
          </h4>
          <p className="text-[13px] text-[#45464e] max-w-[260px]">
            {language === 'en'
              ? 'No active civic hazards or severe advisories reported in this filter sector.'
              : 'ఈ విభాగంలో ప్రస్తుతం ఎలాంటి అత్యవసర హెచ్చరికలు నమోదు కాలేదు.'}
          </p>
        </div>
      )}

      {/* Sticky Bottom CTA: Citizen Incident Reporting */}
      <div className="sticky bottom-24 z-20 pt-2 pb-1">
        <div className="bg-[#081534] text-white p-3.5 rounded-xl shadow-lg flex items-center justify-between gap-2 border border-[#1e2a4a]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#9d4314] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">add_location_alt</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold leading-tight truncate">
                {language === 'en' ? 'Spotted a Hazard?' : 'ప్రమాదాన్ని గుర్తించారా?'}
              </span>
              <span className="text-[11px] text-[#dae2fd] truncate">
                {language === 'en'
                  ? 'Instant geo-tagged SDRF citizen report'
                  : 'జియో-ట్యాగ్ చేయబడిన పౌర నివేదికను పంపండి'}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenReportModal}
            className="min-h-[42px] px-3.5 rounded-lg bg-white text-[#081534] text-[12px] font-bold whitespace-nowrap shadow hover:bg-[#eaedff] active:scale-95 transition-all flex items-center gap-1"
          >
            <span>{language === 'en' ? 'Report Now' : 'నివేదించండి'}</span>
            <span className="material-symbols-outlined text-[16px] text-[#9d4314]">campaign</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Pill Cluster */}
      <div className="flex items-center justify-between px-1 py-1 text-[#45464e] text-[11px]">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#43a55d] animate-pulse"></span>
          <span>{language === 'en' ? 'DDMA Link: Synchronized' : 'DDMA లింక్: అనుసంధానించబడింది'}</span>
        </span>
        <span className="font-semibold text-[#081534]">District Code: AP-WGD-TDP</span>
      </div>
    </div>
  );
};
