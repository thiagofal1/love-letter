import { HeartCrack, Home } from 'lucide-react';
import { applyTheme } from '../lib/themes';
import { useEffect } from 'react';

export function NotFound() {
  useEffect(() => {
    applyTheme('warm-gold');
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute inset-0 vignette" />
      <div className="grain-overlay" />
      
      <div className="relative z-10 flex flex-col items-center max-w-md">
        <HeartCrack className="w-16 h-16 text-muted-foreground mb-6" strokeWidth={1} />
        
        <h1 className="font-display text-4xl text-foreground mb-4">
          Carta não encontrada
        </h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-mono">
          O amor pode estar no ar, mas a carta que você procura não está aqui.
          Talvez o link esteja incorreto ou ela tenha sido apagada.
        </p>

        <a 
          href="/" 
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-accent transition-colors shadow-[0_0_15px_rgba(201,160,122,0.3)]"
        >
          <Home className="w-4 h-4" />
          Voltar para a página inicial
        </a>
      </div>
    </div>
  );
}
