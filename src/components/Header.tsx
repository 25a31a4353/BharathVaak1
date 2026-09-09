import React, { useState } from 'react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  location: string;
  onChangeLocation: (loc: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenNotifications,
  onOpenProfile,
  location,
  onChangeLocation,
}) => {
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  const availableLocations = [
    'Tadepalligudem, AP',
    'Eluru, AP',
    'Rajahmundry, AP',
    'Tanuku, AP',
    'Bhimavaram, AP',
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-20 px-4 flex items-center justify-between gap-2 max-w-2xl mx-auto">
        {/* Logo and App Title */}
        <div className="flex items-center gap-2">
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1XmPvKsVXJgVOD7BF_cGFc9ZA2nr5zf1WakYU50hlqXDcMWXIGkagU6DsoTASwrKMPotF23c2iOkPcTFvGaahK_HuaTmlsSD48e1cJNiJyZuNGHqhnqbIhZvDfELlV5SXvA_Df_cVqmQDCK-txEdk8IPqRLspVCBO0ogRWKFiXvcPzoxia4g9D7_E7Ub6p3E9ZnOUJECHGPf6OUrEuJMvHOrT17MULheMeBj0qT3FAB2spriwXQ1NhLuc8r"
            alt="Akashvani Civic Emblem"
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="font-display font-bold text-[20px] tracking-tight text-[#081534] leading-none">
              Akashvani
            </span>
            <div className="relative">
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-1.5 mt-0.5 text-left group focus:outline-none"
                title="Switch District / Mandal"
              >
                <span className="w-2 h-2 rounded-full bg-[#43a55d] animate-pulse"></span>
                <span className="text-[11px] font-bold text-[#45464e] leading-none group-hover:text-[#081534] transition-colors flex items-center gap-0.5">
                  {location}
                  <span className="material-symbols-outlined text-[13px] text-[#76777f]">
                    expand_more
                  </span>
                </span>
              </button>

              {/* Location Switcher Dropdown */}
              {showLocationMenu && (
                <div className="absolute top-6 left-0 bg-white border border-[#c6c6cf]/40 shadow-lg rounded-xl py-1.5 w-48 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#76777f] tracking-wider">
                    {language === 'en' ? 'Select Operational District' : 'ప్రాంతాన్ని ఎంచుకోండి'}
                  </div>
                  {availableLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        onChangeLocation(loc);
                        setShowLocationMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center justify-between hover:bg-[#eaedff] transition-colors ${
                        loc === location ? 'font-bold text-[#081534] bg-[#f2f3ff]' : 'text-[#45464e]'
                      }`}
                    >
                      <span>{loc}</span>
                      {loc === location && (
                        <span className="material-symbols-outlined text-[16px] text-[#43a55d]">
                          check
                        </span>
                      )}
                    </button>
                  ))}
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
            className="min-h-[40px] px-2.5 flex items-center justify-center rounded-lg bg-[#eaedff] text-[#081534] font-semibold text-[13px] hover:bg-[#dae2fd] active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] mr-1 text-[#1e2a4a]">
              translate
            </span>
            <span>{language === 'en' ? 'EN|తె' : 'తె|EN'}</span>
          </button>

          {/* Notifications Button with Red Indicator */}
          <button
            onClick={onOpenNotifications}
            aria-label="Disaster Notifications"
            className="relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#081534] hover:bg-[#eaedff] active:scale-95 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-[#faf8ff] animate-pulse"></span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            aria-label="Responder Profile"
            className="w-8 h-8 rounded-full bg-[#081534] hover:bg-[#1e2a4a] text-white flex items-center justify-center shadow-sm ml-1 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
