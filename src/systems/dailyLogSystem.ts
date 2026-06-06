// 일일 일지 시스템 — docs/06 "일일 일지".
// trainingSystem 의 DiscipleTickReport[] 를 받아 UI 가 쓰기 좋은 형태로 가공:
// 1. DailyLog (메인 하단 인라인 패널) — 변화 있는 줄만, 풍경 한 줄씩
// 2. badges 맵 (DiscipleCard 위 배지) — discipleId → DiscipleBadge[]
// 3. Milestone[] (변곡점 모달 큐) — 승급·탈진만

import { findMartialArt } from '@/data/martialArts';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import type {
  DailyLog,
  DailyLogEntry,
  DailyLogKind,
  DiscipleBadge,
  Milestone,
} from '@/types';
import { MARTIAL_STAGE_LABEL } from '@/types/martialArt';
import { STAT_LABEL } from '@/types/training';
import type { DiscipleTickReport } from './trainingSystem';
import { staminaLevelIndex, staminaSceneLabel } from './staminaSystem';

// 진척 합 임계치 — base=8 기준. 활동·체력·재능 곱 후 판단.
const PROGRESS_GOOD = 5;
const PROGRESS_NORMAL = 2;
// 그 이하 (0 < delta < 2) = "미미", 0 = "정체/멈춤"

function trainingPhrase(name: string, totalDelta: number): { text: string; isPlateau: boolean } {
  if (totalDelta <= 0) {
    return {
      text: `${name}은 형을 짚었으나 한 자리에서 맴돌았다.`,
      isPlateau: true,
    };
  }
  if (totalDelta < PROGRESS_NORMAL) {
    return {
      text: `${name}이 무공의 결을 더듬어 보았으나 손에 잡히지 않았다.`,
      isPlateau: true,
    };
  }
  if (totalDelta < PROGRESS_GOOD) {
    return {
      text: `${name}이 자세를 한결 다듬었다.`,
      isPlateau: false,
    };
  }
  return {
    text: `${name}의 자세에서 군더더기가 빠졌다 — 한 걸음 나아갔다.`,
    isPlateau: false,
  };
}

function buildEntry(report: DiscipleTickReport, name: string): DailyLogEntry[] {
  const id = report.discipleId;
  const entries: DailyLogEntry[] = [];

  // 1) 탈진 — 다른 줄 모두 덮어쓰는 가장 강한 사건.
  if (report.collapsed) {
    entries.push({
      id: `${id}-collapse`,
      kind: 'collapse',
      discipleId: id,
      discipleName: name,
      text: `${name}이 무리한 끝에 쓰러졌다 — 사부가 거두어 치료에 들였다.`,
    });
    return entries;
  }

  // 2) 명령 수행 중 (폐관·의뢰·치료)
  if (report.overrideCommand === 'healing') {
    entries.push({
      id: `${id}-override-healing`,
      kind: 'override',
      discipleId: id,
      discipleName: name,
      text: `${name}이 치료를 이어가며 몸을 추슬렀다.`,
    });
  } else if (report.overrideCommand === 'quest') {
    entries.push({
      id: `${id}-override-quest`,
      kind: 'override',
      discipleId: id,
      discipleName: name,
      text: `${name}은 의뢰 현장에서 강호의 바람을 마셨다.`,
    });
  } else if (report.overrideCommand === 'seclusion') {
    const totalDelta = report.arts.reduce((s, a) => s + a.delta, 0);
    const phrase = trainingPhrase(name, totalDelta);
    entries.push({
      id: `${id}-override-seclusion`,
      kind: phrase.isPlateau ? 'plateau' : 'training',
      discipleId: id,
      discipleName: name,
      text: `${name}은 폐관에 들어 안과 마주섰다 — ${phrase.text.replace(`${name}은 `, '').replace(`${name}이 `, '').replace(`${name}의 `, '')}`,
    });
  } else {
    // 3) 사문/개인 패턴 카테고리 활동
    entries.push(categoryEntry(report, name));
  }

  // 4) 단련 스탯 레벨업 — 관찰 가능한 성장 (docs/06 노출 OK).
  for (const g of report.statGains) {
    if (g.levelUps <= 0) continue;
    entries.push({
      id: `${id}-growth-${g.statId}`,
      kind: 'growth',
      discipleId: id,
      discipleName: name,
      text: `${name}의 ${STAT_LABEL[g.statId]} 단련이 한 단계 무르익었다.`,
    });
  }

  // 5) 기색 변화 (풍경 라벨 단계 변화 감지) — 큰 변화만 한 줄 추가.
  const beforeLabel = staminaSceneLabel(report.staminaBefore, report.maxStamina);
  const afterLabel = staminaSceneLabel(report.staminaAfter, report.maxStamina);
  if (beforeLabel !== afterLabel) {
    const dropped =
      staminaLevelIndex(report.staminaAfter, report.maxStamina) <
      staminaLevelIndex(report.staminaBefore, report.maxStamina);
    entries.push({
      id: `${id}-stamina`,
      kind: dropped ? 'stamina_drop' : 'stamina_rise',
      discipleId: id,
      discipleName: name,
      text: dropped
        ? `${name}의 기색이 ${afterLabel}으로 가라앉았다.`
        : `${name}이 기력을 되찾아 ${afterLabel}에 가까워졌다.`,
    });
  }

  // 6) 무공 성장 — 밴드 승급(굵은 줄) 또는 성 +1(가벼운 줄). docs/26.
  for (const a of report.arts) {
    const art = findMartialArt(a.artId);
    const artName = art?.name ?? a.artId;
    if (a.promoted) {
      const stageLabel = MARTIAL_STAGE_LABEL[a.promoted];
      entries.push({
        id: `${id}-promotion-${a.artId}`,
        kind: 'promotion',
        discipleId: id,
        discipleName: name,
        text: `${name}이 ${artName} ${stageLabel} 경지에 올랐다 — ${a.seong}성.`,
      });
    } else if (a.seong > a.seongBefore) {
      entries.push({
        id: `${id}-seong-${a.artId}`,
        kind: 'growth',
        discipleId: id,
        discipleName: name,
        text: `${name}의 ${artName}이 ${a.seong}성에 올랐다.`,
      });
    }
  }

  return entries;
}

