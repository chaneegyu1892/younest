-- M2.4: 휴지통(deleted_at != null) 항목을 hard delete하는 RPC.
-- SECURITY INVOKER로 RLS 적용. user_id = auth.uid() + deleted_at is not null 이중 가드.

create or replace function hard_delete_pages(p_ids uuid[])
returns int
language plpgsql
security invoker
as $$
declare
  affected int;
begin
  delete from pages
  where id = any(p_ids)
    and user_id = auth.uid()
    and deleted_at is not null;
  get diagnostics affected = row_count;
  return affected;
end
$$;

grant execute on function hard_delete_pages(uuid[]) to authenticated;
