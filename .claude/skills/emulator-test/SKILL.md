---
name: emulator-test
description: Drive the Shidao app on a real Android emulator end-to-end ("에뮬레이터 테스트", "에뮬로 화면 띄워서 테스트", "사이클 돌려", "화면 직접 보면서 터치 테스트", "run an emulator cycle", "E2E on emulator"). Claude boots the AVD, builds/installs the dev app, then SEES screens via screencap→Read and TAPS by coordinate — catching real-device render/transition/touch bugs that npm test·sim can't (the "false confidence" gap). Runs user-defined parameterized "cycles" (docs/49). Use when the user wants visual/touch verification of a flow on device; for unit/screen/sim regression use the `test` skill instead.
---

# Emulator Test — 사도전 실기기 사이클 구동 (see-and-tap E2E)

Claude가 안드로이드 에뮬레이터로 앱을 **실제 띄우고, 스크린샷으로 화면을 보고, 좌표로 탭**해 사용자 정의 시나리오(사이클)를 끝까지 돌린다. 단위·화면·sim 테스트가 못 보는 **실기기 렌더 결과·화면 전이·터치 반응**을 사람 눈으로 잡는다(시뮬 PASS인데 실기기 버그 = 거짓 확신, [feedback_test_blindspot_analysis]).

- **테스트 케이스(무엇을·어떤 사전조건에·무엇을 기대) = `docs/49_에뮬레이터_E2E_테스트.md`.** 이 스킬은 *어떻게 구동·관찰·탭하는가*(절차)다. 케이스를 베끼지 말고 docs/49를 읽어서 돈다(드리프트 방지).
- 런북 원본·환경 셋업 사실 = `docs/40_테스트_전략.md §3-C`.

## 진행 규율 (불변 — 사용자 지정, docs/49 §1)

```
사이클 실행 → 오류 발견 시 → 즉시 수정 → 다시 시연(클린할 때까지 반복)
            → 애매한 사항은 (오류 다 고친 뒤) 마지막에 한꺼번에 질문
```

- **오류**(크래시·렌더 깨짐·터치 무반응·게이트 오작동·잘못된 텍스트/수치)는 도중에 만나면 **고치고 재시연**. 고침은 그냥 끝내지 말고 [37 Part A] 등재 + Part D 사각 분석 + 형제 사냥(grep 전수)까지 = 「완료」(AGENTS.md `# 작업 순서` ④).
- **애매한 사항**(취향·문구 어색·밸런스 의문 — 「틀렸다」 단정 불가)은 건드리지 말고 **메모**, 오류 전부 고친 뒤 사용자에게 모아서 질문. 도중에 멈춰 묻지 않는다.
- **계정 안전**: 인증 테스트는 **더미 QA 계정만**(사용자 실계정 절대 입력 금지). 비밀번호 직접 입력 동작은 테스트 더미에 한함.

## 0. 사전조건 확인 (시작 전 1회)

```bash
ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
EMU="$LOCALAPPDATA/Android/Sdk/emulator/emulator.exe"
"$ADB" devices            # 이미 떠 있나 확인 — 떠 있으면 부팅 스킵
```

- 환경(이 PC에 설치됨): `ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk` · AVD 이름 **sadojeon**(pixel_6·android-35) · JDK 21.
- **⚠ R41 선행**: `metro.config.js` blockList(.test/.spec 제외)이 있어야 app/ 테스트 파일이 번들을 안 깬다(docs/37 R41). 현재 수정됨 — 없으면 먼저 확인.

## 1. 부팅 + 빌드·설치

```bash
"$EMU" -avd sadojeon -no-snapshot -no-boot-anim -gpu auto &     # 백그라운드 부팅(하이퍼바이저 가속)
"$ADB" wait-for-device
until [ "$("$ADB" shell getprop sys.boot_completed | tr -d '\r')" = 1 ]; do sleep 5; done
# 빌드+설치(첫회 수십 분 — executorch 네이티브 통과 확인됨). dev 화면 켜려면 EXPO_PUBLIC_APP_ENV 미설정(__DEV__)이면 충분.
JAVA_HOME="/c/Program Files/Java/jdk-21" ANDROID_HOME="$LOCALAPPDATA/Android/Sdk" npx expo run:android
# dev-client 런처면 8081 서버 행 탭, dev 메뉴 뜨면 Continue 탭.
```

