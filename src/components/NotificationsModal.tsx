import React from 'react';
import { Language } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const testSirenSound = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance('This is a test of the Akashvani Disaster Alert System.');
      msg.lang = 'en-IN';
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cf]/40 flex flex-col animate-in zoom-in-95">
        <div className="bg-[#081534] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">notifications_active</span>
            <h2 className="font-display text-[16px] font-bold">
              {language === 'en' ? 'Disaster Alert Notifications' : 'విపత్తు హెచ్చరికలు'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Siren test */}
          <div className="bg-[#f2f3ff] p-3 rounded-xl flex items-center justify-between border border-[#eaedff]">
            <div>
              <div className="text-[13px] font-bold text-[#081534]">
                {language === 'en' ? 'Emergency Sounder Test' : 'హెచ్చరిక శబ్దం పరీక్ష'}
              </div>
              <div className="text-[11px] text-[#45464e]">
                {language === 'en' ? 'Verify siren audio output' : 'స్పీకర్ వాల్యూమ్ సరిచూసుకోండి'}
              </div>
            </div>
            <button
              onClick={testSirenSound}
              className="min-h-[36px] px-3 rounded-lg bg-[#081534] text-white text-[11px] font-bold shadow active:scale-95 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">volume_up</span>
              <span>Test Audio</span>
            </button>
          </div>

          {/* Notification stream */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase font-bold text-[#76777f] tracking-wider">
              {language === 'en' ? 'Recent Broadcast Dispatches' : 'ఇటీవలి అధికారిక సమాచారం'}
            </span>

            <div className="bg-[#ffdad6]/40 p-3 rounded-xl border border-[#ffdad6] flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#ba1a1a]">RED ALERT DISPATCH</span>
                <span className="text-[#45464e]">12 min ago</span>
              </div>
              <div className="text-[13px] font-bold text-[#131b2e]">
                Godavari Inflow Surge in Wards 8, 9 &amp; Jagannadhapuram
              </div>
              <div className="text-[11px] text-[#45464e]">
                Mandatory evacuation ground floor advisory. Relief camp active at ZP High School.
              </div>
            </div>

            <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff] flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#fe8c58]">POWER GRID NOTICE</span>
                <span className="text-[#45464e]">35 min ago</span>
              </div>
              <div className="text-[13px] font-bold text-[#131b2e]">
                Feeder Isolation for Stormwater Safety
              </div>
              <div className="text-[11px] text-[#45464e]">
                Restoration expected at 18:30 IST by APEPDCL maintenance teams.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
