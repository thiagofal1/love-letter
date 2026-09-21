import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, Loader2 } from 'lucide-react';

export function AuthDialog({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!supabase) {
      setError('Supabase não configurado.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Cadastro realizado! Verifique seu email ou faça login se a confirmação estiver desativada.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-md rounded-lg p-6 relative shadow-lg">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-display font-semibold text-primary mb-2">
          {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {isLogin ? 'Faça login para salvar e gerenciar suas cartas.' : 'Cadastre-se para guardar e editar suas cartas de amor para sempre.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded pl-9 pr-3 py-2 text-sm focus:border-primary outline-none text-foreground"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded pl-9 pr-3 py-2 text-sm focus:border-primary outline-none text-foreground"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-950/30 p-2 rounded border border-red-900/50">{error}</div>}
          {success && <div className="text-primary text-xs bg-primary/10 p-2 rounded border border-primary/20">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
}
