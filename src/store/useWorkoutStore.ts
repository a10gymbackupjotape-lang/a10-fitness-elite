import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BASE_EXERCISES, LibraryExercise } from '../data/exercises';

export type UserRole = 'admin' | 'instructor' | 'user';

export interface AppEvent {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: 'custom' | 'special' | 'promotion' | 'holiday';
  startDate: number;
  endDate: number;
  imageUrl?: string;
  participants: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earnedBy: string[]; // user ids
}

export interface Tip {
  id: string;
  instructorName: string;
  instructorAvatar: string;
  content: string;
  category: 'tip' | 'orientation';
  date: number;
}

export type SetType = 'normal' | 'warm_up' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  type: SetType;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  name: string;
  notes: string;
  sets: WorkoutSet[];
}

export type ReliabilityLevel = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface UserStats {
  points: number;
  level: number; // 1-6
  totalWeight: number; // For "Primeira Tonelada"
  streak: number;
  lastWorkoutDate?: number;
  reliability: ReliabilityLevel;
  fullName: string;
  avatarUrl: string;
  weight: number;
  height: number;
  gender: string;
  birthDate: string;
  strengthScore: number;
  showSensitiveData: boolean;
  showBadges: boolean;
  instagramUrl: string;
  youtubeUrl: string;
  personalRecords: Record<string, number>;
  weeklyPoints: number;
  monthlyPoints: number;
  weeklyVolume: number;
  monthlyVolume: number;
  followerCount: number;
  followingCount: number;
}

export interface CompletedWorkout {
  id: string;
  name: string;
  date: number;
  duration: number;
  totalVolume: number;
  xpEarned: number;
  points: number; // Formula-based points
  reliability: ReliabilityLevel;
  isValidated: boolean;
  exercises: ActiveExercise[];
}

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  sets: number;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  description: string;
  muscleGroups: string[];
  isRecurring?: boolean;
  days: Record<number, RoutineExercise[]>; // 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab, 0=Dom
  authorRole?: UserRole;
}

export const PREDEFINED_ROUTINES: RoutineTemplate[] = [
  // INICIANTES
  {
    id: 'init-1',
    title: 'Adaptação Full Body',
    description: 'Ideal para a primeira semana. Foco em técnica e adaptação neuromuscular.',
    muscleGroups: ['Full Body'],
    days: {
      1: [{ exerciseId: 'chest-1', name: 'Supino Máquina', sets: 3 }, { exerciseId: 'leg-1', name: 'Leg Press', sets: 3 }],
      3: [{ exerciseId: 'back-1', name: 'Puxada Alta', sets: 3 }, { exerciseId: 'shoulder-1', name: 'Elevação Lateral', sets: 3 }],
      5: [{ exerciseId: 'leg-2', name: 'Cadeira Extensora', sets: 3 }, { exerciseId: 'arm-1', name: 'Rosca Direta', sets: 3 }]
    }
  },
  {
    id: 'init-2',
    title: 'Caminhada + Fortalecimento',
    description: 'Para quem está saindo do sedentarismo. Alterna cardio leve com força.',
    muscleGroups: ['Cardio', 'Pernas'],
    days: {
      1: [{ exerciseId: 'cd-1', name: 'Esteira (Caminhada)', sets: 1 }, { exerciseId: 'bw-1', name: 'Agachamento Livre', sets: 3 }],
      2: [{ exerciseId: 'cd-1', name: 'Esteira (Caminhada)', sets: 1 }],
      4: [{ exerciseId: 'cd-1', name: 'Esteira (Caminhada)', sets: 1 }, { exerciseId: 'bw-2', name: 'Flexão de Braços (Joelho)', sets: 3 }]
    }
  },
  {
    id: 'init-3',
    title: 'Funcional Express',
    description: 'Treino rápido de 20 min para dias corridos.',
    muscleGroups: ['Core', 'Agilidade'],
    days: {
      1: [{ exerciseId: 'core-1', name: 'Prancha Abdominal', sets: 3 }, { exerciseId: 'bw-3', name: 'Polichinelos', sets: 3 }]
    }
  },
  // MELHOR IDADE
  {
    id: 'senior-1',
    title: 'Mobilidade Flex',
    description: 'Foco em amplitude de movimento e redução de dores articulares.',
    muscleGroups: ['Mobilidade'],
    days: {
      1: [{ exerciseId: 'mob-1', name: 'Alongamento Dinâmico', sets: 3 }, { exerciseId: 'mob-2', name: 'Rotação de Tronco', sets: 3 }]
    }
  },
  {
    id: 'senior-2',
    title: 'Força Funcional Sênior',
    description: 'Exercícios que auxiliam nas atividades do dia a dia.',
    muscleGroups: ['Funcional'],
    days: {
      2: [{ exerciseId: 'bw-1', name: 'Sentar e Levantar', sets: 3 }, { exerciseId: 'ext-1', name: 'Extensora Sentado', sets: 3 }],
      4: [{ exerciseId: 'push-1', name: 'Empurrar Parede', sets: 3 }, { exerciseId: 'pull-1', name: 'Remada com Elástico', sets: 3 }]
    }
  },
  {
    id: 'senior-3',
    title: 'Equilíbrio e Postura',
    description: 'Prevenção de quedas e melhora da sustentação da coluna.',
    muscleGroups: ['Equilíbrio'],
    days: {
      1: [{ exerciseId: 'bal-1', name: 'Ficar em um pé só', sets: 3 }, { exerciseId: 'pos-1', name: 'YMCA (Postura)', sets: 3 }]
    }
  },
  // PERFORMANCE
  {
    id: 'perf-1',
    title: 'Arnold Split (Volume Real)',
    description: 'O clássico de Arnold Schwarzenegger para hipertrofia máxima.',
    muscleGroups: ['Peito', 'Costas', 'Ombros', 'Braços'],
    days: {
      1: [{ exerciseId: 'ch-1', name: 'Supino Inclinado', sets: 4 }, { exerciseId: 'bk-1', name: 'Barra Fixa', sets: 4 }],
      2: [{ exerciseId: 'sh-1', name: 'Desenvolvimento Militar', sets: 4 }, { exerciseId: 'arm-1', name: 'Rosca Alternada', sets: 4 }],
      3: [{ exerciseId: 'lg-1', name: 'Agachamento Livre', sets: 4 }, { exerciseId: 'lg-2', name: 'Stiff', sets: 4 }]
    }
  },
  {
    id: 'perf-2',
    title: 'PPL Elite (Push Pull Legs)',
    description: 'Divisão otimizada para atletas avançados.',
    muscleGroups: ['Empurrar', 'Puxar', 'Pernas'],
    days: {
      1: [{ exerciseId: 'push-max', name: 'Supino Reto Pesado', sets: 5 }],
      2: [{ exerciseId: 'pull-max', name: 'Remada Curvada', sets: 5 }],
      3: [{ exerciseId: 'leg-max', name: 'Agachamento High Bar', sets: 5 }]
    }
  },
  {
    id: 'perf-3',
    title: 'Powerbuilding Hybrid',
    description: 'Combina força bruta com estética.',
    muscleGroups: ['Força', 'Estética'],
    days: {
      1: [{ exerciseId: 'deadlift', name: 'Levantamento Terra', sets: 3 }, { exerciseId: 'acc-1', name: 'Extensora', sets: 4 }]
    }
  }
];

