-- ============================================
-- Love Letter — Tabela de Assinaturas Premium
-- Execute no SQL Editor do Supabase
-- Executar antes de letters_rls.sql para instalar o trigger de direitos.
-- ============================================

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  mp_preapproval_id text,
  mp_payer_email text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('pending', 'authorized', 'paused', 'cancelled', 'rejected'));

-- Índice para busca por user_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_preapproval_id ON public.subscriptions(mp_preapproval_id);

-- RLS (Row Level Security)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.subscriptions FROM anon, authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;

DROP POLICY IF EXISTS "Users can read own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Garantir que user_id existe na tabela letters (caso ainda não exista)
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON public.letters(user_id);

DROP POLICY IF EXISTS "Users can update own letters" ON public.letters;

CREATE OR REPLACE FUNCTION public.enforce_letter_premium_entitlement()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  has_active_subscription boolean;
BEGIN
  IF coalesce(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = NEW.user_id
      AND status = 'authorized'
  )
  INTO has_active_subscription;

  NEW.is_premium := has_active_subscription;
  IF NOT has_active_subscription AND NEW.theme_id IN ('classic-red', 'pastel-rose', 'dark-velvet') THEN
    NEW.theme_id := 'warm-gold';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_letter_premium_entitlement ON public.letters;
CREATE TRIGGER enforce_letter_premium_entitlement
  BEFORE INSERT OR UPDATE ON public.letters
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_letter_premium_entitlement();
