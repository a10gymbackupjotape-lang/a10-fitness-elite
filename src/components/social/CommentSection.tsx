import React from 'react';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { CommentItem } from './CommentItem';
import { Send, MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  workoutId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ workoutId }) => {
  const [content, setContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  
  const comments = useWorkoutStore(state => state.comments[workoutId] || []);
  const addComment = useWorkoutStore(state => state.addComment);
  const fetchComments = useWorkoutStore(state => state.fetchComments);

  React.useEffect(() => {
    if (showComments) {
      fetchComments(workoutId);
    }
  }, [showComments, workoutId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(workoutId, content.trim());
      setContent('');
      // fetchComments is already triggered by Realtime subscription in the store
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentCount = comments.length;

  return (
    <div className="mt-4 border-t border-zinc-800 pt-4">
      <button 
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-amber-500 transition-colors uppercase tracking-widest"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {showComments ? 'Ocultar Comentários' : `${commentCount} Comentários`}
      </button>

      {showComments && (
        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {comments.length > 0 ? (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <p className="text-xs text-zinc-600 italic py-2">Seja o primeiro a comentar!</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input 
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              style={{ borderRadius: 0 }}
            />
            <button 
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-4 bg-amber-500 text-black font-bold text-xs uppercase hover:bg-amber-400 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex items-center justify-center min-w-[48px]"
              style={{ borderRadius: 0 }}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
