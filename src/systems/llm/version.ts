// LLM 튜닝 버전 — 프롬프트·모델·파라미터를 바꿀 때마다 올린다.
// 모든 LLM 요청/응답 로그(app_logs)에 함께 저장되어, 나중에 튜닝 시
// "어느 버전이 이 응답을 냈는지" 추적·비교할 수 있게 한다.
//
// 형식: 'YYYY-MM-DD.n' (같은 날 여러 번 바꾸면 n 증가).

export const LLM_MODEL_ID = 'llama-3.2-3b-spinquant-q4';

export const LLM_TUNING_VERSION = '2026-05-31.1';
