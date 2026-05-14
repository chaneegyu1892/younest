-- 'images' bucket 생성 (public read, RLS-driven write)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- 사용자 자신의 폴더에만 INSERT/UPDATE/DELETE 허용
-- path 첫 segment가 user_id여야 함: e.g. "{auth.uid()}/{uuid}.webp"

create policy "images_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "images_storage_update_own"
  on storage.objects for update
  using (
    bucket_id = 'images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "images_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- SELECT는 public bucket이라 정책 없이도 누구나 읽을 수 있음 (URL 추측 어려움)
