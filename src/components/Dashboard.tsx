import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AuthDialog } from './AuthDialog';
import type { LoveLetterData } from '../types/letter';
import {
  Heart, Plus, ExternalLink, Pencil, Trash2, Link,
  Check, Loader2, LogOut, LayoutDashboard, AlertCircle,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, slug?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const [letters, setLetters] = useState<LoveLetterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchLetters();
  }, [user, authLoading]);

  async function fetchLetters() {
    if (!isSupabaseConfigured || !supabase || !user) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('letters')
        .select('id, slug, partner_name, author_name, relationship_start_date, hero_title, is_premium, created_at, photos')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLetters((data as LoveLetterData[]) || []);
    } catch (err) {
      console.error('Erro ao buscar cartas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar suas cartas.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    setDeletingId(id);

    try {
      const { error: deleteError } = await supabase
        .from('letters')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setLetters((prev) => prev.filter((l) => l.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Erro ao excluir carta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir carta.');
    } finally {
      setDeletingId(null);
    }
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/?l=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  /* ── Estado: carregando auth ── */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center font-mono text-sm tracking-widest">
        <Loader2 className="w-5 h-5 animate-spin mr-3" />
        CARREGANDO...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {isAuthOpen && <AuthDialog onClose={() => setIsAuthOpen(false)} />}

      {/* Navbar */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <span className="font-semibold text-lg tracking-wider font-display text-primary">
            LOVE LETTER <span className="text-xs font-mono text-muted-foreground ml-1">Dashboard</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-muted-foreground hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-primary hover:bg-primary/10 rounded transition-colors"
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">

        {/* ── Não Logado ── */}
        {!user && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <LayoutDashboard className="w-12 h-12 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-display text-primary mb-3">
              Faça login para ver suas cartas
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
              Acesse sua conta para gerenciar, editar e compartilhar suas cartas de amor.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2.5 rounded bg-primary text-primary-foreground font-medium text-sm hover:bg-accent transition-colors"
            >
              Entrar ou Cadastrar
            </button>
          </div>
        )}

        {/* ── Logado ── */}
        {user && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-display text-primary mb-1">Suas cartas de amor</h1>
                <p className="text-sm text-muted-foreground font-mono">
                  {letters.length} {letters.length === 1 ? 'carta criada' : 'cartas criadas'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('editor')}
                className="px-4 py-2 rounded bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 hover:bg-accent transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Carta
              </button>
            </div>

            {/* Erro */}
            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded border border-red-900/50 bg-red-950/30 text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            )}

            {/* Estado Vazio */}
            {!loading && letters.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-lg">
                <Heart className="w-10 h-10 text-muted-foreground mb-5" />
                <h3 className="text-xl font-display text-primary mb-2">
                  Nenhuma carta ainda
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Crie sua primeira carta de amor interativa e surpreenda quem você ama.
                </p>
                <button
                  onClick={() => onNavigate('editor')}
                  className="px-5 py-2 rounded bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeira Carta
                </button>
              </div>
            )}

            {/* Grid de Cartas */}
            {!loading && letters.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {letters.map((letter) => (
                  <div
                    key={letter.id}
                    className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    {/* Preview Header */}
                    <div className="h-28 bg-secondary flex items-center justify-center relative overflow-hidden">
                      {letter.photos && letter.photos.length > 0 ? (
                        <img
                          src={letter.photos[0]}
                          alt={`${letter.partner_name} & ${letter.author_name}`}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <Heart className="w-8 h-8 text-primary/30" />
                      )}
                      {letter.is_premium && (
                        <span className="absolute top-2 right-2 text-[10px] font-mono bg-primary/20 text-primary px-2 py-0.5 rounded">
                          PREMIUM
                        </span>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="p-4">
                      <h3 className="font-display text-primary text-lg leading-tight mb-0.5">
                        {letter.partner_name} & {letter.author_name}
                      </h3>
                      {letter.hero_title && (
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {letter.hero_title} {letter.hero_subtitle || ''}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                        <span>{letter.created_at ? formatDate(letter.created_at) : '—'}</span>
                        <span className="text-border">·</span>
                        <span className="text-primary/70">{letter.slug}</span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="border-t border-border px-4 py-3 flex items-center gap-1">
                      {/* Ver */}
                      <a
                        href={`/?l=${letter.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Ver carta"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Editar */}
                      <button
                        onClick={() => onNavigate('edit', letter.slug)}
                        className="p-2 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Editar carta"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Copiar Link */}
                      <button
                        onClick={() => letter.slug && copyLink(letter.slug)}
                        className="p-2 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Copiar link"
                      >
                        {copiedSlug === letter.slug ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Link className="w-4 h-4" />
                        )}
                      </button>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Excluir */}
                      {confirmDeleteId === letter.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-red-400 mr-1">Excluir?</span>
                          <button
                            onClick={() => letter.id && handleDelete(letter.id)}
                            disabled={deletingId === letter.id}
                            className="px-2 py-1 rounded text-[10px] font-mono bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-colors disabled:opacity-50"
                          >
                            {deletingId === letter.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Sim'
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(letter.id || null)}
                          className="p-2 rounded text-muted-foreground hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Excluir carta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Criado com Love Letter
        </span>
      </footer>
    </div>
  );
}
