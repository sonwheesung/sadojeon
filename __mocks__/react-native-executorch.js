// 전역 수동 mock — 테스트에서 executorch 네이티브를 절대 로드하지 않게(화면/시스템 import 안전망).
// 실 코드는 dynamic require 라 보통 안 타지만, 정적 import 가 새도 import 가 깨지지 않게 stub 제공.
module.exports = {
  LLMModule: { fromModelName: jest.fn(async () => ({ generate: jest.fn(async () => '') })) },
  QWEN3_1_7B_QUANTIZED: 'qwen3-1.7b-quantized',
  isAvailable: false,
};
