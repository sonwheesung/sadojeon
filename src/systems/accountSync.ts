// 계정 상태(업적·해금 무공서·누적 집계·다이아) ↔ Supabase 동기화. 회차(runSync)와 **별개** —
// 회차를 넘어 누적되는 유저 단위 상태라 account_state(user_id당 1행)에 저장. docs/31·32.
// capture/commitAccountState(서버 엔진과 공유)를 재사용 — 드리프트 0.

import { account } from '@/data/repositories';
import { captureAccountState, commitAccountState, type AccountState } from '@/engine/accountState';

// 동시 저장 직렬화(runSync 와 동일 — 자동저장 연달아 부를 때 충돌·부분쓰기 방지).
let saveQueue: Promise<void> = Promise.resolve();

async function doSaveAccount(): Promise<void> {
  await account.saveAccount(captureAccountState() as unknown as Record<string, unknown>);
}

export function saveAccount(): Promise<void> {
  const next = saveQueue.then(doSaveAccount, doSaveAccount);
  saveQueue = next.catch(() => {});
  return next;
}

// 자동(silent) 계정 저장 — 실패해도 게임 흐름 안 막음. 회차 자동저장과 같은 시점에 호출.
export function saveAccountSilently(): void {
  saveAccount().catch((e) => {
    if (typeof console !== 'undefined') console.warn('[accountSync] 계정 저장 실패', e);
  });
}

// 로그인·세션 복원 시 — DB 계정 상태 로드. **없으면(신규/미동기) 로컬을 지우지 않고 그대로 DB 시드**
// (오프라인에서 쌓은 업적·해금이 첫 동기화에서 날아가지 않게). 업적·해금·집계는 단조 증가라
// DB 존재 시 그걸 정본으로 반영해도 손실 없음.
export async function loadAccount(): Promise<void> {
  const data = await account.getAccount();
  if (data && typeof data === 'object' && Object.keys(data).length > 0) {
    commitAccountState(data as unknown as AccountState);
  } else {
    await saveAccount(); // DB 비었음 — 로컬 진행을 DB로 시드
  }
}
