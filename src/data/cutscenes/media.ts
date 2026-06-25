// 컷씬 모션 미디어 레지스트리 — eventId → discipleId → 움직이는 WebP(3~5초, 1회 재생).
// 제작 파이프라인(docs/20): 베이스+엔드 이미지 → 영상 AI(mp4) → ffmpeg로 워터마크 제거·축소 변환.
// expo-image가 재생하므로 네이티브 재빌드 불필요. 파일 추가 = 항목 한 줄, 없으면 오버레이가 그레이박스(점선) 폴백.
import type { ImageSourcePropType } from 'react-native';

export interface CutsceneMediaEntry {
  source: ImageSourcePropType;
  // 'cover' = 세로(9:16) 자산 — 쇼츠식 풀스크린 표준(✅ 2026-06-12).
  // 'letterbox' = 가로 레거시 자산 — 화면 가로 꽉 차게 가운데 배치(깨달음 1호 컷).
  fit: 'cover' | 'letterbox';
}

export const CUTSCENE_MEDIA: Record<string, Record<string, CutsceneMediaEntry>> = {
  enlightenment: {
    // 세로판(9:16) — 쇼츠식 풀스크린. 인게임 기본 재생.
    'jang-cheol': {
      source: require('../../../assets/images/cutscenes/enlightenment/jang-cheol-v.webp'),
      fit: 'cover',
    },
  },
  tournament_champion: {
    // 세로 9:16 — 정파 본산 전각 앞 우승, 손 흔드는 환호(v11). 2026-06-14.
    'jang-cheol': {
      source: require('../../../assets/images/cutscenes/tournament_champion/jang-cheol.webp'),
      fit: 'cover',
    },
  },
  fatal_rescue_medic: {
    // 세로 9:16 — 구사일생 의술(醫). 익명의 손이 침을 놓고 혈색이 돌아온다. 2026-06-24.
    'jang-cheol': {
      source: require('../../../assets/images/cutscenes/fatal_rescue_medic/jang-cheol.webp'),
      fit: 'cover',
    },
  },
  fatal_rescue_elixir: {
    // 세로 9:16 — 구사일생 영약(生). 익명의 손이 옥병을 입술에 대 영약을 먹이고 혈색이 돌아온다. 2026-06-25.
    'jang-cheol': {
      source: require('../../../assets/images/cutscenes/fatal_rescue_elixir/jang-cheol.webp'),
      fit: 'cover',
    },
  },
};

// 보조판(가로 등 다른 비율) — 두 버전 다 보존(✅ 사용자 결정 2026-06-12).
// 인게임 트리거는 기본판만 재생, 시뮬랩 미리보기는 기본+보조 모두 큐에 올려 비교.
// (깨달음 가로 레거시(새벽마당판)는 2026-06-24 폐관 세로판 재작업으로 폐기 — ALT 비움.
//  옛 가로 파일(enlightenment/jang-cheol.webp 등)은 orphan, 정리 대상.)
export const CUTSCENE_MEDIA_ALT: Record<string, Record<string, CutsceneMediaEntry>> = {};

export function findCutsceneMedia(
  eventId: string,
  discipleId: string,
  variant: 'default' | 'alt' = 'default',
): CutsceneMediaEntry | undefined {
  const table = variant === 'alt' ? CUTSCENE_MEDIA_ALT : CUTSCENE_MEDIA;
  return table[eventId]?.[discipleId];
}
