import React from 'react';
import { Dumbbell, History as HistoryIcon, Users, User, Bell, LogOut, Camera } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  activeTab: 'workout' | 'history' | 'ranking' | 'profile';
  setActiveTab: (tab: 'workout' | 'history' | 'ranking' | 'profile') => void;
  unreadCount: number;
  setShowNotifications: (show: boolean) => void;
  markNotificationsAsRead: () => void;
  userStats: {
    fullName: string;
    [key: string]: any;
  };
  session: any;
  allProfiles: any[];
  setTempPhoto: (photo: string) => void;
  setOriginalFile: (file: File) => void;
  setShowPhotoModal: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  setShowNotifications,
  markNotificationsAsRead,
  userStats,
  session,
  allProfiles,
  setTempPhoto,
  setOriginalFile,
  setShowPhotoModal
}) => {
  const currentUserProfile = allProfiles.find(p => p.id === session?.user.id);

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-xl p-6 sticky top-0 h-screen">
      <div className="mb-10">
        <h1 className="text-2xl font-display font-bold text-primary tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-background" />
          </div>
          A10 academia
        </h1>
      </div>
      
      <nav className="flex-1 space-y-2 flex flex-col">
        {[
          { id: 'workout', label: 'Treino', icon: Dumbbell },
          { id: 'history', label: 'Histórico', icon: HistoryIcon },
          { id: 'ranking', label: 'Comunidade', icon: Users },
          { id: 'profile', label: 'Perfil', icon: User },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
              activeTab === item.id 
                ? "bg-primary text-background shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
        
        <button
          onClick={() => {
            setShowNotifications(true);
            markNotificationsAsRead();
          }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <span>Notificações</span>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all mt-auto border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair da Conta</span>
        </button>
      </nav>

      <div className="pt-6 border-t border-border">
        <div className="bg-muted/50 p-4 rounded-xl border border-border flex items-center gap-3 relative group">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden relative border border-primary/10">
            {currentUserProfile?.avatar_url ? (
              <img src={currentUserProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              (userStats.fullName || session?.user.email || 'A').charAt(0).toUpperCase()
            )}
            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <Camera className="w-4 h-4 text-white" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setTempPhoto(ev.target?.result as string);
                      setOriginalFile(file);
                      setShowPhotoModal(true);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">
              {userStats.fullName || session?.user.user_metadata.full_name || session?.user.email?.split('@')[0] || 'Usuário Elite'}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Atleta A10</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
