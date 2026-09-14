import { useState } from 'react';
import type { LoveLetterData, MemoryItem } from '../types/letter';
import { DEFAULT_LOVE_LETTER } from '../types/letter';
import { LoveLetterViewer } from './LoveLetterViewer';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Heart, Save, Eye, Sparkles, Music,
  Calendar, Plus, Trash2, Link, Check, ExternalLink,
} from 'lucide-react';

function generateSlug(partner: string, author: string) {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean(partner)}-e-${clean(author)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

interface LoveLetterEditorProps {
  initialData?: LoveLetterData;
}

export function LoveLetterEditor({ initialData = DEFAULT_LOVE_LETTER }: LoveLetterEditorProps) {
  const [formData, setFormData] = useState<LoveLetterData>(initialData);
  const [activeTab, setActiveTab] = useState<'geral' | 'mensagens' | 'memorias' | 'musica'>('geral');
  const [viewMode, setViewMode] = useState<'split' | 'preview'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    setIsSaving(true);
    setShareUrl(null);

    try {
      const slug = formData.slug || generateSlug(formData.partner_name, formData.author_name);

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('letters')
          .upsert({ slug, ...formData })
          .select()
          .single();
        if (error) throw error;
        setShareUrl(`${window.location.origin}/?l=${slug}`);
      } else {
        const encoded = btoa(encodeURIComponent(JSON.stringify(formData)));
        setShareUrl(`${window.location.origin}/?d=${encoded}`);
      }
    } catch (err) {
      console.error('Erro ao publicar:', err);
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

  const tabs = [
    { id: 'geral' as const, label: 'Geral', icon: Calendar },
    { id: 'mensagens' as const, label: 'Mensagens', icon: Heart },
    { id: 'memorias' as const, label: 'Timeline', icon: Sparkles },
    { id: 'musica' as const, label: 'Música & Fim', icon: Music },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <span className="font-semibold text-lg tracking-wider font-display text-primary">
            LOVE LETTER <span className="text-xs font-mono text-muted-foreground ml-1">Studio</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
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
