// 네임드 NPC 조우 — **도감 만남 활성화의 단일 seam**. 어디서 네임드를 만나든 여기 한 줄로 모은다.
// "신경 안 쓸 정도": 콘텐츠(컷씬·서신·풍문 본문)에 이름이 등장하면 meetNpcsInText 가 알아서
// 도감을 채운다 — 새 사건/대사를 쓸 때 네임드를 언급만 하면 자동 발견 처리된다.
// 만남 기록은 **계정 단위 영구**(metNpcStore — metaStorage + account_state DB). docs/24·38.

import { useMetNpcStore } from '@/stores/metNpcStore';
import { NAMED_NPCS } from '@/data/npcs';

// 특정 네임드를 만남 처리(정확·권장). id 가 없으면 무시.
export function meetNpc(id: string | undefined | null): void {
  if (id) useMetNpcStore.getState().markMet(id);
}

export function meetNpcs(ids: readonly (string | undefined | null)[]): void {
  for (const id of ids) meetNpc(id);
}

// 본문에 별호·한자명이 등장하는 네임드를 자동 만남 처리(set-and-forget).
// 별호는 충분히 고유(혈수나찰·천면랑·혈천노조…)해 오탐이 드물다 — 정밀이 필요하면 meetNpc(id) 사용.
export function meetNpcsInText(...texts: (string | undefined | null)[]): void {
  const text = texts.filter(Boolean).join(' ');
  if (!text) return;
  const store = useMetNpcStore.getState();
  for (const n of NAMED_NPCS) {
    if (text.includes(n.name) || (n.hanjaName && text.includes(n.hanjaName))) store.markMet(n.id);
  }
}

// 개발/테스트 — 도감 전체 활성화(모든 네임드 만남). 프로덕션 호출 X.
export function meetAllNpcs(): void {
  const store = useMetNpcStore.getState();
  for (const n of NAMED_NPCS) store.markMet(n.id);
}
