import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Weight, 
  Clock, 
  Flame, 
  Zap, 
  BarChart3, 
  ChevronRight,
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { CommentSection } from '../social/CommentSection';

interface RankingTabProps {
  communityMode: 'feed' | 'ranking';
  setCommunityMode: (mode: 'feed' | 'ranking') => void;
  socialFeed: any[];
  setSelectedUserForProfile: (user: any) => void;
  supportWorkout: (id: string) => Promise<void>;
  setSelectedHistoryWorkout: (workout: any) => void;
  rankingTimeframe: 'weekly' | 'monthly' | 'all';
  setRankingTimeframe: (t: 'weekly' | 'monthly' | 'all') => void;
  weightCategory: string;
  setWeightCategory: (c: string) => void;
  genderFilter: string;
  setGenderFilter: (g: string) => void;
  ageFilter: string;
  setAgeFilter: (a: string) => void;
  sortedRanking: any[];
  session: any;
  rankingCategory: 'volume' | 'strength' | 'frequency' | 'evolution';
  setRankingCategory: (c: 'volume' | 'strength' | 'frequency' | 'evolution') => void;
  userStats: any;
  hallOfFame: any[];
}

export const RankingTab: React.FC<RankingTabProps> = ({
  communityMode,
  setCommunityMode,
  socialFeed,
  setSelectedUserForProfile,
  supportWorkout,
  setSelectedHistoryWorkout,
  rankingTimeframe,
  setRankingTimeframe,
  weightCategory,
  setWeightCategory,
  genderFilter,
  setGenderFilter,
  ageFilter,
  setAgeFilter,
  sortedRanking,
  session,
  rankingCategory,
  setRankingCategory,
  userStats,
  hallOfFame
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-24 p-4"
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
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setSelectedUserForProfile(workout.profile)}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted border-2 border-primary/20 overflow-hidden">
                      {workout.profile?.avatar_url ? (
                        <img src={workout.profile.avatar_url} className="w-full h-full object-cover" />
                      ) : <span className="flex items-center justify-center w-full h-full">👤</span>}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase group-hover:text-primary transition-colors">{workout.profile?.full_name || 'Atleta'}</p>
                      <p className="text-[8px] text-muted-foreground font-bold uppercase">{format(new Date(workout.date), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-[8px] font-black text-primary border border-primary/20">
                    <Trophy className="w-2 h-2" /> +{workout.xpEarned || 0} XP
                  </div>
                </div>

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

                <div className="px-4 py-3 bg-muted/20 flex gap-2 border-t border-border/50">
                  <button 
                    onClick={async () => {
                      await supportWorkout(workout.id);
                    }}
                    className="flex-1 bg-card border border-border py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all active:scale-95 text-[9px] font-black uppercase tracking-widest"
                  >
                    <Flame className="w-3 h-3 text-orange-500" /> Apoiar
                  </button>
                  <button 
                    className="flex-1 bg-card border border-border py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all active:scale-95 text-[9px] font-black uppercase tracking-widest"
                    onClick={() => setSelectedHistoryWorkout(workout)}
                  >
                    <MessageSquare className="w-3 h-3 text-blue-500" /> Detalhes
                  </button>
                </div>
                
                <div className="px-4 pb-4">
                  <CommentSection workoutId={workout.id} />
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

          {/* Podiums */}
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
                ) : <span className="flex items-center justify-center w-full h-full">👤</span>}
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
                ) : <span className="flex items-center justify-center w-full h-full">👑</span>}
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
                ) : <span className="flex items-center justify-center w-full h-full">👤</span>}
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

          {/* Hall da Fama */}
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
                    ) : record.user ? <span className="flex items-center justify-center w-full h-full">👤</span> : <span className="flex items-center justify-center w-full h-full">⌛</span>}
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
                      <div className="flex items-center gap-2">
                        {idx === 0 && <span className="text-xl">👑</span>}
                        {idx === 1 && <span className="text-xl">🥈</span>}
                        {idx === 2 && <span className="text-xl">🥉</span>}
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
