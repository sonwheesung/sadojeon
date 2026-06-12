---
name: responsive-media
description: Every image, cutscene, and media UI must be responsive — phones (9:16~9:21+) crop the sides, tablets (4:3) crop the top/bottom, so design for "no critical content loss on any aspect ratio". Invoke when adding any image/cutscene/media screen, when writing image-generation prompts, or when the user says "반응형" / "잘림" / "태블릿에서 깨짐" / "responsive media".
---

# Responsive Media — 모든 이미지·컷씬은 반응형이다

✅ 사용자 룰(2026-06-12, 회사 시연 피드백에서 확정): 기기마다 화면 비율이 달라(폰 9:16~9:21+, 태블릿 3:4·4:3, 폴더블) 같은 그림도 잘리는 부위가 다르다. **어떤 기기에서도 얼굴·핵심 정보가 잘리지 않는 것**이 모든 미디어 작업의 전제다.

## 4원칙

1. **잘림 0 원칙** — 화면을 꽉 채우는 cover는 폰 범위(가로/세로 ≤ 0.58, 16:9 폭)까지만. 그보다 넓은 화면(태블릿)은 **contain(전체 보기) + 먹색 띠**로 자동 전환. 구현 패턴 = `CutsceneOverlay.tsx`의 `COVER_MAX_ASPECT`(0.58) 분기. 새 풀스크린 미디어 화면은 이 패턴을 재사용한다.
2. **구도 안전선** — 이미지 생성 프롬프트에 반드시 포함: **얼굴·핵심 소품은 화면 정중앙 기준 가로·세로 모두 가운데 1/3 구역 안**. 가장자리 디테일은 "어떤 기기에선 안 보인다"고 전제하고 그린다. (길쭉한 폰=좌우 잘림, 태블릿=위아래 잘림 대비)
3. **글자는 그림에 굽지 않는다** — 한자·제목·자막은 전부 앱이 얹는다(이미지에 박힌 글자는 잘림·번역·크기 대응이 전부 불가). 기존 "화면에 글자 금지" 프롬프트 룰의 반응형 근거.
4. **고정 수치 금지** — 화면 크기를 px로 하드코딩하지 말 것. `useWindowDimensions` + `aspectRatio` 스타일로 계산. "내 폰에서 맞음"은 검증이 아니다.

## 검증 절차

1. 시뮬랩 허브 → "컷씬 미리보기" → **기기 비율 틀**(이 기기 / 폰 20:9 / 폰 16:9 / 태블릿 4:3) 선택 재생 — 기기를 모으지 않고 한 대로 잘림 확인.
2. 새 미디어 UI·새 컷씬 자산은 최소 **폰 20:9 + 태블릿 4:3 두 틀**에서 얼굴·자막·핵심 소품이 보이는지 확인 후 완료 보고.
3. 컷씬 외 미디어 화면(일러스트 뷰, 갤러리 등)을 새로 만들면 같은 비율 시뮬레이터 훅을 붙일 수 있는지 검토.

## 구현 위치

- 잘림 0 분기: `src/components/cutscene/CutsceneOverlay.tsx` (`COVER_MAX_ASPECT`, `contentFit` 분기)
- 기기 비율 시뮬레이터: `app/simlab/index.tsx` (`PREVIEW_RATIOS`) + `PlayingCutscene.frameAspect`
- 프롬프트 안전선 정본: `assets/images/cutscenes/_프롬프트_장철.md` "기기 잘림 안전선" + `docs/20_컷씬_시스템.md` "기기 비율 검증"

## 하지 말 것

- contentFit="cover"를 화면 비율 확인 없이 풀스크린에 쓰지 말 것.
- 이미지 생성 시 얼굴·핵심 소품을 화면 가장자리에 배치하는 프롬프트 금지.
- 특정 해상도(예: 720×1280) 전제의 레이아웃 계산 금지 — 비율로만 다룬다.
- "내 기기에서 확인했다"로 끝내지 말 것 — 비율 틀 두 개 이상.
