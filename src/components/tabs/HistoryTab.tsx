import React from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompletedWorkout } from '../../store/useWorkoutStore';

interface HistoryTabProps {
  history: CompletedWorkout[];
  setSelectedHistoryWorkout: (workout: CompletedWorkout) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  setSelectedHistoryWorkout,
}) => {
  return (
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
          <p className="text-muted-foreground text-sm font-medium">Nenhum treino ainda. Comece a treinar!</p>
        </div>
      ) : (
        history.map((workout) => (
          <button 
            key={workout.id} 
            onClick={() => setSelectedHistoryWorkout(workout)}
            className="w-full text-left bg-card p-5 rounded-2xl border border-border hover:border-primary/50 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base group-hover:text-primary transition-colors">{workout.name}</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  {format(workout.date, "d 'de' MMMM, yyyy", { locale: ptBR })} • {Math.floor(workout.duration / 60)} min
                </p>
              </div>
              <div className="text-right">
                <span className="text-primary font-mono text-sm font-black flex items-center gap-1">
                  {workout.totalVolume.toLocaleString('pt-BR')} <span className="text-[10px]">KG</span>
                </span>
                <p className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter">Volume Total</p>
              </div>
            </div>
          </button>
        ))
      )}
    </motion.div>
  );
};
