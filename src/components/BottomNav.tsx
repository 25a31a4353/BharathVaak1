import React from 'react';
import { NavTab, Language } from '../types';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: Language;
  onOpenSOS: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
  onOpenSOS,
}) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      labelEn: 'Home',
      labelTe: 'హోమ్',
      icon: 'home',
    },
    {
      id: 'alerts' as NavTab,
      labelEn: 'Alerts',
      labelTe: 'హెచ్చరికలు',
      icon: 'notifications_active',
      badge: true,
    },
    {
      id: 'sos' as NavTab,
      labelEn: 'SOS',
      labelTe: 'ఎస్.ఓ.ఎస్',
      icon: 'emergency',
      isSOS: true,
    },
    {
      id: 'map' as NavTab,
      labelEn: 'Map',
      labelTe: 'మ్యాప్',
      icon: 'map',
    },
    {
      id: 'community' as NavTab,
      labelEn: 'Community',
      labelTe: 'సమాజం',
      icon: 'groups',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 w-full z-40 pb-safe bg-[#faf8ff]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-[#eaedff]"
      aria-label="Bottom Navigation"
    >
      <div className="flex justify-around items-center h-20 px-1 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          if (tab.isSOS) {
            return (
              <button
                key={tab.id}
                onClick={onOpenSOS}
                aria-label="Trigger Emergency SOS"
                className="flex flex-col items-center justify-center -mt-5 min-h-[56px] min-w-[56px] px-2 py-1 bg-[#ba1a1a] hover:bg-[#a01616] text-white rounded-xl shadow-[0_4px_14px_rgba(186,26,26,0.4)] active:scale-95 transition-all focus:ring-4 focus:ring-[#ba1a1a]/30"
              >
                <span className="material-symbols-outlined text-[28px] animate-pulse">
                  emergency
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider leading-tight">
                  SOS
                </span>
              </button>
            );
          }

          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[48px] px-2 transition-colors rounded-lg ${
                isActive
                  ? 'text-[#081534] font-bold'
                  : 'text-[#45464e] hover:text-[#081534]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="text-[11px] leading-tight">
                {language === 'en' ? tab.labelEn : tab.labelTe}
              </span>
              {tab.badge && !isActive && (
                <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
