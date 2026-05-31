// [DEV] LLM 요청/응답 영속 로그 — Claude(개발 보조)가 읽고 분석할 수 있게 기록.
//
// 두 출구:
//   1) Metro 터미널: 매 호출을 `[LLM_IO]{json}` 한 줄로 출력 → 터미널에서 복사해 붙여넣기 (리빌드 불필요)
//   2) 파일: documentDirectory/llm-debug.jsonl 에 한 줄(JSONL)씩 append → 누적 기록
//
// JSONL 한 줄 = { ts, source, discipleName, llmCalled, prompt, raw }
// - prompt = LLM 에 보낸 요청 전문
// - raw    = LLM 이 돌려준 응답 원문 (또는 [error] 메시지)
//
// expo-file-system SDK 54 새 API (File/Paths). 레거시 import 아님.
// append 직접 메서드가 없어 read-modify-write 로 처리 (dev 로그, 크기 작아 무방).

import { File, Paths } from 'expo-file-system';

import type { LlmDebugEntry } from '@/stores/pendingStore';

const LOG_FILENAME = 'llm-debug.jsonl';

export interface LlmLogRecord extends LlmDebugEntry {
  ts: string;
}

function logFile(): File {
  return new File(Paths.document, LOG_FILENAME);
}

// LLM 호출 한 건 기록. pushLlmDebug 에서 매 호출 fire-and-forget 로 부른다.
export function logLlmCall(entry: LlmDebugEntry): void {
  if (!__DEV__) return;
  const record: LlmLogRecord = { ts: new Date().toISOString(), ...entry };
  const line = JSON.stringify(record);

  // 1) 터미널 — 한 줄. 사용자가 복사해 붙여넣으면 Claude 가 분석.
  console.log(`[LLM_IO]${line}`);

  // 2) 파일 append (best-effort — 실패해도 게임 흐름 막지 않음).
  try {
    const file = logFile();
    if (!file.exists) file.create();
    const existing = file.textSync();
    file.write(existing + line + '\n');
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.warn('[debugLog] 로그 파일 기록 실패', e);
    }
  }
}

// 누적 로그 전문 읽기 — 내보내기/복사 액션용.
export function readLlmLog(): string {
  if (!__DEV__) return '';
  try {
    return logFile().textSync();
  } catch {
    return '';
  }
}

// 로그 초기화 — 새 회차/분석 시작 전 비우기용.
export function clearLlmLog(): void {
  if (!__DEV__) return;
  try {
    const file = logFile();
    if (file.exists) file.write('');
    else file.create();
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.warn('[debugLog] 로그 초기화 실패', e);
    }
  }
}

// 파일 경로 — 사용자가 직접 추출(adb 등)할 때 안내용.
export function llmLogPath(): string {
  try {
    return logFile().uri;
  } catch {
    return `${Paths.document.uri}${LOG_FILENAME}`;
  }
}
