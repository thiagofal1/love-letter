import { useEffect, useState } from 'react';
import type { LoveLetterData } from './types/letter';
import { DEFAULT_LOVE_LETTER } from './types/letter';
import { LoveLetterViewer } from './components/LoveLetterViewer';
import { LoveLetterEditor } from './components/LoveLetterEditor';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [letterData, setLetterData] = useState<LoveLetterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('l');
    const encodedData = params.get('d');

    async function loadLetter() {
      if (encodedData) {
        try {
          setLetterData(JSON.parse(decodeURIComponent(atob(encodedData))));
          setLoading(false);
          return;
        } catch {
          console.error('Falha ao decodificar dados da carta.');
        }
      }

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
        } catch {
          console.error('Falha ao carregar carta.');
        }
      }

      setLoading(false);
    }

    loadLetter();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center font-mono text-sm tracking-widest">
        CARREGANDO...
      </div>
    );
  }

  if (letterData) {
    return <LoveLetterViewer data={letterData} />;
  }

  return <LoveLetterEditor initialData={DEFAULT_LOVE_LETTER} />;
}
