import React from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Instagram, 
  Youtube, 
  Zap, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Users, 
  UserCheck,
  User
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { BASE_EXERCISES } from '../../data/exercises';

interface ProfileTabProps {
  userStats: any;
  session: any;
  history: any[];
  streak: number;
  totalXP: number;
  badges: any[];
  getActivityData: () => any[];
  setShowEditProfile: (show: boolean) => void;
  supabase: any;
  setTempPhoto: (photo: string | null) => void;
  setOriginalFile: (file: File | null) => void;
  setShowPhotoModal: (show: boolean) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userStats,
  session,
  history,
  streak,
  totalXP,
  badges,
  getActivityData,
  setShowEditProfile,
  supabase,
  setTempPhoto,
  setOriginalFile,
  setShowPhotoModal
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-24 p-4"
    >
      <div className="bg-card p-8 rounded-[32px] border border-border text-center space-y-4 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -translate-x-12 -translate-y-12 blur-2xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-16 translate-y-16 blur-3xl" />
        
        <div className="relative inline-block group">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl border-2 border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
            {userStats.avatarUrl ? (
              <img src={userStats.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              "👨‍🚀"
            )}
            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <Camera className="w-6 h-6 text-white" />
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
          <div className="absolute -bottom-2 -right-2 bg-primary text-background w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-card shadow-lg">
            {userStats.level}
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">
            {userStats.fullName || session?.user.user_metadata.full_name || session?.user.email?.split('@')[0] || 'Usuário Elite'}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className={cn(
              "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border",
              userStats.reliability === 'diamond' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
              userStats.reliability === 'gold' ? "bg-primary/10 text-primary border-primary/20" :
              "bg-muted text-muted-foreground border-border"
            )}>
              {userStats.reliability === 'diamond' ? '💎 Diamante' : userStats.reliability === 'gold' ? '🏆 Ouro' : userStats.reliability === 'silver' ? '🥈 Prata' : '🥉 Bronze'}
            </span>
            <span className="text-[8px] bg-muted text-muted-foreground font-black uppercase px-2 py-1 rounded-full">
              {userStats.level === 6 ? 'Lenda' : userStats.level === 5 ? 'Elite' : userStats.level === 4 ? 'Avançado' : userStats.level === 3 ? 'Intermediário' : userStats.level === 2 ? 'Aprendiz' : 'Iniciante'}
            </span>
          </div>
          {userStats.bio && (
            <p className="text-[10px] text-muted-foreground font-medium max-w-[250px] mx-auto pt-2 italic leading-relaxed">
              "{userStats.bio}"
            </p>
          )}
        </div>

        <div className="space-y-4 pt-4 text-left">
          <div className="flex justify-between items-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Zap className="w-3 h-3 text-purple-500" /> Tendência de Volume (7d)
            </div>
          </div>
          <div className="flex items-end justify-between h-12 gap-1 px-1">
            {getActivityData().map((day, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(day.height, 10)}%` }}
                  className={cn(
                    "w-full rounded-t-sm transition-all duration-300",
                    day.volume > 0 ? "bg-primary shadow-[0_0_10px_rgba(255,215,0,0.3)]" : "bg-muted/30"
                  )}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[6px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold border border-border">
                  {day.volume} kg
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>XP Total</span>
            <span>{(totalXP % 1000)} / 1000 XP</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden shadow-inner p-0.5">
            <motion.div 
              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]" 
              initial={{ width: 0 }}
              animate={{ width: `${(totalXP % 1000) / 10}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4">
          <div className="bg-muted/50 p-3 rounded-2xl">
            <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Pontos</p>
            <p className="font-display font-black text-xs text-primary">{(userStats.points || 0).toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 p-3 rounded-xl border border-border">
            <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Treinos</p>
            <p className="font-display font-black text-xs">{history.length}</p>
          </div>
          <div className="bg-muted/50 p-3 rounded-xl border border-border">
            <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Streak</p>
            <p className="font-display font-black text-xs text-orange-500">{streak} 🔥</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="bg-muted/30 p-2 rounded-xl border border-border/50 flex items-center justify-center gap-2">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black">{userStats.followerCount}</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Seguidores</span>
          </div>
          <div className="bg-muted/30 p-2 rounded-xl border border-border/50 flex items-center justify-center gap-2">
            <UserCheck className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black">{userStats.followingCount}</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Seguindo</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6">
          <button 
            onClick={() => setShowEditProfile(true)}
            className="w-full bg-primary text-background py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <Settings className="w-4 h-4" />
            Bio & Métricas
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full py-3 bg-muted/30 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl border border-border transition-all active:scale-95 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" />
            Encerrar Sessão Elite
          </button>
        </div>

        {/* Personal Records (PRs) */}
        <div className="pt-6 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recordes Pessoais (1RM)</h3>
            <TrendingUp className="w-3 h-3 text-primary" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Supino', id: 'bench', aliases: ['1', 'pt-1', 'Supino Reto', 'Bench Press'] },
              { label: 'Agacho', id: 'squat', aliases: ['2', 'pg-6', 'Agachamento', 'Squat'] },
              { label: 'Terra', id: 'deadlift', aliases: ['3', 'Levantamento Terra', 'Deadlift'] }
            ].map(lift => {
              const pr = Object.entries(userStats.personalRecords || {}).find(([exId]) => {
                const ex = BASE_EXERCISES.find(e => e.id === exId);
                return ex && lift.aliases.some(a => ex.name.toLowerCase().includes(a.toLowerCase()) || ex.id === a);
              })?.[1] || 0;

              return (
                <div key={lift.id} className="bg-card/40 border border-border p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
                  <span className="text-[8px] font-black uppercase text-muted-foreground">{lift.label}</span>
                  <span className="text-sm font-display font-black text-primary">{Math.floor(pr as number)} <span className="text-[8px] text-muted-foreground">kg</span></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conquistas */}
        <div className="pt-6 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conquistas</h3>
            <span className="text-[10px] font-bold text-primary">{badges.filter(b => b.earnedBy.includes('current-user')).length} / {badges.length}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {badges.map(badge => {
              const isEarned = badge.earnedBy.includes('current-user');
              return (
                <div 
                  key={badge.id}
                  title={`${badge.name}: ${badge.description}`}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border transition-all duration-300 cursor-help",
                    isEarned ? "bg-primary/10 border-primary/20 shadow-lg" : "bg-muted/30 border-transparent opacity-40 grayscale"
                  )}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-[6px] font-black uppercase text-center leading-tight line-clamp-1 px-1">
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
