import React from 'react';
import { motion } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface NotificationPanelProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notifications: any[];
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  showNotifications,
  setShowNotifications,
  notifications
}) => {
  if (!showNotifications) return null;

  return (
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar overflow-x-hidden">
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
  );
};
