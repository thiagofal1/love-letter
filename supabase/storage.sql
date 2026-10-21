-- Execute este arquivo no SQL Editor depois de implantar a Edge Function
-- get-shared-letter. O bucket privado é servido por URLs temporárias.
-- Cada conta pode armazenar até 100 fotos; cada carta pode compartilhar até 10.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'love-photos',
  'love-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view love photos" on storage.objects;
drop policy if exists "Public can upload love photos" on storage.objects;
drop policy if exists "Owners can view love photos" on storage.objects;
drop policy if exists "Owners can upload love photos" on storage.objects;
drop policy if exists "Owners can delete love photos" on storage.objects;

create or replace function public.can_upload_love_photo()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  owned_photo_count bigint;
begin
  if current_user_id is null then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(current_user_id::text, 0)
  );

  select count(*)
  into owned_photo_count
  from storage.objects
  where bucket_id = 'love-photos'
    and (storage.foldername(name))[1] = current_user_id::text;

  return owned_photo_count < 100;
end;
$$;

revoke all on function public.can_upload_love_photo() from public;
grant execute on function public.can_upload_love_photo() to authenticated;

create policy "Owners can view love photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'love-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Owners can upload love photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'love-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select public.can_upload_love_photo())
);

create policy "Owners can delete love photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'love-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
