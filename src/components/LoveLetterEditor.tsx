import React, { useState } from 'react';
import type { LoveLetterData, MemoryItem } from '../types/letter';
import { DEFAULT_LOVE_LETTER } from '../types/letter';
import { LoveLetterViewer } from './LoveLetterViewer';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Heart, Save, Eye, Sparkles, Music, Calendar, Plus, Trash2, Link, Check, ExternalLink } from 'lucide-react';

interface LoveLetterEditorProps {
  initialData?: LoveLetterData;
}

export const LoveLetterEditor: React.FC<LoveLetterEditorProps> = ({
  initialData = DEFAULT_LOVE_LETTER
}) => {
  const [formData, setFormData] = useState<LoveLetterData>(initialData);
  const [activeTab, setActiveTab] = useState<'geral' | 'mensagens' | 'memorias' | 'musica'>('geral');
  const [viewMode, setViewMode] = useState<'split' | 'preview_only'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const updateField = <K extends keyof LoveLetterData>(key: K, value: LoveLetterData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Declaration Updates
  const handleDeclarationChange = (index: number, val: string) => {
    const next = [...(formData.declarations || [])];
    next[index] = val;
    updateField('declarations', next);
  };

  const addDeclaration = () => {
    updateField('declarations', [...(formData.declarations || []), 'Nova declaração...']);
  };

  const removeDeclaration = (index: number) => {
    updateField(
      'declarations',
      (formData.declarations || []).filter((_, i) => i !== index)
    );
  };

  // Handle Memory Updates
  const handleMemoryChange = (index: number, field: keyof MemoryItem, val: string) => {
    const next = [...(formData.memories || [])];
    next[index] = { ...next[index], [field]: val };
    updateField('memories', next);
  };

  const addMemory = () => {
    const next: MemoryItem[] = [
      ...(formData.memories || []),
      { date: 'Novo Momento', label: 'Título da Memória', desc: 'Descrição do momento especial...' }
    ];
    updateField('memories', next);
  };

  const removeMemory = (index: number) => {
    updateField(
      'memories',
      (formData.memories || []).filter((_, i) => i !== index)
    );
  };

  // Save / Publish
  const handleSave = async () => {
    setIsSaving(true);
    setShareUrl(null);

    try {
      const slug =
        formData.slug ||
        `${formData.partner_name.toLowerCase().replace(/[^a-z0-9]/g, '')}-e-${formData.author_name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('letters')
          .upsert({
            slug,
            partner_name: formData.partner_name,
            author_name: formData.author_name,
            relationship_start_date: formData.relationship_start_date,
            hero_title: formData.hero_title,
            hero_subtitle: formData.hero_subtitle,
            hero_description: formData.hero_description,
            marquee_text: formData.marquee_text,
            declarations: formData.declarations,
            memories: formData.memories,
            closing_quote: formData.closing_quote,
            closing_message: formData.closing_message,
            footer_text: formData.footer_text,
            spotify_playlist_url: formData.spotify_playlist_url,
            photos: formData.photos,
            theme_id: formData.theme_id
          })
          .select()
          .single();

        if (error) throw error;
        const generatedUrl = `${window.location.origin}/?l=${slug}`;
        setShareUrl(generatedUrl);
      } else {
        // Fallback Client-side URL encoding for demo without Supabase credentials
        const encoded = btoa(encodeURIComponent(JSON.stringify(formData)));
        const generatedUrl = `${window.location.origin}/?d=${encoded}`;
        setShareUrl(generatedUrl);
      }
    } catch (err) {
      console.error('Erro ao salvar carta:', err);
      alert('Não foi possível salvar a carta no Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0a08] text-[#f0ebe3]">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#2a2318] bg-[#16120e] px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-[#c9a07a] fill-[#c9a07a]" />
          <span className="font-semibold text-lg tracking-wider font-['Fraunces'] text-[#c9a07a]">
            LOVE LETTER <span className="text-xs font-mono text-[#7a6e62] ml-1">SaaS Studio</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'split' ? 'preview_only' : 'split')}
            className="px-3 py-1.5 rounded border border-[#2a2318] text-xs font-mono flex items-center gap-2 hover:border-[#c9a07a] transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#c9a07a]" />
            {viewMode === 'split' ? 'Tela Cheia' : 'Modo Editor'}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded bg-[#c9a07a] text-[#0d0a08] font-medium text-sm flex items-center gap-2 hover:bg-[#e8b89a] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Publicando...' : 'Publicar Carta'}
          </button>
        </div>
      </header>

      {/* Share Modal Banner if URL generated */}
      {shareUrl && (
        <div className="bg-[#211c16] border-b border-[#c9a07a] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#c9a07a]" />
            <span className="text-sm font-mono text-[#e8e0d4]">
              Carta gerada com sucesso! Link único: <strong className="text-[#c9a07a]">{shareUrl}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 rounded bg-[#c9a07a] text-[#0d0a08] text-xs font-mono flex items-center gap-1.5 hover:bg-[#e8b89a]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded text-[#c9a07a] hover:bg-[#2a2318]"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Form Panel */}
        {viewMode === 'split' && (
          <aside className="w-full md:w-[450px] lg:w-[500px] border-r border-[#2a2318] bg-[#16120e] flex flex-col h-[calc(100vh-4rem)]">
            {/* Form Nav Tabs */}
            <div className="flex border-b border-[#2a2318] bg-[#0d0a08]">
              {[
                { id: 'geral', label: 'Geral', icon: Calendar },
                { id: 'mensagens', label: 'Mensagens', icon: Heart },
                { id: 'memorias', label: 'Linha do Tempo', icon: Sparkles },
                { id: 'musica', label: 'Música & Fim', icon: Music },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 text-xs font-mono flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#c9a07a] text-[#c9a07a] bg-[#16120e]'
                        : 'border-transparent text-[#7a6e62] hover:text-[#f0ebe3]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ABA GERAL */}
              {activeTab === 'geral' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Nome do Parceiro(a)</label>
                    <input
                      type="text"
                      value={formData.partner_name}
                      onChange={(e) => updateField('partner_name', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Seu Nome / Autor</label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => updateField('author_name', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Data do Início do Relacionamento</label>
                    <input
                      type="datetime-local"
                      value={formData.relationship_start_date.slice(0, 16)}
                      onChange={(e) => updateField('relationship_start_date', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none text-[#f0ebe3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Título Principal (Hero)</label>
                    <input
                      type="text"
                      value={formData.hero_title}
                      onChange={(e) => updateField('hero_title', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Subtítulo (Hero)</label>
                    <input
                      type="text"
                      value={formData.hero_subtitle}
                      onChange={(e) => updateField('hero_subtitle', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Descrição Inicial</label>
                    <textarea
                      rows={3}
                      value={formData.hero_description}
                      onChange={(e) => updateField('hero_description', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ABA MENSAGENS & DECLARAÇÕES */}
              {activeTab === 'mensagens' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Texto da Faixa Letreiro (Marquee)</label>
                    <input
                      type="text"
                      value={formData.marquee_text}
                      onChange={(e) => updateField('marquee_text', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-mono text-[#7a6e62] uppercase">Lista de Declarações</label>
                      <button
                        onClick={addDeclaration}
                        className="text-xs font-mono text-[#c9a07a] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.declarations || []).map((dec, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={dec}
                            onChange={(e) => handleDeclarationChange(i, e.target.value)}
                            className="flex-1 bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-1.5 text-sm focus:border-[#c9a07a] outline-none"
                          />
                          <button
                            onClick={() => removeDeclaration(i)}
                            className="p-2 text-[#7a6e62] hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA LINHA DO TEMPO */}
              {activeTab === 'memorias' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-[#7a6e62] uppercase">Momentos Marcantes (Timeline)</label>
                    <button
                      onClick={addMemory}
                      className="text-xs font-mono text-[#c9a07a] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Novo Momento
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(formData.memories || []).map((mem, i) => (
                      <div key={i} className="p-4 rounded border border-[#2a2318] bg-[#0d0a08] space-y-3 relative">
                        <button
                          onClick={() => removeMemory(i)}
                          className="absolute top-3 right-3 text-[#7a6e62] hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div>
                          <label className="block text-[10px] font-mono text-[#7a6e62] uppercase">Data / Rótulo</label>
                          <input
                            type="text"
                            value={mem.date}
                            onChange={(e) => handleMemoryChange(i, 'date', e.target.value)}
                            className="w-full bg-[#16120e] border border-[#2a2318] rounded px-2.5 py-1 text-xs outline-none focus:border-[#c9a07a]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-[#7a6e62] uppercase">Título da Memória</label>
                          <input
                            type="text"
                            value={mem.label}
                            onChange={(e) => handleMemoryChange(i, 'label', e.target.value)}
                            className="w-full bg-[#16120e] border border-[#2a2318] rounded px-2.5 py-1 text-xs outline-none focus:border-[#c9a07a]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-[#7a6e62] uppercase">Descrição</label>
                          <textarea
                            rows={2}
                            value={mem.desc}
                            onChange={(e) => handleMemoryChange(i, 'desc', e.target.value)}
                            className="w-full bg-[#16120e] border border-[#2a2318] rounded px-2.5 py-1 text-xs outline-none focus:border-[#c9a07a] resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA MÚSICA & FECHAMENTO */}
              {activeTab === 'musica' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">URL da Playlist do Spotify</label>
                    <input
                      type="text"
                      placeholder="https://open.spotify.com/playlist/..."
                      value={formData.spotify_playlist_url}
                      onChange={(e) => updateField('spotify_playlist_url', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Citação Final</label>
                    <textarea
                      rows={2}
                      value={formData.closing_quote}
                      onChange={(e) => updateField('closing_quote', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Mensagem de Encerramento</label>
                    <textarea
                      rows={2}
                      value={formData.closing_message}
                      onChange={(e) => updateField('closing_message', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7a6e62] uppercase mb-1">Texto do Rodapé</label>
                    <input
                      type="text"
                      value={formData.footer_text}
                      onChange={(e) => updateField('footer_text', e.target.value)}
                      className="w-full bg-[#0d0a08] border border-[#2a2318] rounded px-3 py-2 text-sm focus:border-[#c9a07a] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Right Live Preview Panel */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] bg-[#0d0a08]">
          <LoveLetterViewer data={formData} isPreview={true} />
        </main>
      </div>
    </div>
  );
};
