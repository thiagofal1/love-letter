-- Execute este arquivo no SQL Editor do seu projeto Supabase antes de usar uploads.
-- A Fase 6 substitui estas políticas públicas por políticas vinculadas ao usuário autenticado.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'love-photos',
  'love-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view love photos" on storage.objects;
create policy "Public can view love photos"
on storage.objects for select
to public
using (bucket_id = 'love-photos');

drop policy if exists "Public can upload love photos" on storage.objects;
create policy "Public can upload love photos"
on storage.objects for insert
to public
with check (bucket_id = 'love-photos');