// 카테고리별 평상시 한 줄.
function categoryEntry(report: DiscipleTickReport, name: string): DailyLogEntry {
  const id = report.discipleId;
  const what = report.optionLabel ?? '';

  switch (report.category) {
    case 'rest':
      return {
        id: `${id}-rest`,
        kind: 'rest',
        discipleId: id,
        discipleName: name,
        text: what
          ? `${name}이 ${what}(으)로 숨을 돌렸다.`
          : `${name}이 푹 쉬며 기력을 회복했다.`,
      };
    case 'physical':
      return {
        id: `${id}-physical`,
        kind: 'training',
        discipleId: id,
        discipleName: name,
        text: what
          ? `${name}이 ${what}(으)로 몸을 단련했다.`
          : `${name}이 몸을 단련했다.`,
      };
    case 'study':
      return {
        id: `${id}-study`,
        kind: 'training',
        discipleId: id,
        discipleName: name,
        text: what
          ? `${name}이 ${what} 공부에 머리를 싸맸다.`
          : `${name}이 서책을 들여다보았다.`,
      };
    case 'martial':
    default: {
      const totalDelta = report.arts.reduce((s, a) => s + a.delta, 0);
      const phrase = trainingPhrase(name, totalDelta);
      return {
        id: `${id}-training`,
        kind: phrase.isPlateau ? 'plateau' : 'training',
        discipleId: id,
        discipleName: name,
        text: phrase.text,
      };
    }
  }
}

function computeBadges(report: DiscipleTickReport): DiscipleBadge[] {
  const out: DiscipleBadge[] = [];
  if (report.collapsed) {
    out.push('collapsed');
    return out;
  }
  if (report.arts.some((a) => a.promoted)) out.push('promoted');
  const ratio = report.maxStamina > 0 ? report.staminaAfter / report.maxStamina : 0;
  if (ratio < 0.1) {
    out.push('low_stamina');
  }
  const totalDelta = report.arts.reduce((s, a) => s + a.delta, 0);
  if (report.category === 'martial' && totalDelta > 0 && totalDelta < PROGRESS_NORMAL) {
    out.push('plateau');
  }
  const leveledUp = report.statGains.some((g) => g.levelUps > 0);
  const seongUp = report.arts.some((a) => a.seong > a.seongBefore && !a.promoted);
  if (totalDelta >= PROGRESS_GOOD || leveledUp || seongUp) out.push('good_progress');
  return out;
}

