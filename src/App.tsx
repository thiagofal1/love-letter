import React, { useEffect, useState } from 'react';
import type { LoveLetterData } from './types/letter';
import { DEFAULT_LOVE_LETTER } from './types/letter';
import { LoveLetterViewer } from './components/LoveLetterViewer';
import { LoveLetterEditor } from './components/LoveLetterEditor';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export const App: React.FC = () => {
  const [letterData, setLetterData] = useState<LoveLetterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('l');
    const dataParam = params.get('d');

    const loadLetter = async () => {
      // 1. Data passed via encoded base64 parameter
      if (dataParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(dataParam)));
          setLetterData(decoded);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Erro ao decodificar dados da carta:', e);
        }
      }

      // 2. Data stored in Supabase by slug
      if (slug && isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('letters')
            .select('*')
            .eq('slug', slug)
            .single();

          if (data && !error) {
            setLetterData(data as LoveLetterData);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Erro ao carregar carta do Supabase:', e);
        }
      }

      // 3. Fallback or default editor mode
      setLoading(false);
    };

    loadLetter();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0a08] text-[#c9a07a] flex items-center justify-center font-['DM_Mono'] text-sm tracking-widest">
        CARREGANDO LOVE LETTER...
      </div>
    );
  }

  // If a specific letter was loaded via URL parameter
  if (letterData) {
    return <LoveLetterViewer data={letterData} />;
  }

  // Default mode: SaaS Editor / Creator Interface
  return <LoveLetterEditor initialData={DEFAULT_LOVE_LETTER} />;
};

export default App;
