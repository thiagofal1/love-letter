-- Execute este arquivo depois de supabase/letters_user_id.sql.
-- Cartas publicadas continuam legíveis pelo viewer compartilhado.

alter table public.letters enable row level security;

drop policy if exists "Public can view letters" on public.letters;
create policy "Public can view letters"
on public.letters for select
to anon
using (true);

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
