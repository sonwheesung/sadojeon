-- 보안 advisor 경고 대응.
-- 1) set_updated_at: search_path 고정 (mutable search_path 경고).
-- 2) handle_new_user: 트리거 전용 — PostgREST RPC 노출 차단 (anon/authenticated EXECUTE 회수).
--    (트리거는 함수 소유자 권한으로 실행되므로 EXECUTE 회수해도 가입 트리거는 정상 동작.)

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
