// expo-file-system 스텁 — 헤드리스에서 LLM 디버그 파일 로그 미사용. import만 통과.
export class File { constructor(..._a: unknown[]) {} get exists() { return false; } text() { return ''; } create() {} write() {} }
export const Paths = { document: '' };
export default {};
