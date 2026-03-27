import React from 'react';
import { Bell, Settings } from 'lucide-react';

interface MobileHeaderProps {
  activeTab: string;
  unreadCount: number;
  setShowNotifications: (show: boolean) => void;
  markNotificationsAsRead: () => void;
  setActiveTab: (tab: any) => void;
  setShowEditProfile: (show: boolean) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  unreadCount,
  setShowNotifications,
  markNotificationsAsRead,
  setActiveTab,
  setShowEditProfile
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'workout': return 'Treino';
      case 'history': return 'Histórico';
      case 'ranking': return 'Ranking'; // Note: ranking tab actually shows "Comunidade" in sidebar, keeping technical ID usage
      case 'profile': return 'Perfil';
      default: return 'A10 Fitness';
    }
  };

  return (
    <header className="lg:hidden p-4 border-b border-border flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <h1 className="text-2xl font-display font-bold tracking-tight">
        {getTitle()}
      </h1>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => {
            setShowNotifications(true);
            markNotificationsAsRead();
          }}
          className="p-2 rounded-full hover:bg-muted relative transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-background animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => { setActiveTab('profile'); setShowEditProfile(true); }}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
