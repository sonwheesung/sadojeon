-- 공통 제자 원본 10명 시드 — src/data/disciples/startingPool.ts 기준.
-- upsert(ON CONFLICT) 라 재실행 안전.
-- talents/personality 5축은 "만남 시점 결정"이라 비움(`{}`). data 에 gender·group·premium 메타.

insert into public.common_disciples (id, name, hanja_name, star_rank, bio, data) values
  ('jang-cheol',  '장철',   '張鐵',   1, '농촌. 평범하나 우직.',
     jsonb_build_object('gender','male',  'group','village',  'isPremium', false)),
  ('jin-sohwa',   '진소화', '陳小花', 1, '마을 약방 집안. 약초 지식.',
     jsonb_build_object('gender','female','group','village',  'isPremium', false)),
  ('han-baram',   '한바람', '韓바람', 2, '부모 없이 떠돌던 아이.',
     jsonb_build_object('gender','male',  'group','wanderer', 'isPremium', false)),
  ('yun-soso',    '윤소소', '尹素素', 2, '양반가 출신. 예법에 익숙.',
     jsonb_build_object('gender','female','group','noble',    'isPremium', false)),
  ('gang-muyeol', '강무열', '姜武烈', 3, '지방 무관 자제. 가문에 알려지지 않은 과거.',
     jsonb_build_object('gender','male',  'group','noble',    'isPremium', false)),
  ('i-cheongha',  '이청하', '李淸霞', 3, '살수 조직에서 빠져나옴. 기억이 흐림.',
     jsonb_build_object('gender','female','group','lone',     'isPremium', false)),
  ('dokgo-yeon',  '독고연', '獨孤燕', 4, '멸문된 독고세가의 유일한 생존자.',
     jsonb_build_object('gender','male',  'group','noble',    'isPremium', false)),
  ('baek-yeon',   '백연',   '白蓮',   4, '도사의 딸. 도가 사상 어릴 적부터 접함.',
     jsonb_build_object('gender','female','group','lone',     'isPremium', false)),
  ('jin-baekho',  '진백호', '陳白虎', 5, '부모 없이 떠돌던 천재. 어떤 무공도 한 번에 흉내.',
     jsonb_build_object('gender','male',  'group','wanderer', 'isPremium', true)),
  ('sa-cheonhwa', '사천화', '謝天花', 5, '사천당가 분가의 딸. 독공 가풍.',
     jsonb_build_object('gender','female','group','lone',     'isPremium', true))
on conflict (id) do update set
  name       = excluded.name,
  hanja_name = excluded.hanja_name,
  star_rank  = excluded.star_rank,
  bio        = excluded.bio,
  data       = excluded.data;
