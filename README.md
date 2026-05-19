# Shidao (사도전 · 師徒傳)

A wuxia disciple training simulation. Tales of Master and Disciple.

문파의 사부가 되어 제자들을 가르치고, 한 세대를 길러 강호로 떠나보낸다.
오프라인 텍스트 중심 양육 시뮬레이션 (iOS · Android).

## Stack

- React Native 0.81 + React 19
- Expo SDK 54 · Expo Router 6 (file-based routing)
- TypeScript (strict)
- Zustand · expo-sqlite · AsyncStorage
- Noto Serif KR / SC (명조체)

## Development

```bash
npm install
npm start            # Metro
npm run android      # Android emulator
npm run ios          # iOS simulator (macOS only)
```

Expo Go 또는 dev client에서 QR로 연결.

## Layout

```
app/                 expo-router routes
  (tabs)/            사문 · 서신함 · 무공 · 강호 · 의뢰
  schedule/          일정 변경
  disciple/[id]      제자 상세
  conversation/      면담
  event/[id]         사건 결정
src/
  components/        재사용 UI
  stores/            Zustand 상태
  types/             도메인 타입
  data/              시나리오 풀 · 무공 데이터 · 상수
  systems/           시간 · 수련 · 서신함 · 이벤트 로직
  theme/             colors · typography · spacing
assets/              images · audio
docs/                기획서 (git 추적 별도)
```

## Documentation

기획서: `/docs/` (gitignore 처리됨, 로컬 전용)
