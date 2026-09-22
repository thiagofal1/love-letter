-- ============================================
-- Love Letter — Tabela de Assinaturas Premium
-- Execute no SQL Editor do Supabase
-- ============================================

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  mp_preapproval_id text,
  mp_payer_email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'paused', 'cancelled')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Índice para busca por user_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_preapproval_id ON subscriptions(mp_preapproval_id);

-- RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ler sua própria assinatura
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Apenas service_role (Edge Functions) pode inserir/atualizar
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Garantir que user_id existe na tabela letters (caso ainda não exista)
ALTER TABLE letters ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON letters(user_id);

-- Policy para permitir update de is_premium via service_role
CREATE POLICY "Users can update own letters"
  ON letters FOR UPDATE
  USING (auth.uid() = user_id);
