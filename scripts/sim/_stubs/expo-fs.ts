// expo-file-system 스텁(헤드리스 sim) — 파일 IO 없음. LLM 디버그 로그 등에서만 쓰여 no-op.
export class File {
  constructor(..._a: unknown[]) {}
  get exists() { return false; }
  create() {}
  write() {}
  text() { return ''; }
  delete() {}
}
export const Paths = { document: '', cache: '' };
export default {};
