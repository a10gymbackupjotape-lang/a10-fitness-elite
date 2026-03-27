import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Trophy, 
  X, 
  Megaphone, 
  Plus, 
  Settings, 
  Calendar, 
  MessageCircle, 
  Award, 
  Trash2, 
  CheckCircle2, 
  Download 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useWorkoutStore, SetType } from '../../store/useWorkoutStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WorkoutTabProps {
  session: any;
  currentTime: Date;
  events: any[];
  currentEventIndex: number;
  participateInEvent: (id: string) => void;
  currentUserRole: string;
  setShowAdminDashboard: (show: boolean) => void;
  setShowCreateEvent: (show: boolean) => void;
  setShowCreateBadge: (show: boolean) => void;
  setShowCreateTip: (show: boolean) => void;
  setEditingRoutine: (routine: any) => void;
  setShowRoutineEditor: (show: boolean) => void;
  tips: any[];
  routineSection: 'mine' | 'suggested';
  setRoutineSection: (section: 'mine' | 'suggested') => void;
  setRoutineToDelete: (id: string) => void;
  workoutTime: number;
  setShowCancelConfirm: (show: boolean) => void;
  setWorkoutName: (name: string) => void;
  setShowFinishModal: (show: boolean) => void;
  setShowExercisePicker: (show: boolean) => void;
}

const SET_TYPES: { value: SetType; label: string; color: string }[] = [
  { value: 'normal', label: 'N', color: 'bg-muted' },
  { value: 'warm_up', label: 'A', color: 'bg-orange-500/20 text-orange-500' },
  { value: 'drop', label: 'D', color: 'bg-blue-500/20 text-blue-500' },
  { value: 'failure', label: 'F', color: 'bg-red-500/20 text-red-500' },
];

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  session,
  currentTime,
  events,
  currentEventIndex,
  participateInEvent,
  currentUserRole,
  setShowAdminDashboard,
  setShowCreateEvent,
  setShowCreateBadge,
  setShowCreateTip,
  setEditingRoutine,
  setShowRoutineEditor,
  tips,
  routineSection,
  setRoutineSection,
  setRoutineToDelete,
  workoutTime,
  setShowCancelConfirm,
  setWorkoutName,
  setShowFinishModal,
  setShowExercisePicker
}) => {
  const { 
    activeWorkout, 
    startWorkout, 
    routines, 
    importRoutine, 
    removeExercise, 
    updateExercise, 
    updateSet, 
    removeSet, 
    addSet,
    predefinedRoutines
  } = useWorkoutStore();

  const formatDay = (date: Date) => format(date, "EEEE", { locale: ptBR });
  const formatHour = (date: Date) => format(date, "HH:mm");
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
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
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user.id || 'Guest'}`} 
                  alt="User" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold">Olá, {session?.user.user_metadata.full_name || session?.user.email?.split('@')[0] || 'Atleta'} <span className="text-primary text-xs uppercase ml-1 animate-pulse">( elite )</span></h2>
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
                      {event.participants.includes(session?.user.id) ? 'Inscrito' : 'Participar Agora'}
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
                        {events[currentEventIndex].participants.includes(session?.user.id) ? 'Você está inscrito ✨' : 'Participar do Evento'}
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
                    {new Date(currentTime.getTime() + (i - currentTime.getDay()) * 86400000).getDate()}
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
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-100 transition-opacity">
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
                predefinedRoutines.map((routine) => (
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
                onClick={() => {}} // Placeholder for marketplace
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
          <div className="flex justify-between items-center bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-border sticky top-0 z-20 shadow-lg">
            <div>
              <h2 className="text-xl font-display font-bold">Treino Ativo</h2>
              <p className="text-primary text-sm font-mono tracking-wider">{formatTime(workoutTime)}</p>
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
                className="bg-primary text-background px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Finalizar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {activeWorkout.exercises.map((exercise) => (
              <div key={exercise.exerciseId} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                  <h3 className="font-display font-bold text-primary">{exercise.name}</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => removeExercise(exercise.exerciseId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="px-2">
                    <textarea 
                      placeholder="Adicione notas para este exercício..."
                      value={exercise.notes}
                      onChange={(e) => updateExercise(exercise.exerciseId, { notes: e.target.value })}
                      className="w-full bg-muted/50 border-none rounded-lg p-3 text-xs text-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none resize-none h-16 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-[40px_1fr_1fr_40px_24px] gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black px-1">
                    <span className="text-center">Set</span>
                    <span className="text-center">KG</span>
                    <span className="text-center">REPS</span>
                    <span className="text-center">OK</span>
                    <span></span>
                  </div>
                  
                  {exercise.sets.map((set, idx) => (
                    <div key={set.id} className="grid grid-cols-[40px_1fr_1fr_40px_24px] gap-2 items-center group px-1">
                      <button 
                        onClick={() => {
                          const currentIdx = SET_TYPES.findIndex(t => t.value === set.type);
                          const nextType = SET_TYPES[(currentIdx + 1) % SET_TYPES.length].value;
                          updateSet(exercise.exerciseId, set.id, { type: nextType });
                        }}
                        className={cn(
                          "w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[11px] font-black transition-all mx-auto border-2",
                          set.completed 
                            ? "bg-primary border-primary text-background shadow-lg shadow-primary/20" 
                            : cn(SET_TYPES.find(t => t.value === set.type)?.color, "border-transparent")
                        )}
                      >
                        <span>{idx + 1}</span>
                        <span className="text-[6px] opacity-60">{SET_TYPES.find(t => t.value === set.type)?.label}</span>
                      </button>
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        onChange={(e) => updateSet(exercise.exerciseId, set.id, { weight: Number(e.target.value) })}
                        placeholder="0"
                        className="bg-muted/80 border-none rounded-xl py-3 text-center font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none min-w-0"
                      />
                      <input 
                        type="number" 
                        value={set.reps || ''} 
                        onChange={(e) => updateSet(exercise.exerciseId, set.id, { reps: Number(e.target.value) })}
                        placeholder="0"
                        className="bg-muted/80 border-none rounded-xl py-3 text-center font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none min-w-0"
                      />
                      <button 
                        onClick={() => updateSet(exercise.exerciseId, set.id, { completed: !set.completed })}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all mx-auto border-2",
                          set.completed 
                            ? "bg-primary border-primary text-background shadow-lg shadow-primary/20" 
                            : "bg-muted border-transparent text-muted-foreground"
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
                    className="w-full py-3 rounded-xl bg-muted/50 text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors border-2 border-dashed border-border/50"
                  >
                    + Adicionar Série
                  </button>
                </div>
              </div>
            ))}

            <button 
              onClick={() => setShowExercisePicker(true)}
              className="w-full border-2 border-dashed border-border rounded-2xl py-10 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all bg-card/30 group"
            >
              <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <Plus className="w-8 h-8" />
              </div>
              <span className="font-black uppercase tracking-[0.3em] text-[10px]">Adicionar Exercício</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
