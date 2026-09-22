import { useEffect, useState } from 'react';
import type { LoveLetterData } from './types/letter';
import { DEFAULT_LOVE_LETTER } from './types/letter';
import { LoveLetterViewer } from './components/LoveLetterViewer';
import { LoveLetterEditor } from './components/LoveLetterEditor';
import { Dashboard } from './components/Dashboard';
import { CookieBanner } from './components/CookieBanner';
import { NotFound } from './components/NotFound';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { AuthProvider } from './contexts/AuthContext';

type AppView = 'editor' | 'viewer' | 'dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('editor');
  const [letterData, setLetterData] = useState<LoveLetterData | null>(null);
  const [editorData, setEditorData] = useState<LoveLetterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const slug = params.get('l');
    const editSlug = params.get('edit');
    const encodedData = params.get('d');

    async function loadRoute() {
      // Rota: Dashboard
      if (view === 'dashboard') {
        setCurrentView('dashboard');
        setLoading(false);
        return;
      }

      // Rota: Editar carta existente
      if (editSlug && isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('letters')
            .select('*')
            .eq('slug', editSlug)
            .single();

          if (data && !error) {
            setEditorData(data as LoveLetterData);
            setCurrentView('editor');
            setLoading(false);
            return;
          }
        } catch {
          console.error('Falha ao carregar carta para edição.');
        }
      }

      // Rota: Viewer via base64
      if (encodedData) {
        try {
          setLetterData(JSON.parse(decodeURIComponent(atob(encodedData))));
          setCurrentView('viewer');
          setLoading(false);
          return;
        } catch {
          console.error('Falha ao decodificar dados da carta.');
        }
      }

      // Rota: Viewer via slug
      if (slug && isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('letters')
            .select('*')
            .eq('slug', slug)
            .single();

          if (error || !data) {
            setIsNotFound(true);
            setLoading(false);
            return;
          }

          setLetterData(data as LoveLetterData);
          setCurrentView('viewer');
          setLoading(false);
          return;
        } catch {
          setIsNotFound(true);
          setLoading(false);
          return;
        }
      }

      // Rota padrão: Editor
      setCurrentView('editor');
      setLoading(false);
    }

    loadRoute();
  }, []);

  function handleNavigate(view: string, slug?: string) {
    if (view === 'dashboard') {
      window.history.pushState({}, '', '/?view=dashboard');
      setCurrentView('dashboard');
      setEditorData(null);
    } else if (view === 'edit' && slug) {
      window.history.pushState({}, '', `/?edit=${slug}`);
      // Recarregar a página para buscar os dados da carta
      window.location.href = `/?edit=${slug}`;
    } else {
      // Editor vazio (nova carta)
      window.history.pushState({}, '', '/');
      setEditorData(null);
      setCurrentView('editor');
    }
  }

  let content;
  if (loading) {
    content = (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center font-mono text-sm tracking-widest">
        CARREGANDO...
      </div>
    );
  } else if (isNotFound) {
    content = <NotFound />;
  } else if (currentView === 'dashboard') {
    content = <Dashboard onNavigate={handleNavigate} />;
  } else if (currentView === 'viewer' && letterData) {
    content = <LoveLetterViewer data={letterData} />;
  } else {
    content = (
      <LoveLetterEditor
        initialData={editorData || DEFAULT_LOVE_LETTER}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/30 selection:text-primary">
        {content}
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}
