-- EvoluFit: executar SOMENTE em um novo projeto Supabase EvoluFit.
-- Não execute no GABS-RIFAS.
-- Dados individuais de rotina: RLS por auth.uid().
create extension if not exists pgcrypto;

create table if not exists public.ef_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint ef_user_state_payload_object check (jsonb_typeof(payload) = 'object')
);
alter table public.ef_user_state enable row level security;
revoke all on public.ef_user_state from anon;
grant select,insert,update,delete on public.ef_user_state to authenticated;

drop policy if exists ef_state_select_own on public.ef_user_state;
drop policy if exists ef_state_insert_own on public.ef_user_state;
drop policy if exists ef_state_update_own on public.ef_user_state;
drop policy if exists ef_state_delete_own on public.ef_user_state;
create policy ef_state_select_own on public.ef_user_state for select to authenticated
  using (user_id = (select auth.uid()));
create policy ef_state_insert_own on public.ef_user_state for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy ef_state_update_own on public.ef_user_state for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy ef_state_delete_own on public.ef_user_state for delete to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.ef_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  note varchar(60) not null default '',
  object_path text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists ef_photos_user_date on public.ef_photos(user_id,date desc);
alter table public.ef_photos enable row level security;
revoke all on public.ef_photos from anon;
grant select,insert,update,delete on public.ef_photos to authenticated;

drop policy if exists ef_photo_select_own on public.ef_photos;
drop policy if exists ef_photo_insert_own on public.ef_photos;
drop policy if exists ef_photo_update_own on public.ef_photos;
drop policy if exists ef_photo_delete_own on public.ef_photos;
create policy ef_photo_select_own on public.ef_photos for select to authenticated
  using (user_id = (select auth.uid()));
create policy ef_photo_insert_own on public.ef_photos for insert to authenticated
  with check (user_id = (select auth.uid())
              and split_part(object_path,'/',1) = (select auth.uid())::text);
create policy ef_photo_update_own on public.ef_photos for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid())
              and split_part(object_path,'/',1) = (select auth.uid())::text);
create policy ef_photo_delete_own on public.ef_photos for delete to authenticated
  using (user_id = (select auth.uid()));

-- Bucket privado, limitado a imagens de até 8 MB.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('evolufit-photos','evolufit-photos',false,8388608,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists ef_storage_select_own on storage.objects;
drop policy if exists ef_storage_insert_own on storage.objects;
drop policy if exists ef_storage_update_own on storage.objects;
drop policy if exists ef_storage_delete_own on storage.objects;
create policy ef_storage_select_own on storage.objects for select to authenticated
  using (bucket_id='evolufit-photos'
         and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy ef_storage_insert_own on storage.objects for insert to authenticated
  with check (bucket_id='evolufit-photos'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy ef_storage_update_own on storage.objects for update to authenticated
  using (bucket_id='evolufit-photos'
         and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id='evolufit-photos'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy ef_storage_delete_own on storage.objects for delete to authenticated
  using (bucket_id='evolufit-photos'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Verificações posteriores:
-- select relname,relrowsecurity from pg_class where relname in ('ef_user_state','ef_photos');
-- select id,public from storage.buckets where id='evolufit-photos';
