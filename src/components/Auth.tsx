import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        setError('Verifique seu e-mail para confirmar o cadastro!');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-card/50 backdrop-blur-2xl border border-border p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-background rounded-2xl mb-4 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display font-black tracking-tighter uppercase text-primary">A10 academia</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] mt-2 font-mono">Professional Training System</p>
          </div>

          <div className="flex gap-2 p-1 bg-muted mb-8 rounded-xl border border-border">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                isLogin ? "bg-primary text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Entrar
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                !isLogin ? "bg-primary text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      required 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="João Silva"
                      className="w-full bg-background/50 border border-border p-4 pl-12 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30 text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-background/50 border border-border p-4 pl-12 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background/50 border border-border p-4 pl-12 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30 text-sm"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[10px] flex items-center gap-3 uppercase font-bold tracking-tight rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-background font-black py-4 rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 mt-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Iniciar Sessão' : 'Criar Conta'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-[8px] text-muted-foreground uppercase tracking-widest opacity-50">
            {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'} 
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-black ml-1 hover:underline"
            >
              {isLogin ? 'Cadastre-se' : 'Faça Login'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
