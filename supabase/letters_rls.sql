-- Execute depois de supabase/letters_user_id.sql e supabase/subscriptions.sql.
-- Visitantes recebem cartas apenas pela Edge Function get-shared-letter,
-- que exige o token secreto e nunca expõe a tabela via acesso anonimo.

alter table public.letters enable row level security;

alter table public.letters
  add column if not exists share_token text;

update public.letters
set share_token = gen_random_uuid()::text
where share_token is null;

alter table public.letters
  alter column share_token set default gen_random_uuid()::text,
  alter column share_token set not null;

create unique index if not exists letters_share_token_key
  on public.letters(share_token);

drop policy if exists "Public can view letters" on public.letters;

drop policy if exists "Owners can view letters" on public.letters;
create policy "Owners can view letters"
on public.letters for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Owners can create letters" on public.letters;
create policy "Owners can create letters"
on public.letters for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update letters" on public.letters;
create policy "Owners can update letters"
on public.letters for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete letters" on public.letters;
create policy "Owners can delete letters"
on public.letters for delete
to authenticated
using ((select auth.uid()) = user_id);
