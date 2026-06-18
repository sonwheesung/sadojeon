# 사도전 서버 (Vercel) — 서버 권위 엔진

앱(Expo)은 화면만, **이 서버가 게임 상태·시뮬을 소유**한다. docs/31 정본.
조작 피해(매출 탈취·진행 치팅·세이브 스커밍) 0 목표.

## 구성

```
server/
  api/advance.mjs   POST  하루 진행 — 상태 로드→엔진→저장→{state,events}
  api/newRun.mjs    POST  새 회차 — 서버 시드 생성→엔진→저장
  lib/supabaseAdmin.mjs   service-role 클라(RLS 우회) + JWT 검증
  dist/engine.mjs   ← 빌드 산출물(RN-free 엔진 번들). `node build-engine.mjs` 로 생성/갱신
  build-engine.mjs  src/engine/serverEngine.ts 를 RN 스텁으로 번들
  verify.mjs        번들 결정성 검증(node verify.mjs)
  migrations/001_server_authority.sql   스키마·RLS(컷오버 시 적용)
```

**엔진 번들 흐름**: 앱 로직(RN 의존)을 `_stubs` 로 묶어 Node-구동 가능한 단일 ESM 으로.
엔진 자체는 DB 비접근(supabase 스텁) — 영속은 핸들러 몫. `commit→advanceTurn→capture` 는
동기 블록이라 warm 인스턴스 동시 요청에도 전역 스토어 무오염.

## 배포 (사용자 작업 — 계정 필요)

1. **엔진 번들 빌드** (엔진 코드 바뀔 때마다): 레포 루트에서
   `node server/build-engine.mjs` → `server/dist/engine.mjs` 갱신. 커밋.
2. **Vercel 프로젝트 연결**: vercel.com 에서 이 레포 import → **Root Directory = `server`** 지정.
   (또는 CLI: 터미널에 `! vercel link` 후 `! vercel --prod`.)
3. **Vercel 환경변수**:
   - `SUPABASE_URL` = Supabase 프로젝트 URL
   - `SUPABASE_SERVICE_ROLE_KEY` = service-role 키 (⚠️ 앱 번들엔 절대 X — 서버 전용)
4. **DB 마이그레이션** (컷오버 시점): `migrations/001_server_authority.sql` 적용
   (Supabase SQL editor). ⚠️ RLS 뒤집기는 앱이 서버 경유로 바뀐 **뒤** — 먼저 적용하면 현 앱 저장 깨짐.
   단 §4 보안 핫픽스(common_disciples_test_write 제거)는 즉시 적용 권장.
5. **앱 재배선**(Expo): runSync 직접 저장 → `POST {VERCEL_URL}/api/advance|newRun`(Authorization: Bearer <supabase JWT>)
   호출 + 응답 state 로 화면 렌더. (다음 단계 작업)

## 로컬 검증

```
node server/build-engine.mjs && node server/verify.mjs   # 번들 결정성 (5 PASS)
node .claude/skills/balance-sim/run-headless.cjs serverturn   # 엔진 API 결정성 (8 PASS)
```

## 상태 (2026-06-18)

- ✅ 엔진 번들 RN-free Node 구동·결정성 검증.
- ✅ 핸들러·설정·마이그레이션 작성(배포 대기 — 사용자 Vercel/Supabase 연결 필요).
- ⏳ 앱 재배선(Expo→Vercel 호출), RLS 컷오버, LLM 서버화(별도 트랙).
