// 전투 결과 → 풍경 서술 — docs/35 §6. 숨은 변수 룰: 수치(체력·내공·피해)는 절대 노출하지
// 않고, 사부가 지켜본 듯한 몇 줄의 풍경으로만 결과를 읽게 한다(서신·일지용).

import { josa } from '@/utils/korean';
import type { CombatResult, CombatantResult } from '@/types/combat';
import type { WoundType } from '@/types/disciple';

// 상처 속성 라벨 — woundSystem.WOUND_TYPE_LABEL 과 같은 값. 전투 모듈은 스토어 사슬
// (woundSystem→alchemySystem→스토어)을 끌고 오지 않으려 여기 사본을 둔다(표시 전용).
const WOUND_TYPE_LABEL: Record<WoundType, string> = {
  wound: '외상',
  burn: '화상',
  poison: '중독',
  frost: '동상',
  inner: '내상',
};

function names(list: CombatantResult[]): string {
  return list.map((c) => c.name).join('·');
}

// 승부의 한 줄 — 모드·구간별 결.
function headline(r: CombatResult, win: CombatantResult[], lose: CombatantResult[]): string {
  const w = names(win);
  const l = names(lose);
  if (r.winner === 'draw') {
    return r.mode === 'spar'
      ? `${josa(w, '과', '와')} ${josa(l, '이', '가')} 끝내 우열을 가리지 못했다.`
      : `${josa(w, '과', '와')} ${josa(l, '이', '가')} 어우러져 싸웠으나 승부가 나지 않은 채 갈라섰다.`;
  }
  if (r.mode === 'spar') {
    if (r.tier === 'close') return `${josa(w, '이', '가')} 반 수 차로 ${josa(l, '을', '를')} 눌렀다 — 끝까지 손에 땀을 쥐는 합이었다.`;
    if (r.tier === 'edge') return `${josa(w, '이', '가')} 한 수 위였다. ${josa(l, '은', '는')} 받아내는 데 급급했다.`;
    return `${w}의 무위가 한참 위라 ${josa(l, '은', '는')} 손도 제대로 못 섞었다.`;
  }
  if (r.tier === 'close') return `${josa(w, '이', '가')} 사력을 다해 ${josa(l, '을', '를')} 꺾었다 — 종이 한 장 차이였다.`;
  if (r.tier === 'edge') return `${josa(w, '이', '가')} ${josa(l, '을', '를')} 제압했다. 합이 갈수록 격차가 드러났다.`;
  return `${josa(w, '이', '가')} ${josa(l, '을', '를')} 일방적으로 쓸어버렸다.`;
}

// 전투원별 뒷이야기 — 죽음·패주·부상·탈진만 짚는다(무사한 사람은 침묵).
function aftermath(r: CombatResult): string[] {
  const lines: string[] = [];
  for (const c of r.combatants) {
    if (c.state === 'dead') lines.push(`${josa(c.name, '은', '는')} 끝내 일어나지 못했다.`);
    else if (c.state === 'fled') lines.push(`${josa(c.name, '은', '는')} 어둠을 타고 달아났다.`);
    else if (c.wound)
      lines.push(`${josa(c.name, '이', '가')} ${WOUND_TYPE_LABEL[c.wound.type]}을(를) 입었다.`);
    else if (c.state === 'standing' && c.qiFrac <= 0.12)
      lines.push(`${josa(c.name, '은', '는')} 이겼으되 내공이 바닥나 한동안 운기조식이 필요해 보였다.`);
  }
  return lines;
}

// 판 전체 서술 — 첫 줄 승부, 뒤이어 뒷이야기. 서신 body·일지에 그대로 실을 수 있다.
export function narrateCombat(r: CombatResult): string {
  const sideA = r.combatants.filter((c) => c.side === 'A');
  const sideB = r.combatants.filter((c) => c.side === 'B');
  const win = r.winner === 'B' ? sideB : sideA;
  const lose = r.winner === 'B' ? sideA : sideB;

  const lines = [headline(r, win, lose), ...aftermath(r)];

  // 오래 끈 승부·삽시간의 승부 — 합 수의 결만 살짝.
  if (r.rounds >= 20) lines.push('수십 합을 주고받은 긴 싸움이었다.');
  else if (r.rounds <= 3 && r.tier === 'crush') lines.push('승부는 삽시간에 갈렸다.');

  return lines.join(' ');
}
