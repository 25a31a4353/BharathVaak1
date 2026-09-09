import React from 'react';
import { Language } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  location: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  language,
  location,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cf]/40 flex flex-col animate-in zoom-in-95">
        <div className="bg-[#081534] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">badge</span>
            <h2 className="font-display text-[16px] font-bold">
              {language === 'en' ? 'Civic Responder Profile' : 'పౌర రక్షణ ప్రొఫైల్'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3.5">
          {/* User Digital Public ID Card */}
          <div className="bg-gradient-to-r from-[#1e2a4a] to-[#081534] text-white p-4 rounded-xl shadow flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#fe8c58] text-[#712800] flex items-center justify-center font-bold text-[20px] flex-shrink-0">
              SM
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[16px]">Shanmukheswara M.</span>
                <span className="material-symbols-outlined text-[16px] text-[#43a55d]">verified</span>
              </div>
              <span className="text-[12px] text-[#dae2fd]">{location} • Ward 8</span>
              <span className="text-[11px] text-[#fe8c58] font-semibold mt-0.5">
                Civic Responder ID: AP-TDP-88392
              </span>
            </div>
          </div>

          {/* Quick Vital Details */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#f2f3ff] p-2.5 rounded-xl border border-[#eaedff]">
              <div className="text-[10px] text-[#45464e] font-bold uppercase">Blood Group</div>
              <div className="text-[15px] font-bold text-[#ba1a1a] mt-0.5">O+ve</div>
            </div>
            <div className="bg-[#f2f3ff] p-2.5 rounded-xl border border-[#eaedff]">
              <div className="text-[10px] text-[#45464e] font-bold uppercase">Assigned Camp</div>
              <div className="text-[13px] font-bold text-[#081534] mt-0.5">ZP High School</div>
            </div>
            <div className="bg-[#f2f3ff] p-2.5 rounded-xl border border-[#eaedff]">
              <div className="text-[10px] text-[#45464e] font-bold uppercase">Civic Points</div>
              <div className="text-[15px] font-bold text-[#43a55d] mt-0.5">14 Upvoted</div>
            </div>
          </div>

          {/* Saved Emergency Contacts */}
          <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#76777f] uppercase">
              <span>Primary Family SOS Contacts</span>
              <span className="text-[#43a55d]">2 Synced</span>
            </div>
            <div className="flex items-center justify-between text-[13px] bg-white p-2 rounded-lg border border-[#c6c6cf]/30">
              <span className="font-semibold text-[#131b2e]">Family Contact 1 (Father)</span>
              <a href="tel:9848011223" className="text-[#081534] font-bold flex items-center gap-1 text-[12px]">
                <span className="material-symbols-outlined text-[15px]">call</span>
                <span>98480 11223</span>
              </a>
            </div>
            <div className="flex items-center justify-between text-[13px] bg-white p-2 rounded-lg border border-[#c6c6cf]/30">
              <span className="font-semibold text-[#131b2e]">Ward Volunteer (Ramesh)</span>
              <a href="tel:9440055667" className="text-[#081534] font-bold flex items-center gap-1 text-[12px]">
                <span className="material-symbols-outlined text-[15px]">call</span>
                <span>94400 55667</span>
              </a>
            </div>
          </div>

          {/* Offline Survival Checklist Button */}
          <button
            onClick={() => alert('Offline Emergency Survival Protocol downloaded to device cache.')}
            className="min-h-[44px] rounded-xl bg-[#081534] hover:bg-[#1e2a4a] text-white font-bold text-[13px] shadow flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
            <span>Download Offline Flood Survival Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
