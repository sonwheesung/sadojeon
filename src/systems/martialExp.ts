// 수련 낙수(落水) — 상위 무공을 닦으면 그 뿌리(직계 선행 무공)도 함께 무르익는다. docs/26 §낙수.
// 정통 결: 매화검법의 수련은 육합검의 복습을 품는다 — 상승 무공의 형 안에 기초의 형이 있다.
// 클릭 0 설계(사용자 결정 2026-06-11): 키트(여러 무공)는 선택지가 아니라 수련의 부산물로 자란다.
// 순수 배열 변환 — 스토어를 모른다. 세 적립 경로(기초 수련·의뢰 실전·대련)가 본 적립 직후 호출.

import {
  GRADE_LEARN_MULT,
  expToNextSeong,
  findMartialArt,
  seongCap,
} from '@/data/martialArts';
import { REALM_SEONG_CAP } from '@/data/realm';
import type { MartialArtInstance } from '@/types';
import type { Realm } from '@/types/realm';

// 낙수 비율 — 본 적립의 30%가 직계 선행들에 나뉘어 흐른다(1단계만 — 뿌리의 뿌리까지는 공짜 없음). 🔧
export const TRICKLE_RATE = 0.3;

// sourceArtId 에 exp 만큼 본 적립이 일어난 직후 호출 — 배운(보유 instance) 직계 선행에만 낙수.
// 선행 책 자신의 등급 학습 속도(GRADE_LEARN_MULT — 하품은 금방 뗀다)가 그대로 적용된다.
export function applyPrereqTrickle(
  arts: MartialArtInstance[],
  sourceArtId: string,
  exp: number,
  realm: Realm,
): MartialArtInstance[] {
  if (exp <= 0) return arts;
  const source = findMartialArt(sourceArtId);
  const prereqs = source?.prerequisites ?? [];
  if (prereqs.length === 0) return arts;

  const learned = prereqs.filter((p) => arts.some((a) => a.artId === p.artId));
  if (learned.length === 0) return arts;
  const sharePerBook = (exp * TRICKLE_RATE) / learned.length;

  return arts.map((inst) => {
    const hit = learned.find((p) => p.artId === inst.artId);
    if (!hit) return inst;
    const art = findMartialArt(inst.artId);
    if (!art) return inst;
    const cap = Math.min(seongCap(art.grade), REALM_SEONG_CAP[realm]);
    if (inst.seong >= cap) return inst; // 이미 상한 — 흐를 곳 없음
    let seong = inst.seong;
    let e = inst.exp + sharePerBook * GRADE_LEARN_MULT[art.grade];
    while (seong < cap && e >= expToNextSeong(seong)) {
      e -= expToNextSeong(seong);
      seong += 1;
    }
    if (seong >= cap) {
      seong = cap;
      e = 0;
    }
    return { ...inst, seong, exp: e };
  });
}
