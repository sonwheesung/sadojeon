-- 아이디 중복 확인 RPC — 미로그인(anon) 도 호출 가능해야 하므로 SECURITY DEFINER.
-- username 만 boolean 으로 반환 (다른 정보 노출 X). profiles.username 은 소문자 저장.

create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where username = lower(trim(p_username))
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
