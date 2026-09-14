import { useState, useEffect } from 'react';
import { NavTab, Language, AlertItem, GovStatus } from './types';
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
import { govApi } from './services/govApi';
import { useUserLocation } from './hooks/useUserLocation';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('alerts');
  const [language, setLanguage] = useState<Language>('en');
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [govStatus, setGovStatus] = useState<GovStatus | null>(null);

  // Live device GPS and real-time environment telemetry hook
  const {
    userLocation,
    telemetry,
    isTelemetryLoading,
    isLocating,
    requestLiveGps,
    refreshTelemetry,
    setPredefinedLocation,
  } = useUserLocation();

  // Poll Government Server connection
  const checkGovHealth = async () => {
    try {
      const status = await govApi.getStatus();
      setGovStatus(status);
    } catch (e) {
      setGovStatus({
        connected: false,
        serverUrl: 'https://akashvani-production.up.railway.app',
        latencyMs: 999,
        timestamp: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    checkGovHealth();
    const interval = setInterval(checkGovHealth, 30000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Fixed Institutional Header with Live GPS Control */}
      <Header
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        userLocation={userLocation}
        onRequestLiveGps={requestLiveGps}
        onSelectPredefinedLocation={setPredefinedLocation}
        isLocating={isLocating}
        govStatus={govStatus}
        onRefreshGovStatus={checkGovHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-24 pb-28">
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
            userLocation={userLocation}
            telemetry={telemetry}
            isTelemetryLoading={isTelemetryLoading}
            onRefreshTelemetry={refreshTelemetry}
            onRequestLiveGps={requestLiveGps}
          />
        )}

        {currentTab === 'map' && (
          <MapView
            language={language}
            onOpenSOS={() => setIsSOSOpen(true)}
            userLocation={userLocation}
            onRequestLiveGps={requestLiveGps}
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

      {/* Modals with Live GPS Connection */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        language={language}
        location={userLocation.displayName || userLocation.shortName}
        userLocation={userLocation}
      />

      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        language={language}
        location={userLocation.displayName || userLocation.shortName}
        userLocation={userLocation}
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
        location={userLocation.displayName || userLocation.shortName}
      />
    </div>
  );
}
