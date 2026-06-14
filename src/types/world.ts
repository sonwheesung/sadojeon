// 강호 정세 — 양육 15년 동안 살아 움직이는 세계. docs/08.
// 세력(블록)은 세력치·기조를 들고, 라이벌 간 긴장이 쌓이면 사건이 터진다.
// 숫자(power·tension)는 화면에 직접 노출 X — 기조 라벨/풍문 문구로만 보인다(숨은변수 룰).

// 강호 5세력 블록 — 개별 문파(factions.ts)보다 거친 진영 단위.
export type WorldBloc =
  | 'orthodox' //   정파(무림맹·구파일방·세가) — 정통, 멸문 불가
  | 'unorthodox' // 사파(녹림·하오문 등)
  | 'demonic' //    마교
  | 'neutral' //    중도(표국·개방 등)
  | 'imperial'; //  관·군(황실)

// 진영 간 기조 — 긴장도가 오를수록 위로. 화면엔 라벨만.
export type Stance =
  | 'calm' //     평온
  | 'restless' // 술렁임
  | 'tension' //  긴장
  | 'clash' //    충돌
  | 'war'; //     전쟁

// 세력 한 진영의 살아있는 상태(회차 스코프, 매 계절 갱신).
export interface WorldPower {
  id: WorldBloc;
  label: string;
  power: number; //   세력치 0~100 (사건으로 오르내림)
  stance: Stance; //  현재 기조(자기 라이벌 긴장 중 최고)
  outlook: string; // 화면 표시 문구(엔진이 매 계절 갱신)
}

// 진행 중/막 끝난 강호 사건 — 수명을 가진다(국면 phase 진행 → 결말).
export interface WorldEvent {
  id: string;
  kind: string; //         사건 종류 id (worldEvents 레지스트리)
  blocs: WorldBloc[]; //   연루 진영(보통 1~2)
  phase: number; //        현재 국면 0~phasesTotal (phasesTotal 도달 = 결말 처리 대상)
  phasesTotal: number; //  국면 수(1=단발, 3=개전·격화·결전 같은 다국면)
  startedSeason: number; // 시작 누적 계절 인덱스
  headline: string; //     화면 표시 제목(현 국면)
  sub: string; //          화면 표시 부제(현 국면)
  done: boolean; //        결말 처리 완료(다음 갱신에서 목록서 제거)
  meta?: Record<string, unknown>; // 사건 종류 비공개 데이터(전쟁 승자 등)
}

// 엔진 코어가 주고받는 정세 전체 상태(스토어·화면·헤드리스 공용).
export interface WorldState {
  season: number; //              누적 계절 인덱스(0부터, 매 tick +1)
  powers: Record<WorldBloc, WorldPower>;
  tensions: Record<string, number>; // 라이벌 쌍 긴장 0~100, 키 = blocPairKey(a,b)
  events: WorldEvent[];
}
