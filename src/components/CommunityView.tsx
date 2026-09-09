import React, { useState } from 'react';
import { Language } from '../types';

interface CommunityViewProps {
  language: Language;
  onOpenReportModal: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  language,
  onOpenReportModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'volunteer' | 'reunion'>('reports');
  const [volunteerRegistered, setVolunteerRegistered] = useState(false);
  const [volunteerSkill, setVolunteerSkill] = useState('First-Aid & Medical');
  const [volunteerPhone, setVolunteerPhone] = useState('');
  const [volunteerName, setVolunteerName] = useState('');

  const [missingPersons, setMissingPersons] = useState([
    {
      id: 'm1',
      name: 'Ramu K. (Age 64)',
      lastSeen: 'Near Old Bus Stand Sai Baba Temple during water logging',
      reportedBy: 'Son: P. Krishna (98480xxxxx)',
      status: 'Located at ZP School Shelter',
      isResolved: true,
    },
    {
      id: 'm2',
      name: 'Elderly Couple (Satyanarayana & Lakshmi)',
      lastSeen: 'Ward 9, 2nd Cross, Pentapadu Road',
      reportedBy: 'Ward Volunteer Ramesh (94400xxxxx)',
      status: 'SDRF Boat dispatched to rescue',
      isResolved: false,
    },
  ]);

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName || !volunteerPhone) return;
    setVolunteerRegistered(true);
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 gap-4 max-w-2xl mx-auto">
      {/* Community Banner */}
      <div className="bg-[#1e2a4a] text-white p-4 rounded-xl shadow-sm flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-bold text-[#fe8c58] uppercase tracking-wider">
            {language === 'en' ? 'Tadepalligudem Civic Resilience' : 'తాడేపల్లిగూడెం పౌర వేదిక'}
          </span>
          <h2 className="font-display text-[18px] font-bold leading-tight mt-0.5">
            {language === 'en'
              ? 'Community Ground Verification'
              : 'క్షేత్రస్థాయి పౌర ధృవీకరణ వేదిక'}
          </h2>
          <p className="text-[12px] text-[#dae2fd] mt-0.5">
            {language === 'en'
              ? 'Crowdsourced incident cross-checking & volunteer rescue mobilization'
              : 'ప్రజలచే ప్రమాదాల నివేదన మరియు వాలంటీర్ సహాయక బృందాల సమన్వయం'}
          </p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="min-h-[40px] px-3 rounded-lg bg-white text-[#081534] text-[12px] font-bold shadow hover:bg-[#eaedff] active:scale-95 transition-all flex items-center gap-1 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[16px] text-[#9d4314]">add_location_alt</span>
          <span>{language === 'en' ? 'Report' : 'నివేదించు'}</span>
        </button>
      </div>

      {/* Sub-tabs: Ground Reports | Volunteer Reserve | Family Reunion */}
      <div className="grid grid-cols-3 gap-1 bg-[#eaedff] p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
            activeSubTab === 'reports'
              ? 'bg-white text-[#081534] shadow-xs'
              : 'text-[#45464e] hover:text-[#081534]'
          }`}
        >
          {language === 'en' ? 'Ground Reports' : 'క్షేత్ర నివేదికలు'}
        </button>
        <button
          onClick={() => setActiveSubTab('volunteer')}
          className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
            activeSubTab === 'volunteer'
              ? 'bg-white text-[#081534] shadow-xs'
              : 'text-[#45464e] hover:text-[#081534]'
          }`}
        >
          {language === 'en' ? 'Volunteer Taskforce' : 'వాలంటీర్ బృందం'}
        </button>
        <button
          onClick={() => setActiveSubTab('reunion')}
          className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
            activeSubTab === 'reunion'
              ? 'bg-white text-[#081534] shadow-xs'
              : 'text-[#45464e] hover:text-[#081534]'
          }`}
        >
          {language === 'en' ? 'Family Reunion' : 'కుటుంబ క్షేమం'}
        </button>
      </div>

      {/* SUB-TAB 1: Ground Reports */}
      {activeSubTab === 'reports' && (
        <div className="flex flex-col gap-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cf]/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="bg-[#ffdbcd] text-[#7d2d00] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Ward 4 Ground Check
              </span>
              <span className="text-[11px] text-[#45464e]">25 min ago</span>
            </div>
            <h3 className="text-[14px] font-bold text-[#131b2e]">
              Water Drainage Blockage Cleared near Railway Feeder
            </h3>
            <p className="text-[13px] text-[#45464e]">
              Local youth and sanitation teams cleared plastic silt debris from the stormwater culvert. Water receded by 1.2 feet. Road partially open for two-wheelers.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#43a55d] font-semibold">
              <span className="material-symbols-outlined text-[15px]">thumb_up</span>
              <span>24 Citizens confirmed on spot</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cf]/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="bg-[#ffdad6] text-[#93000a] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">warning</span>
                Ward 8 Inundation Notice
              </span>
              <span className="text-[11px] text-[#45464e]">40 min ago</span>
            </div>
            <h3 className="text-[14px] font-bold text-[#131b2e]">
              Water Entering Ground Floor Apartments at Jagannadhapuram
            </h3>
            <p className="text-[13px] text-[#45464e]">
              Residents moving elders to 1st and 2nd floors. Electricity turned off as a precaution. Requesting inflatable boat support for pregnant woman in Door #8-14-2.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#ba1a1a] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">siren</span>
                SDRF Rescue Unit Notified
              </span>
              <button
                onClick={onOpenReportModal}
                className="text-[11px] text-[#081534] font-bold hover:underline"
              >
                Add Ground Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Volunteer Registration */}
      {activeSubTab === 'volunteer' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cf]/40 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#43a55d]">
              volunteer_activism
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-[#081534]">
                {language === 'en'
                  ? 'Join Tadepalligudem Disaster Volunteer Taskforce'
                  : 'తాడేపల్లిగూడెం వాలంటీర్ టాస్క్‌ఫోర్స్‌లో చేరండి'}
              </h3>
              <p className="text-[12px] text-[#45464e]">
                {language === 'en'
                  ? 'Coordinate with SDRF & Red Cross West Godavari'
                  : 'ఎస్.డి.ఆర్.ఎఫ్ & రెడ్ క్రాస్‌తో కలిసి సహాయక చర్యల్లో పాల్గొనండి'}
              </p>
            </div>
          </div>

          {volunteerRegistered ? (
            <div className="bg-[#003313] text-white p-4 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#43a55d]">
                  check_circle
                </span>
                <span className="font-bold text-[14px]">
                  {language === 'en' ? 'Registered Successfully!' : 'నమోదు పూర్తయింది!'}
                </span>
              </div>
              <p className="text-[12px] text-[#95f8a7]">
                Thank you, <strong>{volunteerName}</strong>. Your contact has been assigned to Ward Disaster Volunteer Cell. The relief staging coordinator at ZP Boys School will contact you shortly.
              </p>
              <div className="text-[11px] text-[#dae2fd]">
                Role: <strong>{volunteerSkill}</strong> • Volunteer ID: TDP-VOL-8492
              </div>
            </div>
          ) : (
            <form onSubmit={handleVolunteerSubmit} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  {language === 'en' ? 'Full Name' : 'పూర్తి పేరు'}
                </label>
                <input
                  type="text"
                  required
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="e.g. Srinivas V."
                  className="w-full min-h-[44px] px-3 rounded-lg border border-[#c6c6cf] text-[13px] focus:outline-none focus:border-[#081534]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  {language === 'en' ? 'Mobile Number (WhatsApp)' : 'మొబైల్ నంబర్'}
                </label>
                <input
                  type="tel"
                  required
                  value={volunteerPhone}
                  onChange={(e) => setVolunteerPhone(e.target.value)}
                  placeholder="e.g. 98480 12345"
                  className="w-full min-h-[44px] px-3 rounded-lg border border-[#c6c6cf] text-[13px] focus:outline-none focus:border-[#081534]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  {language === 'en' ? 'Primary Volunteer Capability' : 'సహాయక నైపుణ్యం'}
                </label>
                <select
                  value={volunteerSkill}
                  onChange={(e) => setVolunteerSkill(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-lg border border-[#c6c6cf] text-[13px] bg-white focus:outline-none focus:border-[#081534]"
                >
                  <option>First-Aid &amp; Medical Nurse</option>
                  <option>Boat Operation / Swimming &amp; Lifesaving</option>
                  <option>Rations, Drinking Water &amp; Food Distribution</option>
                  <option>Relief Camp Management &amp; Childcare</option>
                  <option>Amateur Radio / Communication Operator</option>
                </select>
              </div>

              <button
                type="submit"
                className="min-h-[44px] rounded-lg bg-[#081534] hover:bg-[#1e2a4a] text-white text-[13px] font-bold shadow active:scale-95 transition-all mt-1"
              >
                {language === 'en' ? 'Enroll as Emergency Volunteer' : 'వాలంటీర్‌గా నమోదు చేసుకోండి'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* SUB-TAB 3: Family Reunion / Missing Persons */}
      {activeSubTab === 'reunion' && (
        <div className="flex flex-col gap-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cf]/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#081534]">
                {language === 'en' ? 'Family Trace & Welfare Board' : 'సభ్యుల క్షేమ సమాచార పట్టిక'}
              </h3>
              <span className="text-[11px] text-[#45464e]">Coordinated with Red Cross</span>
            </div>

            <div className="flex flex-col gap-2">
              {missingPersons.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#f2f3ff] p-3 rounded-lg flex flex-col gap-1 border border-[#eaedff]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#131b2e]">{p.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.isResolved
                          ? 'bg-[#43a55d] text-white'
                          : 'bg-[#ffdad6] text-[#93000a]'
                      }`}
                    >
                      {p.isResolved ? 'SAFE AT SHELTER' : 'SEARCH ACTIVE'}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#45464e] leading-snug">
                    <strong>Last seen:</strong> {p.lastSeen}
                  </p>
                  <div className="text-[11px] text-[#081534] font-medium pt-0.5">
                    Status: {p.status} • {p.reportedBy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
