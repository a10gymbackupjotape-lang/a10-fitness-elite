/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { format, startOfDay, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  History as HistoryIcon, 
  User, 
  Plus, 
  Settings,
  Search,
  ChevronRight,
  CheckCircle2,
  X,
  Clock,
  Timer,
  Trash2,
  MoreVertical,
  Bell,
  Megaphone,
  Calendar,
  Award,
  Medal,
  Flame,
  Star,
  Download,
  ChevronDown,
  Check,
  MessageCircle,
  Edit2,
  ChevronLeft,
  Zap,
  BarChart3,
  Weight,
  CheckSquare,
  Server as Database,
  LogOut,
  PlusCircle,
  Trophy,
  Camera,
  Scale,
  Instagram,
  Youtube,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  UserCheck
} from 'lucide-react';
import { useWorkoutStore, SetType, CompletedWorkout, RoutineTemplate, UserRole, AppEvent } from './store/useWorkoutStore';
import { BASE_EXERCISES, LibraryExercise } from './data/exercises';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { cn } from './lib/utils';
import Auth from './components/Auth';
import { Session } from '@supabase/supabase-js';

// --- Mock Data ---


// BASE_EXERCISES is imported from data/exercises.ts

const SET_TYPES: { value: SetType; label: string; color: string }[] = [
  { value: 'normal', label: 'N', color: 'bg-muted' },
  { value: 'warm_up', label: 'A', color: 'bg-orange-500/20 text-orange-500' },
  { value: 'drop', label: 'D', color: 'bg-blue-500/20 text-blue-500' },
  { value: 'failure', label: 'F', color: 'bg-red-500/20 text-red-500' },
];

