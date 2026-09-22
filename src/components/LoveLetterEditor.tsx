import { useState, useEffect } from 'react';
import type { LoveLetterData, MemoryItem } from '../types/letter';
import { DEFAULT_LOVE_LETTER } from '../types/letter';
import { LoveLetterViewer } from './LoveLetterViewer';
import { PhotoUploader } from './PhotoUploader';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AuthDialog } from './AuthDialog';
import { PremiumModal } from './PremiumModal';
import { THEMES, applyTheme, getTheme } from '../lib/themes';
import {
  Heart, Save, Eye, Sparkles, Music,
  Calendar, Plus, Trash2, Link, Check, ExternalLink, ImagePlus, UserCircle, LogOut, LayoutDashboard, Crown, Lock
} from 'lucide-react';

function generateSlug(partner: string, author: string) {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean(partner)}-e-${clean(author)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

interface LoveLetterEditorProps {
  initialData?: LoveLetterData;
  onNavigate?: (view: string, slug?: string) => void;
}

export function LoveLetterEditor({ initialData = DEFAULT_LOVE_LETTER, onNavigate }: LoveLetterEditorProps) {
  const [formData, setFormData] = useState<LoveLetterData>(initialData);
  const [activeTab, setActiveTab] = useState<'geral' | 'mensagens' | 'memorias' | 'fotos' | 'musica' | 'premium'>('geral');
  const [viewMode, setViewMode] = useState<'split' | 'preview'>('split');

  useEffect(() => {
    applyTheme(formData.theme_id || 'warm-gold');
  }, [formData.theme_id]);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [publishNotice, setPublishNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { user, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  function updateField<K extends keyof LoveLetterData>(key: K, value: LoveLetterData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function updateDeclaration(index: number, value: string) {
    const next = [...(formData.declarations || [])];
    next[index] = value;
    updateField('declarations', next);
  }

  function addDeclaration() {
    updateField('declarations', [...(formData.declarations || []), '']);
  }

  function removeDeclaration(index: number) {
    updateField('declarations', (formData.declarations || []).filter((_, i) => i !== index));
  }

  function updateMemory(index: number, field: keyof MemoryItem, value: string) {
    const next = [...(formData.memories || [])];
    next[index] = { ...next[index], [field]: value };
    updateField('memories', next);
  }

  function addMemory() {
    updateField('memories', [
      ...(formData.memories || []),
      { date: '', label: '', desc: '' },
    ]);
  }

  function removeMemory(index: number) {
    updateField('memories', (formData.memories || []).filter((_, i) => i !== index));
  }

  async function handlePublish() {
    // Check if user is trying to save a premium theme without being premium
    const selectedTheme = getTheme(formData.theme_id || 'warm-gold');
    if (selectedTheme.premium && !formData.is_premium) {
        setIsPremiumModalOpen(true);
        // Revert to free theme
        updateField('theme_id', 'warm-gold');
        return;
    }

    setIsSaving(true);
    setShareUrl(null);
    setPublishNotice(null);

    try {
      const slug = formData.slug || generateSlug(formData.partner_name, formData.author_name);

      if (isSupabaseConfigured && supabase) {
        if (!user) {
          setIsAuthOpen(true);
          setPublishNotice({ type: 'error', text: 'Faça login para salvar a carta.' });
          setIsSaving(false);
          return;
        }

        const dataToSave = { ...formData, slug, user_id: user.id };
        const { error } = await supabase
          .from('letters')
          .upsert(dataToSave, { onConflict: 'slug' });
        if (error) throw error;
        setShareUrl(`${window.location.origin}/?l=${slug}`);
        setPublishNotice({ type: 'success', text: 'Carta salva. Seu link está pronto.' });
      } else {
        const encoded = btoa(encodeURIComponent(JSON.stringify(formData)));
        setShareUrl(`${window.location.origin}/?d=${encoded}`);
        setPublishNotice({ type: 'success', text: 'Carta salva no link local. Configure o Supabase para persistência.' });
      }
    } catch (err) {
      console.error('Erro ao publicar:', err);
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao publicar.';
      setPublishNotice({ type: 'error', text: `Não foi possível salvar: ${message}` });
    } finally {
      setIsSaving(false);
    }
  }

  function copyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePremiumCheckout() {
    if (!user) {
        setIsPremiumModalOpen(false);
        setIsAuthOpen(true);
        return;
    }

    try {
        setIsCheckoutLoading(true);
        setPublishNotice({ type: 'success', text: 'Gerando checkout do Mercado Pago...' });
        const { data: { session } } = await supabase!.auth.getSession();
        
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
                returnUrl: window.location.href
            })
        });

        const data = await res.json();
        
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
             throw new Error(data.error || 'Erro ao gerar checkout');
        }
    } catch (err) {
        console.error("Checkout Error:", err);
        const msg = err instanceof Error ? err.message : 'Erro desconhecido ao conectar.';
        setPublishNotice({ type: 'error', text: `Erro: ${msg}` });
        setIsCheckoutLoading(false);
    }
  }

  const tabs = [
    { id: 'geral' as const, label: 'Geral', icon: Calendar },
    { id: 'mensagens' as const, label: 'Mensagens', icon: Heart },
    { id: 'memorias' as const, label: 'Timeline', icon: Sparkles },
    { id: 'fotos' as const, label: 'Fotos', icon: ImagePlus },
    { id: 'musica' as const, label: 'Música & Fim', icon: Music },
    { id: 'premium' as const, label: 'Premium', icon: Crown },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {isAuthOpen && <AuthDialog onClose={() => setIsAuthOpen(false)} />}
      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
        onCheckout={handlePremiumCheckout}
        isLoading={isCheckoutLoading}
      />
      
      {/* Navbar */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <span className="font-semibold text-lg tracking-wider font-display text-primary">
            LOVE LETTER <span className="text-xs font-mono text-muted-foreground ml-1">Studio</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user && onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Minhas Cartas
            </button>
          )}

          {user ? (
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-muted-foreground hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-primary hover:bg-primary/10 rounded transition-colors"
            >
              <UserCircle className="w-3.5 h-3.5" />
              Entrar
            </button>
          )}

          <button
            onClick={() => setViewMode(viewMode === 'split' ? 'preview' : 'split')}
            className="px-3 py-1.5 rounded border border-border text-xs font-mono flex items-center gap-2 hover:border-primary transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            {viewMode === 'split' ? 'Tela Cheia' : 'Editor'}
          </button>

          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="px-4 py-1.5 rounded bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 hover:bg-accent transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </header>

      {/* Banner de link gerado */}
      {shareUrl && (
        <div className="bg-secondary border-b border-primary px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-mono text-card-foreground">
              Link: <strong className="text-primary">{shareUrl}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-mono flex items-center gap-1.5 hover:bg-accent">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <a href={shareUrl} target="_blank" rel="noreferrer" className="p-1 rounded text-primary hover:bg-secondary">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {publishNotice && (
        <div
          role="status"
          aria-live="polite"
          className={`border-b px-6 py-2 text-xs font-mono ${publishNotice.type === 'success' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-red-400/40 bg-red-950/30 text-red-200'}`}
        >
          {publishNotice.text}
        </div>
      )}

      {/* Editor + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'split' && (
          <aside className="w-full md:w-[450px] lg:w-[500px] border-r border-border bg-card flex flex-col h-[calc(100vh-4rem)]">
            {/* Abas */}
            <div className="flex border-b border-border bg-background">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 text-xs font-mono flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary bg-card'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Formulário */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'geral' && (
                <div className="space-y-4">
                  <Field label="Nome do Parceiro(a)" value={formData.partner_name} onChange={(v) => updateField('partner_name', v)} />
                  <Field label="Seu Nome" value={formData.author_name} onChange={(v) => updateField('author_name', v)} />
                  <Field label="Data de Início" value={formData.relationship_start_date.slice(0, 16)} onChange={(v) => updateField('relationship_start_date', v)} type="datetime-local" />
                  <Field label="Título (Hero)" value={formData.hero_title} onChange={(v) => updateField('hero_title', v)} />
                  <Field label="Subtítulo (Hero)" value={formData.hero_subtitle} onChange={(v) => updateField('hero_subtitle', v)} />
                  <Field label="Descrição Inicial" value={formData.hero_description} onChange={(v) => updateField('hero_description', v)} multiline />
                </div>
              )}

              {activeTab === 'mensagens' && (
                <div className="space-y-6">
                  <Field label="Texto do Letreiro (Marquee)" value={formData.marquee_text} onChange={(v) => updateField('marquee_text', v)} />

                  <ListSection title="Declarações" onAdd={addDeclaration}>
                    {(formData.declarations || []).map((text, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => updateDeclaration(i, e.target.value)}
                          className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-sm focus:border-primary outline-none"
                        />
                        <button onClick={() => removeDeclaration(i)} className="p-2 text-muted-foreground hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </ListSection>
                </div>
              )}

              {activeTab === 'memorias' && (
                <ListSection title="Momentos Marcantes" onAdd={addMemory}>
                  {(formData.memories || []).map((mem, i) => (
                    <div key={i} className="p-4 rounded border border-border bg-background space-y-3 relative">
                      <button onClick={() => removeMemory(i)} className="absolute top-3 right-3 text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <MiniField label="Data" value={mem.date} onChange={(v) => updateMemory(i, 'date', v)} />
                      <MiniField label="Título" value={mem.label} onChange={(v) => updateMemory(i, 'label', v)} />
                      <MiniField label="Descrição" value={mem.desc} onChange={(v) => updateMemory(i, 'desc', v)} multiline />
                    </div>
                  ))}
                </ListSection>
              )}

              {activeTab === 'musica' && (
                <div className="space-y-4">
                  <Field label="URL da Playlist Spotify" value={formData.spotify_playlist_url} onChange={(v) => updateField('spotify_playlist_url', v)} placeholder="https://open.spotify.com/playlist/..." />
                  <Field label="Citação Final" value={formData.closing_quote} onChange={(v) => updateField('closing_quote', v)} multiline />
                  <Field label="Mensagem de Encerramento" value={formData.closing_message} onChange={(v) => updateField('closing_message', v)} multiline />
                  <Field label="Texto do Rodapé" value={formData.footer_text} onChange={(v) => updateField('footer_text', v)} />
                </div>
              )}

              {activeTab === 'fotos' && (
                <PhotoUploader
                  photos={formData.photos || []}
                  onChange={(photos) => updateField('photos', photos)}
                />
              )}

              {activeTab === 'premium' && (
                <div className="space-y-8">
                  {/* Seletor de Temas */}
                  <div className="space-y-4">
                    <label className="block text-xs font-mono text-muted-foreground uppercase">Tema de Cores</label>
                    <div className="grid grid-cols-2 gap-3">
                      {THEMES.map((theme) => {
                        const isSelected = (formData.theme_id || 'warm-gold') === theme.id;
                        const isLocked = theme.premium && !formData.is_premium;

                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={(e) => {
                              if (theme.promotional) {
                                const hasVisited = localStorage.getItem('has_visited_thigasfal');
                                if (!hasVisited) {
                                  e.preventDefault();
                                  window.open('https://thigasfal.dev', '_blank');
                                  localStorage.setItem('has_visited_thigasfal', 'true');
                                  // Can show a quick notice so the user knows what happened
                                  setPublishNotice({ type: 'success', text: 'Obrigado por visitar! O tema especial foi desbloqueado.' });
                                  updateField('theme_id', theme.id);
                                  return;
                                }
                              }
                              updateField('theme_id', theme.id);
                            }}
                            className={`relative p-3 rounded border text-left transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-background hover:border-muted-foreground'
                            }`}
                          >
                            {/* Palette Preview */}
                            <div className="flex gap-1.5 mb-2">
                              {['background', 'primary', 'card', 'accent'].map((colorKey) => (
                                <div
                                  key={colorKey}
                                  className="w-5 h-5 rounded-full border border-border"
                                  style={{ backgroundColor: theme.colors[colorKey] }}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-mono text-foreground">{theme.name}</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{theme.description}</p>

                            {/* Premium Badge */}
                            {theme.premium && (
                              <span className="absolute top-2 right-2 flex items-center gap-1">
                                {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                                <span className="text-[9px] font-mono text-primary uppercase">Premium</span>
                              </span>
                            )}

                            {/* Promotional Badge */}
                            {theme.promotional && (
                              <span className="absolute top-2 right-2 flex items-center gap-1">
                                {!localStorage.getItem('has_visited_thigasfal') && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                                <span className="text-[9px] font-mono text-primary uppercase">Promo</span>
                              </span>
                            )}

                            {/* Selected Check */}
                            {isSelected && (
                              <div className="absolute bottom-2 right-2">
                                <Check className="w-3.5 h-3.5 text-primary" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="h-px bg-border" />

                  {/* Slug Personalizado */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono text-muted-foreground uppercase">Link Personalizado</label>
                    {formData.is_premium ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-0 rounded border border-border overflow-hidden">
                          <span className="px-3 py-2 bg-secondary text-[11px] font-mono text-muted-foreground whitespace-nowrap border-r border-border">
                            loveletter.app/
                          </span>
                          <input
                            type="text"
                            value={formData.slug || ''}
                            onChange={(e) => {
                              const sanitized = e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, '-')
                                .replace(/[^a-z0-9\-]/g, '');
                              updateField('slug', sanitized);
                            }}
                            className="flex-1 bg-background px-3 py-2 text-sm focus:outline-none text-foreground font-mono"
                            placeholder="izzy-e-thiago"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Use letras, números e hífens. Ex: izzy-e-thiago
                        </p>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setIsPremiumModalOpen(true)}
                        className="p-4 rounded border border-dashed border-border text-center cursor-pointer hover:border-primary/50 transition-colors group"
                      >
                        <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
                        <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          Disponível no plano Premium
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Customize o link da sua carta com um slug exclusivo.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Marca d'água */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono text-muted-foreground uppercase">Marca d'água</label>
                    {formData.is_premium ? (
                      <div className="p-3 rounded border border-primary/30 bg-primary/5">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-xs text-primary font-mono">Marca d'água removida</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Sua carta não exibe "Criado com Love Letter" no rodapé.
                        </p>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setIsPremiumModalOpen(true)}
                        className="p-4 rounded border border-dashed border-border text-center cursor-pointer hover:border-primary/50 transition-colors group"
                      >
                        <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
                        <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          Disponível no plano Premium
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Remova o "Criado com Love Letter" do rodapé da sua carta.
                        </p>
                      </div>
                    )}
                  </div>
                  {/* CTA Premium (se não for premium) */}
                  {!formData.is_premium && (
                      <div className="pt-6 border-t border-border text-center">
                          <h3 className="text-lg font-display text-primary mb-2">Seja Premium</h3>
                          <p className="text-xs text-muted-foreground mb-4">
                              Desbloqueie temas exclusivos, link personalizado e remova a marca d'água por apenas <strong className="text-foreground">R$ 3,99/mês</strong>.
                          </p>
                          <button
                            onClick={handlePremiumCheckout}
                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded flex items-center justify-center gap-2 hover:bg-accent transition-colors shadow-[0_0_15px_rgba(201,160,122,0.3)]"
                          >
                              <Crown className="w-5 h-5" />
                              Fazer Upgrade Agora
                          </button>
                      </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] bg-background">
          <LoveLetterViewer data={formData} />
        </main>
      </div>
    </div>
  );
}

/* ── Componentes de Formulário ── */

function Field({ label, value, onChange, type = 'text', multiline = false, placeholder }: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const cls = "w-full bg-background border border-border rounded px-3 py-2 text-sm focus:border-primary outline-none text-foreground";

  return (
    <div>
      <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">{label}</label>
      {multiline ? (
        <textarea rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none`} placeholder={placeholder} />
      ) : (
        <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className={cls} placeholder={placeholder} />
      )}
    </div>
  );
}

function MiniField({ label, value, onChange, multiline = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls = "w-full bg-card border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary";

  return (
    <div>
      <label className="block text-[10px] font-mono text-muted-foreground uppercase">{label}</label>
      {multiline ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}

function ListSection({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-muted-foreground uppercase">{title}</label>
        <button onClick={onAdd} className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
