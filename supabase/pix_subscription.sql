-- Apply after subscriptions.sql.
-- Pix payments are manual; each confirmed payment grants one month of Premium.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'card',
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS checkout_url text;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_payment_method_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_payment_method_check
  CHECK (payment_method IN ('card', 'pix'));

CREATE TABLE IF NOT EXISTS public.premium_pix_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mp_authorized_payment_id text NOT NULL UNIQUE,
  mp_preapproval_id text NOT NULL,
  mp_payment_id text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL CHECK (amount = 3.99),
  currency_id text NOT NULL CHECK (currency_id = 'BRL'),
  paid_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_pix_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.premium_pix_payments FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.premium_pix_payments TO service_role;

CREATE OR REPLACE FUNCTION public.apply_pix_subscription_payment(
  p_authorized_payment_id text,
  p_preapproval_id text,
  p_payment_id text,
  p_user_id uuid,
  p_amount numeric,
  p_currency_id text,
  p_paid_at timestamptz
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_subscription public.subscriptions%ROWTYPE;
  new_period_end timestamptz;
  inserted_payment_id uuid;
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'service_role required';
  END IF;
  IF p_amount <> 3.99 OR p_currency_id <> 'BRL' THEN
    RAISE EXCEPTION 'invalid Pix payment amount or currency';
  END IF;

  SELECT *
  INTO current_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND
    OR current_subscription.payment_method <> 'pix'
    OR current_subscription.mp_preapproval_id <> p_preapproval_id THEN
    RAISE EXCEPTION 'Pix payment does not match the active subscription';
  END IF;

  INSERT INTO public.premium_pix_payments (
    mp_authorized_payment_id,
    mp_preapproval_id,
    mp_payment_id,
    user_id,
    amount,
    currency_id,
    paid_at
  )
  VALUES (
    p_authorized_payment_id,
    p_preapproval_id,
    p_payment_id,
    p_user_id,
    p_amount,
    p_currency_id,
    p_paid_at
  )
  ON CONFLICT (mp_authorized_payment_id) DO NOTHING
  RETURNING id INTO inserted_payment_id;

  IF inserted_payment_id IS NULL THEN
    RETURN current_subscription.current_period_end;
  END IF;

  new_period_end :=
    greatest(coalesce(current_subscription.current_period_end, p_paid_at), p_paid_at, now())
    + interval '1 month';

  UPDATE public.subscriptions
  SET current_period_end = new_period_end,
      updated_at = now()
  WHERE user_id = p_user_id;

  UPDATE public.letters
  SET is_premium = true
  WHERE user_id = p_user_id;

  RETURN new_period_end;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_pix_subscription_payment(
  text, text, text, uuid, numeric, text, timestamptz
) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_pix_subscription_payment(
  text, text, text, uuid, numeric, text, timestamptz
) TO service_role;

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
      AND (
        (payment_method = 'card' AND status = 'authorized')
        OR (payment_method = 'pix' AND current_period_end > now())
      )
  )
  INTO has_active_subscription;

  NEW.is_premium := has_active_subscription;
  IF NOT has_active_subscription AND NEW.theme_id IN ('classic-red', 'pastel-rose', 'dark-velvet') THEN
    NEW.theme_id := 'warm-gold';
  END IF;
  RETURN NEW;
END;
$$;
