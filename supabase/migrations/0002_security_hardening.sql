-- Advisor-Fixes: fester search_path, is_member nur für eingeloggte Rollen
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.is_member() from public, anon;
grant execute on function public.is_member() to authenticated, service_role;