function buildMilestones(reports: DiscipleTickReport[]): Milestone[] {
  const out: Milestone[] = [];
  const day = useTimeStore.getState().totalDay;
  const disciples = useDiscipleStore.getState().disciples;

  for (const r of reports) {
    const d = disciples[r.discipleId];
    if (!d) continue;

    if (r.collapsed) {
      out.push({
        id: `${day}-${r.discipleId}-collapse`,
        kind: 'collapse',
        discipleId: r.discipleId,
        discipleName: d.name,
        title: '쓰러짐',
        body: `${d.name}이 무리한 끝에 쓰러졌다.\n사부가 거두어 치료에 들였다 — 며칠 강제 휴식.`,
      });
    }

    for (const a of r.arts) {
      if (!a.promoted) continue;
      const art = findMartialArt(a.artId);
      const stageLabel = MARTIAL_STAGE_LABEL[a.promoted];
      out.push({
        id: `${day}-${r.discipleId}-promo-${a.artId}`,
        kind: 'promotion',
        discipleId: r.discipleId,
        discipleName: d.name,
        artId: a.artId,
        artName: art?.name ?? a.artId,
        newStage: a.promoted,
        title: '경지 도약',
        body: `${d.name}이 ${art?.name ?? a.artId} ${stageLabel} 경지에 올랐다 — ${a.seong}성.`,
      });
    }
  }

  return out;
}

// 메인 엔트리 — reports 받아 일지·배지·변곡점 모두 빌드.
export function buildTickArtifacts(
  reports: DiscipleTickReport[],
  dateLabel: string,
): { log: DailyLog; badges: Record<string, DiscipleBadge[]>; milestones: Milestone[] } {
  const disciples = useDiscipleStore.getState().disciples;
  const entries: DailyLogEntry[] = [];
  const badges: Record<string, DiscipleBadge[]> = {};

  for (const r of reports) {
    const d = disciples[r.discipleId];
    if (!d) continue;
    const name = d.name;
    entries.push(...buildEntry(r, name));
    const b = computeBadges(r);
    if (b.length > 0) badges[r.discipleId] = b;
  }

  const day = useTimeStore.getState().totalDay;
  return {
    log: { day, dateLabel, entries },
    badges,
    milestones: buildMilestones(reports),
  };
}

// 배지 라벨 — 카드에 노출되는 짧은 한자 1~2자.
export const BADGE_LABEL: Record<DiscipleBadge, string> = {
  promoted: '진(進)',
  collapsed: '도(倒)',
  low_stamina: '핍(乏)',
  plateau: '벽(壁)',
  good_progress: '진(進)',
};

// 짧은 라벨 — 일지 평상시 한 줄에 사용.
export function shortKindLabel(kind: DailyLogKind): string {
  switch (kind) {
    case 'training':
      return '수련';
    case 'meditation':
      return '명상';
    case 'rest':
      return '휴식';
    case 'autonomy':
      return '자율';
    case 'growth':
      return '단련';
    case 'override':
      return '명령 수행';
    case 'plateau':
      return '정체';
    case 'stamina_drop':
      return '기색 가라앉음';
    case 'stamina_rise':
      return '기색 회복';
    case 'collapse':
      return '쓰러짐';
    case 'promotion':
      return '경지 도약';
  }
}

// 우선순위 — 한 제자 entries 중 가장 중요한 kind 를 대표로.
const KIND_PRIORITY: Record<DailyLogKind, number> = {
  collapse: 0,
  promotion: 1,
  growth: 2,
  stamina_drop: 3,
  stamina_rise: 4,
  plateau: 5,
  override: 6,
  training: 7,
  meditation: 8,
  rest: 9,
  autonomy: 10,
};

export interface DiscipleLogGroup {
  discipleId: string;
  discipleName: string;
  primaryKind: DailyLogKind;
  primaryLabel: string;  // 한 단어 짧은 라벨
  entries: DailyLogEntry[];  // 그 제자의 모든 entries (펼침 시 표시)
}

// 제자별로 entries 묶기 + 가장 중요한 kind 를 primary 로.
// 원래 entries 순서(첫 등장 순) 유지 → 사문 카드 순서와 일치.
export function groupLogByDisciple(log: DailyLog): DiscipleLogGroup[] {
  const map: Record<string, DiscipleLogGroup> = {};
  for (const e of log.entries) {
    if (!e.discipleId) continue;
    let g = map[e.discipleId];
    if (!g) {
      g = {
        discipleId: e.discipleId,
        discipleName: e.discipleName ?? '?',
        primaryKind: e.kind,
        primaryLabel: shortKindLabel(e.kind),
        entries: [],
      };
      map[e.discipleId] = g;
    }
    g.entries.push(e);
    if (KIND_PRIORITY[e.kind] < KIND_PRIORITY[g.primaryKind]) {
      g.primaryKind = e.kind;
      g.primaryLabel = shortKindLabel(e.kind);
    }
  }
  const seen = new Set<string>();
  const result: DiscipleLogGroup[] = [];
  for (const e of log.entries) {
    if (!e.discipleId || seen.has(e.discipleId)) continue;
    seen.add(e.discipleId);
    const g = map[e.discipleId];
    if (g) result.push(g);
  }
  return result;
}