export const DEFAULT_ROUTINES: RoutineTemplate[] = [
  {
    id: 'push-pull-1',
    title: 'Minha Rotina Semanal (ABC)',
    description: 'Split clássico ABC.',
    muscleGroups: ['Peito', 'Costas', 'Pernas'],
    isRecurring: true,
    days: {
      1: [ // Segunda: Push
        { exerciseId: '1', name: 'Supino Reto (Barra)', sets: 3 },
        { exerciseId: '4', name: 'Desenvolvimento (Halteres)', sets: 3 },
      ],
      3: [ // Quarta: Pull
        { exerciseId: '3', name: 'Levantamento Terra (Barra)', sets: 3 },
        { exerciseId: '7', name: 'Puxada Frontal (Máquina)', sets: 3 },
      ],
      5: [ // Sexta: Legs
        { exerciseId: '2', name: 'Agachamento (Barra)', sets: 3 },
        { exerciseId: '8', name: 'Leg Press (Máquina)', sets: 3 },
      ]
    }
  }
];

export interface WorkoutState {
  activeWorkout: {
    id: string;
    startTime: number;
    exercises: ActiveExercise[];
    name?: string;
  } | null;
  history: CompletedWorkout[];
  lastPerformance: Record<string, { weight: number; reps: number }>;
  totalXP: number;
  routines: RoutineTemplate[];
  restTimer: {
    duration: number;
    remaining: number;
    isActive: boolean;
  };
  currentUserRole: UserRole;
  allProfiles: any[];
  events: AppEvent[];
  badges: Badge[];
  tips: Tip[];
  customExercises: LibraryExercise[];
  lastBadgeEarned: Badge | null;
  userStats: UserStats;
  predefinedRoutines: RoutineTemplate[];
  follows: string[];
  socialFeed: any[];
  clearLastBadgeEarned: () => void;
  
  updateProfile: (updates: Partial<UserStats>) => Promise<void>;
  
