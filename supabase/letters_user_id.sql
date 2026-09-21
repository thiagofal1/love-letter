-- Execute este arquivo no SQL Editor do projeto Supabase.
-- Registros existentes permanecem com user_id nulo até serem associados.

alter table public.letters
  add column if not exists user_id uuid
  references auth.users(id)
  on delete set null;

create index if not exists letters_user_id_idx
  on public.letters(user_id);
