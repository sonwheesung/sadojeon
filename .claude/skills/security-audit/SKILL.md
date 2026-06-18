---
name: security-audit
description: 사도전 보안 검증 — 서버 권위(docs/31) 위협 모델 + Supabase RLS/시크릿/anti-cheat 점검. 레포 자동 스캔(scan.sh) + Supabase MCP 절차. Use before a release, after touching auth·RLS·Supabase·서버 엔진·결제(BM), when the user says "보안 검증"/"security audit"/"치팅 막혔나", or after schema/policy 변경.
---

# Security Audit — 사도전 서버 권위 보안 검증

게임의 보안 = **조작 피해 0**(매출 탈취·진행 치팅·세이브 스커밍). [11 BM]·[31 서버권위]·[32 업적]의 보호선.
두 면을 본다: **레포(클라/엔진)** = `scan.sh` 자동, **Supabase(DB/Auth)** = MCP 절차.

## 위협 모델 (무엇을 막나)
1. **클라 권위 치팅** — 앱이 자기 row 에 `gold=999999`·`realm=화경`·과금영약 INSERT. RLS owner 는 "내 row"라 통과 → **서버 권위(쓰기 전부 Vercel)** 로만 차단(docs/31).
2. **세이브 스커밍** — 결과 마음에 안 들면 재시도. **시드를 서버 비공개(run_secrets, 유저 SELECT 정책 없음)** + 매 턴 전진·저장으로 차단. (serverturn·verify.mjs 가 "같은 상태+시드→같은 결과" 실증.)
3. **시크릿 유출** — service-role 키가 앱 번들/git 에 들어가면 끝. anon 키만 EXPO_PUBLIC_.
4. **과허용 RLS** — `USING(true)`/`WITH CHECK(true)` 가 non-SELECT 에 붙으면 전체 쓰기 구멍.

## 1) 레포 자동 스캔
```
bash .claude/skills/security-audit/scan.sh
```
점검: ①앱 소스 service-role 참조 0 ②하드코딩 JWT 0 ③.env* gitignore ④EXPO_PUBLIC_ 시크릿성 0
⑤엔진 Math.random() 0(시드 PRNG) ⑥엔진 벽시계(Date.now) 의존. **FAIL>0 이면 릴리스 금지.**

## 2) Supabase 점검 (MCP)
- **advisor**: `mcp__supabase__get_advisors{type:'security'}` → `rls_policy_always_true`·`security_definer` 등 0 확인.
- **RLS 전수**: `mcp__supabase__execute_sql` 로 정책 덤프 —
  ```sql
  select c.relname tbl, p.polname, p.polcmd cmd,
    pg_get_expr(p.polqual,p.polrelid) using_e, pg_get_expr(p.polwithcheck,p.polrelid) check_e
  from pg_policy p join pg_class c on c.oid=p.polrelid
  join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' order by 1,2;
  ```
  - **always-true 금지**(SELECT 제외): `polcmd` 가 `*`/`a`/`w`/`d` 인데 using/check 가 `true` → 구멍.
  - **서버 권위 컷오버 후**: 게임 테이블(runs·run_disciples·alchemy_state·jianghu_state·inbox_items·run_npcs·items·quests·growth_events)은 **SELECT only** (owner ALL 금지 — 쓰기는 service-role).
  - **run_secrets**: RLS on + **정책 0개**(유저 접근 불가, service-role 만). rng_state 가 클라로 안 샘.
- **시드 비노출**: `/api/*` 응답에 `rngState` 없는지(advance.mjs 는 state·events 만 반환).

## 3) 알려진 기준선 (2026-06-18 측정)
- ✅ 레포 스캔 FAIL 0. service-role 앱 미포함·.env gitignore·Math.random 0.
- ✅ **(수정됨 2026-06-18) `common_disciples_test_write`** — ALL/true 정책 제거(`drop_common_disciples_test_write_policy` 마이그레이션). read 정책만 잔존. advisor 재실행에서 `rls_policy_always_true` 사라짐 확인.
- 🟡 **MED owner ALL 쓰기** — 전 게임 테이블 클라 쓰기 가능(클라 권위 치팅면). → docs/31 RLS 뒤집기(컷오버 시).
- 🟢 **LOW `is_username_available` SECURITY DEFINER anon 실행** — 유저명 열거 가능(가입용, 가용 bool만 반환이라 저위험). 수용 또는 rate-limit.
- 🟢 **LOW 유출 비번 보호 비활성** — Supabase Auth 설정에서 HaveIBeenPwned 체크 on.
- ℹ️ **researchSystem 실시간 타이머(Date.now) = 의도된 BM**(비급 연구는 실시간 대기 또는 다이아 스킵 — 진행만으론 못 풂, 사용자 확정 2026-06-18). **턴기반 전환 금지.** 서버 권위 처리 = **서버가 시계 소유**(Vercel 함수가 서버 시간으로 완료 판정 → 클라 위조 불가). 결정적 턴 엔진과 별개 레이어(serverturn 검증은 setResearchInstant 로 분리). scan 의 Date.now WARN 중 researchSystem 은 이 의도 항목.

## 출력
발견을 심각도(HIGH/MED/LOW)·근거(스캔/advisor/MCP)·수정안으로 보고. 사용자가 코드 안 봄 → 일상어로
"게임에서 무엇이 뚫리나"를 설명([feedback_explain_plain_no_code]). prod DB 변경은 **확인 후** 적용.
관련: [[project_server_authority]] · docs/31 · docs/11(BM).
