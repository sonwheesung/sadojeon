import { useTimeStore } from '@/stores/timeStore';
import type { Season } from '@/types/game';

const SEASON_LABEL: Record<Season, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
};

export function useGameDateLabel(): string {
  const time = useTimeStore((s) => s.current);
  return `${time.year}년차 ${SEASON_LABEL[time.season]} ${time.week}주차`;
}
