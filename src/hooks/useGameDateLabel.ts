import { useTimeStore } from '@/stores/timeStore';
import { weekOfMonth } from '@/systems/calendar';
import { DAY_LABEL } from '@/types/schedule';
import type { Season } from '@/types/game';

const SEASON_LABEL: Record<Season, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
};

// 표기: "1년차 봄 1주차 월요일"
export function useGameDateLabel(): string {
  const time = useTimeStore((s) => s.current);
  const w = weekOfMonth(time);
  const day = DAY_LABEL[time.day] ?? '';
  return `${time.year}년차 ${SEASON_LABEL[time.season]} ${w}주차 ${day}요일`;
}