  setRole: (role: UserRole) => void;
  uploadAvatar: (file: File) => Promise<string | null>;
  addEvent: (event: Omit<AppEvent, 'id' | 'participants'>) => void;
  updateEvent: (id: string, updates: Partial<AppEvent>) => void;
  deleteEvent: (id: string) => void;
  addBadge: (badge: Omit<Badge, 'id' | 'earnedBy'>) => void;
  addTip: (tip: Omit<Tip, 'id' | 'date'>) => void;
  addCustomExercise: (exercise: Omit<LibraryExercise, 'id' | 'isCustom'>) => void;
  deleteCustomExercise: (id: string) => void;
  participateInEvent: (eventId: string) => void;
  claimBadge: (badgeId: string) => void;
  startWorkout: (template?: RoutineTemplate, dayIndex?: number) => void;
  endWorkout: (name?: string) => void;
  cancelWorkout: () => void;
  addExercise: (exercise: { id: string; name: string }) => void;
  removeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<ActiveExercise>) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
  deleteWorkout: (id: string) => void;
  saveRoutine: (routine: Omit<RoutineTemplate, 'id'>) => void;
  updateRoutine: (id: string, updates: Partial<RoutineTemplate>) => void;
  deleteRoutine: (id: string) => void;
  importRoutine: (routine: RoutineTemplate) => void;
  setReliability: (level: ReliabilityLevel) => void;
  validateWorkout: (workoutId: string, level: ReliabilityLevel) => void;
  addPoints: (amount: number) => void;
  generateTestData: () => Promise<void>;
  resetTestData: () => Promise<void>;
  fetchInitialData: () => Promise<void>;
  subscribeToRealtime: () => (() => void);
  
  // Social Actions (Phase 11)
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  fetchSocialFeed: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      updateProfile: async (updates) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.from('profiles').update({
            full_name: updates.fullName,
            weight: updates.weight,
            height: updates.height,
            gender: updates.gender,
            birth_date: updates.birthDate,
            show_sensitive_data: updates.showSensitiveData,
            show_badges: updates.showBadges,
            instagram_url: updates.instagramUrl,
            youtube_url: updates.youtubeUrl,
            personal_records: updates.personalRecords
          }).eq('id', user.id);
          if (error) console.error('Error updating profile:', error);
          get().fetchInitialData();
        }
      },
      history: [],
      lastPerformance: {},
      totalXP: 0,
      routines: DEFAULT_ROUTINES,
      restTimer: {
        duration: 60,
        remaining: 0,
        isActive: false,
      },
      currentUserRole: 'user',
      allProfiles: [],
      events: [
        { 
          id: 'ev-1', 
          title: 'Desafio Verão 2026', 
          subtitle: '30 dias de foco total',
          description: 'Conclua 20 treinos no mês.', 
          type: 'special', 
          startDate: Date.now(), 
          endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, 
          participants: [] 
        }
      ],
      predefinedRoutines: PREDEFINED_ROUTINES,
      badges: [
        { id: 'bg-1', name: 'Primeiro Passo', description: 'Conclua seu primeiro treino.', icon: '🏆', requirement: '1 Treino', earnedBy: ['current-user'] },
        { id: 'bg-2', name: 'Primeira Tonelada', description: 'Levante um total acumulado de 1.000kg.', icon: '🏋️‍♂️', requirement: '1.000kg', earnedBy: ['current-user'] },
        { id: 'bg-3', name: 'Guerreiro Consistente', description: 'Mantenha um streak de 5 dias.', icon: '🔥', requirement: '5 Dias Streak', earnedBy: ['current-user'] },
        { id: 'bg-4', name: 'Vibe Master', description: 'Alcance o Nível 5 de evolução.', icon: '👑', requirement: 'Nível 5', earnedBy: ['current-user'] },
        { id: 'bg-5', name: 'Força Bruta', description: 'Atinja 100kg em qualquer exercício.', icon: '💪', requirement: '100kg PR', earnedBy: ['current-user'] },
        { id: 'bg-6', name: 'Volumétrico', description: 'Acumule 10.000 pontos totais.', icon: '📈', requirement: '10k Pontos', earnedBy: ['current-user'] },
        { id: 'bg-7', name: 'Máquina Incansável', description: 'Acumule 100.000 pontos totais.', icon: '🔥', requirement: '100k Pontos', earnedBy: ['current-user'] },
        { id: 'bg-8', name: 'Frequência de Ouro', description: 'Treine 5 dias na mesma semana.', icon: '📅', requirement: '5 Dias/Semana', earnedBy: ['current-user'] },
      ],
      tips: [
        { id: 'tip-1', instructorName: 'Paulo Muzy', instructorAvatar: '', content: 'A constância vence o talento.', category: 'tip', date: Date.now() }
      ],
      customExercises: [],
      lastBadgeEarned: null,
      userStats: {
        points: 0,
        level: 1,
        totalWeight: 0,
        streak: 1,
        reliability: 'bronze',
        weight: 0,
        height: 0,
        gender: '',
        birthDate: '',
        strengthScore: 0,
        fullName: '',
        showSensitiveData: true,
        showBadges: true,
        instagramUrl: '',
        youtubeUrl: '',
        personalRecords: {},
        avatarUrl: '',
        weeklyPoints: 0,
        monthlyPoints: 0,
        weeklyVolume: 0,
        monthlyVolume: 0,
        followerCount: 0,
        followingCount: 0
      },
      follows: [],
      socialFeed: [],
      
      followUser: async (targetUserId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        try {
          const { error } = await supabase.from('follows').insert({
            follower_id: user.id,
            following_id: targetUserId
          });
          if (!error) {
            set(state => ({ 
              follows: [...state.follows, targetUserId],
              allProfiles: state.allProfiles.map(p => 
                p.id === targetUserId 
                  ? { ...p, follower_count: (p.follower_count || 0) + 1 } 
                  : p
              ),
              userStats: {
                ...state.userStats,
                followingCount: state.userStats.followingCount + 1
              }
            }));
            get().fetchSocialFeed();
          }
        } catch (error) {
          console.error('Error following user:', error);
        }
      },

      unfollowUser: async (targetUserId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        try {
          const { error } = await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
          if (!error) {
            set(state => ({ 
              follows: state.follows.filter(id => id !== targetUserId),
              allProfiles: state.allProfiles.map(p => 
                p.id === targetUserId 
                  ? { ...p, follower_count: Math.max(0, (p.follower_count || 0) - 1) } 
                  : p
              ),
              userStats: {
                ...state.userStats,
                followingCount: Math.max(0, state.userStats.followingCount - 1)
              }
            }));
            get().fetchSocialFeed();
          }
        } catch (error) {
          console.error('Error unfollowing user:', error);
        }
      },

      fetchSocialFeed: async () => {
        if (!isSupabaseConfigured) return;
        const { follows } = get();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const feedUserIds = [user.id, ...follows];
        
        try {
          const { data, error } = await supabase
            .from('workouts')
            .select(`
              *,
              profile:profiles!inner(id, full_name, avatar_url, follower_count, following_count)
            `)
            .in('user_id', feedUserIds)
            .order('date', { ascending: false })
            .limit(50);

          if (!error && data) {
            set({ socialFeed: data.map(w => ({
              ...w,
              date: new Date(w.date).getTime(),
              totalVolume: Number(w.total_volume),
              xpEarned: Number(w.xp_earned),
              profile: w.profile
            })) });
          }
        } catch (err) {
          console.error('Error fetching social feed:', err);
        }
      },
      
      clearLastBadgeEarned: () => set({ lastBadgeEarned: null }),

      fetchInitialData: async () => {
        if (!isSupabaseConfigured) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        try {
          // 1. Fetch Events (Public)
          const { data: events, error: evError } = await supabase.from('events').select('*');
          if (!evError && events) {
            set({ 
              events: events.map(ev => ({
                id: ev.id,
                title: ev.title,
                subtitle: ev.subtitle,
                description: ev.description,
                type: ev.type,
                startDate: Number(ev.startDate),
                endDate: Number(ev.endDate),
                imageUrl: ev.imageUrl,
                participants: ev.participants_ids || []
              }))
            });
          }

          // 2. Fetch User Profile
          const { data: profile, error: pError } = await supabase.from('profiles').select('*').single();
          if (!pError && profile) {
            set({ 
              userStats: {
                points: profile.points || 0,
                level: profile.level || 1,
                totalWeight: Number(profile.total_weight) || 0,
                streak: profile.streak || 1,
                reliability: profile.reliability as ReliabilityLevel,
                lastWorkoutDate: profile.last_workout_date ? new Date(profile.last_workout_date).getTime() : undefined,
                weight: Number(profile.weight) || 0,
                height: Number(profile.height) || 0,
                gender: profile.gender || '',
                birthDate: profile.birth_date || '',
                strengthScore: Number(profile.strength_score) || 0,
                fullName: profile.full_name || '',
                avatarUrl: profile.avatar_url || '',
                showSensitiveData: profile.show_sensitive_data ?? true,
                showBadges: profile.show_badges ?? true,
                instagramUrl: profile.instagram_url || '',
                youtubeUrl: profile.youtube_url || '',
                personalRecords: profile.personal_records || {},
                weeklyPoints: profile.weekly_points || 0,
                monthlyPoints: profile.monthly_points || 0,
                weeklyVolume: Number(profile.weekly_volume) || 0,
                monthlyVolume: Number(profile.monthly_volume) || 0,
                followerCount: profile.follower_count || 0,
                followingCount: profile.following_count || 0
              },
              currentUserRole: profile.role as UserRole
            });

            // 3. Fetch Initial Follows List
            const { data: follows, error: fError } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', user.id);
            if (!fError && follows) {
              set({ follows: follows.map(f => f.following_id) });
              get().fetchSocialFeed();
            }
          }

          // 3. Fetch All Profiles (for Ranking)
          const { data: allProfs, error: apError } = await supabase.from('profiles').select('*').order('points', { ascending: false });
          if (!apError && allProfs) {
            set({ allProfiles: allProfs });
          }

          // 4. Fetch Workouts (History)
          const { data: workouts, error: wError } = await supabase
            .from('workouts')
            .select('*')
            .order('date', { ascending: false });
          if (!wError && workouts) {
            set({ history: workouts.map(w => ({
              ...w,
              points: w.points,
              xpEarned: w.xp_earned,
              totalVolume: Number(w.total_volume),
              isValidated: w.is_validated,
              date: new Date(w.date).getTime()
            })) });
          }

          // 4. Fetch Routines
          const { data: routines, error: rError } = await supabase.from('routines').select('*');
          if (!rError && routines) {
            set({ routines: routines.map(r => ({
              id: r.id,
              title: r.title,
              description: r.description,
              muscleGroups: r.muscle_groups,
              days: r.days,
              isRecurring: r.is_recurring,
              authorRole: r.author_role as UserRole
            })) });
          }

          // 5. Fetch Custom Exercises
          const { data: customEx, error: ceError } = await supabase.from('custom_exercises').select('*');
          if (!ceError && customEx) {
            set({ customExercises: customEx.map(ce => ({
              id: ce.id,
              name: ce.name,
              muscle: ce.muscle,
              equipment: ce.equipment,
              isCustom: true
            })) });
          }

          // 6. Fetch Badges
          const { data: userBadges, error: ubError } = await supabase.from('user_badges').select('*');
          if (!ubError && userBadges) {
            set(state => ({
              badges: state.badges.map(b => ({
                ...b,
                earnedBy: userBadges.some(ub => ub.badge_id === b.id) ? ['current-user'] : []
              }))
            }));
          }

        } catch (err) {
          console.error('Error fetching initial data:', err);
        }
      },

      subscribeToRealtime: () => {
        if (!isSupabaseConfigured) return () => {};
        
        const mainChannel = supabase.channel('app-sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => get().fetchInitialData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => get().fetchInitialData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts' }, () => {
            get().fetchInitialData();
            get().fetchSocialFeed();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'routines' }, () => get().fetchInitialData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_exercises' }, () => get().fetchInitialData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'user_badges' }, () => get().fetchInitialData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'event_participants' }, () => get().fetchInitialData())
          .subscribe();

        return () => {
          supabase.removeChannel(mainChannel);
        };
      },

      setRole: (role) => set({ currentUserRole: role }),
      addEvent: async (event) => {
        if (isSupabaseConfigured) {
          const newEvent = {
            id: crypto.randomUUID(),
            title: event.title,
            subtitle: event.subtitle,
            description: event.description,
            type: event.type,
            startDate: event.startDate,
            endDate: event.endDate,
            imageUrl: event.imageUrl,
            participants_ids: []
          };
          
          const { error } = await supabase.from('events').insert([newEvent]);
          if (error) console.error('Error adding event:', error);
          get().fetchInitialData();
        }
      },
      updateEvent: async (id, updates) => {
        if (isSupabaseConfigured) {
          const dbUpdates: any = { ...updates };
          if (updates.participants) {
            dbUpdates.participants_ids = updates.participants;
            delete dbUpdates.participants;
          }
          
          const { error } = await supabase.from('events').update(dbUpdates).eq('id', id);
          if (error) console.error('Error updating event:', error);
          get().fetchInitialData();
        }
      },
      deleteEvent: async (id) => {
        set(state => ({
          events: state.events.filter(ev => ev.id !== id)
        }));

        if (isSupabaseConfigured) {
          const { error } = await supabase.from('events').delete().eq('id', id);
          if (error) console.error('Error deleting event:', error);
        }
      },
      addBadge: (badge) => set(state => ({ 
        badges: [...state.badges, { ...badge, id: crypto.randomUUID(), earnedBy: [] }] 
      })),
      addTip: (tip) => set(state => ({ 
        tips: [...state.tips, { ...tip, id: crypto.randomUUID(), date: Date.now() }] 
      })),
      addCustomExercise: async (exercise) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.from('custom_exercises').insert([{
            user_id: user.id,
            name: exercise.name,
            muscle: exercise.muscle,
            equipment: exercise.equipment
          }]);
          if (error) console.error('Error adding custom exercise:', error);
          get().fetchInitialData();
        }
      },
      deleteCustomExercise: async (id) => {
        const { error } = await supabase.from('custom_exercises').delete().eq('id', id);
        if (error) console.error('Error deleting custom exercise:', error);
        get().fetchInitialData();
      },
      participateInEvent: async (eventId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isSupabaseConfigured) {
          // 1. Record participation in junction table
          const { error: partError } = await supabase.from('event_participants').insert([{ event_id: eventId, user_id: user.id }]);
          if (partError) console.error('Error joining event (junction):', partError);
          
          // 2. Update participants_ids in event table for easy access
          const event = get().events.find(e => e.id === eventId);
          if (event && !event.participants.includes(user.id)) {
            const newParticipants = [...event.participants, user.id];
            await supabase.from('events').update({ participants_ids: newParticipants }).eq('id', eventId);
          }
          
          get().fetchInitialData();
        }
      },
      claimBadge: async (badgeId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.from('user_badges').insert([{ badge_id: badgeId, user_id: user.id }]);
          if (error) console.error('Error claiming badge:', error);
          get().fetchInitialData();
        }
      },
      startWorkout: (template, dayIndex) => {
        const { lastPerformance } = get();
        let currentDay = dayIndex ?? new Date().getDay();
        let dayExercises = template?.days[currentDay] || [];
        
        // If current day is empty, try to find the first day that has exercises as fallback
        if (template && dayExercises.length === 0) {
          const availableDays = Object.keys(template.days).map(Number).sort((a, b) => a - b);
          if (availableDays.length > 0) {
            // Prefer a day > 0 (Mon-Sat) over 0 (Sun) if possible, or just the first one
            currentDay = availableDays[0];
            dayExercises = template.days[currentDay];
          }
        }
        
        const exercises: ActiveExercise[] = template 
          ? dayExercises.map(te => {
              const last = lastPerformance[te.exerciseId] || { weight: 0, reps: 0 };
              return {
                id: crypto.randomUUID(),
                exerciseId: te.exerciseId,
                name: te.name,
                notes: '',
                sets: Array.from({ length: te.sets }).map(() => ({
                  id: crypto.randomUUID(),
                  type: 'normal',
                  weight: last.weight,
                  reps: last.reps,
                  completed: false
                }))
              };
            })
          : [];

        set({
          activeWorkout: {
            id: crypto.randomUUID(),
            startTime: Date.now(),
            exercises,
            name: template ? `${template.title} - ${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][currentDay]}` : 'Novo Treino'
          }
        });
      },
      endWorkout: async (name) => {
        const { activeWorkout, lastPerformance, userStats, badges, history } = get();
        if (!activeWorkout) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const totalVolume = activeWorkout.exercises.reduce((acc, ex) => 
          acc + ex.sets.reduce((sAcc, s) => sAcc + (s.completed ? s.weight * s.reps : 0), 0), 0
        );

        let prsBroken = 0;
        const newLastPerformance = { ...lastPerformance };
        activeWorkout.exercises.forEach(ex => {
          const bestSet = ex.sets.reduce((best, current) => 
            (current.weight * current.reps > best.weight * best.reps) ? current : best
          , { weight: 0, reps: 0 });
          
          if (bestSet.weight > 0) {
            const previousBest = lastPerformance[ex.exerciseId];
            if (!previousBest || (bestSet.weight * bestSet.reps > previousBest.weight * previousBest.reps)) {
              prsBroken++;
            }
            newLastPerformance[ex.exerciseId] = { weight: bestSet.weight, reps: bestSet.reps };
          }
        });

        let calculatedPoints = 0;
        let sessionWeight = 0;
        const userWeight = 75;

        activeWorkout.exercises.forEach(ex => {
          const isBodyweight = ex.exerciseId.startsWith('bw-');
          const isCardio = ex.exerciseId.startsWith('cd-');
          const completedSets = ex.sets.filter(s => s.completed);
          if (completedSets.length === 0) return;

          const maxWeight = Math.max(...completedSets.map(s => s.weight));
          const maxReps = Math.max(...completedSets.map(s => s.reps));
          
          if (isBodyweight) {
            let factor = 0.5;
            if (ex.exerciseId === 'bw-1') factor = 0.65;
            if (ex.exerciseId === 'bw-2') factor = 1.0;
            if (ex.exerciseId === 'bw-3') factor = 0.7;
            if (ex.exerciseId === 'bw-6') factor = 0.3;
            calculatedPoints += (userWeight * factor) + maxReps + completedSets.length;
          } else if (isCardio) {
            calculatedPoints += (maxWeight * 1) + (maxReps * 1);
          } else {
            calculatedPoints += maxWeight + maxReps + completedSets.length;
            sessionWeight += ex.sets.reduce((acc, s) => acc + (s.completed ? s.weight * s.reps : 0), 0);
          }
        });

        const multipliers: Record<ReliabilityLevel, number> = { bronze: 0.5, silver: 0.8, gold: 1.0, diamond: 1.2 };
        const finalPoints = Math.floor(calculatedPoints * multipliers[userStats.reliability]);
        const streakBonus = Math.min(userStats.streak * 10, 50);
        const xpEarned = Math.floor(finalPoints * 10) + (prsBroken * 100) + streakBonus;

        const completedWorkout: CompletedWorkout = {
          id: activeWorkout.id,
          name: name || activeWorkout.name || 'Novo Treino',
          date: Date.now(),
          duration: Math.floor((Date.now() - activeWorkout.startTime) / 1000),
          totalVolume,
          xpEarned,
          points: finalPoints,
          reliability: userStats.reliability,
          isValidated: userStats.reliability !== 'bronze',
          exercises: activeWorkout.exercises,
        };

        // Badge Check Logic
        const newHistory = [completedWorkout, ...history];
        const newPointsTotal = userStats.points + finalPoints;
        const newTotalWeight = userStats.totalWeight + sessionWeight;
        const today = new Date().toDateString();
        const lastDate = userStats.lastWorkoutDate ? new Date(userStats.lastWorkoutDate).toDateString() : '';
        const newStreak = lastDate !== today ? userStats.streak + 1 : userStats.streak;

        // Evolution Logic (Levels 1-6)
        const levels = [0, 500, 1500, 3000, 6000, 12000];
        let newLevel = 1;
        for (let i = levels.length - 1; i >= 0; i--) {
          if (newPointsTotal >= levels[i]) { newLevel = i + 1; break; }
        }

        const earnedBadges: string[] = [];
        badges.forEach(badge => {
          if (badge.earnedBy.includes('current-user')) return;
          let earned = false;
          if (badge.id === 'bg-1' && newHistory.length >= 1) earned = true;
          if (badge.id === 'bg-2' && newTotalWeight >= 1000) earned = true;
          if (badge.id === 'bg-3' && newStreak >= 5) earned = true;
          if (badge.id === 'bg-4' && newLevel >= 5) earned = true;
          if (badge.id === 'bg-5' && Math.max(...activeWorkout.exercises.flatMap(e => e.sets.map(s => s.completed ? s.weight : 0))) >= 100) earned = true;
          if (badge.id === 'bg-6' && newPointsTotal >= 10000) earned = true;
          if (badge.id === 'bg-7' && newPointsTotal >= 100000) earned = true;
          if (badge.id === 'bg-8' && newStreak >= 5) earned = true;

          if (earned) earnedBadges.push(badge.id);
        });

        if (earnedBadges.length > 0) {
          await supabase.from('user_badges').insert(
            earnedBadges.map(bid => ({ user_id: user.id, badge_id: bid }))
          );
        }

        const workoutData = {
          user_id: user.id,
          name: name || activeWorkout.name || 'Novo Treino',
          duration: Math.floor((Date.now() - activeWorkout.startTime) / 1000),
          total_volume: totalVolume,
          xp_earned: xpEarned,
          points: finalPoints,
          reliability: userStats.reliability,
          is_validated: userStats.reliability !== 'bronze',
          exercises: activeWorkout.exercises
        };

        const { error: wError } = await supabase.from('workouts').insert([workoutData]);
        if (wError) console.error('Error saving workout:', wError);

        // 5. Personal Records & Strength Score Logic
        const updatedPRs = { ...(userStats.personalRecords || {}) };
        const mainLifts = {
          bench: ['Supino Reto', 'Bench Press', 'ex-1'],
          squat: ['Agachamento', 'Squat', 'ex-2'],
          deadlift: ['Levantamento Terra', 'Terra', 'Deadlift', 'ex-3']
        };

        const workout1RMs: Record<string, number> = {};

        activeWorkout.exercises.forEach(ex => {
          const completedSets = ex.sets.filter(s => s.completed);
          if (completedSets.length === 0) return;

          // Calculate best 1RM in this specific workout for this exercise
          const max1RM = Math.max(...completedSets.map(s => s.weight * (1 + s.reps / 30)));
          
          // Update Personal Records (All-time best 1RM per exercise)
          if (!updatedPRs[ex.exerciseId] || max1RM > updatedPRs[ex.exerciseId]) {
            updatedPRs[ex.exerciseId] = Math.round(max1RM * 10) / 10;
          }

          // Check if this is a main lift for the Strength Score
          Object.entries(mainLifts).forEach(([key, aliases]) => {
            if (aliases.some(alias => ex.name.toLowerCase().includes(alias.toLowerCase()) || ex.exerciseId === alias)) {
              workout1RMs[key] = max1RM;
            }
          });
        });

        // Recalculate Strength Score based on ALL-TIME best 1RMs for the 3 main lifts
        // We look for the best 1RM in updatedPRs that matches the main lifts aliases
        const getBest1RMForCategory = (aliases: string[]) => {
          let best = 0;
          Object.entries(updatedPRs).forEach(([exId, oneRM]) => {
            const exercise = [...BASE_EXERCISES, ...get().customExercises].find(e => e.id === exId);
            if (exercise && aliases.some(alias => exercise.name.toLowerCase().includes(alias.toLowerCase()) || exercise.id === alias)) {
              if (oneRM > best) best = oneRM;
            }
          });
          return best;
        };

        const updatedStrengthScore = Math.floor(
          getBest1RMForCategory(mainLifts.bench) + 
          getBest1RMForCategory(mainLifts.squat) + 
          getBest1RMForCategory(mainLifts.deadlift)
        );

        const { userStats: currentUserStats } = get();
        const nowIso = new Date().toISOString();
        const nowTs = new Date(nowIso).getTime();

        const updatedPoints = currentUserStats.points + finalPoints;
        const updatedTotalWeight = currentUserStats.totalWeight + totalVolume;
        const updatedWeeklyPoints = currentUserStats.weeklyPoints + finalPoints;
        const updatedMonthlyPoints = currentUserStats.monthlyPoints + finalPoints;
        const updatedWeeklyVolume = (currentUserStats.weeklyVolume || 0) + totalVolume;
        const updatedMonthlyVolume = (currentUserStats.monthlyVolume || 0) + totalVolume;

        const updatedStats: UserStats = {
          ...currentUserStats,
          points: updatedPoints,
          totalWeight: updatedTotalWeight,
          weeklyPoints: updatedWeeklyPoints,
          monthlyPoints: updatedMonthlyPoints,
          weeklyVolume: Number(updatedWeeklyVolume.toFixed(2)),
          monthlyVolume: Number(updatedMonthlyVolume.toFixed(2)),
          strengthScore: updatedStrengthScore,
          personalRecords: updatedPRs,
          streak: newStreak,
          lastWorkoutDate: nowTs
        };

        const { error: pError } = await supabase.from('profiles').update({
          points: updatedStats.points,
          total_weight: updatedStats.totalWeight,
          streak: updatedStats.streak,
          level: Math.min(newLevel, 6),
          last_workout_date: nowIso,
          strength_score: updatedStats.strengthScore,
          personal_records: updatedStats.personalRecords,
          weekly_points: updatedStats.weeklyPoints,
          monthly_points: updatedStats.monthlyPoints,
          weekly_volume: updatedStats.weeklyVolume,
          monthly_volume: updatedStats.monthlyVolume,
        }).eq('id', user.id);
        if (pError) console.error('Error updating profile:', pError);

        get().fetchInitialData();
        set({ activeWorkout: null });
      },

      cancelWorkout: () => set({ activeWorkout: null }),
      addExercise: (exercise) => set((state) => {
        if (!state.activeWorkout) return state;
        const last = state.lastPerformance[exercise.id] || { weight: 0, reps: 0 };
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: [...state.activeWorkout.exercises, {
              exerciseId: exercise.id,
              name: exercise.name,
              notes: '',
              sets: [{ id: crypto.randomUUID(), type: 'normal', weight: last.weight, reps: last.reps, completed: false }]
            }]
          }
        };
      }),
      removeExercise: (exerciseId) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.filter(e => e.exerciseId !== exerciseId)
          }
        };
      }),
      updateExercise: (exerciseId, updates) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map(e => e.exerciseId === exerciseId ? { ...e, ...updates } : e)
          }
        };
      }),
      addSet: (exerciseId) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map(e => 
              e.exerciseId === exerciseId 
                ? { ...e, sets: [...e.sets, { id: crypto.randomUUID(), type: 'normal', weight: 0, reps: 0, completed: false }] }
                : e
            )
          }
        };
      }),
      updateSet: (exerciseId, setId, updates) => set((state) => {
        if (!state.activeWorkout) return state;
        if (updates.completed === true) get().startRestTimer(60);
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map(e => 
              e.exerciseId === exerciseId 
                ? { ...e, sets: e.sets.map(s => s.id === setId ? { ...s, ...updates } : s) }
                : e
            )
          }
        };
      }),
      removeSet: (exerciseId, setId) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map(e => 
              e.exerciseId === exerciseId ? { ...e, sets: e.sets.filter(s => s.id !== setId) } : e
            )
          }
        };
      }),
      startRestTimer: (seconds) => set({
        restTimer: { duration: seconds, remaining: seconds, isActive: true }
      }),
      tickRestTimer: () => set((state) => {
        if (state.restTimer.remaining <= 0) return { restTimer: { ...state.restTimer, isActive: false } };
        return { restTimer: { ...state.restTimer, remaining: state.restTimer.remaining - 1 } };
      }),
      stopRestTimer: () => set((state) => ({
        restTimer: { ...state.restTimer, isActive: false, remaining: 0 }
      })),
      deleteWorkout: async (id) => {
        const { error } = await supabase.from('workouts').delete().eq('id', id);
        if (error) console.error('Error deleting workout:', error);
        get().fetchInitialData();
      },
      saveRoutine: async (routine) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const newRoutine = {
          user_id: user.id,
          title: routine.title,
          description: routine.description,
          muscle_groups: routine.muscleGroups,
          days: routine.days,
          is_recurring: routine.isRecurring,
          author_role: get().currentUserRole
        };
        const { error } = await supabase.from('routines').insert([newRoutine]);
        if (error) console.error('Error saving routine:', error);
        get().fetchInitialData();
      },
      updateRoutine: async (id, updates) => {
        const { error } = await supabase.from('routines').update({
          title: updates.title,
          description: updates.description,
          muscle_groups: updates.muscleGroups,
          days: updates.days,
          is_recurring: updates.isRecurring
        }).eq('id', id);
        if (error) console.error('Error updating routine:', error);
        get().fetchInitialData();
      },
      deleteRoutine: async (id) => {
        const { error } = await supabase.from('routines').delete().eq('id', id);
        if (error) console.error('Error deleting routine:', error);
        get().fetchInitialData();
      },
      importRoutine: async (routine) => {
        get().saveRoutine({ ...routine, title: `${routine.title} (Importado)` });
      },
      setReliability: async (level) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ reliability: level }).eq('id', user.id);
          get().fetchInitialData();
        }
      },
      validateWorkout: async (workoutId, level) => {
        const { error } = await supabase.from('workouts').update({ reliability: level, is_validated: true }).eq('id', workoutId);
        if (error) console.error('Error validating workout:', error);
        get().fetchInitialData();
      },
      addPoints: async (amount) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { userStats } = get();
          await supabase.from('profiles').update({ points: userStats.points + amount }).eq('id', user.id);
          get().fetchInitialData();
        }
      },

      generateTestData: async () => {
        if (!isSupabaseConfigured) return;
        const testProfiles = Array.from({ length: 50 }).map((_, i) => {
          const points = Math.floor(Math.random() * 50000);
          const level = Math.floor(points / 2000) + 1;
          const names = ['André', 'Bruno', 'Carlos', 'Diego', 'Eduardo', 'Felipe', 'Gabriel', 'Henrique', 'Igor', 'João', 'Kevin', 'Lucas', 'Márcio', 'Natan', 'Otávio', 'Paulo', 'Ricardo', 'Sérgio', 'Tiago', 'Vitor'];
          const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];
          const name = `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
          
          return {
            id: crypto.randomUUID(),
            full_name: `${name} ( teste )`,
            points,
            level: Math.min(level, 6),
            xp: points * 10,
            reliability: ['bronze', 'silver', 'gold', 'diamond'][Math.floor(Math.random() * 4)],
            streak: Math.floor(Math.random() * 10),
            total_weight: Math.floor(Math.random() * 5000),
            is_test: true
          };
        });

        const { error } = await supabase.from('profiles').insert(testProfiles);
        if (error) console.error('Error generating test data:', error);
        get().fetchInitialData();
      },

      resetTestData: async () => {
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.from('profiles').delete().eq('is_test', true);
        if (error) console.error('Error resetting test data:', error);
        get().fetchInitialData();
      },

      uploadAvatar: async (file: File) => {
        if (!isSupabaseConfigured) return null;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return null;

          // 1. Upload file to Storage
          const fileExt = file.name.split('.').pop();
          const filePath = `${user.id}/${Math.random()}.${fileExt}`;

          const { error: uploadError, data } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;

          // 2. Get Public URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          // 3. Update Profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

          if (updateError) throw updateError;

          get().fetchInitialData();
          return publicUrl;
        } catch (err) {
          console.error('Error uploading avatar:', err);
          return null;
        }
      },
    }),
    {
      name: 'a10-academia-storage',
    }
  )
);
