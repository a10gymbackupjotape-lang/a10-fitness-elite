import React from 'react';
import { WorkoutComment, useWorkoutStore } from '../../store/useWorkoutStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CommentItemProps {
  comment: WorkoutComment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const deleteComment = useWorkoutStore(state => state.deleteComment);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  const handleDelete = async () => {
    if (window.confirm('Excluir este comentário?')) {
      setIsDeleting(true);
      await deleteComment(comment.id);
    }
  };

  const isOwner = currentUserId === comment.user_id;

  return (
    <div className="flex gap-3 py-3 border-b border-zinc-800 last:border-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex-shrink-0">
        {comment.user?.avatar_url ? (
          <img 
            src={comment.user.avatar_url} 
            alt={comment.user.full_name} 
            className="w-8 h-8 object-cover border border-zinc-700"
            style={{ borderRadius: 0 }}
          />
        ) : (
          <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500">
            {comment.user?.full_name?.substring(0, 2).toUpperCase() || '??'}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-zinc-100">{comment.user?.full_name || 'Usuário'}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-tight">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          
          {isOwner && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        <p className="text-sm text-zinc-400 mt-1 leading-relaxed break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
};
