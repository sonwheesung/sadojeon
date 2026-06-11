// 컷씬 모션 미디어 레지스트리 — eventId → discipleId → 움직이는 WebP(3~5초, 1회 재생).
// 제작 파이프라인(docs/20): 베이스+엔드 이미지 → 영상 AI(mp4) → ffmpeg로 워터마크 제거·960px·15fps·loop1 WebP 변환.
// expo-image가 재생하므로 네이티브 재빌드 불필요. 파일 추가 = require 한 줄, 없으면 오버레이가 그레이박스(점선) 폴백.
import type { ImageSourcePropType } from 'react-native';

export const CUTSCENE_MEDIA: Record<string, Record<string, ImageSourcePropType>> = {
  enlightenment: {
    'jang-cheol': require('../../../assets/images/cutscenes/enlightenment/jang-cheol.webp'),
  },
};

export function findCutsceneMedia(
  eventId: string,
  discipleId: string,
): ImageSourcePropType | undefined {
  return CUTSCENE_MEDIA[eventId]?.[discipleId];
}