- 빌드는 무겁고 PC를 점유한다. 이미 설치돼 있으면 재빌드 말고 `"$ADB" shell monkey -p <pkg> 1`로 앱만 다시 띄운다.
- 가벼운 대안: 실기기 dev client([project_phone_devserver_tailscale]) — Tailscale IP로 와이파이 무관 접속.

## 2. 보고-판단-탭 루프 (핵심)

한 동작 = 한 확인. 절대 화면 안 보고 연속 탭하지 않는다.

```bash
"$ADB" exec-out screencap -p > shot.png    # 화면 캡처(scratchpad에)
```
→ **Read(shot.png)** 로 화면을 눈으로 본다 → 다음 동작 판단 → 탭 → 다시 screencap.

### ⚠ 좌표 환산 (가장 자주 틀리는 것)

- screencap PNG는 네이티브 **1080×2400**. Read로 열면 harness가 **900×2000**으로 축소 표시하고 "× 1.20" 안내를 붙인다.
- **내가 본 좌표 × 1.20 = 기기 좌표.** `adb shell input tap` 은 **기기 좌표**를 받는다.
- 즉 **언제나 본 좌표에 1.2를 곱해 탭한다.** (안 곱하면 위/아래로 빗나감 — 과거 R40 재시연 때 반복 실패의 원인.)

```bash
"$ADB" shell input tap 712 2233          # 기기 좌표(= 본 좌표 593,1861 × 1.2)
"$ADB" shell input text "emuqa628"       # 텍스트 입력(포커스된 필드)
"$ADB" shell input swipe 540 1600 540 600 300   # 스크롤(기기 좌표)
"$ADB" shell input keyevent 4            # 뒤로가기
```

### 빗나가면 — uiautomator 로 정확한 bounds

RN 텍스트 노드는 uiautomator에 안 잡히지만(한글 grep 무수확), **버튼 bounds는 잡힌다**.

```bash
MSYS_NO_PATHCONV=1 "$ADB" shell uiautomator dump /sdcard/ui.xml   # Git Bash: 프리픽스 필수(경로 망가짐 방지)
MSYS_NO_PATHCONV=1 "$ADB" shell cat /sdcard/ui.xml > ui.xml
# ui.xml에서 bounds="[x1,y1][x2,y2]" 찾아 중심 = ((x1+x2)/2,(y1+y2)/2) 로 탭(이미 기기 좌표 — 1.2 곱하지 않음)
```

## 3. 사이클별 화면 함정

- **서신함 진행 게이트**([project_inbox_progress_gate], docs/12): 결정형 서신(DECISION_KINDS) 미해소면 일과 「진행」이 막힌다. 사이클이 멈추면 **서신함부터** 열어 해소 → 게이트 풀림.
- **빠른 진행**(docs/46): 자동 넘김 — 결정/사건/하산에서만 멈춘다. 멈춤 지점이 곧 확인 포인트.
- **dev 화면 노출**: simlab·사문 삭제 등은 `EXPO_PUBLIC_APP_ENV`/`__DEV__` 게이트(devAccess.ts). dev 빌드면 보인다.
- **표시 텍스트 관찰**(사각 ⑪, docs/37): placeholder 날것(`{name}`)·조사 깨짐(`달리기(으)로`)·잘못된 이름/서열을 스크린샷에서 **눈으로** 확인 — 이게 이 테스트의 고유 가치다.

## 4. 끝나면

- **결과 기록**(docs/49 §5 양식): 사이클·날짜·사전조건·PASS/오류·애매(질문대기). 핵심 스크린샷만 보관.
- 오류 고쳤으면 docs/37 등재 + 형제 사냥 + (수치·화면 만졌으면) docs/40 영향 계층 테스트.
- **새 시스템·콘텐츠 추가했으면 docs/49에 사이클 추가**(AGENTS.md ④).
- 에뮬은 PC를 점유 — 끝나면 백그라운드 프로세스 정리(`"$ADB" emu kill` 또는 창 닫기).

## 트리거 메모

- "에뮬레이터로 테스트", "화면 직접 띄워서 봐줘", "사이클 돌려", "C4 돌려줘" 류.
- 단위/sim 회귀는 이 스킬 아님 → `test` 스킬. 밸런스 수치만 → `balance-sim`.

> 범용 버전은 `C:\project\common\.claude\skills\emulator-test`에도 둔다([feedback_claude_assets_common_sync]) — 거기선 AVD 이름·패키지·docs 경로를 프로젝트 무관하게 일반화(플레이스홀더 + 자동 탐색).
