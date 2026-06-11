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
    'jang-cheol': {
      source: require('../../../assets/images/cutscenes/enlightenment/jang-cheol.webp'),
      fit: 'letterbox',
    },
  },
};

export function findCutsceneMedia(
  eventId: string,
  discipleId: string,
): CutsceneMediaEntry | undefined {
  return CUTSCENE_MEDIA[eventId]?.[discipleId];
}
