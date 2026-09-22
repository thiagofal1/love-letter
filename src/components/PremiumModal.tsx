import { Crown, Check, Loader2, X } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  isLoading: boolean;
}

export function PremiumModal({ isOpen, onClose, onCheckout, isLoading }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-md rounded-lg p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-display text-primary mb-2">Desbloqueie o Premium</h2>
          <p className="text-sm text-muted-foreground">
            Torne sua declaração ainda mais inesquecível com recursos exclusivos.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {[
            'Temas de cores exclusivos (Classic Red, Pastel Rose, Dark Velvet)',
            'Link de acesso totalmente personalizado (ex: loveletter.app/voces)',
            'Remoção da marca d\'água "Criado com Love Letter" do rodapé',
          ].map((benefit, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/20 p-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-foreground leading-snug">{benefit}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onCheckout}
          disabled={isLoading}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded flex items-center justify-center gap-2 hover:bg-accent transition-colors disabled:opacity-70 shadow-[0_0_15px_rgba(201,160,122,0.2)]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Assinar por R$ 3,99/mês
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-muted-foreground mt-3 font-mono">
          Pagamento seguro via Mercado Pago. Cancele quando quiser.
        </p>
      </div>
    </div>
  );
}
