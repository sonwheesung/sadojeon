#!/usr/bin/env bash
# 사도전 보안 스캔 — 레포 측 자동 점검(서버 권위 위협 모델 + 시크릿 노출). docs/31·32.
# Supabase 측(RLS·advisor)은 SKILL.md 의 MCP 절차로 별도. 실행: bash .claude/skills/security-audit/scan.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
fail=0; warn=0
P(){ printf '  PASS  %s\n' "$1"; }
F(){ printf '  FAIL  %s\n%s\n' "$1" "$2"; fail=$((fail+1)); }
W(){ printf '  WARN  %s\n%s\n' "$1" "$2"; warn=$((warn+1)); }
# 생성물·벤더 제외(번들엔 라이브러리 문서 예시가 섞여 오탐).
EX='--exclude-dir=node_modules --exclude-dir=dist --exclude=_headless*.cjs --exclude=engine.mjs'

echo "═══ 사도전 보안 스캔 (레포) ═══"

# 1) service-role 키가 앱 소스(src/·app/)에 절대 없어야 — 있으면 치명(서버 전용 키 유출).
hits=$(grep -rniE $EX "service[_-]?role" src/ app/ 2>/dev/null || true)
[ -z "$hits" ] && P "앱 소스에 service-role 참조 없음" || F "앱 소스에 service-role 참조 — 서버 전용 키 유출 위험" "$hits"

# 2) 하드코딩 JWT/긴 토큰(eyJ...) 없어야.
hits=$(grep -rnoE $EX "eyJ[A-Za-z0-9_-]{20,}" src/ app/ server/ 2>/dev/null || true)
[ -z "$hits" ] && P "하드코딩 JWT 토큰 없음" || F "하드코딩 토큰" "$hits"

# 3) .env* 전부 gitignore.
envbad=""
for f in .env .env.development .env.local .env.production; do
  [ -e "$f" ] && ! git check-ignore "$f" >/dev/null 2>&1 && envbad="$envbad $f"
done
[ -z "$envbad" ] && P ".env* 전부 gitignore" || F ".env 추적됨" "$envbad"

# 4) EXPO_PUBLIC_ 에 시크릿성 이름 없어야(앱 번들에 그대로 노출).
hits=$(grep -rnoE $EX "EXPO_PUBLIC_[A-Z_]+" src/ app/ 2>/dev/null | grep -iE "SERVICE|SECRET|PRIVATE|ROLE" || true)
[ -z "$hits" ] && P "EXPO_PUBLIC_ 시크릿성 변수 없음(anon/url/env만)" || F "EXPO_PUBLIC_ 시크릿 노출" "$hits"

# 5) 결정성/안티치트 — 엔진 경로(src/)에 Math.random 직접 호출 0(시드 PRNG여야). rng.ts 정의 제외.
hits=$(grep -rn $EX "Math\.random(" src/ 2>/dev/null | grep -v "systems/rng.ts" || true)
[ -z "$hits" ] && P "src/ Math.random() 직접 호출 0 (시드 PRNG)" || W "Math.random() 잔존(서버 결정성·세이브스커밍 위협)" "$hits"

# 6) 결정성 — 턴 경로 Date.now/new Date(벽시계 의존). rng.ts(엔트로피 시드)는 의도라 제외.
hits=$(grep -rnE $EX "Date\.now\(|new Date\(" src/systems src/engine 2>/dev/null | grep -v "systems/rng.ts" || true)
[ -z "$hits" ] && P "엔진/시스템 경로 벽시계 의존 없음" || W "벽시계 의존(서버 권위: 턴기반/서버시간으로 이관 검토)" "$hits"

echo "─────────────────────────────────────"
echo "결과: FAIL $fail · WARN $warn"
echo "※ Supabase 측(RLS always-true·SECURITY DEFINER·run_secrets 비공개·owner→read 플립)은 SKILL.md MCP 절차."
[ $fail -gt 0 ] && exit 1 || exit 0
