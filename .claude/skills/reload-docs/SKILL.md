---
name: reload-docs
description: Re-read the entire docs/ knowledge base to restore full project context — use after a /compact (context was summarized and detail lost), when starting a fresh session that needs the design source-of-truth, or when the user says "문서 다시 읽어" / "문서 전부 읽어" / "리로드 독스" / "컴팩트 후 문서". docs/ is the single source of truth for Shidao's systems; this reloads it in one pass.
---

# Reload Docs — 컴팩트 후 문서 전체 재적재

`/compact`는 대화를 요약하며 **문서의 세부(수치·계약·구현 위치)를 잃는다**. docs/가 단일 진실 원천([feedback_docs_code_sync])이므로, 요약 직후 또는 새 세션에서 작업 전에 **docs/ 전체를 한 번에 다시 읽어** 맥락을 복원한다.

## 무엇을 읽나

`docs/` 전부 — 번호 문서(00~45·99) + `docs/disciples/` 전부(01~10 캐릭터 + `_template.md` + `_캐릭터_추가_체크리스트.md`) + `docs/README.md` + 루트 `AGENTS.md`/`CLAUDE.md`.

순서: README(인덱스)로 전체 지도를 잡고 → 00~45·99 → disciples. 큰 파일(특히 36·37)은 끝까지(페이지 넘겨서) 읽는다 — 잘린 중간에서 답을 단정하지 말 것.

## 실행 (한 방 목록 산출)

읽을 파일 목록을 먼저 뽑고, Read 도구로 **병렬 배치**(한 메시지에 여러 Read)로 훑는다:

```
ls docs/*.md docs/disciples/*.md
```

또는 Glob `docs/**/*.md`. 반환된 전 파일을 5~6개씩 묶어 Read 호출(파일이 많아 병렬이 빠르다). 빠진 파일이 없도록 목록과 대조한다.

## 읽고 난 뒤

- 사용자에게 **장황한 요약을 쏟지 말 것** — "문서 N개 재적재 완료, 작업 준비됨" 정도 + 직전 작업 맥락만 짧게.
- 곧바로 직전 task로 복귀. 문서 내용은 이제 작업 판단의 근거로 쓴다(다시 Read 안 해도 됨).
- 문서가 코드와 어긋나 보이면 코드를 확인([feedback_grounded_genre_dev]) — 문서는 작성 시점 스냅샷일 수 있다.

## ⚠ 컴팩트로 자주 잊는 규율 — 버그 찾으면 "현재 원인 + 이전이 왜 못 잡았나"를 함께 문서화

컴팩트 후 가장 자주 빠뜨리는 작업이다. **이번 세션에서 버그/오류를 찾거나 고쳤다면**, 고치고 끝내지 말고 다음을 `docs/37_엣지케이스_레지스트리.md`에 **반드시** 등재한다([feedback_test_blindspot_analysis] · AGENTS.md "버그" 항):

1. **현재 발견** — Part A: 증상 / 원인 / 수정 / 재검증.
2. **사각 분석** — Part D: **"왜 기존 테스트(시뮬·검증)가 이걸 못 잡았나"**(사각 카테고리 번호). 시뮬 PASS인데 실기기 버그였다면 그게 거짓 확신이다.
3. **사각 닫기** — 그 구멍을 메우는 케이스(시뮬/프로브/불변식)를 추가해야 수정이 **완료**다. testguard로 기계 강제.

> 즉, "고침"만으로 끝내지 말 것. 같은 종류 버그가 다음에 다시 안 잡히는 일이 없게 — 현재 원인과 과거 사각을 한 쌍으로 남긴다. (수치/계약/화면을 만진 턴이면 docs/40 영향 계층 테스트도 함께.)

## 트리거 메모

- `/compact` 직후가 1순위 발화 지점. "문서 다시 읽어줘", "컴팩트했어" 류도 트리거.
- 한 주제만 필요하면 전체 대신 그 문서만 Read(이 스킬은 **전체 복원**용). 테스트 인덱스만 필요하면 docs/40, 캐릭터면 docs/15 + disciples 식.

> 범용 버전은 `C:\project\common\.claude\skills\reload-docs`에도 둔다([feedback_claude_assets_common_sync]) — 거기선 경로를 프로젝트 무관하게(docs/ + AGENTS.md/CLAUDE.md 자동 탐색)로 일반화.
