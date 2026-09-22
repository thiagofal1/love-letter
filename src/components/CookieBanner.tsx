import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-card border-t border-border p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 animate-fade-in-up">
      <div className="flex items-start sm:items-center gap-3 max-w-3xl">
        <div className="p-2 bg-primary/10 rounded-full shrink-0 mt-1 sm:mt-0">
          <Cookie className="w-5 h-5 text-primary" />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Nós usamos cookies para melhorar sua experiência e analisar como você interage com a plataforma. 
          Ao continuar navegando, você concorda com o uso de cookies.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <button 
          onClick={accept} 
          className="flex-1 sm:flex-none px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-accent transition-colors"
        >
          Entendi e aceito
        </button>
        <button 
          onClick={() => setIsVisible(false)} 
          className="p-2 text-muted-foreground hover:text-foreground transition-colors" 
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
