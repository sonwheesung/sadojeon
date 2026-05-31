// 도메인 라벨 상수 — 한국어 메인. 한자는 캐릭터 이름 등 일부 영역에서만 보조 표기.
// 컴포넌트는 본 모듈을 통해서만 라벨 접근. UI 한 곳 변경으로 일관 갱신.

// 재능 5축 — docs/03_제자_시스템.md
export const TALENT_AXES = ['body', 'qi', 'agility', 'insight', 'mind'] as const;
export type TalentAxisKey = (typeof TALENT_AXES)[number];

export const TALENT_LABEL: Record<TalentAxisKey, string> = {
  body: '체능',
  qi: '기력',
  agility: '민첩',
  insight: '오성',
  mind: '심성',
};

// 한자 라벨 — 현재 UI 비표시. 폴리시 단계에서 보조 표기 시 사용 가능.
export const TALENT_LABEL_HANJA: Record<TalentAxisKey, string> = {
  body: '體能',
  qi: '氣力',
  agility: '敏捷',
  insight: '悟性',
  mind: '心性',
};

// 별 등급 표시 — ★/☆ 직접 조합
export function starText(rank: number, total = 5): string {
  const filled = Math.max(0, Math.min(total, Math.floor(rank)));
  return '★'.repeat(filled) + '☆'.repeat(total - filled);
}

// 무공 학습 화면 액션 — docs/06_훈련_일정.md
export const TRAIN_ACTIONS = ['start', 'cancel'] as const;
export type TrainActionKey = (typeof TRAIN_ACTIONS)[number];

export const TRAIN_ACTION_LABEL: Record<TrainActionKey, string> = {
  start: '수련 시작',
  cancel: '취소',
};

// 장비 슬롯 6종 — docs/09_경제_시스템.md
export const EQUIPMENT_SLOTS = [
  'weapon', 'top', 'bottom', 'talisman', 'potion', 'pouch',
] as const;
export type EquipmentSlotKey = (typeof EQUIPMENT_SLOTS)[number];

export const EQUIPMENT_SLOT_LABEL: Record<EquipmentSlotKey, string> = {
  weapon: '무구',
  top: '상의',
  bottom: '하의',
  talisman: '호신부',
  potion: '단약',
  pouch: '호신낭',
};

export const EQUIPMENT_SLOT_LABEL_HANJA: Record<EquipmentSlotKey, string> = {
  weapon: '武具',
  top: '上衣',
  bottom: '下衣',
  talisman: '護身符',
  potion: '丹藥',
  pouch: '護身囊',
};

// 장비 화면 액션
export const EQUIPMENT_ACTIONS = ['unequip', 'close'] as const;
export type EquipmentActionKey = (typeof EQUIPMENT_ACTIONS)[number];

export const EQUIPMENT_ACTION_LABEL: Record<EquipmentActionKey, string> = {
  unequip: '해제',
  close: '닫기',
};

// 인벤토리 카테고리 6종
export const INVENTORY_CATEGORIES = [
  'elixir', 'pill', 'scroll', 'material', 'misc', 'trinket',
] as const;
export type InventoryCategoryKey = (typeof INVENTORY_CATEGORIES)[number];

export const INVENTORY_CATEGORY_LABEL: Record<InventoryCategoryKey, string> = {
  elixir: '영약',
  pill: '단약',
  scroll: '비급',
  material: '재료',
  misc: '잡화',
  trinket: '패물',
};

export const INVENTORY_CATEGORY_LABEL_HANJA: Record<InventoryCategoryKey, string> = {
  elixir: '靈藥',
  pill: '丹藥',
  scroll: '祕笈',
  material: '材料',
  misc: '雜貨',
  trinket: '佩物',
};

// 인벤토리 화면 액션
export const INVENTORY_ACTIONS = ['sort', 'close'] as const;
export type InventoryActionKey = (typeof INVENTORY_ACTIONS)[number];

export const INVENTORY_ACTION_LABEL: Record<InventoryActionKey, string> = {
  sort: '정렬',
  close: '닫기',
};

// 무공 도감 갈래 8종 — docs/04_무공_도감.md "8대 갈래"
export const CODEX_CATEGORIES = [
  'sword', 'saber', 'fist', 'palm', 'lightness', 'internal', 'external', 'hidden',
] as const;
export type CodexCategoryKey = (typeof CODEX_CATEGORIES)[number];

export const CODEX_CATEGORY_LABEL: Record<CodexCategoryKey, string> = {
  sword: '검법',
  saber: '도법',
  fist: '권법',
  palm: '장법',
  lightness: '보법',
  internal: '내공',
  external: '외공',
  hidden: '암기',
};

export const CODEX_CATEGORY_LABEL_HANJA: Record<CodexCategoryKey, string> = {
  sword: '劍法',
  saber: '刀法',
  fist: '拳法',
  palm: '掌法',
  lightness: '步法',
  internal: '內功',
  external: '外功',
  hidden: '暗器',
};

// 도감 화면 액션
export const CODEX_ACTIONS = ['sort', 'close'] as const;
export type CodexActionKey = (typeof CODEX_ACTIONS)[number];

export const CODEX_ACTION_LABEL: Record<CodexActionKey, string> = {
  sort: '정렬',
  close: '닫기',
};
