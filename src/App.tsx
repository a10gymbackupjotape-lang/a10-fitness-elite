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
  Plus, 
  Play, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Settings, 
  User, 
  TrendingUp, 
  Calendar, 
  Award, 
  Search, 
  Filter, 
  ChevronDown, 
  Check, 
  MoreHorizontal, 
  Trash2, 
  Copy, 
  Edit3, 
  Share2, 
  Info, 
  Target, 
  Trophy, 
  Users, 
  Camera, 
  Eye, 
  EyeOff, 
  Shield, 
  Instagram, 
  Youtube, 
  Bell, 
  Heart, 
  MessageCircle, 
  LogOut,
  X,
  Timer,
  Megaphone,
  Medal,
  Flame,
  Star,
  Download,
  Edit2,
  ChevronLeft,
  Zap,
  BarChart3,
  Weight,
  CheckSquare,
  Server as Database,
  PlusCircle,
  Scale,
  Lock,
  UserCheck
} from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { NotificationPanel } from './components/layout/NotificationPanel';
import { WorkoutTab } from './components/tabs/WorkoutTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { RankingTab } from './components/tabs/RankingTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { AdminDashboard } from './components/AdminDashboard';
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

  const { 
    activeWorkout, history, restTimer, totalXP, routines,
    saveRoutine, updateRoutine, deleteRoutine, importRoutine,
    startWorkout, endWorkout, cancelWorkout,
    addExercise, removeExercise, updateExercise,
    updateSet, addSet, removeSet,
    startRestTimer, tickRestTimer, stopRestTimer,
    deleteWorkout, clearLastBadgeEarned,
    currentUserRole, setRole, events, participateInEvent,
    badges, tips, customExercises,
    allProfiles, updateProfile,
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
    supportWorkout,
    addEvent, updateEvent, deleteEvent, addBadge, addTip, addCustomExercise, deleteCustomExercise, generateTestData, resetTestData, fetchInitialData,
    subscribeToRealtime
  } = useWorkoutStore();

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
      <MobileHeader 
        activeTab={activeTab}
        unreadCount={unreadCount}
        setShowNotifications={setShowNotifications}
        markNotificationsAsRead={markNotificationsAsRead}
        setActiveTab={setActiveTab}
        setShowEditProfile={setShowEditProfile}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
          setShowNotifications={setShowNotifications}
          markNotificationsAsRead={markNotificationsAsRead}
          userStats={userStats}
          session={session}
          allProfiles={allProfiles}
          setTempPhoto={setTempPhoto}
          setOriginalFile={setOriginalFile}
          setShowPhotoModal={setShowPhotoModal}
        />

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
              <WorkoutTab 
                session={session}
                currentTime={currentTime}
                events={events}
                currentEventIndex={currentEventIndex}
                participateInEvent={participateInEvent}
                currentUserRole={currentUserRole}
                setShowAdminDashboard={setShowAdminDashboard}
                setShowCreateEvent={setShowCreateEvent}
                setShowCreateBadge={setShowCreateBadge}
                setShowCreateTip={setShowCreateTip}
                setEditingRoutine={setEditingRoutine}
                setShowRoutineEditor={setShowRoutineEditor}
                tips={tips}
                routineSection={routineSection}
                setRoutineSection={setRoutineSection}
                setRoutineToDelete={setRoutineToDelete}
                workoutTime={workoutTime}
                setShowCancelConfirm={setShowCancelConfirm}
                setWorkoutName={setWorkoutName}
                setShowFinishModal={setShowFinishModal}
                setShowExercisePicker={setShowExercisePicker}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab 
                history={history}
                setSelectedHistoryWorkout={setSelectedHistoryWorkout}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab 
                userStats={userStats}
                session={session}
                history={history}
                streak={streak}
                totalXP={totalXP}
                badges={badges}
                getActivityData={getActivityData}
                setShowEditProfile={setShowEditProfile}
                supabase={supabase}
                setTempPhoto={setTempPhoto}
                setOriginalFile={setOriginalFile}
                setShowPhotoModal={setShowPhotoModal}
              />
            )}

            {activeTab === 'ranking' && (
              <RankingTab 
                communityMode={communityMode}
                setCommunityMode={setCommunityMode}
                socialFeed={socialFeed}
                setSelectedUserForProfile={setSelectedUserForProfile}
                supportWorkout={supportWorkout}
                setSelectedHistoryWorkout={setSelectedHistoryWorkout}
                rankingTimeframe={rankingTimeframe}
                setRankingTimeframe={setRankingTimeframe}
                weightCategory={weightCategory}
                setWeightCategory={setWeightCategory}
                genderFilter={genderFilter}
                setGenderFilter={setGenderFilter}
                ageFilter={ageFilter}
                setAgeFilter={setAgeFilter}
                sortedRanking={sortedRanking}
                session={session}
                rankingCategory={rankingCategory}
                setRankingCategory={setRankingCategory}
                userStats={userStats}
                hallOfFame={hallOfFame}
              />
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Biografia (Bio)</label>
                  <textarea 
                    placeholder="Conte sobre sua jornada fitness..."
                    defaultValue={userStats.bio} 
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24 text-xs"
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
            <AdminDashboard 
              showAdminDashboard={showAdminDashboard}
              setShowAdminDashboard={setShowAdminDashboard}
              events={events}
              setEditingEvent={setEditingEvent}
              setShowEditEvent={setShowEditEvent}
              deleteEvent={deleteEvent}
              history={history}
              validateWorkout={validateWorkout}
              addPoints={(pts) => addPoints(pts)}
              customExercises={customExercises}
              addCustomExercise={addCustomExercise}
              deleteCustomExercise={deleteCustomExercise}
              isSupabaseConfigured={isSupabaseConfigured}
              generateTestData={generateTestData}
              resetTestData={resetTestData}
              fetchInitialData={fetchInitialData}
              setShowCreateEvent={setShowCreateEvent}
              setShowCreateBadge={setShowCreateBadge}
              setShowCreateTip={setShowCreateTip}
            />
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
        <NotificationPanel 
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notifications={notifications}
        />
      </AnimatePresence>
    </>
  );
}
