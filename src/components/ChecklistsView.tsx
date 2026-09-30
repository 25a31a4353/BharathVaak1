import React, { useState, useEffect, useMemo } from 'react';
import { Language, NavTab, UserLocationState } from '../types';
import { DISASTER_CHECKLISTS, DisasterGuide, ChecklistItem, SurvivalHack, HelplineContact } from '../data/checklistsData';

interface ChecklistsViewProps {
  language: Language;
  onNavigateTab: (tab: NavTab) => void;
  userLocation: UserLocationState;
  initialDisasterId?: string;
}

export const ChecklistsView: React.FC<ChecklistsViewProps> = ({
  language,
  onNavigateTab,
  userLocation,
  initialDisasterId = 'cyclone',
}) => {
  const [selectedDisasterId, setSelectedDisasterId] = useState<string>(initialDisasterId);
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'before' | 'during' | 'after'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [criticalOnly, setCriticalOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeTab, setActiveTab] = useState<'checklist' | 'calculator' | 'survival' | 'helplines'>('checklist');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [smsModalOpen, setSmsModalOpen] = useState<boolean>(false);
  const [smsRecipient, setSmsRecipient] = useState<string>('');
  const [customSmsNotes, setCustomSmsNotes] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Household Calculator state
  const [household, setHousehold] = useState({
    adults: 2,
    children: 1,
    seniors: 1,
    pets: 0,
    evacDays: 3,
  });

  // Checklist completion state persisted in localStorage
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('akashvani_checklists_state');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track online/offline status in real-time
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save checked items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('akashvani_checklists_state', JSON.stringify(checkedItems));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [checkedItems]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const currentGuide = useMemo<DisasterGuide>(() => {
    return (
      DISASTER_CHECKLISTS.find((g) => g.id === selectedDisasterId) ||
      DISASTER_CHECKLISTS[0]
    );
  }, [selectedDisasterId]);

  // Aggregate items according to selected phase
  const allCurrentItems = useMemo<ChecklistItem[]>(() => {
    const { before, during, after } = currentGuide.phases;
    if (selectedPhase === 'before') return before;
    if (selectedPhase === 'during') return during;
    if (selectedPhase === 'after') return after;
    return [...before, ...during, ...after];
  }, [currentGuide, selectedPhase]);

  // Filtered items
  const filteredItems = useMemo<ChecklistItem[]>(() => {
    return allCurrentItems.filter((item) => {
      if (criticalOnly && !item.isCritical) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesEn =
          item.titleEn.toLowerCase().includes(query) ||
          item.descriptionEn.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query);
        const matchesTe =
          item.titleTe.includes(query) ||
          item.descriptionTe.includes(query);
        return matchesEn || matchesTe;
      }
      return true;
    });
  }, [allCurrentItems, criticalOnly, selectedCategory, searchQuery]);

  // Completion calculation for selected guide
  const guideTotalItems = useMemo(() => {
    const { before, during, after } = currentGuide.phases;
    return [...before, ...during, ...after];
  }, [currentGuide]);

  const guideCompletedCount = useMemo(() => {
    return guideTotalItems.filter((i) => !!checkedItems[i.id]).length;
  }, [guideTotalItems, checkedItems]);

  const guideProgressPct = Math.round(
    guideTotalItems.length > 0 ? (guideCompletedCount / guideTotalItems.length) * 100 : 0
  );

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      return next;
    });
  };

  const handleMarkAllCurrent = (markAs: boolean) => {
    setCheckedItems((prev) => {
      const next = { ...prev };
      filteredItems.forEach((item) => {
        next[item.id] = markAs;
      });
      return next;
    });
    showToast(
      language === 'en'
        ? markAs
          ? 'Marked items as completed'
          : 'Cleared marked items'
        : markAs
        ? 'అంశాలు పూర్తయినట్లు గుర్తించబడ్డాయి'
        : 'గుర్తులను తొలగించారు'
    );
  };

  const handleResetGuide = () => {
    setCheckedItems((prev) => {
      const next = { ...prev };
      guideTotalItems.forEach((item) => {
        delete next[item.id];
      });
      return next;
    });
    showToast(language === 'en' ? 'Checklist reset for this disaster.' : 'ఈ విపత్తు చెక్‌లిస్ట్ పునఃప్రారంభించబడింది.');
  };

  // Calculator computations
  const totalPersons = household.adults + household.children + household.seniors;
  const waterLitersNeeded =
    (household.adults * 3 + household.children * 2 + household.seniors * 3 + household.pets * 1) *
    household.evacDays;
  const orsPacketsNeeded = totalPersons * household.evacDays * 2;
  const chlorineTabletsNeeded = Math.ceil(waterLitersNeeded / 5);
  const batterySetsNeeded = Math.max(4, totalPersons * 2);
  const dryRationKg = Math.round(totalPersons * household.evacDays * 0.45 * 10) / 10;

  // Generate offline SMS string
  const generateOfflineSmsBody = () => {
    const locationStr = userLocation.displayName || userLocation.shortName;
    const gpsStr = `${userLocation.latitude.toFixed(4)},${userLocation.longitude.toFixed(4)}`;
    const familyCount = totalPersons;
    const pendingCritical = guideTotalItems.filter((i) => i.isCritical && !checkedItems[i.id]).length;

    let base = currentGuide.offlineSmsTemplate
      .replace('[LOCATION]', `${locationStr} (GPS ${gpsStr})`)
      .replace('[HOUSE_NO]', locationStr)
      .replace('[LOCATION/HOUSE_NO]', locationStr)
      .replace('[COUNT]', `${familyCount} family members`)
      .replace('[CHILDREN/ELDERLY]', `${household.children} children, ${household.seniors} seniors`)
      .replace('[SAFE_ZONE]', 'Designated Relief Camp')
      .replace('[SHELTER_NAME]', 'Nearest High School Shelter')
      .replace('[FEET]', '2-3')
      .replace('[STREET/WARD]', locationStr);

    if (customSmsNotes) {
      base += ` Note: ${customSmsNotes}`;
    }
    base += ` [Status: ${guideProgressPct}% prepared, ${pendingCritical} critical pending]`;
    return base;
  };

  const handleSendOfflineSms = () => {
    const body = encodeURIComponent(generateOfflineSmsBody());
    const recipient = smsRecipient.trim();
    // Native SMS intent protocol works 100% offline without cellular data
    const url = recipient ? `sms:${recipient}?body=${body}` : `sms:?body=${body}`;
    window.location.href = url;
    setSmsModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 gap-4 max-w-2xl mx-auto">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#081534] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 border border-[#43a55d] animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px] text-[#43a55d]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Offline Status Badge Banner */}
      <div
        className={`rounded-xl p-3 flex items-center justify-between border shadow-xs transition-all ${
          !isOnline
            ? 'bg-[#081534] text-white border-[#43a55d]'
            : 'bg-[#e7f7ed] text-[#0f5128] border-[#43a55d]/40'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              !isOnline ? 'bg-[#43a55d] text-[#00210a]' : 'bg-[#43a55d]/20 text-[#216b35]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {!isOnline ? 'offline_bolt' : 'cloud_done'}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-extrabold uppercase tracking-wide">
                {!isOnline
                  ? language === 'en'
                    ? '100% Offline Mode Active'
                    : 'పూర్తి ఆఫ్‌లైన్ మోడ్ యాక్టివ్'
                  : language === 'en'
                  ? 'Offline Ready & Synced'
                  : 'ఆఫ్‌లైన్ కోసం సిద్ధంగా ఉంది'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  !isOnline ? 'bg-[#43a55d] animate-pulse' : 'bg-[#216b35]'
                }`}
              />
            </div>
            <span
              className={`text-[11px] leading-tight ${
                !isOnline ? 'text-[#dae2fd]' : 'text-[#216b35]'
              }`}
            >
              {language === 'en'
                ? 'All emergency checklists, local survival guides & phone helplines work without cellular data.'
                : 'ఇంటర్నెట్ లేదా డేటా లేకుండానే అన్ని మార్గదర్శకాలు, ఫోన్ నంబర్లు పని చేస్తాయి.'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowPrintModal(true)}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-colors ${
            !isOnline
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              : 'bg-white hover:bg-white/90 text-[#081534] border-[#c6c6cf]/60 shadow-xs'
          }`}
          title="Print or save offline pocket summary"
        >
          <span className="material-symbols-outlined text-[15px]">print</span>
          <span className="hidden xs:inline">
            {language === 'en' ? 'Pocket Card' : 'ప్రింట్'}
          </span>
        </button>
      </div>

      {/* View Header with Localized Region */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[22px] text-[#081534]">fact_check</span>
            <h1 className="text-[18px] font-display font-extrabold text-[#081534] tracking-tight">
              {language === 'en' ? 'Disaster Preparedness Checklists' : 'విపత్తు రక్షణ చెక్‌లిస్ట్‌లు'}
            </h1>
          </div>
          <p className="text-[12px] text-[#45464e] mt-0.5">
            {language === 'en'
              ? `Actionable safety protocols for ${userLocation.shortName} and Godavari basin`
              : `${userLocation.shortName} & పరిసర ప్రాంతాల కోసం ప్రాణరక్షణ నిబంధనలు`}
          </p>
        </div>

        <button
          onClick={() => setSmsModalOpen(true)}
          className="px-2.5 py-1.5 rounded-lg bg-[#ba1a1a] hover:bg-[#a01616] text-white text-[11px] font-bold shadow-xs flex items-center gap-1 transition-all active:scale-95 flex-shrink-0"
          title="Compose Emergency Status SMS (works offline)"
        >
          <span className="material-symbols-outlined text-[15px]">sms</span>
          <span className="hidden xs:inline">{language === 'en' ? 'Offline SMS' : 'ఆఫ్‌లైన్ SMS'}</span>
        </button>
      </div>

      {/* Horizontal Disaster Guide Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
        {DISASTER_CHECKLISTS.map((guide) => {
          const isSelected = guide.id === selectedDisasterId;
          const items = [...guide.phases.before, ...guide.phases.during, ...guide.phases.after];
          const completed = items.filter((i) => checkedItems[i.id]).length;
          const pct = Math.round(items.length > 0 ? (completed / items.length) * 100 : 0);

          return (
            <button
              key={guide.id}
              onClick={() => {
                setSelectedDisasterId(guide.id);
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-[#081534] text-white border-[#081534] shadow-sm'
                  : 'bg-white hover:bg-[#f2f3ff] text-[#45464e] border-[#c6c6cf]/40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[18px] ${
                  isSelected ? 'bg-white/15 text-white' : 'bg-[#f2f3ff] text-[#081534]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{guide.icon}</span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[12px] font-bold leading-tight ${
                    isSelected ? 'text-white' : 'text-[#131b2e]'
                  }`}
                >
                  {language === 'en' ? guide.titleEn.split(' ')[0] : guide.titleTe.split(' ')[0]}
                </span>
                <span
                  className={`text-[10px] ${
                    isSelected ? 'text-[#dae2fd]' : 'text-[#76777f]'
                  }`}
                >
                  {pct}% {language === 'en' ? 'Ready' : 'సిద్ధం'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Selected Disaster Hero Card & Progress Ring */}
      <div className="bg-gradient-to-br from-[#081534] to-[#172554] text-white rounded-2xl p-4 shadow-md flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#43a55d] text-[#00210a]">
                {language === 'en' ? currentGuide.badgeEn : currentGuide.badgeTe}
              </span>
              <span className="text-[10px] text-[#dae2fd]/80">
                {currentGuide.officialSource}
              </span>
            </div>

            <h2 className="text-[16px] font-display font-extrabold text-white mt-1 leading-snug">
              {language === 'en' ? currentGuide.titleEn : currentGuide.titleTe}
            </h2>

            <p className="text-[11px] text-[#dae2fd] mt-1 leading-relaxed">
              {language === 'en' ? currentGuide.summaryEn : currentGuide.summaryTe}
            </p>
          </div>

          {/* Interactive Progress Meter */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 bg-white/10 p-2.5 rounded-xl backdrop-blur-xs min-w-[76px] text-center border border-white/15">
            <span className="text-[20px] font-extrabold font-mono text-[#43a55d] leading-none">
              {guideProgressPct}%
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#dae2fd] mt-1 font-bold">
              {language === 'en' ? 'Prepared' : 'సిద్ధత'}
            </span>
            <span className="text-[9px] text-white/70 mt-0.5 font-mono">
              {guideCompletedCount}/{guideTotalItems.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#43a55d] to-[#7be698] transition-all duration-300 rounded-full"
            style={{ width: `${guideProgressPct}%` }}
          />
        </div>

        {/* Localized Basin Context Callout */}
        <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 flex items-center gap-2 text-[11px] text-[#dae2fd]">
          <span className="material-symbols-outlined text-[18px] text-[#43a55d] flex-shrink-0">
            location_on
          </span>
          <span className="leading-tight">
            {language === 'en' ? currentGuide.localContextEn : currentGuide.localContextTe}
          </span>
        </div>
      </div>

      {/* Sub-Navigation: Checklist vs Household Calculator vs Survival Hacks vs Helplines */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#eaedff] rounded-xl text-center text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'checklist'
              ? 'bg-white text-[#081534] shadow-xs'
              : 'text-[#45464e] hover:text-[#081534]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">checklist</span>
          <span>{language === 'en' ? 'Checklist' : 'జాబితా'}</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'calculator'
              ? 'bg-white text-[#081534] shadow-xs'
              : 'text-[#45464e] hover:text-[#081534]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">calculate</span>
          <span>{language === 'en' ? '72h Kit' : 'కిట్ కాలిక్యులేటర్'}</span>
        </button>

        <button
          onClick={() => setActiveTab('survival')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'survival'
              ? 'bg-white text-[#081534] shadow-xs'
              : 'text-[#45464e] hover:text-[#081534]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">lightbulb</span>
          <span>{language === 'en' ? 'Life Hacks' : 'రక్షణ పద్ధతులు'}</span>
        </button>

        <button
          onClick={() => setActiveTab('helplines')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'helplines'
              ? 'bg-white text-[#081534] shadow-xs'
              : 'text-[#45464e] hover:text-[#081534]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">call</span>
          <span>{language === 'en' ? 'Hotlines' : 'హెల్ప్‌లైన్లు'}</span>
        </button>
      </div>

      {/* TAB 1: CHECKLIST VIEW */}
      {activeTab === 'checklist' && (
        <div className="flex flex-col gap-3">
          {/* Phase Filter Tabs (Before / During / After) */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            <div className="flex items-center gap-1">
              {[
                { id: 'all', labelEn: 'All Phases', labelTe: 'అన్నీ' },
                { id: 'before', labelEn: 'Before (Prep)', labelTe: 'ముందుగా' },
                { id: 'during', labelEn: 'During (Impact)', labelTe: 'విపత్తు వేళ' },
                { id: 'after', labelEn: 'After (Safe Return)', labelTe: 'ముగిశాక' },
              ].map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setSelectedPhase(phase.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    selectedPhase === phase.id
                      ? 'bg-[#081534] text-white shadow-xs'
                      : 'bg-white text-[#45464e] hover:bg-[#eaedff] border border-[#c6c6cf]/40'
                  }`}
                >
                  {language === 'en' ? phase.labelEn : phase.labelTe}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCriticalOnly(!criticalOnly)}
              className={`flex-shrink-0 px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-colors ${
                criticalOnly
                  ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                  : 'bg-white text-[#ba1a1a] border-[#ba1a1a]/40 hover:bg-[#ba1a1a]/5'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span>{language === 'en' ? 'Critical Only' : 'ముఖ్యమైనవి'}</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-[#76777f]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Search checklist (water, roof, documents...)'
                    : 'శోధించండి (నీరు, పత్రాలు, విద్యుత్...)'
                }
                className="w-full pl-8 pr-7 py-1.5 rounded-xl text-[12px] bg-white border border-[#c6c6cf]/50 focus:outline-none focus:ring-2 focus:ring-[#081534] text-[#131b2e]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#76777f] hover:text-[#131b2e]"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>

            {/* Quick Bulk Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMarkAllCurrent(true)}
                className="p-1.5 bg-white hover:bg-[#e7f7ed] text-[#216b35] border border-[#c6c6cf]/40 rounded-lg transition-colors"
                title="Mark visible items as completed"
              >
                <span className="material-symbols-outlined text-[17px]">done_all</span>
              </button>
              <button
                onClick={handleResetGuide}
                className="p-1.5 bg-white hover:bg-[#ffdad6] text-[#ba1a1a] border border-[#c6c6cf]/40 rounded-lg transition-colors"
                title="Reset checklist for this disaster"
              >
                <span className="material-symbols-outlined text-[17px]">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
            {['all', 'Structural', 'Water & Food', 'Medical', 'Power & Comms', 'Documents', 'Livestock'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-full font-bold flex-shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#081534] text-white'
                    : 'bg-[#eaedff] text-[#45464e] hover:bg-[#dae2fd]'
                }`}
              >
                {cat === 'all' ? (language === 'en' ? 'All Categories' : 'అన్ని విభాగాలు') : cat}
              </button>
            ))}
          </div>

          {/* Checklist Items List */}
          <div className="flex flex-col gap-2 mt-1">
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center border border-[#c6c6cf]/40 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[36px] text-[#76777f]">
                  search_off
                </span>
                <span className="text-[13px] font-bold text-[#131b2e]">
                  {language === 'en' ? 'No matching action items' : 'ఎలాంటి అంశాలు కనిపించలేదు'}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setCriticalOnly(false);
                    setSelectedPhase('all');
                  }}
                  className="text-[11px] text-[#081534] font-bold underline"
                >
                  {language === 'en' ? 'Clear all filters' : 'ఫిల్టర్లను తొలగించండి'}
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                      isChecked
                        ? 'bg-[#f4f7f4] border-[#43a55d]/40 opacity-80'
                        : item.isCritical
                        ? 'bg-white border-[#ba1a1a]/30 shadow-xs hover:border-[#ba1a1a]'
                        : 'bg-white border-[#c6c6cf]/40 shadow-xs hover:border-[#081534]'
                    }`}
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-[#43a55d] text-white'
                          : 'border-2 border-[#76777f] hover:border-[#081534]'
                      }`}
                    >
                      {isChecked && (
                        <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.isCritical && (
                          <span className="bg-[#ba1a1a] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">priority_high</span>
                            CRITICAL
                          </span>
                        )}
                        <span className="text-[9px] font-semibold text-[#5a5c68] bg-[#eaedff] px-1.5 py-0.2 rounded">
                          {item.category}
                        </span>
                      </div>

                      <h3
                        className={`text-[13px] font-bold mt-1 leading-snug ${
                          isChecked ? 'line-through text-[#76777f]' : 'text-[#131b2e]'
                        }`}
                      >
                        {language === 'en' ? item.titleEn : item.titleTe}
                      </h3>

                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${
                          isChecked ? 'text-[#76777f]' : 'text-[#45464e]'
                        }`}
                      >
                        {language === 'en' ? item.descriptionEn : item.descriptionTe}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HOUSEHOLD 72-HOUR KIT CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-xl p-4 border border-[#c6c6cf]/40 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#15803d]">backpack</span>
                <h3 className="text-[14px] font-bold text-[#081534]">
                  {language === 'en'
                    ? '72-Hour Household Supply Calculator'
                    : 'కుటుంబ అత్యవసర కిట్ కాలిక్యులేటర్'}
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#15803d] bg-[#e7f7ed] px-2 py-0.5 rounded-full">
                {totalPersons} {language === 'en' ? 'People' : 'వ్యక్తులు'}
              </span>
            </div>

            <p className="text-[11px] text-[#45464e]">
              {language === 'en'
                ? 'Adjust your household headcount to calculate exact life-support rations required before municipal services restore.'
                : 'మీ కుటుంబ సభ్యుల సంఖ్యను నమోదు చేయండి. 3 రోజుల అత్యవసర తాగునీరు, మందులు మరియు ఆహార అవసరాలను లెక్కిస్తుంది.'}
            </p>

            {/* Stepper Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Adults */}
              <div className="bg-[#f2f3ff] p-2.5 rounded-xl border border-[#eaedff] flex flex-col gap-1 text-center">
                <span className="text-[11px] font-bold text-[#131b2e]">
                  {language === 'en' ? 'Adults' : 'పెద్దలు'}
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    onClick={() =>
                      setHousehold((prev) => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))
                    }
                    className="w-7 h-7 rounded-lg bg-white shadow-xs border border-[#c6c6cf]/50 font-bold text-[#081534] active:scale-95 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-[14px] font-bold font-mono min-w-[20px]">
                    {household.adults}
                  </span>
                  <button
                    onClick={() => setHousehold((prev) => ({ ...prev, adults: prev.adults + 1 }))}
                    className="w-7 h-7 rounded-lg bg-white shadow-xs border border-[#c6c6cf]/50 font-bold text-[#081534] active:scale-95 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="bg-[#f2f3ff] p-2.5 rounded-xl border border-[#eaedff] flex flex-col gap-1 text-center">
                <span className="text-[11px] font-bold text-[#131b2e]">
                  {language === 'en' ? 'Children (<12)' : 'చిన్నపిల్లలు'}
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    onClick={() =>
                      setHousehold((prev) => ({ ...prev, children: Math.max(0, prev.children - 1) }))
                    }
                    className="w-7 h-7 rounded-lg bg-white shadow-xs border border-[#c6c6cf]/50 font-bold text-[#081534] active:scale-95 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-[14px] font-bold font-mono min-w-[20px]">
                    {household.children}
                  </span>
                  <button
                    onClick={() =>
                      setHousehold((prev) => ({ ...prev, children: prev.children + 1 }))
                    }
                    className="w-7 h-7 rounded-lg bg-white shadow-xs border border-[#c6c6cf]/50 font-bold text-[#081534] active:scale-95 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Seniors */}
              <div className="bg-[#f2f3ff] p-2.5 rounded-xl border border-[#eaedff] flex flex-col gap-1 text-center">
                <span className="text-[11px] font-bold text-[#131b2e]">
                  {language === 'en' ? 'Seniors (60+)' : 'వృద్ధులు'}
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    onClick={() =>
                      setHousehold((prev) => ({ ...prev, seniors: Math.max(0, prev.seniors - 1) }))
                    }
                    className="w-7 h-7 rounded-lg bg-white shadow-xs border border-[#c6c6cf]/50 font-bold text-[#081534] active:scale-95 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-[14px] font-bold font-mono min-w-[20px]">
                    {household.seniors}
                  </span>
                  <button
                    onClick={() =>
                      setHousehold((prev) => ({ ...prev, seniors: prev.seniors + 1 }))
                    }
                    className="w-7 h-7 rounded-lg bg-white shadow-xs border border-[#c6c6cf]/50 font-bold text-[#081534] active:scale-95 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Days to Cover */}
              <div className="bg-[#f2f3ff] p-2.5 rounded-xl border border-[#eaedff] flex flex-col gap-1 text-center">
                <span className="text-[11px] font-bold text-[#131b2e]">
                  {language === 'en' ? 'Survival Days' : 'రోజుల సంఖ్య'}
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    onClick={() =>
                      setHousehold((prev) => ({ ...prev, evacDays: Math.max(1, prev.evacDays - 1) }))
                    }
                    className="w-7 h-7 rounded-lg bg-white shadow-xs border border-[#c6c6cf]/50 font-bold text-[#081534] active:scale-95 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-[14px] font-bold font-mono min-w-[20px]">
                    {household.evacDays}d
                  </span>
                  <button
                    onClick={() =>
                      setHousehold((prev) => ({ ...prev, evacDays: Math.min(7, prev.evacDays + 1) }))
                    }
                    className="w-7 h-7 rounded-lg bg-white shadow-xs border border-[#c6c6cf]/50 font-bold text-[#081534] active:scale-95 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Quantities Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2">
              <div className="bg-[#081534] text-white p-3 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#43a55d]">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                  <span className="text-[10px] font-bold uppercase">Target</span>
                </div>
                <div className="mt-2">
                  <div className="text-[22px] font-extrabold font-mono leading-none">
                    {waterLitersNeeded}L
                  </div>
                  <div className="text-[11px] text-[#dae2fd] mt-1">
                    {language === 'en' ? 'Potable Drinking Water' : 'తాగునీరు (లీటర్లు)'}
                  </div>
                  <div className="text-[9px] text-[#dae2fd]/70 mt-0.5">
                    (3L/day per person)
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#c6c6cf]/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#ea580c]">
                  <span className="material-symbols-outlined text-[20px]">cookie</span>
                  <span className="text-[10px] font-bold uppercase text-[#76777f]">Rations</span>
                </div>
                <div className="mt-2">
                  <div className="text-[22px] font-extrabold font-mono text-[#131b2e] leading-none">
                    {dryRationKg} kg
                  </div>
                  <div className="text-[11px] text-[#45464e] mt-1">
                    {language === 'en' ? 'Non-Perishable Food' : 'పొడి ఆహారం (అటుకులు)'}
                  </div>
                  <div className="text-[9px] text-[#76777f] mt-0.5">
                    (Ready to eat, no heat)
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#c6c6cf]/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#15803d]">
                  <span className="material-symbols-outlined text-[20px]">medication</span>
                  <span className="text-[10px] font-bold uppercase text-[#76777f]">Medical</span>
                </div>
                <div className="mt-2">
                  <div className="text-[22px] font-extrabold font-mono text-[#131b2e] leading-none">
                    {orsPacketsNeeded} pkts
                  </div>
                  <div className="text-[11px] text-[#45464e] mt-1">
                    {language === 'en' ? 'WHO-Formula ORS' : 'ఓఆర్ఎస్ ప్యాకెట్లు'}
                  </div>
                  <div className="text-[9px] text-[#76777f] mt-0.5">
                    (For dehydration/cholera)
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#c6c6cf]/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#0284c7]">
                  <span className="material-symbols-outlined text-[20px]">sanitizer</span>
                  <span className="text-[10px] font-bold uppercase text-[#76777f]">Sanitation</span>
                </div>
                <div className="mt-2">
                  <div className="text-[22px] font-extrabold font-mono text-[#131b2e] leading-none">
                    {chlorineTabletsNeeded} tabs
                  </div>
                  <div className="text-[11px] text-[#45464e] mt-1">
                    {language === 'en' ? 'Chlorine Purification' : 'క్లోరిన్ మాత్రలు'}
                  </div>
                  <div className="text-[9px] text-[#76777f] mt-0.5">
                    (1 tab per 5L clear water)
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#c6c6cf]/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#7c3aed]">
                  <span className="material-symbols-outlined text-[20px]">battery_charging_full</span>
                  <span className="text-[10px] font-bold uppercase text-[#76777f]">Power</span>
                </div>
                <div className="mt-2">
                  <div className="text-[22px] font-extrabold font-mono text-[#131b2e] leading-none">
                    {batterySetsNeeded} cells
                  </div>
                  <div className="text-[11px] text-[#45464e] mt-1">
                    {language === 'en' ? 'Torch Batteries' : 'టార్చ్ లైట్ బ్యాటరీలు'}
                  </div>
                  <div className="text-[9px] text-[#76777f] mt-0.5">
                    (Alkaline AA/AAA)
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#c6c6cf]/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#b91c1c]">
                  <span className="material-symbols-outlined text-[20px]">pill</span>
                  <span className="text-[10px] font-bold uppercase text-[#76777f]">Chronic</span>
                </div>
                <div className="mt-2">
                  <div className="text-[22px] font-extrabold font-mono text-[#131b2e] leading-none">
                    15 days
                  </div>
                  <div className="text-[11px] text-[#45464e] mt-1">
                    {language === 'en' ? 'Prescription Meds' : 'బీపీ, షుగర్ మందులు'}
                  </div>
                  <div className="text-[9px] text-[#76777f] mt-0.5">
                    (Waterproof container)
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                showToast(
                  language === 'en'
                    ? `Calculated requirements saved for ${totalPersons} persons.`
                    : `${totalPersons} మందికి అవసరమైన కిట్ వివరాలు భద్రపరచబడ్డాయి.`
                );
                setSelectedDisasterId('gobag');
                setActiveTab('checklist');
              }}
              className="w-full mt-1 py-2.5 rounded-xl bg-[#081534] hover:bg-[#152758] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[17px]">fact_check</span>
              <span>
                {language === 'en'
                  ? 'Apply to 72-Hour Go-Bag Checklist'
                  : 'గో-బ్యాగ్ చెక్‌లిస్ట్‌కు వర్తింపజేయండి'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SURVIVAL LIFE-HACKS */}
      {activeTab === 'survival' && (
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-xl p-4 border border-[#c6c6cf]/40 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#ea580c]">lightbulb</span>
              <h3 className="text-[14px] font-bold text-[#081534]">
                {language === 'en' ? 'Field Survival Hacks & Protocols' : 'అత్యవసర రక్షణ కిటుకులు & పద్ధతులు'}
              </h3>
            </div>
            <p className="text-[11px] text-[#45464e]">
              {language === 'en'
                ? 'Tested, offline-executable field techniques when standard municipal power, running water, and emergency rescue are unavailable.'
                : 'విద్యుత్, నీరు, రక్షణ దళాలు అందుబాటులో లేనప్పుడు ప్రాణాలు కాపాడుకునే సులభమైన దేశీయ పద్ధతులు.'}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {currentGuide.survivalHacks.map((hack, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 border border-[#c6c6cf]/40 shadow-sm flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#081534] text-white flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">{hack.icon}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-[#081534]">
                    {language === 'en' ? hack.titleEn : hack.titleTe}
                  </h4>
                </div>

                <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col gap-2 border border-[#eaedff]">
                  {(language === 'en' ? hack.stepsEn : hack.stepsTe).map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-[11px] text-[#131b2e]">
                      <span className="w-5 h-5 rounded-full bg-[#081534] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Universal Offline Radio Hack */}
            <div className="bg-white rounded-xl p-4 border border-[#c6c6cf]/40 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#081534] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">radio</span>
                </div>
                <h4 className="text-[13px] font-bold text-[#081534]">
                  {language === 'en' ? 'All India Radio Frequency Tuning' : 'ఆకాశవాణి రేడియో ఫ్రీక్వెన్సీ'}
                </h4>
              </div>
              <p className="text-[11px] text-[#45464e] leading-relaxed">
                {language === 'en'
                  ? 'When mobile towers fail during cyclones, FM/AM radio waves continue broadcasting. Tune to Vijayawada MW 837 kHz or FM 102.2 MHz using any basic phone headset as antenna.'
                  : 'మొబైల్ టవర్లు కూలిపోయినప్పుడు కూడా ఆకాశవాణి రేడియో పనిచేస్తుంది. సాధారణ ఇయర్‌ఫోన్లను యాంటెన్నాగా వాడి విజయవాడ రేడియో 837 kHz వినవచ్చు.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIRECT EMERGENCY HOTLINES */}
      {activeTab === 'helplines' && (
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-xl p-4 border border-[#c6c6cf]/40 shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">call</span>
                <h3 className="text-[14px] font-bold text-[#081534]">
                  {language === 'en' ? 'Direct Emergency Voice Hotlines' : 'అత్యవసర వాయిస్ కాల్ నంబర్లు'}
                </h3>
              </div>
              <span className="text-[10px] bg-[#ba1a1a]/10 text-[#ba1a1a] px-2 py-0.5 rounded-full font-bold">
                24x7 Cellular Voice
              </span>
            </div>
            <p className="text-[11px] text-[#45464e] mt-1">
              {language === 'en'
                ? 'These toll-free helplines connect via standard GSM cellular voice, bypassing mobile internet outages.'
                : 'ఇంటర్నెట్ పని చేయకపోయినా సాధారణ సెల్‌ఫోన్ కాల్ ద్వారా నేరుగా మాట్లాడవచ్చు.'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {currentGuide.emergencyHelplines.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="bg-white hover:bg-[#f2f3ff] p-3 rounded-xl border border-[#c6c6cf]/40 shadow-xs flex items-center justify-between transition-all active:scale-98"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#081534]">
                      {language === 'en' ? contact.labelEn : contact.labelTe}
                    </span>
                    {contact.isTollFree && (
                      <span className="bg-[#e7f7ed] text-[#216b35] text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                        Toll-Free
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#45464e] mt-0.5">
                    {language === 'en' ? contact.agencyEn : contact.agencyTe}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[14px] font-extrabold font-mono text-[#081534]">
                    {contact.number}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#081534] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[17px]">call</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* District Control Room Special Entry */}
          <div className="bg-[#f2f3ff] rounded-xl p-3 border border-[#eaedff] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#081534]">
                Tadepalligudem Tahsildar / Revenue Control Room
              </span>
              <span className="text-[10px] text-[#45464e]">
                Mandal Emergency Operations Center
              </span>
            </div>
            <a
              href="tel:08818222123"
              className="px-3 py-1.5 rounded-lg bg-[#081534] text-white text-[11px] font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">call</span>
              <span>Dial 08818-222123</span>
            </a>
          </div>
        </div>
      )}

      {/* OFFLINE SMS MODAL */}
      {smsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">sms</span>
                <h3 className="text-[15px] font-bold text-[#081534]">
                  {language === 'en' ? 'Send Emergency Offline SMS' : 'ఆఫ్‌లైన్ ఎమర్జెన్సీ SMS పంపండి'}
                </h3>
              </div>
              <button
                onClick={() => setSmsModalOpen(false)}
                className="text-[#76777f] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-[11px] text-[#45464e]">
              {language === 'en'
                ? 'When mobile internet and Wi-Fi are down, standard SMS text messages work directly over cellular base towers without data.'
                : 'ఇంటర్నెట్ ఆగిపోయినప్పుడు కూడా మీ మొబైల్‌లోని సాధారణ ఎస్ఎంఎస్ ద్వారా బంధువులకు, అధికారులకు సమాచారం వెళ్తుంది.'}
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#131b2e]">
                {language === 'en' ? 'Recipient Mobile (Optional)' : 'గ్రహీత మొబైల్ నంబర్ (ఐచ్ఛికం)'}
              </label>
              <input
                type="tel"
                value={smsRecipient}
                onChange={(e) => setSmsRecipient(e.target.value)}
                placeholder="e.g. 9876543210 (Leave blank to pick from contacts)"
                className="px-3 py-1.5 text-[12px] rounded-xl border border-[#c6c6cf]/60 bg-[#faf8ff] text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#081534]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#131b2e]">
                {language === 'en' ? 'Custom Emergency Note' : 'అదనపు వివరాలు (అవసరమైతే)'}
              </label>
              <input
                type="text"
                value={customSmsNotes}
                onChange={(e) => setCustomSmsNotes(e.target.value)}
                placeholder="e.g. Roof leaking, infant needs milk"
                className="px-3 py-1.5 text-[12px] rounded-xl border border-[#c6c6cf]/60 bg-[#faf8ff] text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#081534]"
              />
            </div>

            {/* SMS Preview Box */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-[#76777f]">
                {language === 'en' ? 'Generated Message Preview' : 'సందేశం ప్రివ్యూ'}
              </span>
              <div className="p-3 bg-[#f2f3ff] rounded-xl border border-[#eaedff] text-[11px] font-mono text-[#131b2e] leading-relaxed select-all">
                {generateOfflineSmsBody()}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSmsModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold text-[#45464e] bg-[#eaedff] hover:bg-[#dae2fd] transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'రద్దు చేయి'}
              </button>
              <button
                onClick={handleSendOfflineSms}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white bg-[#ba1a1a] hover:bg-[#a01616] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>{language === 'en' ? 'Open SMS App' : 'SMS యాప్ తెరవండి'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POCKET CARD / PRINT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-[#c6c6cf]/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#081534]">print</span>
                <h3 className="text-[15px] font-bold text-[#081534]">
                  {language === 'en' ? 'Offline Pocket Survival Summary' : 'ఆఫ్‌లైన్ పాకెట్ సర్వైవల్ కార్డ్'}
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-[#76777f] hover:text-[#131b2e]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Printable summary content */}
            <div className="flex flex-col gap-3 text-[11px] text-[#131b2e]">
              <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff]">
                <div className="font-bold text-[13px] text-[#081534]">
                  Akashvani DPI &bull; {currentGuide.titleEn}
                </div>
                <div className="text-[10px] text-[#45464e] mt-0.5">
                  Location: {userLocation.displayName || userLocation.shortName} (GPS: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
                </div>
                <div className="mt-1 font-bold text-[#15803d]">
                  Status: {guideProgressPct}% Prepared ({guideCompletedCount}/{guideTotalItems.length} items checked)
                </div>
              </div>

              {/* Critical Items List */}
              <div className="flex flex-col gap-1.5">
                <div className="font-bold text-[12px] text-[#ba1a1a] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">priority_high</span>
                  <span>Must-Do Critical Life Safety Steps</span>
                </div>
                <ul className="list-disc pl-5 flex flex-col gap-1 text-[11px]">
                  {guideTotalItems
                    .filter((i) => i.isCritical)
                    .map((item) => (
                      <li key={item.id} className={checkedItems[item.id] ? 'line-through text-[#76777f]' : 'text-[#131b2e]'}>
                        <span className="font-bold">{item.titleEn}</span>: {item.descriptionEn}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Key Phone Numbers */}
              <div className="flex flex-col gap-1">
                <div className="font-bold text-[12px] text-[#081534]">
                  Emergency Toll-Free Dialers
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-[#f2f3ff] p-2 rounded">Police/Fire/Ambulance: 112</div>
                  <div className="bg-[#f2f3ff] p-2 rounded">AP State Disaster (APSDMA): 1070</div>
                  <div className="bg-[#f2f3ff] p-2 rounded">Eluru District Control: 1077</div>
                  <div className="bg-[#f2f3ff] p-2 rounded">Power Outage / Line Snapped: 1912</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#c6c6cf]/30">
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold text-[#45464e] bg-[#eaedff] hover:bg-[#dae2fd]"
              >
                {language === 'en' ? 'Close' : 'మూసివేయి'}
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white bg-[#081534] hover:bg-[#152758] flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>{language === 'en' ? 'Print / Save PDF' : 'ప్రింట్ చేయండి'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
