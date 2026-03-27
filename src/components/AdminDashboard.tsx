import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Dumbbell, 
  Database, 
  Settings, 
  Terminal, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  User,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { BASE_EXERCISES } from '../data/exercises';

interface AdminDashboardProps {
  showAdminDashboard: boolean;
  setShowAdminDashboard: (show: boolean) => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;
  events: any[];
  setEditingEvent: (event: any) => void;
  setShowEditEvent: (show: boolean) => void;
  deleteEvent: (id: string) => void;
  history: any[];
  validateWorkout: (id: string, type: 'gold' | 'bronze') => void;
  addPoints: (pts: number) => void;
  customExercises: any[];
  addCustomExercise: (ex: any) => void;
  deleteCustomExercise: (id: string) => void;
  isSupabaseConfigured: boolean;
  generateTestData: () => void;
  resetTestData: () => void;
  fetchInitialData: () => void;
  setShowCreateEvent: (show: boolean) => void;
  setShowCreateBadge: (show: boolean) => void;
  setShowCreateTip: (show: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  showAdminDashboard,
  setShowAdminDashboard,
  adminTab,
  setAdminTab,
  events,
  setEditingEvent,
  setShowEditEvent,
  deleteEvent,
  history,
  validateWorkout,
  addPoints,
  customExercises,
  addCustomExercise,
  deleteCustomExercise,
  isSupabaseConfigured,
  generateTestData,
  resetTestData,
  fetchInitialData,
  setShowCreateEvent,
  setShowCreateBadge,
  setShowCreateTip
}) => {
  return (
    <AnimatePresence>
      {showAdminDashboard && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center lg:p-8"
        >
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setShowAdminDashboard(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="w-full h-full lg:h-auto lg:max-w-5xl bg-card border border-border lg:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-black uppercase tracking-tight">Painel de Controle Elite</h2>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">A10 Management System Suite</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAdminDashboard(false)}
                className="p-3 hover:bg-muted rounded-full transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="flex border-b border-border bg-card overflow-x-auto no-scrollbar scroll-px-4">
              {[
                { id: 'events', label: 'Eventos', icon: Calendar },
                { id: 'validation', label: 'Validação', icon: CheckCircle2 },
                { id: 'exercises', label: 'Exercícios', icon: Dumbbell },
                { id: 'supabase', label: 'Sincronia', icon: Database },
                { id: 'settings', label: 'Presets', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={cn(
                    "flex-1 min-w-[100px] flex flex-col items-center gap-1.5 py-4 border-b-2 transition-all",
                    adminTab === tab.id 
                      ? "border-primary text-primary bg-primary/5" 
                      : "border-transparent text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-muted/10 no-scrollbar">
              
              {adminTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground px-1">Gerenciar Cronograma</h3>
                    <button 
                      onClick={() => setShowCreateEvent(true)}
                      className="bg-primary hover:bg-primary/90 text-background px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Novo Evento
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                      <div key={event.id} className="bg-card p-5 rounded-[24px] border border-border hover:border-primary/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className={cn(
                            "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest",
                            event.type === 'tournament' ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                          )}>
                            {event.type}
                          </div>
                          <div className="text-[10px] font-bold text-muted-foreground">
                            {format(event.date, "dd MMM")} • {event.time}
                          </div>
                        </div>
                        <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{event.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{event.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-bold">
                                U{i}
                              </div>
                            ))}
                            <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[8px] font-bold text-primary">
                              +{event.participants}
                            </div>
                          </div>
                          <div className="flex gap-2">
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
                              <p className="text-xs text-muted-foreground">João Silva • {format(new Date(workout.date), "dd/MM/yy HH:mm")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-display font-black text-primary">+{workout.points} PTS</p>
                              <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-tighter">Motor Universal</p>
                            </div>
                          </div>

                          <div className="p-3 bg-muted/30 rounded-xl space-y-2 border border-border/40">
                            {workout.exercises.map((ex: any) => (
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
