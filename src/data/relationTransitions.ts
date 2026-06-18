// 관계 단계 전이 표 — 단일 진실. docs/33·37 C9.
// 종전 REL_UP/REL_DOWN 이 daeryeon·expedition·quest·sparring·mediation 5파일에 중복 정의돼
// 드리프트 위험이 있었다(관계 그래프 시뮬 관찰, 2026-06-18) → 여기로 단일화.
// 5단 saturating: enemy↔distant↔neutral↔friend↔sworn, 양 끝은 제자리.
import type { RelationLevel } from '@/types';

// 한 단계 호전(적대→소원→무관→우호→결의). sworn 에서 더 못 오름.
export const REL_UP: Record<RelationLevel, RelationLevel> = {
  enemy: 'distant',
  distant: 'neutral',
  neutral: 'friend',
  friend: 'sworn',
  sworn: 'sworn',
};

// 한 단계 악화. enemy 에서 더 못 내려감.
export const REL_DOWN: Record<RelationLevel, RelationLevel> = {
  sworn: 'friend',
  friend: 'neutral',
  neutral: 'distant',
  distant: 'enemy',
  enemy: 'enemy',
};

// 중재 전용 — **무관까지만** 누그러뜨린다(우호↑로는 안 올림). neutral 이상은 키 없음(Partial)
// → 호출부가 `if(next)` 로 무변화 처리. docs/37 C9(중재는 enemy→distant→neutral 키만).
export const TOWARD_NEUTRAL: Partial<Record<RelationLevel, RelationLevel>> = {
  enemy: 'distant',
  distant: 'neutral',
};