const BadgeCelebration = () => {
  const { lastBadgeEarned, clearLastBadgeEarned } = useWorkoutStore();
  
  return (
    <AnimatePresence>
      {lastBadgeEarned && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            className="bg-card w-full max-w-sm rounded-[32px] p-8 border border-primary/20 shadow-2xl text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            
            {/* Animated Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1.5, 0],
                    x: [0, (Math.random() - 0.5) * 300],
                    y: [0, (Math.random() - 0.5) * 300]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                  className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-primary/40"
                />
              ))}
            </div>

            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-5xl mx-auto shadow-inner relative">
              <span className="animate-bounce inline-block">{lastBadgeEarned.icon}</span>
              <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
            </div>
            <div className="space-y-2 relative">
              <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">Nova Conquista!</h2>
              <p className="text-primary font-bold">{lastBadgeEarned.name}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{lastBadgeEarned.description}</p>
            </div>
            <button 
              onClick={clearLastBadgeEarned}
              className="w-full bg-primary text-background font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all relative"
            >
              Incrível!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Dumbbell className="w-12 h-12 text-primary animate-bounce" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Iniciando A10 academia...</p>
      </div>
    );
  }

  if (isSupabaseConfigured && !session) {
    return <Auth />;
  }

  return <AppContent session={session} />;
}

function AppContent({ session }: { session: Session | null }) {
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'profile' | 'ranking'>('workout');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutTime, setWorkoutTime] = useState(0);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminTab, setAdminTab] = useState<'events' | 'exercises' | 'settings' | 'supabase'>('events');

  const { 
    activeWorkout, history, restTimer, totalXP, routines,
    saveRoutine, updateRoutine, deleteRoutine, importRoutine,
    startWorkout, endWorkout, cancelWorkout,
    addExercise, removeExercise, updateExercise,
    updateSet, addSet, removeSet,
    startRestTimer, tickRestTimer, stopRestTimer,
    deleteWorkout, clearLastBadgeEarned,
    currentUserRole, setRole, events, addEvent, updateEvent, deleteEvent, participateInEvent,
    badges, addBadge, claimBadge, tips, addTip, customExercises, addCustomExercise, deleteCustomExercise,
    generateTestData, resetTestData,
    fetchInitialData, subscribeToRealtime,
    allProfiles, updateProfile} = useWorkoutStore();

  useEffect(() => {
    if (session) {
      fetchInitialData();
      const unsubscribe = subscribeToRealtime();
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [session]);

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showRoutineEditor, setShowRoutineEditor] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [showWeeklyWrapped, setShowWeeklyWrapped] = useState(false);
  const [workoutName, setWorkoutName] = useState('Novo Treino');
  const [selectedHistoryWorkout, setSelectedHistoryWorkout] = useState<CompletedWorkout | null>(null);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [activeRoutineDay, setActiveRoutineDay] = useState(1); // 1 = Seg
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateBadge, setShowCreateBadge] = useState(false);
  const [showCreateTip, setShowCreateTip] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [rankingCategory, setRankingCategory] = useState<'strength' | 'volume' | 'evolution' | 'frequency'>('volume');
  const [weightCategory, setWeightCategory] = useState<'pena' | 'medio' | 'pesado' | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<'masculino' | 'feminino' | 'all'>('all');
  const [ageFilter, setAgeFilter] = useState<'young' | 'adult' | 'master' | 'senior' | 'all'>('all');
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [rankingTimeframe, setRankingTimeframe] = useState<'weekly' | 'monthly' | 'all'>('all');
  const [communityMode, setCommunityMode] = useState<'feed' | 'ranking'>('feed');
  const [showNotifications, setShowNotifications] = useState(false);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getAgeCategory = (age: number) => {
    if (age === 0) return 'unknown';
    if (age <= 25) return 'young';
    if (age <= 40) return 'adult';
    if (age <= 60) return 'master';
    return 'senior';
  };
  const [routineSection, setRoutineSection] = useState<'mine' | 'suggested'>('mine');
  
  // Photo Adjustment States
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const { 
    userStats, 
    validateWorkout, 
    addPoints,
    setReliability,
    follows,
    socialFeed,
    followUser,
    unfollowUser,
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationsAsRead,
    supportWorkout
  } = useWorkoutStore();

  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  const allExercises = useMemo(() => [...BASE_EXERCISES, ...customExercises], [customExercises]);

  const filteredExercises = allExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateStreak = () => {
    if (history.length === 0) return 0;
    const sortedDates = history
      .map(w => startOfDay(w.date).getTime())
      .sort((a, b) => b - a);
    
    const uniqueDates = Array.from(new Set(sortedDates));
    let streak = 0;
    let currentDate = startOfDay(new Date()).getTime();
    
    if (uniqueDates[0] < currentDate - 86400000) return 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === currentDate || uniqueDates[i] === currentDate - 86400000) {
        streak++;
        currentDate = uniqueDates[i];
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const targetProfile = useMemo(() => 
    allProfiles.find(p => p.id === selectedUserForProfile?.id) || selectedUserForProfile
  , [allProfiles, selectedUserForProfile]);

  const hallOfFame = useMemo(() => {
    const categories = [
      { id: 'bench', label: 'Supino', aliases: ['1', 'pt-1', 'Supino Reto', 'Bench Press'] },
      { id: 'squat', label: 'Agacho', aliases: ['2', 'pg-6', 'Agachamento', 'Squat'] },
      { id: 'deadlift', label: 'Terra', aliases: ['3', 'Levantamento Terra', 'Deadlift'] }
    ];

    return categories.map(cat => {
      let bestUser: any = null;
      let maxPR = 0;

      allProfiles.forEach(p => {
        const pPRs = p.personal_records || {};
        Object.entries(pPRs).forEach(([exId, oneRM]: [string, any]) => {
          const ex = BASE_EXERCISES.find(e => e.id === exId);
          if (ex && cat.aliases.some(a => ex.name.toLowerCase().includes(a.toLowerCase()) || ex.id === a)) {
            if (oneRM > maxPR) {
              maxPR = oneRM;
              bestUser = p;
            }
          }
        });
      });

      return { ...cat, user: bestUser, value: maxPR };
    });
  }, [allProfiles]);
  
  const calculateLevel = (xp: number) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };
  
  const getLevelTitle = (level: number) => {
    if (level < 10) return 'Frango';
    if (level < 20) return 'Iniciante';
    if (level < 30) return 'Rato de Academia';
    if (level < 40) return 'Monstro';
    if (level < 50) return 'Mutante';
    if (level < 100) return 'Titã';
    return 'Lenda';
  };

  const rank = calculateLevel(totalXP);
  const title = getLevelTitle(rank);

  const getActivityData = () => {
    const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = startOfDay(date).getTime();
      const dayEnd = dayStart + 86400000;
      
      const dayVolume = history
        .filter(w => w.date >= dayStart && w.date < dayEnd)
        .reduce((acc, w) => acc + w.totalVolume, 0);
      
      data.push({
        label: days[date.getDay()],
        volume: dayVolume
      });
    }
    
    const maxVolume = Math.max(...data.map(d => d.volume), 1000);
    return data.map(d => ({
      ...d,
      height: (d.volume / maxVolume) * 100
    }));
  };

  const sortedRanking = useMemo(() => {
    let sorted = [...allProfiles];
    
    // 1. Filter by Weight Category
    if (weightCategory !== 'all') {
      sorted = sorted.filter(p => {
        const weight = Number(p.weight) || 0;
        if (weightCategory === 'pena') return weight < 70;
        if (weightCategory === 'medio') return weight >= 70 && weight <= 85;
        if (weightCategory === 'pesado') return weight > 85;
        return true;
      });
    }

    // 2. Filter by Gender
    if (genderFilter !== 'all') {
      sorted = sorted.filter(p => p.gender === genderFilter);
    }

    // 3. Filter by Age
    if (ageFilter !== 'all') {
      sorted = sorted.filter(p => getAgeCategory(calculateAge(p.birth_date)) === ageFilter);
    }

    // 4. Sort by Category and Timeframe
    sorted.sort((a, b) => {
      if (rankingCategory === 'strength') return (b.strength_score || 0) - (a.strength_score || 0);
      if (rankingCategory === 'volume') {
        const valA = rankingTimeframe === 'weekly' ? (a.weekly_volume || 0) : rankingTimeframe === 'monthly' ? (a.monthly_volume || 0) : (a.total_weight || 0);
        const valB = rankingTimeframe === 'weekly' ? (b.weekly_volume || 0) : rankingTimeframe === 'monthly' ? (b.monthly_volume || 0) : (b.total_weight || 0);
        return Number(valB) - Number(valA);
      }
      // Points (default for Evolution/Frequency for now, or use points)
      const ptsA = rankingTimeframe === 'weekly' ? (a.weekly_points || 0) : rankingTimeframe === 'monthly' ? (a.monthly_points || 0) : (a.points || 0);
      const ptsB = rankingTimeframe === 'weekly' ? (b.weekly_points || 0) : rankingTimeframe === 'monthly' ? (b.monthly_points || 0) : (b.points || 0);
      return ptsB - ptsA;
    });

    return sorted;
  }, [allProfiles, rankingCategory, rankingTimeframe, weightCategory, genderFilter, ageFilter]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'ranking') {
        setShowPushNotification(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const formatDay = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
  };

  const formatHour = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const activityData = getActivityData();

  const personalRecords = Object.entries(useWorkoutStore.getState().lastPerformance)
    .map(([id, perf]) => {
      const exercise = allExercises.find(e => e.id === id);
      return {
        id,
        name: exercise?.name || 'Exercício Desconhecido',
        weight: perf.weight,
        reps: perf.reps
      };
    })
    .sort((a, b) => b.weight - a.weight);

  useEffect(() => {
    let interval: number;
    if (activeWorkout) {
      interval = window.setInterval(() => {
        setWorkoutTime(Math.floor((Date.now() - activeWorkout.startTime) / 1000));
      }, 1000);
    } else {
      setWorkoutTime(0);
    }
    return () => clearInterval(interval);
  }, [activeWorkout]);

  useEffect(() => {
    let interval: number;
    if (restTimer.isActive) {
      interval = window.setInterval(() => {
        tickRestTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer.isActive, tickRestTimer]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Auth />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row text-xs">
      {/* Role Switcher (Dev Only) */}
      <div className="fixed bottom-24 right-4 z-[400] flex flex-col gap-2">
        {(['user', 'instructor', 'admin'] as UserRole[]).map(role => (
          <button
            key={role}
            onClick={() => {
              setRole(role);
              setActiveTab('workout');
            }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all shadow-xl backdrop-blur-md",
              currentUserRole === role 
                ? "bg-primary border-primary text-background scale-110" 
                : "bg-background/80 border-border text-muted-foreground opacity-50 hover:opacity-100"
            )}
          >
            {role[0].toUpperCase()}
          </button>
        ))}
      </div>
      {/* Mobile/Tablet Header */}
      <header className="lg:hidden p-4 border-b border-border flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <h1 className="text-2xl font-display font-bold tracking-tight">
          {activeTab === 'workout' ? 'Treino' : activeTab === 'history' ? 'Histórico' : activeTab === 'ranking' ? 'Ranking' : 'Perfil'}
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

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-xl p-6 sticky top-0 h-screen">
          <div className="mb-10">
            <h1 className="text-2xl font-display font-bold text-primary tracking-tighter flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-background" />
              </div>
              A10 academia
            </h1>
          </div>
          
          <nav className="flex-1 space-y-2">
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
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden relative">
                {allProfiles.find(p => p.id === session?.user.id)?.avatar_url ? (
                  <img src={allProfiles.find(p => p.id === session?.user.id)?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  "JP"
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
                  <span className="text-primary ml-1">( {currentUserRole} )</span>
                </p>
                <p className="text-[10px] text-muted-foreground truncate">Nível {rank}</p>
              </div>
              <Settings 
                onClick={() => { setActiveTab('profile'); setShowEditProfile(true); }}
                className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" 
              />
            </div>
          </div>
        </aside>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-0">
        <div className="lg:hidden">
          <AnimatePresence>
            {showPushNotification && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-20 left-4 right-4 z-50 bg-card border border-border p-4 rounded-[28px] shadow-2xl flex items-start gap-4"
              >
                <div className="bg-primary/20 p-2 rounded-full mt-1">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Alerta de Ranking!</h4>
                  <p className="text-xs text-muted-foreground mt-1">Opa! O Marcos S. acabou de te ultrapassar no Ranking de Volume. Vai deixar?</p>
                </div>
                <button onClick={() => setShowPushNotification(false)} className="p-1">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'workout' && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-6"
            >
              {!activeWorkout ? (
                <div className="space-y-6">
                  {/* User Header */}
                  <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 bg-muted">
                        <img 
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                          alt="User" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-display font-bold">Olá, João Silva <span className="text-primary text-xs uppercase ml-1 animate-pulse">( dev )</span></h2>
                        <p className="text-xs text-muted-foreground capitalize">
                          {formatDay(currentTime)}, {formatHour(currentTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Promo/Events Section */}
                  <div className="space-y-4">
                    {/* Desktop/Tablet Grid */}
                    <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {events.map((event) => (
                        <div key={event.id} className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary to-primary/60 p-6 text-background shadow-lg group min-h-[180px] flex flex-col justify-end">
                          {event.imageUrl && (
                            <div className="absolute inset-0 z-0">
                              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            </div>
                          )}
                          <div className="relative z-10 space-y-2 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-90">
                              <Megaphone className="w-3 h-3 text-white" />
                              <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg text-white border border-white/10">
                                {event.type === 'special' ? 'Evento Especial' : event.type === 'promotion' ? 'Promoção' : event.type === 'holiday' ? 'Feriado' : 'Evento Customizado'}
                              </span>
                            </div>
                            <h3 className="text-xl font-display font-black leading-tight">{event.title}</h3>
                            {event.subtitle && <p className="text-xs font-bold opacity-90 -mt-1">{event.subtitle}</p>}
                            <p className="text-[10px] opacity-90 line-clamp-2 font-medium">{event.description}</p>
                            <button onClick={() => participateInEvent(event.id)} className="mt-2 bg-white text-primary px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-transform">
                              {event.participants.includes('current-user') ? 'Inscrito' : 'Participar Agora'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mobile Auto-Carousel */}
                    <div className="sm:hidden relative h-[220px]">
                      <AnimatePresence mode="wait">
                        {events.length > 0 && (
                          <motion.div
                            key={events[currentEventIndex].id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="absolute inset-0 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary to-primary/60 p-6 text-background shadow-lg flex flex-col justify-end"
                          >
                            {events[currentEventIndex].imageUrl && (
                              <div className="absolute inset-0 z-0">
                                <img src={events[currentEventIndex].imageUrl} alt={events[currentEventIndex].title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                              </div>
                            )}
                            <div className="relative z-10 space-y-2 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-90">
                                <Megaphone className="w-3 h-3 text-white" />
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg text-white border border-white/10">
                                  {events[currentEventIndex].type === 'special' ? 'Evento Especial' : events[currentEventIndex].type === 'promotion' ? 'Promoção' : events[currentEventIndex].type === 'holiday' ? 'Feriado' : 'Evento Customizado'}
                                </span>
                              </div>
                              <h3 className="text-2xl font-display font-black leading-tight">{events[currentEventIndex].title}</h3>
                              {events[currentEventIndex].subtitle && <p className="text-xs font-bold opacity-90 -mt-1">{events[currentEventIndex].subtitle}</p>}
                              <p className="text-xs opacity-90 line-clamp-2 font-medium">{events[currentEventIndex].description}</p>
                              <button onClick={() => participateInEvent(events[currentEventIndex].id)} className="mt-4 bg-white text-primary w-full py-3 rounded-xl text-sm font-black shadow-lg active:scale-95 transition-all">
                                {events[currentEventIndex].participants.includes('current-user') ? 'Você está inscrito ✨' : 'Participar do Evento'}
                              </button>
                            </div>
                            
                            {/* Dots */}
                            <div className="absolute bottom-4 right-6 flex gap-1 z-20">
                              {events.map((_, i) => (
                                <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === currentEventIndex ? "bg-white w-4" : "bg-white/40")} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Admin/Instructor Quick Actions */}
                  {currentUserRole === 'admin' && (
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowAdminDashboard(true)}
                        style={{ background: 'linear-gradient(45deg, #FFD700, #FFA500)' }}
                        className="w-full p-4 rounded-xl text-amber-950 flex items-center justify-center gap-2 font-black shadow-xl shadow-amber-500/20 group hover:scale-[1.02] active:scale-95 transition-all duration-300"
                      >
                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" />
                        <span className="text-xs uppercase tracking-[0.2em]">Painel de Controle Admin</span>
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setShowCreateEvent(true)}
                          className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex flex-col items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase">Novo Evento</span>
                        </button>
                        <button 
                          onClick={() => setShowCreateBadge(true)}
                          className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex flex-col items-center gap-2"
                        >
                          <Trophy className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase">Nova Badge</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {currentUserRole === 'instructor' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setShowCreateTip(true)}
                        className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex flex-col items-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">Nova Dica</span>
                      </button>
                      <button 
                        onClick={() => {
                          setEditingRoutine(null);
                          setShowRoutineEditor(true);
                        }}
                        className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex flex-col items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">Projetar Treino</span>
                      </button>
                    </div>
                  )}

                  {/* Calendar Card */}
                  <div className="bg-card p-5 rounded-2xl border border-border space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Calendário de Treinos
                      </h3>
                      <button className="text-[10px] font-bold text-primary uppercase tracking-wider">Ver tudo</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-center">
                          <p className="text-[10px] text-muted-foreground font-bold mb-1">{day}</p>
                          <div className={cn(
                            "h-8 w-full rounded-lg flex items-center justify-center text-xs font-mono",
                            i === currentTime.getDay() ? "bg-primary text-background font-bold" : "bg-muted/50"
                          )}>
                            {23 + i}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border/50 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <p className="text-[10px] text-muted-foreground font-medium">Próximo treino agendado: Amanhã às 08:00</p>
                    </div>
                  </div>

                  {/* Tips & Orientations Feed */}
                  {tips.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="font-display font-bold flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          Dicas de Instrutores
                        </h3>
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-5 h-5 rounded-full border border-background bg-muted overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="pro" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex overflow-x-auto gap-3 pb-2 -mx-1 px-1 scrollbar-hide">
                        {tips.map((tip) => (
                          <div 
                            key={tip.id} 
                            className="bg-card p-4 rounded-xl border border-border min-w-[240px] max-w-[240px] space-y-3 relative overflow-hidden group hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                {tip.instructorName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold truncate">{tip.instructorName}</p>
                                <p className="text-[8px] text-muted-foreground uppercase">{tip.category === 'tip' ? 'Dica Rápida' : 'Orientação'}</p>
                              </div>
                            </div>
                            <p className="text-xs text-foreground/90 leading-relaxed line-clamp-3 italic">
                              "{tip.content}"
                            </p>
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                              <Award className="w-12 h-12" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                    <h2 className="text-xl font-display font-semibold">Início Rápido</h2>
                    <p className="text-muted-foreground text-sm">Inicie um treino vazio e adicione exercícios conforme avança.</p>
                    <button 
                      onClick={() => startWorkout()}
                      className="w-full bg-primary text-background font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                      Iniciar Treino Vazio
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-lg font-display font-semibold">Minhas Rotinas</h2>
                      <button 
                        onClick={() => {
                          setEditingRoutine(null);
                          setShowRoutineEditor(true);
                        }}
                        className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                         Nova Rotina
                      </button>
                    </div>

                      <div className="flex gap-4 mb-2">
                        <button 
                          onClick={() => setRoutineSection('mine')}
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                            routineSection === 'mine' ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          Minhas Rotinas
                        </button>
                        <button 
                          onClick={() => setRoutineSection('suggested')}
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                            routineSection === 'suggested' ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                           Sugeridas (A10)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {routineSection === 'mine' ? (
                          routines.map((template) => (
                            <div 
                              key={template.id}
                              className="bg-card p-4 rounded-xl border border-border flex justify-between items-center group hover:border-primary/50 transition-colors shadow-sm"
                            >
                              <div onClick={() => startWorkout(template)} className="flex-1 cursor-pointer space-y-2">
                                <div>
                                  <h3 className="font-semibold text-sm">{template.title}</h3>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{template.isRecurring ? 'Semanal' : 'Ocasional'}</p>
                                </div>
                                <div className="flex gap-1">
                                  {[
                                    { idx: 1, label: 'S' },
                                    { idx: 2, label: 'T' },
                                    { idx: 3, label: 'Q' },
                                    { idx: 4, label: 'Q' },
                                    { idx: 5, label: 'S' },
                                    { idx: 6, label: 'S' },
                                    { idx: 0, label: 'D' },
                                  ].map(day => {
                                    const hasExs = (template.days[day.idx] || []).length > 0;
                                    return (
                                      <div 
                                        key={day.idx}
                                        className={cn(
                                          "w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold border transition-colors",
                                          hasExs 
                                            ? "bg-primary/20 border-primary/40 text-primary" 
                                            : "bg-muted/50 border-border text-muted-foreground opacity-30"
                                        )}
                                      >
                                        {day.label}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingRoutine(template);
                                    setShowRoutineEditor(true);
                                  }}
                                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRoutineToDelete(template.id);
                                  }}
                                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          useWorkoutStore.getState().predefinedRoutines.map((routine) => (
                            <div key={routine.id} className="bg-card border-2 border-dashed border-border p-4 rounded-xl space-y-3 hover:border-primary transition-colors flex flex-col justify-between group">
                              <div>
                                <div className="flex justify-between items-start">
                                  <h3 className="font-bold text-sm">{routine.title}</h3>
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[7px] font-black uppercase",
                                    routine.id.startsWith('init') ? "bg-green-500/20 text-green-500" :
                                    routine.id.startsWith('senior') ? "bg-blue-500/20 text-blue-500" :
                                    "bg-orange-500/20 text-orange-500"
                                  )}>
                                    {routine.id.startsWith('init') ? "Iniciante" : routine.id.startsWith('senior') ? "Melhor Idade" : "Performance"}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{routine.description}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  importRoutine(routine);
                                  setRoutineSection('mine');
                                }}
                                className="w-full bg-primary/10 text-primary font-black py-2 rounded-lg text-[10px] tracking-widest uppercase hover:bg-primary hover:text-background transition-all"
                              >
                                <Download className="w-3 h-3 inline mr-1" /> Importar
                              </button>
                            </div>
                          ))
                        )}
                        {routineSection === 'mine' && (
                          <button 
                            onClick={() => {
                              setEditingRoutine({
                                id: '',
                                title: '',
                                description: '',
                                muscleGroups: [],
                                days: {},
                                isRecurring: false
                              });
                              setShowRoutineEditor(true);
                            }}
                            className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all group min-h-[100px]"
                          >
                            <Plus className="w-5 h-5" />
                            <span className="font-bold text-[10px] uppercase tracking-wider">Nova Rotina</span>
                          </button>
                        )}
                      </div>

                    <div className="pt-2">
                       <button 
                        onClick={() => setShowMarketplace(true)}
                        className="w-full py-4 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Importar do Instrutor
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-display font-bold">Treino Ativo</h2>
                      <p className="text-primary text-sm font-mono">{formatTime(workoutTime)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowCancelConfirm(true)}
                        className="text-muted-foreground px-4 py-2 rounded-lg font-bold text-sm hover:text-destructive transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => {
                          const now = new Date();
                          const hours = now.getHours();
                          let timeOfDay = 'da Manhã';
                          if (hours >= 12 && hours < 17) timeOfDay = 'da Tarde';
                          if (hours >= 17 || hours < 4) timeOfDay = 'da Noite';
                          setWorkoutName(`Treino ${timeOfDay}`);
                          setShowFinishModal(true);
                        }}
                        className="bg-primary text-background px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                      >
                        Finalizar
                      </button>
                    </div>
                  </div>

                  {activeWorkout.exercises.map((exercise) => (
                    <div key={exercise.exerciseId} className="bg-card rounded-2xl border border-border overflow-hidden">
                      <div className="p-4 border-b border-border flex justify-between items-center">
                        <h3 className="font-display font-bold text-primary">{exercise.name}</h3>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => removeExercise(exercise.exerciseId)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Exercise Notes */}
                        <div className="px-2">
                          <textarea 
                            placeholder="Adicione notas para este exercício..."
                            value={exercise.notes}
                            onChange={(e) => updateExercise(exercise.exerciseId, { notes: e.target.value })}
                            className="w-full bg-muted/50 border-none rounded-lg p-2 text-xs text-muted-foreground focus:ring-1 focus:ring-primary outline-none resize-none h-12"
                          />
                        </div>

                        <div className="grid grid-cols-[36px_1fr_1fr_36px_24px] gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">
                          <span className="text-center">Série</span>
                          <span className="text-center">Peso</span>
                          <span className="text-center">Reps</span>
                          <span className="text-center">Feito</span>
                          <span></span>
                        </div>
                        {exercise.sets.map((set, idx) => (
                          <div key={set.id} className="grid grid-cols-[36px_1fr_1fr_36px_24px] gap-2 items-center group px-1">
                            <button 
                              onClick={() => {
                                const nextType = SET_TYPES[(SET_TYPES.findIndex(t => t.value === set.type) + 1) % SET_TYPES.length].value;
                                updateSet(exercise.exerciseId, set.id, { type: nextType });
                              }}
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all mx-auto",
                                set.completed ? "bg-primary text-background" : "bg-muted text-muted-foreground border border-border/50"
                              )}
                            >
                              {idx + 1}
                            </button>
                            <input 
                              type="number" 
                              value={set.weight || ''} 
                              onChange={(e) => updateSet(exercise.exerciseId, set.id, { weight: Number(e.target.value) })}
                              placeholder="0"
                              className="bg-muted border-none rounded-lg p-2 text-center font-mono focus:ring-1 focus:ring-primary outline-none min-w-0"
                            />
                            <input 
                              type="number" 
                              value={set.reps || ''} 
                              onChange={(e) => updateSet(exercise.exerciseId, set.id, { reps: Number(e.target.value) })}
                              placeholder="0"
                              className="bg-muted border-none rounded-lg p-2 text-center font-mono focus:ring-1 focus:ring-primary outline-none min-w-0"
                            />
                            <button 
                              onClick={() => updateSet(exercise.exerciseId, set.id, { completed: !set.completed })}
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors mx-auto",
                                set.completed ? "bg-primary text-background" : "bg-muted text-muted-foreground"
                              )}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => removeSet(exercise.exerciseId, set.id)}
                              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity mx-auto"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => addSet(exercise.exerciseId)}
                          className="w-full py-2 rounded-lg bg-muted text-sm font-semibold hover:bg-muted/80 transition-colors"
                        >
                          + Adicionar Série
                        </button>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => setShowExercisePicker(true)}
                    className="w-full border-2 border-dashed border-border rounded-2xl py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="font-bold uppercase tracking-widest text-xs">Adicionar Exercício</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              {history.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <HistoryIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Nenhum treino ainda. Comece a treinar!</p>
                </div>
              ) : (
                history.map((workout) => (
                  <button 
                    key={workout.id} 
                    onClick={() => setSelectedHistoryWorkout(workout)}
                    className="w-full text-left bg-card p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{workout.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {format(workout.date, "d 'de' MMMM, yyyy")} • {Math.floor(workout.duration / 60)}m
                        </p>
                      </div>
                      <span className="text-primary font-mono text-xs font-bold">{workout.totalVolume} kg</span>
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 pb-24"
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
                    <span className="text-[8px] bg-muted text-muted-foreground font-black uppercase px-2 py-1 rounded-full uppercase">
                      {userStats.level === 6 ? 'Lenda' : userStats.level === 5 ? 'Elite' : userStats.level === 4 ? 'Avançado' : userStats.level === 3 ? 'Intermediário' : userStats.level === 2 ? 'Aprendiz' : 'Iniciante'}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    {userStats.instagramUrl && (
                      <a href={userStats.instagramUrl} target="_blank" rel="noreferrer" className="p-2 bg-muted/50 rounded-lg hover:bg-primary/20 transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {userStats.youtubeUrl && (
                      <a href={userStats.youtubeUrl} target="_blank" rel="noreferrer" className="p-2 bg-muted/50 rounded-lg hover:bg-primary/20 transition-colors">
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
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

                <div className="flex gap-3 pt-6">
                  <button 
                    onClick={() => setShowEditProfile(true)}
                    className="flex-1 bg-primary text-background py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    <Settings className="w-4 h-4" />
                    Editar Bio & Métricas
                  </button>
                  <button 
                    onClick={() => supabase.auth.signOut()}
                    className="px-4 bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl border border-border transition-all active:scale-95"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
                {/* Personal Records (PRs) - PHASE 10 */}
                <div className="pt-6 space-y-3">
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
                          <span className="text-sm font-display font-black text-primary">{Math.floor(pr)} <span className="text-[8px] text-muted-foreground">kg</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Conquistas */}
                <div className="pt-6 space-y-3">
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
          )}

          {activeTab === 'ranking' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 pb-24"
            >
              {/* Community Mode Selector */}
              <div className="flex p-1 bg-card border border-border rounded-2xl gap-1">
                <button 
                  onClick={() => setCommunityMode('feed')}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                    communityMode === 'feed' ? "bg-primary text-background shadow-lg" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  Feed Social
                </button>
                <button 
                  onClick={() => setCommunityMode('ranking')}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                    communityMode === 'ranking' ? "bg-primary text-background shadow-lg" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  Ranking Elite
                </button>
              </div>

              {communityMode === 'feed' ? (
                /* SOCIAL FEED */
                <div className="space-y-4">
                  {socialFeed.length === 0 ? (
                    <div className="bg-card p-12 rounded-[32px] border border-border text-center space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-2xl opacity-50">📡</div>
                      <div>
                        <h4 className="font-display font-black uppercase">O silêncio do guerreiro</h4>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-tighter">Siga outros atletas no Ranking para ver seus treinos aqui.</p>
                      </div>
                    </div>
                  ) : (
                    socialFeed.map((workout: any) => (
                      <motion.div 
                        key={workout.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-[32px] border border-border overflow-hidden shadow-xl"
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-border/50 flex items-center justify-between">
                          <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setSelectedUserForProfile(workout.profile)}
                          >
                            <div className="w-10 h-10 rounded-full bg-muted border-2 border-primary/20 overflow-hidden">
                              {workout.profile?.avatar_url ? (
                                <img src={workout.profile.avatar_url} className="w-full h-full object-cover" />
                              ) : <span>👤</span>}
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase group-hover:text-primary transition-colors">{workout.profile?.full_name || 'Atleta'}</p>
                              <p className="text-[8px] text-muted-foreground font-bold uppercase">{format(workout.date, 'dd/MM/yyyy HH:mm')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-[8px] font-black text-primary border border-primary/20">
                            <Trophy className="w-2 h-2" /> +{workout.xpEarned || 0} XP
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                          <div>
                            <h4 className="text-lg font-display font-black uppercase tracking-tight leading-none mb-1">{workout.name}</h4>
                            <div className="flex gap-3">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                <Weight className="w-3 h-3 text-primary" /> {workout.totalVolume?.toLocaleString()} kg
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3 text-orange-500" /> {Math.floor(workout.duration / 60)} min
                              </span>
                            </div>
                          </div>

                          {/* Exercise Summary Preview */}
                          <div className="space-y-1">
                            {workout.exercises?.slice(0, 3).map((ex: any, idx: number) => (
                              <div key={idx} className="bg-muted/30 px-3 py-2 rounded-xl flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-tighter truncate max-w-[150px]">{ex.name}</span>
                                <span className="text-[8px] font-black text-muted-foreground">{ex.sets?.length} séries</span>
                              </div>
                            ))}
                            {workout.exercises?.length > 3 && (
                              <p className="text-[8px] font-bold text-center text-muted-foreground pt-1">+ {workout.exercises.length - 3} exercícios no treino</p>
                            )}
                          </div>
                        </div>

                        {/* Footer - Interactions */}
                        <div className="px-4 py-3 bg-muted/20 flex gap-2 border-t border-border/50">
                          <button 
                            onClick={async () => {
                              await supportWorkout(workout.id);
                              // Feedback visual imediato
                            }}
                            className="flex-1 bg-card border border-border py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all active:scale-95 text-[9px] font-black uppercase tracking-widest"
                          >
                            <Flame className="w-3 h-3 text-orange-500" /> Apoiar
                          </button>
                          <button 
                            className="flex-1 bg-card border border-border py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all active:scale-95 text-[9px] font-black uppercase tracking-widest"
                            onClick={() => setSelectedHistoryWorkout(workout)}
                          >
                            <MessageCircle className="w-3 h-3 text-blue-500" /> Detalhes
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                /* RANKING ELITE */
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black uppercase text-xs tracking-widest text-muted-foreground">Sua Classificação</h3>
                  <div className="flex gap-1 p-1 bg-muted rounded-xl">
                    {['weekly', 'monthly', 'all'].map(p => (
                      <button 
                        key={p} 
                        onClick={() => setRankingTimeframe(p as any)}
                        className={cn(
                          "px-3 py-1 text-[8px] font-black uppercase rounded-lg transition-all",
                          rankingTimeframe === p ? "bg-background text-primary shadow-sm" : "hover:bg-background/50 text-muted-foreground"
                        )}
                      >
                        {p === 'all' ? 'Total' : p === 'weekly' ? 'Sem' : 'Mês'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Weight Category Filter */}
                  <div className="flex gap-2 p-1 bg-muted/50 rounded-xl overflow-x-auto no-scrollbar">
                    {[
                      { id: 'all', label: 'Todos Pesos' },
                      { id: 'pena', label: 'Pena (<70kg)' },
                      { id: 'medio', label: 'Médio (70-85kg)' },
                      { id: 'pesado', label: 'Pesado (>85kg)' }
                    ].map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setWeightCategory(cat.id as any)}
                        className={cn(
                          "px-3 py-1.5 text-[7px] font-black uppercase rounded-lg whitespace-nowrap transition-all",
                          weightCategory === cat.id ? "bg-primary text-background shadow-md" : "text-muted-foreground hover:bg-background/50"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Gender and Age Filters */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <div className="flex gap-1 p-1 bg-muted/30 rounded-xl shrink-0">
                      {['all', 'masculino', 'feminino'].map(g => (
                        <button 
                          key={g} 
                          onClick={() => setGenderFilter(g as any)}
                          className={cn(
                            "px-3 py-1.5 text-[7px] font-black uppercase rounded-lg transition-all",
                            genderFilter === g ? "bg-card border border-border shadow-sm scale-[1.02]" : "text-muted-foreground opacity-50"
                          )}
                        >
                          {g === 'all' ? 'Tudo' : g === 'masculino' ? 'Masc' : 'Fem'}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-1 p-1 bg-muted/30 rounded-xl shrink-0">
                      {['all', 'young', 'adult', 'master', 'senior'].map(a => (
                        <button 
                          key={a}
                          onClick={() => setAgeFilter(a as any)}
                          className={cn(
                            "px-3 py-1.5 text-[7px] font-black uppercase rounded-lg transition-all",
                            ageFilter === a ? "bg-card border border-border shadow-sm scale-[1.02]" : "text-muted-foreground opacity-50"
                          )}
                        >
                          {a === 'all' ? 'Idades' : a === 'young' ? 'Jovem' : a === 'adult' ? 'Adulto' : a === 'master' ? 'Master' : 'Sênior'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

                <div className="flex items-end justify-around py-4 h-48 bg-muted/20 rounded-[24px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
                  
                  {/* 3rd Place */}
                  <div 
                    className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => {
                      const u = sortedRanking[2];
                      if (u) setSelectedUserForProfile(u);
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg border-2 border-[#CD7F32] overflow-hidden">
                      {sortedRanking[2]?.avatar_url ? (
                        <img src={sortedRanking[2].avatar_url} className="w-full h-full object-cover" />
                      ) : '👤'}
                    </div>
                    <div className="w-12 h-16 bg-[#CD7F32]/20 border-t-4 border-[#CD7F32] rounded-t-lg flex items-center justify-center font-black">3º</div>
                  </div>

                  {/* 1st Place */}
                  <div 
                    className="flex flex-col items-center gap-2 mb-4 scale-110 cursor-pointer active:scale-105 transition-transform"
                    onClick={() => {
                      const u = sortedRanking[0];
                      if (u) setSelectedUserForProfile(u);
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl border-2 border-primary shadow-[0_0_20px_rgba(255,215,0,0.2)] overflow-hidden">
                      {sortedRanking[0]?.avatar_url ? (
                        <img src={sortedRanking[0].avatar_url} className="w-full h-full object-cover" />
                      ) : '👑'}
                    </div>
                    <div className="w-16 h-28 bg-primary/10 border-t-4 border-primary rounded-t-lg flex items-center justify-center font-black">1º</div>
                  </div>

                  {/* 2nd Place */}
                  <div 
                    className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => {
                      const u = sortedRanking[1];
                      if (u) setSelectedUserForProfile(u);
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg border-2 border-[#C0C0C0] overflow-hidden">
                      {sortedRanking[1]?.avatar_url ? (
                        <img src={sortedRanking[1].avatar_url} className="w-full h-full object-cover" />
                      ) : '👤'}
                    </div>
                    <div className="w-12 h-20 bg-[#C0C0C0]/20 border-t-4 border-[#C0C0C0] rounded-t-lg flex items-center justify-center font-black">2º</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary text-background rounded-2xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background/20 rounded-full flex items-center justify-center font-black">
                      #{sortedRanking.findIndex(p => p.id === session?.user?.id) + 1 || '--'}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Sua Posição</p>
                      <p className="font-display font-black uppercase">
                        {rankingCategory === 'strength' 
                          ? `${Math.floor(userStats.strengthScore || 0)} KG`
                          : rankingCategory === 'frequency'
                          ? `${userStats.streak || 0} DIAS`
                          : rankingCategory === 'volume'
                          ? `${(rankingTimeframe === 'weekly' ? (userStats.weeklyVolume || 0) : rankingTimeframe === 'monthly' ? (userStats.monthlyVolume || 0) : (userStats.totalWeight || 0)).toLocaleString()} KG`
                          : `${(rankingTimeframe === 'weekly' ? (userStats.weeklyPoints || 0) : rankingTimeframe === 'monthly' ? (userStats.monthlyPoints || 0) : (userStats.points || 0)).toLocaleString()} PTS`
                        }
                      </p>
                    </div>
                  </div>
                </div>

              {/* Ranking Categories */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'volume', label: 'Volume Total', icon: BarChart3, color: 'text-primary' },
                  { id: 'strength', label: 'Força Bruta', icon: Weight, color: 'text-orange-500' },
                  { id: 'frequency', label: 'Frequência', icon: Flame, color: 'text-blue-500' },
                  { id: 'evolution', label: 'Evolução', icon: Zap, color: 'text-purple-500' }
                ].map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setRankingCategory(cat.id as any)}
                    className={cn(
                      "p-4 rounded-[20px] bg-card border flex flex-col items-center text-center gap-3 transition-all active:scale-95",
                      rankingCategory === cat.id ? "border-primary shadow-lg scale-105" : "border-border"
                    )}
                  >
                    <div className={cn("p-3 rounded-2xl", rankingCategory === cat.id ? "bg-primary text-background" : "bg-muted text-muted-foreground opacity-60")}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[10px] uppercase tracking-tighter line-clamp-1">{cat.label}</h4>
                      <p className="text-[8px] text-muted-foreground uppercase font-black">Ver Top 50</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Hall da Fama - NEW PHASE 10 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-primary" /> Hall da Fama (Recordes)
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {hallOfFame.map(record => (
                    <div 
                      key={record.id} 
                      onClick={() => record.user && setSelectedUserForProfile(record.user)}
                      className="bg-card/40 border border-border p-3 rounded-2xl flex flex-col items-center gap-2 relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
                    >
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg border-2 border-primary/20 overflow-hidden relative">
                        {record.user?.avatar_url ? (
                          <img src={record.user.avatar_url} className="w-full h-full object-cover" />
                        ) : record.user ? '👤' : '⌛'}
                      </div>
                      <div className="text-center">
                        <p className="text-[6px] font-black uppercase text-muted-foreground">{record.label}</p>
                        <p className="text-[10px] font-display font-black text-primary">{Math.floor(record.value)} kg</p>
                        <p className="text-[6px] font-bold text-muted-foreground truncate w-16 px-1">
                          {record.user?.full_name?.split(' ')[0] || record.user?.email?.split('@')[0] || '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard Detail List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Líderes - {rankingCategory.toUpperCase()}</h3>
                </div>
                
                <div className="bg-card rounded-[24px] border border-border divide-y divide-border overflow-hidden shadow-sm">
                  {sortedRanking
                    .map((user, idx) => {
                      const isMe = user.id === session?.user?.id;
                      return (
                        <div 
                          key={user.id} 
                          onClick={() => setSelectedUserForProfile(user)}
                          className={cn(
                            "p-4 flex items-center justify-between transition-colors cursor-pointer active:bg-muted/10", 
                            isMe ? "bg-primary/5 shadow-inner" : "hover:bg-muted/5"
                          )}
                        >
                          <div className="flex items-center gap-4 text-left">
                            <span className={cn("font-black text-xs w-4", idx === 0 ? "text-primary" : "text-muted-foreground opacity-50")}>#{idx + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs overflow-hidden">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span>👤</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm tracking-tight flex items-center gap-1">
                                {user.full_name || 'Usuário'} 
                                {isMe && <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded ml-1">VOCÊ</span>}
                                {user.is_test && <span className="text-[8px] bg-muted text-muted-foreground px-1 py-0.5 rounded font-mono">TESTE</span>}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {rankingCategory === 'strength' 
                                  ? `${Math.floor(user.strength_score || 0)} KG`
                                  : rankingCategory === 'frequency'
                                  ? `${user.streak || 0} DIAS`
                                  : rankingCategory === 'volume'
                                  ? `${(rankingTimeframe === 'weekly' ? (user.weekly_volume || 0) : rankingTimeframe === 'monthly' ? (user.monthly_volume || 0) : (user.total_weight || 0)).toLocaleString()} KG`
                                  : `${(rankingTimeframe === 'weekly' ? (user.weekly_points || 0) : rankingTimeframe === 'monthly' ? (user.monthly_points || 0) : (user.points || 0)).toLocaleString()} PTS`
                                }
                              </p>
                            </div>
                          </div>
                          {idx === 0 && <span className="text-xl">👑</span>}
                          {idx !== 0 && <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </main>
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditProfile(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-black uppercase tracking-tight">Editar Perfil</h3>
                <button onClick={() => setShowEditProfile(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome de Exibição</label>
                  <input 
                    type="text" 
                    placeholder="Seu nome completo"
                    defaultValue={userStats.fullName} 
                    onChange={(e) => updateProfile({ fullName: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Peso (kg)</label>
                    <input 
                      type="number" 
                      defaultValue={userStats.weight} 
                      onChange={(e) => updateProfile({ weight: Number(e.target.value) })}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Altura (cm)</label>
                    <input 
                      type="number" 
                      defaultValue={userStats.height}
                      onChange={(e) => updateProfile({ height: Number(e.target.value) })}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Privacidade dos Dados</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border">
                          <Eye className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase">Mostrar Métricas</p>
                          <p className="text-[8px] text-muted-foreground uppercase">Peso, Altura e Idade</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => updateProfile({ showSensitiveData: !userStats.showSensitiveData })}
                        className={cn("w-10 h-5 rounded-full transition-colors relative", userStats.showSensitiveData ? "bg-primary" : "bg-muted")}
                      >
                        <motion.div 
                          animate={{ x: userStats.showSensitiveData ? 22 : 2 }}
                          className="absolute top-1 w-3 h-3 bg-background rounded-full"
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border">
                          <Award className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase">Mostrar Badges</p>
                          <p className="text-[8px] text-muted-foreground uppercase">Minhas Conquistas</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => updateProfile({ showBadges: !userStats.showBadges })}
                        className={cn("w-10 h-5 rounded-full transition-colors relative", userStats.showBadges ? "bg-primary" : "bg-muted")}
                      >
                        <motion.div 
                          animate={{ x: userStats.showBadges ? 22 : 2 }}
                          className="absolute top-1 w-3 h-3 bg-background rounded-full"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Redes Sociais</h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Link do Instagram"
                        defaultValue={userStats.instagramUrl}
                        onChange={(e) => updateProfile({ instagramUrl: e.target.value })}
                        className="w-full bg-muted border border-border rounded-xl pl-12 pr-4 py-4 font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Link do YouTube"
                        defaultValue={userStats.youtubeUrl}
                        onChange={(e) => updateProfile({ youtubeUrl: e.target.value })}
                        className="w-full bg-muted border border-border rounded-xl pl-12 pr-4 py-4 font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowEditProfile(false)}
                  className="w-full bg-primary text-background py-5 rounded-xl font-black uppercase tracking-widest text-[12px] shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Finalizar Edição
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Profile Modal */}
      <AnimatePresence>
        {selectedUserForProfile && targetProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserForProfile(null)}
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-lg bg-card border border-border rounded-[40px] shadow-2xl relative overflow-hidden"
            >
              <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
                <button onClick={() => setSelectedUserForProfile(null)} className="absolute top-6 right-6 p-2 bg-background/50 backdrop-blur-md rounded-full hover:bg-background transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-8 pb-8 -mt-16 relative">
                <div className="w-32 h-32 rounded-full border-8 border-card bg-muted flex items-center justify-center text-4xl overflow-hidden shadow-2xl mb-4">
                  {targetProfile.avatar_url ? (
                    <img src={targetProfile.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>

                <div className="space-y-1 mb-6 text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-display font-black uppercase tracking-tighter">
                      {targetProfile.full_name || targetProfile.username || 'Usuário'}
                    </h2>
                    {targetProfile.is_test && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-mono">TESTE</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {targetProfile.role === 'instructor' ? 'Elite Coach' : 'Membro Premium'}
                    </p>
                    <div className="flex gap-2">
                      {targetProfile.instagram_url && (
                        <a href={targetProfile.instagram_url} target="_blank" rel="noreferrer" className="p-2 bg-muted/50 rounded-lg hover:bg-primary/20 transition-colors">
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {targetProfile.youtube_url && (
                        <a href={targetProfile.youtube_url} target="_blank" rel="noreferrer" className="p-2 bg-muted/50 rounded-lg hover:bg-primary/20 transition-colors">
                          <Youtube className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="p-4 bg-muted/30 rounded-3xl text-center border border-border/50">
                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Pontos</p>
                    <p className="text-lg font-display font-black text-primary">{(targetProfile.points||0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-3xl text-center border border-border/50">
                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Força</p>
                    <p className="text-lg font-display font-black">{Math.floor(targetProfile.strength_score || 0)} <span className="text-[8px]">KG</span></p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-3xl text-center border border-border/50">
                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Streak</p>
                    <p className="text-lg font-display font-black text-orange-500">{targetProfile.streak || 0} 🔥</p>
                  </div>
                </div>

                <div className="flex justify-center gap-8 mb-8 pb-4 border-b border-border/30">
                  <div className="text-center">
                    <p className="text-[12px] font-black">{targetProfile.follower_count ?? (targetProfile as any).followerCount ?? 0}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Seguidores</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] font-black">{targetProfile.following_count ?? (targetProfile as any).followingCount ?? 0}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Seguindo</p>
                  </div>
                </div>

                {targetProfile.show_sensitive_data !== false && (
                  <div className="space-y-4 text-left mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Detalhes do Atleta</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border border-border/30">
                        <Scale className="w-5 h-5 text-primary opacity-50" />
                        <div>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase">Peso</p>
                          <p className="text-sm font-black">{targetProfile.weight || '--'} kg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border border-border/30">
                        <User className="w-5 h-5 text-primary opacity-50" />
                        <div>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase">Idade</p>
                          <p className="text-sm font-black">{calculateAge(targetProfile.birth_date) || '--'} anos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {targetProfile.show_badges !== false && (
                  <div className="space-y-4 text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Conquistas Recentes</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {badges.slice(0, 4).map(badge => {
                        const isEarned = targetProfile.points > 5000; 
                        return (
                          <div 
                            key={badge.id}
                            className={cn(
                              "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border transition-all duration-300",
                              isEarned ? "bg-primary/10 border-primary/20" : "bg-muted/30 border-transparent opacity-40 grayscale"
                            )}
                          >
                            <span className="text-lg">{badge.icon}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => {
                    const isFollowing = follows.includes(targetProfile.id);
                    if (isFollowing) {
                      unfollowUser(targetProfile.id);
                    } else {
                      followUser(targetProfile.id);
                    }
                  }}
                  className={cn(
                    "w-full mt-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[12px] shadow-2xl transition-all text-center active:scale-95",
                    follows.includes(targetProfile.id) 
                      ? "bg-muted text-muted-foreground" 
                      : "bg-primary text-background shadow-primary/30"
                  )}
                >
                  {follows.includes(targetProfile.id) ? 'Deixar de Seguir' : 'Seguir Atleta'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {restTimer.isActive && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50"
          >
            <div className="bg-primary text-background p-4 rounded-2xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-background/20 p-2 rounded-lg">
                  <Timer className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Descansando</p>
                  <p className="text-2xl font-mono font-bold">{restTimer.remaining}s</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => stopRestTimer()}
                  className="bg-background/20 px-4 py-2 rounded-lg font-bold text-xs"
                >
                  Pular
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-4 flex justify-around items-center z-50 pb-8">
        <button 
          onClick={() => setActiveTab('workout')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'workout' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Treino</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'history' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <HistoryIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Histórico</span>
        </button>
        <button 
          onClick={() => setActiveTab('ranking')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'ranking' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Comunidade</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'profile' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
        </button>
      </nav>

      {/* Finish Workout Modal */}
      <AnimatePresence>
        {showFinishModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-display font-bold">Finalizar Treino</h3>
                <p className="text-muted-foreground text-sm">Bom trabalho! Dê um nome à sua sessão.</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Nome do Treino</label>
                  <input 
                    type="text"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="w-full bg-muted border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="ex: Treino Pesado de Pernas"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    endWorkout(workoutName);
                    setShowFinishModal(false);
                    setActiveTab('history');
                  }}
                  className="w-full bg-primary text-background font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                  Salvar Treino
                </button>
                <button 
                  onClick={() => setShowFinishModal(false)}
                  className="w-full bg-muted font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Wrapped Modal */}
      <AnimatePresence>
        {showWeeklyWrapped && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-purple-600 to-indigo-800 p-8 rounded-3xl max-w-sm w-full space-y-8 shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowWeeklyWrapped(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-center relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Gym Wrapped</p>
                <h3 className="text-3xl font-display font-bold">Sua Semana</h3>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                  <p className="text-sm opacity-80">Você queimou</p>
                  <p className="text-4xl font-mono font-bold my-1">3.240</p>
                  <p className="text-xs opacity-80">calorias nesta semana</p>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs font-bold text-green-300">🔥 24% acima da média da academia!</p>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                  <p className="text-sm opacity-80">Sua posição no Ranking</p>
                  <p className="text-4xl font-mono font-bold my-1">Top 5%</p>
                  <p className="text-xs opacity-80">dos alunos mais consistentes</p>
                </div>
              </div>

              <div className="relative z-10 pt-4">
                <button 
                  onClick={() => setShowWeeklyWrapped(false)}
                  className="w-full bg-white text-indigo-900 font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                  Incrível!
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute -left-10 -bottom-10 opacity-10">
                <Trophy className="w-48 h-48" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-display font-bold">Cancelar Treino?</h3>
                <p className="text-muted-foreground text-sm">Todo o progresso desta sessão será perdido. Isso não pode ser desfeito.</p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    cancelWorkout();
                    setShowCancelConfirm(false);
                  }}
                  className="w-full bg-destructive text-destructive-foreground font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                  Sim, Cancelar Treino
                </button>
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="w-full bg-muted font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                  Continuar Treinando
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Detail Modal */}
      <AnimatePresence>
        {selectedHistoryWorkout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-card border-t sm:border border-border w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[80vh] sm:rounded-2xl flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-display font-bold">{selectedHistoryWorkout.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {format(selectedHistoryWorkout.date, "d 'de' MMMM, yyyy")} • {Math.floor(selectedHistoryWorkout.duration / 60)}m
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedHistoryWorkout(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedHistoryWorkout.exercises.map((exercise, i) => (
                  <div key={i} className="space-y-3">
                    <h4 className="font-bold text-primary">{exercise.name}</h4>
                    {exercise.notes && (
                      <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg italic">
                        {exercise.notes}
                      </p>
                    )}
                    <div className="space-y-1">
                      {exercise.sets.map((set, si) => (
                        <div key={si} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {si + 1}
                            </span>
                          </div>
                          <div className="flex gap-4 font-mono">
                            <span>{set.weight} kg</span>
                            <span className="text-muted-foreground">x</span>
                            <span>{set.reps} reps</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-6 border-t border-border">
                  <button 
                    onClick={() => {
                        // Using a simple state for workout deletion too
                        if (confirm('Tem certeza de que deseja excluir este treino?')) {
                          deleteWorkout(selectedHistoryWorkout.id);
                          setSelectedHistoryWorkout(null);
                        }
                    }}
                    className="w-full text-destructive font-bold text-sm py-4 rounded-xl border border-destructive/20 hover:bg-destructive/10 transition-colors"
                  >
                    Excluir Treino
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showRoutineEditor && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[110] bg-background flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <button 
                onClick={() => {
                  setShowRoutineEditor(false);
                  setEditingRoutine(null);
                }} 
                className="p-2 text-muted-foreground"
              >
                Cancelar
              </button>
              <h2 className="font-display font-bold">{editingRoutine?.id ? 'Editar Rotina' : 'Nova Rotina'}</h2>
              <button 
                onClick={() => {
                  if (!editingRoutine?.title) {
                    alert('Por favor, dê um nome à rotina.');
                    return;
                  }
                  
                  const hasExercises = (Object.values(editingRoutine.days || {}) as any[]).some(dayExs => dayExs.length > 0);
                  if (!hasExercises) {
                    alert('Adicione ao menos um exercício em algum dia da semana.');
                    return;
                  }
                  
                  if (editingRoutine.id) {
                    updateRoutine(editingRoutine.id, editingRoutine);
                  } else {
                    saveRoutine(editingRoutine);
                  }
                  setShowRoutineEditor(false);
                  setEditingRoutine(null);
                }}
                className="text-primary font-bold px-4 py-2"
              >
                Salvar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Nome da Rotina</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Minha Rotina Semanal"
                    value={editingRoutine?.title || ''}
                    onChange={(e) => setEditingRoutine(prev => prev ? { ...prev, title: e.target.value } : { 
                      id: '', title: e.target.value, description: '', muscleGroups: [], days: {} 
                    } as any)}
                    className="w-full bg-card border border-border rounded-xl p-4 focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Calendário Semanal</label>
                  <div className="flex justify-between items-center bg-muted/50 p-1 rounded-xl">
                    {[
                      { idx: 1, label: 'S' },
                      { idx: 2, label: 'T' },
                      { idx: 3, label: 'Q' },
                      { idx: 4, label: 'Q' },
                      { idx: 5, label: 'S' },
                      { idx: 6, label: 'S' },
                      { idx: 0, label: 'D' },
                    ].map((day) => (
                      <button
                        key={day.idx}
                        onClick={() => setActiveRoutineDay(day.idx)}
                        className={cn(
                          "w-10 h-10 rounded-lg text-xs font-bold transition-all",
                          activeRoutineDay === day.idx 
                            ? "bg-primary text-background shadow-lg scale-105" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          Exerícios de {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][activeRoutineDay]}
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowExercisePicker(true)}
                        className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded"
                      >
                        + Adicionar
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {(editingRoutine?.days?.[activeRoutineDay] || []).map((ex, idx) => (
                        <div key={idx} className="bg-card p-4 rounded-xl border border-border flex justify-between items-center">
                          <div>
                            <p className="font-bold text-sm">{ex.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <input 
                                type="number" 
                                value={ex.sets}
                                onChange={(e) => {
                                  const dayExcercises = [...(editingRoutine?.days?.[activeRoutineDay] || [])];
                                  dayExcercises[idx].sets = Number(e.target.value);
                                  setEditingRoutine({ 
                                    ...editingRoutine!, 
                                    days: { ...editingRoutine!.days, [activeRoutineDay]: dayExcercises } 
                                  });
                                }}
                                className="w-10 bg-muted rounded px-1 py-0.5 text-xs text-center outline-none"
                              />
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">séries</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const dayExcercises = (editingRoutine?.days?.[activeRoutineDay] || []).filter((_, i) => i !== idx);
                              setEditingRoutine({ 
                                ...editingRoutine!, 
                                days: { ...editingRoutine!.days, [activeRoutineDay]: dayExcercises } 
                              });
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {(!editingRoutine?.days?.[activeRoutineDay] || editingRoutine.days[activeRoutineDay].length === 0) && (
                        <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                          <p className="text-xs text-muted-foreground px-10">Descanso ou nenhum exercício adicionado.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold">Rotina Recorrente</p>
                    <p className="text-[10px] text-muted-foreground">Repetir esta rotina todas as semanas.</p>
                  </div>
                  <button 
                    onClick={() => setEditingRoutine(prev => prev ? { ...prev, isRecurring: !prev.isRecurring } : null as any)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      editingRoutine?.isRecurring ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      editingRoutine?.isRecurring ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMarketplace && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[120] bg-background flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <button onClick={() => setShowMarketplace(false)} className="p-2 text-muted-foreground">
                <X className="w-6 h-6" />
              </button>
              <h2 className="font-display font-bold">Explorar Treinos</h2>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 space-y-2 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-primary">Dicas Pro</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Importe rotinas criadas por profissionais e adapte-as ao seu ritmo.</p>
                </div>
                <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/10" />
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Instrutores Verificados</h4>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    // --- Instructor Routines from Store ---
                    ...routines.filter(r => r.authorRole === 'instructor'),
                    // --- Built-in Professional Routines ---
                    {
                      id: 'inst-1',
                      title: 'Hipertrofia Máxima (Fellipe Franco)',
                      description: 'Treino ABCD focado em volume muscular.',
                      muscleGroups: ['Peito', 'Costas', 'Pernas', 'Braços'],
                      authorRole: 'instructor',
                      days: {
                        1: [{ exerciseId: '1', name: 'Supino Reto', sets: 4 }],
                        3: [{ exerciseId: '3', name: 'Levantamento Terra', sets: 4 }]
                      }
                    },
                    {
                      id: 'inst-2',
                      title: 'Strongman Iniciante (Paulo Muzy)',
                      description: 'Foco em força progressiva e técnica.',
                      muscleGroups: ['Full Body'],
                      authorRole: 'instructor',
                      days: {
                        2: [{ exerciseId: '2', name: 'Agachamento', sets: 5 }],
                        4: [{ exerciseId: '1', name: 'Supino Reto', sets: 5 }]
                      }
                    }
                  ].map((routine) => (
                    <div key={routine.id} className="bg-card p-5 rounded-2xl border border-border space-y-4 shadow-sm group">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h5 className="font-bold text-sm line-clamp-1">{routine.title}</h5>
                          <p className="text-[10px] text-muted-foreground line-clamp-2">{routine.description}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors overflow-hidden shrink-0">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${routine.id}`} 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[8px] font-bold uppercase tracking-tighter">
                        {routine.muscleGroups.map(m => (
                          <span key={m} className="px-2 py-0.5 rounded bg-primary/10 text-primary">{m}</span>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          importRoutine(routine as any);
                          setShowMarketplace(false);
                        }}
                        className="w-full bg-muted hover:bg-primary hover:text-background transition-all font-bold py-3 rounded-xl text-[10px] flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Importar para Minhas Rotinas
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {routineToDelete && (
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border/50 p-8 rounded-[32px] shadow-2xl space-y-6 relative overflow-hidden max-w-sm w-full"
            >
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-display font-bold">Excluir Rotina?</h3>
                <p className="text-sm text-muted-foreground">Tem certeza de que deseja excluir esta rotina? Esta ação não pode ser desfeita.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setRoutineToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-muted font-bold text-sm hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (routineToDelete) deleteRoutine(routineToDelete);
                    setRoutineToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExercisePicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-background flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center gap-4">
              <button onClick={() => setShowExercisePicker(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
              <div className="flex-1 bg-muted rounded-xl flex items-center px-3 gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar exercícios..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none py-2 outline-none w-full text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  Nenhum exercício encontrado para "{searchQuery}"
                </div>
              ) : (
                filteredExercises.map((exercise) => (
                  <button 
                    key={exercise.id}
                    onClick={() => {
                      if (showRoutineEditor) {
                        setEditingRoutine(prev => {
                          const currentDayExs = [...(prev?.days?.[activeRoutineDay] || [])];
                          const newExs = [...currentDayExs, { exerciseId: exercise.id, name: exercise.name, sets: 3 }];
                          const uniqueMuscles = Array.from(new Set([...(prev?.muscleGroups || []), exercise.muscle]));
                          return { 
                            ...prev, 
                            days: { ...prev?.days, [activeRoutineDay]: newExs },
                            muscleGroups: uniqueMuscles 
                          } as any;
                        });
                      } else {
                        addExercise(exercise);
                      }
                      setShowExercisePicker(false);
                      setSearchQuery('');
                    }}
                    className="w-full bg-card p-4 rounded-xl border border-border flex justify-between items-center hover:border-primary/50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-bold">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">{exercise.muscle} • {exercise.equipment}</p>
                    </div>
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin: Create Event Modal */}
      <AnimatePresence>
        {showCreateEvent && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[2000] bg-background flex flex-col"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-card">
              <button onClick={() => setShowCreateEvent(false)} className="p-2"><X className="w-6 h-6" /></button>
              <h2 className="font-display font-bold">Novo Evento</h2>
              <div className="w-10" />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Título do Evento</label>
                <input id="ev-title" type="text" className="w-full bg-card border border-border rounded-xl p-4 focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Desafio 30 Dias" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Subtítulo</label>
                <input id="ev-subtitle" type="text" className="w-full bg-card border border-border rounded-xl p-4 focus:ring-1 focus:ring-primary outline-none" placeholder="Foco total no verão" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">URL da Imagem Capa</label>
                <input id="ev-imageUrl" type="text" className="w-full bg-card border border-border rounded-xl p-4 focus:ring-1 focus:ring-primary outline-none" placeholder="https://exemplo.com/banner.jpg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Início</label>
                  <input id="ev-start" type="date" className="w-full bg-card border border-border rounded-xl p-4 text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Fim</label>
                  <input id="ev-end" type="date" className="w-full bg-card border border-border rounded-xl p-4 text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                  {['special', 'custom', 'promotion', 'holiday'].map(type => (
                    <button 
                      key={type}
                      id={`ev-type-${type}`}
                      onClick={() => (document.getElementById('ev-type-val') as any).value = type}
                      className="py-2 text-[8px] font-bold rounded-lg hover:bg-background transition-colors focus:bg-primary focus:text-background uppercase"
                    >
                      {type === 'special' ? 'Especial' : type === 'promotion' ? 'Promo' : type === 'holiday' ? 'Feriado' : 'Custom'}
                    </button>
                  ))}
                  <input type="hidden" id="ev-type-val" defaultValue="special" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Descrição</label>
                <textarea id="ev-desc" className="w-full bg-card border border-border rounded-xl p-4 h-32 focus:ring-1 focus:ring-primary outline-none resize-none text-sm" placeholder="Detalhes..." />
              </div>
              <button 
                onClick={() => {
                  const title = (document.getElementById('ev-title') as HTMLInputElement).value;
                  const subtitle = (document.getElementById('ev-subtitle') as HTMLInputElement).value;
                  const type = (document.getElementById('ev-type-val') as HTMLInputElement).value as any;
                  const description = (document.getElementById('ev-desc') as HTMLTextAreaElement).value;
                  const imageUrl = (document.getElementById('ev-imageUrl') as HTMLInputElement).value;
                  const startDate = (document.getElementById('ev-start') as HTMLInputElement).value;
                  const endDate = (document.getElementById('ev-end') as HTMLInputElement).value;

                  if (title && description) {
                    addEvent({ 
                      title, 
                      subtitle: subtitle || 'Novo Evento',
                      type: type as any, 
                      description, 
                      imageUrl,
                      startDate: startDate ? new Date(startDate).getTime() : Date.now(),
                      endDate: endDate ? new Date(endDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000
                    });
                    setShowCreateEvent(false);
                  }
                }}
                className="w-full bg-primary text-background font-black py-4 rounded-xl shadow-lg uppercase tracking-widest active:scale-95 transition-all"
              >
                Publicar Evento
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin: Create Badge Modal */}
      <AnimatePresence>
        {showCreateBadge && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[1100] bg-background flex flex-col"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-card">
              <button onClick={() => setShowCreateBadge(false)} className="p-2"><X className="w-6 h-6" /></button>
              <h2 className="font-display font-bold">Nova Badge</h2>
              <div className="w-10" />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Nome</label>
                  <input id="bg-name" type="text" className="w-full bg-card border border-border rounded-xl p-4 text-sm" placeholder="Ex: Alpha" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">ícone</label>
                  <input id="bg-icon" type="text" className="w-full bg-card border border-border rounded-xl p-4 text-center text-xl" placeholder="🛡️" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Requisito</label>
                <input id="bg-req" type="text" className="w-full bg-card border border-border rounded-xl p-4 text-sm" placeholder="Ex: 10 treinos" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Descrição</label>
                <textarea id="bg-desc" className="w-full bg-card border border-border rounded-xl p-4 h-24 text-sm resize-none" placeholder="Descrição..." />
              </div>
              <button 
                onClick={() => {
                  const name = (document.getElementById('bg-name') as HTMLInputElement).value;
                  const icon = (document.getElementById('bg-icon') as HTMLInputElement).value;
                  const requirement = (document.getElementById('bg-req') as HTMLInputElement).value;
                  const description = (document.getElementById('bg-desc') as HTMLTextAreaElement).value;
                  if (name && icon && requirement) {
                    addBadge({ name, icon, requirement, description });
                    setShowCreateBadge(false);
                  }
                }}
                className="w-full bg-primary text-background font-black py-4 rounded-xl shadow-lg uppercase tracking-widest active:scale-95 transition-all"
              >
                Criar Badge
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructor: Create Tip Modal */}
      <AnimatePresence>
        {showCreateTip && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[1100] bg-background flex flex-col"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-card">
              <button onClick={() => setShowCreateTip(false)} className="p-2"><X className="w-6 h-6" /></button>
              <h2 className="font-display font-bold">Nova Dica</h2>
              <div className="w-10" />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Categoria</label>
                <select id="tip-cat-val" className="w-full bg-card border border-border rounded-xl p-4 text-sm">
                  <option value="tip">Dica</option>
                  <option value="orientation">Orientação</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Conteúdo</label>
                <textarea id="tip-content" className="w-full bg-card border border-border rounded-xl p-4 h-48 focus:ring-1 focus:ring-primary outline-none resize-none text-sm" placeholder="Sua dica..." />
              </div>
              <button 
                onClick={() => {
                  const category = (document.getElementById('tip-cat-val') as HTMLSelectElement).value as any;
                  const content = (document.getElementById('tip-content') as HTMLTextAreaElement).value;
                  if (content) {
                    addTip({ 
                      content, 
                      category, 
                      instructorName: 'Instrutor Vibe', 
                      instructorAvatar: '' 
                    });
                    setShowCreateTip(false);
                  }
                }}
                className="w-full bg-primary text-background font-black py-4 rounded-xl shadow-lg uppercase tracking-widest active:scale-95 transition-all"
              >
                Publicar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEditEvent && editingEvent && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[2000] bg-background flex flex-col"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-card">
              <button onClick={() => setShowEditEvent(false)} className="p-2"><X className="w-6 h-6" /></button>
              <h2 className="font-display font-bold uppercase tracking-widest text-sm text-primary">Editar Evento</h2>
              <div className="w-10" />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Título do Evento</label>
                <input id="edit-ev-title" type="text" defaultValue={editingEvent.title} className="w-full bg-card border border-border rounded-xl p-4 focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Subtítulo</label>
                <input id="edit-ev-subtitle" type="text" defaultValue={editingEvent.subtitle} className="w-full bg-card border border-border rounded-xl p-4 focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">URL da Imagem Capa</label>
                <input id="edit-ev-imageUrl" type="text" defaultValue={editingEvent.imageUrl} className="w-full bg-card border border-border rounded-xl p-4 focus:ring-1 focus:ring-primary outline-none font-mono text-[10px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Início</label>
                  <input id="edit-ev-start" type="date" defaultValue={new Date(editingEvent.startDate).toISOString().split('T')[0]} className="w-full bg-card border border-border rounded-xl p-4 text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Fim</label>
                  <input id="edit-ev-end" type="date" defaultValue={new Date(editingEvent.endDate).toISOString().split('T')[0]} className="w-full bg-card border border-border rounded-xl p-4 text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                  {['special', 'custom', 'promotion', 'holiday'].map(type => (
                    <button 
                      key={type}
                      id={`edit-ev-type-${type}`}
                      onClick={() => (document.getElementById('edit-ev-type-val') as any).value = type}
                      className="py-2 text-[8px] font-bold rounded-lg hover:bg-background transition-colors focus:bg-primary focus:text-background uppercase"
                    >
                      {type === 'special' ? 'Especial' : type === 'promotion' ? 'Promo' : type === 'holiday' ? 'Feriado' : 'Custom'}
                    </button>
                  ))}
                  <input type="hidden" id="edit-ev-type-val" defaultValue={editingEvent.type} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Descrição</label>
                <textarea id="edit-ev-desc" defaultValue={editingEvent.description} className="w-full bg-card border border-border rounded-xl p-4 h-32 focus:ring-1 focus:ring-primary outline-none resize-none text-sm" />
              </div>
              <button 
                onClick={() => {
                  const title = (document.getElementById('edit-ev-title') as HTMLInputElement).value;
                  const subtitle = (document.getElementById('edit-ev-subtitle') as HTMLInputElement).value;
                  const type = (document.getElementById('edit-ev-type-val') as HTMLInputElement).value as any;
                  const description = (document.getElementById('edit-ev-desc') as HTMLTextAreaElement).value;
                  const imageUrl = (document.getElementById('edit-ev-imageUrl') as HTMLInputElement).value;
                  const startDate = (document.getElementById('edit-ev-start') as HTMLInputElement).value;
                  const endDate = (document.getElementById('edit-ev-end') as HTMLInputElement).value;

                  if (title && description && editingEvent) {
                    updateEvent(editingEvent.id, { 
                      title, 
                      subtitle,
                      type, 
                      description, 
                      imageUrl,
                      startDate: startDate ? new Date(startDate).getTime() : editingEvent.startDate,
                      endDate: endDate ? new Date(endDate).getTime() : editingEvent.endDate
                    });
                    setShowEditEvent(false);
                    setEditingEvent(null);
                  }
                }}
                className="w-full bg-primary text-background font-black py-4 rounded-xl shadow-lg uppercase tracking-widest active:scale-95 transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminDashboard && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[1000] bg-background flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
              <button onClick={() => setShowAdminDashboard(false)} className="p-2 text-muted-foreground"><X className="w-6 h-6" /></button>
              <h2 className="font-display font-bold uppercase tracking-widest text-sm">Painel Administrativo</h2>
              <div className="w-10" />
            </div>

            {/* Tabs Header */}
            <div className="flex border-b border-border bg-card shrink-0 px-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'events', label: 'Eventos', icon: Megaphone },
                { id: 'validation', label: 'Validar', icon: CheckSquare },
                { id: 'exercises', label: 'Exercícios', icon: Dumbbell },
                { id: 'supabase', label: 'Supabase', icon: Database },
                { id: 'settings', label: 'Configurações', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={cn(
                    "flex-1 min-w-[100px] flex flex-col items-center gap-1 py-4 text-[10px] font-bold uppercase tracking-tighter transition-all relative",
                    adminTab === tab.id ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4", adminTab === tab.id ? "animate-pulse" : "")} />
                  {tab.label}
                  {adminTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {adminTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground">Eventos Ativos</h3>
                    <button 
                      onClick={() => setShowCreateEvent(true)}
                      className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-lg"
                    >
                      + Novo Evento
                    </button>
                  </div>
                  <div className="space-y-3">
                    {events.map(event => (
                      <div key={event.id} className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between group">
                        <div className="flex items-center gap-4 flex-1 mr-4">
                          <div className={cn("p-3 rounded-xl shrink-0", event.type === 'special' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            {event.type === 'special' ? <Trophy className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs tracking-tight truncate">{event.title}</p>
                            <p className="text-[8px] text-muted-foreground uppercase font-mono">
                              {new Date(event.startDate).toLocaleDateString('pt-BR')} - {new Date(event.endDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setEditingEvent(event);
                              setShowEditEvent(true);
                            }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteEvent(event.id)} 
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminTab === 'validation' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground px-1">Treinos Pendentes de Validação</h3>
                    <div className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full uppercase">
                      {history.filter(w => !w.isValidated).length} Pendentes
                    </div>
                  </div>

                  <div className="space-y-4">
                    {history.filter(w => !w.isValidated).length === 0 ? (
                      <div className="p-12 text-center bg-card rounded-[32px] border border-dashed border-border flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center opacity-30">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">Todos os treinos estão validados!</p>
                      </div>
                    ) : (
                      history.filter(w => !w.isValidated).map(workout => (
                        <motion.div 
                          key={workout.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-card p-5 rounded-[24px] border border-border space-y-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Solicitação de XP</p>
                              <h4 className="font-bold text-lg leading-tight">{workout.name}</h4>
                              <p className="text-xs text-muted-foreground">João Silva • {format(workout.date, "dd/MM/yy HH:mm")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-display font-black text-primary">+{workout.points} PTS</p>
                              <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-tighter">Motor Universal</p>
                            </div>
                          </div>

                          <div className="p-3 bg-muted/30 rounded-xl space-y-2 border border-border/40">
                            {workout.exercises.map(ex => (
                              <div key={ex.exerciseId} className="flex justify-between text-[10px] items-center">
                                <span className="font-bold truncate max-w-[150px]">{ex.name}</span>
                                <span className="text-muted-foreground">{ex.sets.length}S • {ex.sets[0]?.weight || 0}kg x {ex.sets[0]?.reps || 0}r</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                validateWorkout(workout.id, 'gold');
                                addPoints(workout.points);
                              }}
                              className="flex-1 bg-primary text-background font-black py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
                            >
                              Aprovar Pontos
                            </button>
                            <button 
                              onClick={() => validateWorkout(workout.id, 'bronze')}
                              className="px-4 bg-muted text-muted-foreground font-bold py-3 rounded-xl uppercase text-[10px] hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              Recusar
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {adminTab === 'exercises' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground">Repositório de Exercícios</h3>
                  </div>
                  
                  {/* Create New Exercise Form */}
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-4">
                    <p className="text-[10px] font-bold uppercase text-primary">Adicionar Nova Máquina/Exercício</p>
                    <div className="grid grid-cols-1 gap-3">
                      <input id="new-ex-name" type="text" placeholder="Nome (Ex: Leg Press Articulado)" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm" />
                      <div className="grid grid-cols-2 gap-3">
                        <select id="new-ex-muscle" className="bg-card border border-border rounded-xl px-4 py-3 text-sm">
                          <option value="Pernas">Pernas</option>
                          <option value="Peito">Peito</option>
                          <option value="Costas">Costas</option>
                          <option value="Ombros">Ombros</option>
                          <option value="Braços">Braços</option>
                        </select>
                        <select id="new-ex-equip" className="bg-card border border-border rounded-xl px-4 py-3 text-sm">
                          <option value="Máquina">Máquina</option>
                          <option value="Halteres">Halteres</option>
                          <option value="Barra">Barra</option>
                          <option value="Cabo">Cabo</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => {
                          const name = (document.getElementById('new-ex-name') as HTMLInputElement).value;
                          const muscle = (document.getElementById('new-ex-muscle') as HTMLSelectElement).value;
                          const equipment = (document.getElementById('new-ex-equip') as HTMLSelectElement).value;
                          if (name) {
                            addCustomExercise({ name, muscle, equipment });
                            (document.getElementById('new-ex-name') as HTMLInputElement).value = '';
                          }
                        }}
                        className="w-full bg-primary text-background font-bold py-3 rounded-xl text-xs"
                      >
                        Confirmar Adição
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {customExercises.map(ex => (
                      <div key={ex.id} className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between border-l-4 border-l-primary">
                        <div>
                          <p className="font-bold text-sm tracking-tight">{ex.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{ex.muscle} • {ex.equipment}</p>
                        </div>
                        <button onClick={() => deleteCustomExercise(ex.id)} className="p-2 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {BASE_EXERCISES.slice(0, 5).map(ex => (
                      <div key={ex.id} className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between opacity-50 grayscale">
                        <div>
                          <p className="font-bold text-sm tracking-tight">{ex.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{ex.muscle} • {ex.equipment}</p>
                        </div>
                        <div className="text-[8px] font-bold bg-muted px-2 py-1 rounded">SISTEMA</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminTab === 'supabase' && (
                <div className="space-y-6">
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-black uppercase text-sm">Status do Backend</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-mono">Real-time Synchronization</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Conectado ao Projeto</span>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full animate-pulse", isSupabaseConfigured ? "bg-green-500" : "bg-red-500")} />
                          <span className="text-[10px] font-black uppercase">{isSupabaseConfigured ? 'Ativo' : 'Offline'}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-xl space-y-2 border border-transparent hover:border-primary/20 transition-all">
                        <p className="text-[10px] font-bold uppercase text-primary">Instruções de Configuração</p>
                        <ul className="text-[10px] space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-black">•</span>
                            <span>Certifique-se de que as chaves `VITE_SUPABASE_URL` e `ANON_KEY` estão no seu arquivo `.env`.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-black">•</span>
                            <span>Execute o script SQL fornecido (supabase_schema.sql) no seu SQL Editor do Supabase.</span>
                          </li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                          onClick={() => generateTestData()}
                          className="py-4 bg-muted hover:bg-muted/80 text-foreground font-black rounded-xl uppercase tracking-widest text-[9px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <PlusCircle className="w-4 h-4 text-primary" />
                          Gerar 50 Testes
                        </button>
                        <button 
                          onClick={() => resetTestData()}
                          className="py-4 bg-destructive/10 hover:bg-destructive/20 text-destructive font-black rounded-xl uppercase tracking-widest text-[9px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Resetar Testes
                        </button>
                      </div>

                      <button 
                        onClick={() => fetchInitialData()}
                        className="w-full py-4 bg-primary text-background font-black rounded-xl uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
                      >
                        Sincronizar Manualmente
                      </button>
                    </div>
                  </div>

                  <div className="px-2 space-y-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Tabelas Monitoradas</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['profiles', 'workouts', 'events', 'badges'].map(t => (
                        <div key={t} className="p-3 bg-card border border-border rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase">{t}</span>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'settings' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground">Configurações Gerais</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Permitir criação de rotinas por Alunos', key: 'allow_user_routines' },
                        { label: 'Habilitar sistema de gamificação (XP)', key: 'enable_xp' },
                        { label: 'Modo Manutenção (Apenas Staff)', key: 'maint_mode' }
                      ].map(s => (
                        <div key={s.key} className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between">
                          <span className="text-xs font-medium">{s.label}</span>
                          <button className="w-10 h-5 bg-primary/20 rounded-full relative">
                            <div className="absolute left-1 top-1 w-3 h-3 bg-primary rounded-full shadow-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary">Log de Atividades Admin</p>
                        <p className="text-[10px] text-muted-foreground">Último acesso: Hoje às 14:32</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    {/* Photo Adjustment Modal */}
      <AnimatePresence>
        {showPhotoModal && tempPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-card border border-border w-full max-w-sm rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <h3 className="font-display font-bold text-base uppercase tracking-widest">Ajustar Foto</h3>
                <button onClick={() => setShowPhotoModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-full border-4 border-primary overflow-hidden bg-black touch-none cursor-move shadow-2xl group">
                  <motion.img 
                    src={tempPhoto}
                    alt="Ajuste"
                    drag
                    dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
                    style={{ 
                      scale: zoom,
                      x: position.x,
                      y: position.y
                    }}
                    onDragEnd={(_, info) => {
                      setPosition(prev => ({
                        x: prev.x + info.offset.x,
                        y: prev.y + info.offset.y
                      }));
                    }}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Girar / Zoom</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="w-full flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowPhotoModal(false)}
                    className="flex-1 py-3 font-bold rounded-xl bg-muted text-xs uppercase tracking-widest"
                  >
                    Sair
                  </button>
                  <button 
                    onClick={async () => {
                      if (originalFile && tempPhoto && !isUploadingPhoto) {
                        setIsUploadingPhoto(true);
                        try {
                          // Create a canvas to crop the image
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          
                          img.onload = async () => {
                            canvas.width = 400;
                            canvas.height = 400;
                            
                            if (ctx) {
                              ctx.fillStyle = 'black';
                              ctx.fillRect(0, 0, canvas.width, canvas.height);
                              
                              const viewSize = 192;
                              const scale = zoom;
                              const imgRatio = img.width / img.height;
                              let drawW, drawH;
                              
                              if (imgRatio > 1) {
                                drawH = viewSize * scale;
                                drawW = drawH * imgRatio;
                              } else {
                                drawW = viewSize * scale;
                                drawH = drawW / imgRatio;
                              }
                              
                              const canvasScale = 400 / viewSize;
                              const finalW = drawW * canvasScale;
                              const finalH = drawH * canvasScale;
                              const finalX = (canvas.width / 2) + (position.x * canvasScale) - (finalW / 2);
                              const finalY = (canvas.height / 2) + (position.y * canvasScale) - (finalH / 2);
                              
                              ctx.drawImage(img, finalX, finalY, finalW, finalH);
                              
                              canvas.toBlob(async (blob) => {
                                if (blob) {
                                  const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                                  await useWorkoutStore.getState().uploadAvatar(croppedFile);
                                  setShowPhotoModal(false);
                                  setIsUploadingPhoto(false);
                                  setZoom(1);
                                  setPosition({ x: 0, y: 0 });
                                }
                              }, 'image/jpeg', 0.9);
                            }
                          };
                          img.src = tempPhoto;
                        } catch (err) {
                          console.error(err);
                          setIsUploadingPhoto(false);
                          alert('Erro ao processar imagem.');
                        }
                      }
                    }}
                    disabled={isUploadingPhoto}
                    className={cn(
                      "flex-1 py-3 font-black rounded-xl bg-primary text-background text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                      isUploadingPhoto ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg shadow-primary/20 active:scale-95"
                    )}
                  >
                    {isUploadingPhoto ? (
                      <>
                        <div className="w-3 h-3 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex justify-end"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-card border-l border-border h-full flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-display font-black uppercase tracking-tighter">Notificações</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-2">
                    <Bell className="w-12 h-12 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Nada por aqui ainda</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "p-4 rounded-[20px] border transition-all flex gap-3 items-start",
                        notification.is_read ? "bg-muted/20 border-border/50 opacity-70" : "bg-primary/5 border-primary/20 shadow-sm"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border/50 shrink-0">
                        {notification.actor?.avatar_url ? (
                          <img src={notification.actor.avatar_url} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[10px] leading-tight font-medium">
                          <span className="font-black uppercase">{notification.actor?.full_name || 'Alguém'}</span>
                          {notification.type === 'follow' ? ' começou a te seguir!' : 
                           notification.type === 'support' ? ' apoiou seu treino!' : 
                           ' interagiu com você.'}
                        </p>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
