import { useState } from 'react';
import { NavTab, Language, AlertItem } from './types';
import { INITIAL_ALERTS } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AlertsView } from './components/AlertsView';
import { HomeView } from './components/HomeView';
import { MapView } from './components/MapView';
import { CommunityView } from './components/CommunityView';
import { SOSModal } from './components/SOSModal';
import { CitizenReportModal } from './components/CitizenReportModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('alerts');
  const [language, setLanguage] = useState<Language>('en');
  const [location, setLocation] = useState<string>('Tadepalligudem, AP');
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Toggle language between English and Telugu
  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'te' : 'en'));
  };

  // Upvote/confirm community incident
  const handleConfirmCommunityAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((item) => {
        if (item.id === id && item.communityInfo && !item.communityInfo.isConfirmedByUser) {
          return {
            ...item,
            communityInfo: {
              ...item.communityInfo,
              upvotes: item.communityInfo.upvotes + 1,
              isConfirmedByUser: true,
            },
          };
        }
        return item;
      })
    );
  };

  // Add new citizen report to the live feed
  const handleAddAlert = (newAlert: AlertItem) => {
    setAlerts((prev) => [newAlert, ...prev]);
    setCurrentTab('alerts');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] font-sans antialiased">
      {/* Fixed Institutional Header */}
      <Header
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        location={location}
        onChangeLocation={setLocation}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20 pb-28">
        {currentTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            language={language}
            onNavigateTab={setCurrentTab}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onConfirmCommunityAlert={handleConfirmCommunityAlert}
          />
        )}

        {currentTab === 'home' && (
          <HomeView
            language={language}
            onNavigateTab={setCurrentTab}
            onOpenSOS={() => setIsSOSOpen(true)}
            location={location}
          />
        )}

        {currentTab === 'map' && (
          <MapView
            language={language}
            onOpenSOS={() => setIsSOSOpen(true)}
          />
        )}

        {currentTab === 'community' && (
          <CommunityView
            language={language}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onOpenSOS={() => setIsSOSOpen(true)}
      />

      {/* Modals */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        language={language}
        location={location}
      />

      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        language={language}
        location={location}
        onAddAlert={handleAddAlert}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        language={language}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        location={location}
      />
    </div>
  );
}
