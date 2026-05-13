-- 페이지 soft delete cascade RPC.
-- 자기 + 모든 후손을 한 번에 deleted_at = now()로 업데이트.
-- 반환된 ID 배열은 클라이언트 Undo에서 사용.
-- RLS가 user_id = auth.uid()만 통과시키므로 권한 보장.

create or replace function public.soft_delete_page_cascade(p_page_id uuid)
returns table (id uuid)
language plpgsql
security invoker
as $$
declare
  v_now timestamptz := now();
begin
  return query
  with recursive descendants as (
    select p.id
    from public.pages p
    where p.id = p_page_id and p.deleted_at is null
    union all
    select p.id
    from public.pages p
    join descendants d on p.parent_page_id = d.id
    where p.deleted_at is null
  ),
  updated as (
    update public.pages
    set deleted_at = v_now
    where pages.id in (select descendants.id from descendants)
      and pages.deleted_at is null
    returning pages.id
  )
  select updated.id from updated;
end;
$$;

comment on function public.soft_delete_page_cascade is
  'M2.1 — 페이지와 모든 후손을 한 번에 soft delete. 반환된 ID는 Undo에 사용.';
