// 실전 상대 NPC 생성 — docs/35 §4. 의뢰·강호 사건의 적수(산적·사파·살수·마교도…)를
// 경지 한 줄로 빚는다. 엔진 입력(Combatant)을 직접 만들므로 카탈로그 비급이 필요 없다.
// 같은 경지라도 quality(0~1)로 영근 정도가 갈린다 — 여느 삼류 산적 vs 손꼽히는 삼류.

import { random } from '@/systems/rng';
import {
  REALM_EXTERNAL_REQ,
  REALM_INTERNAL_REQ,
  REALM_SEONG_CAP,
} from '@/data/realm';
import { defaultArtTraits } from '@/data/martialArts';
import type { Realm } from '@/types/realm';
import type { MartialArtGrade, MartialArtSchool, MartialPath } from '@/types/martialArt';
import type { CombatArt, Combatant } from '@/types/combat';

// 적수 결 — 무공 갈래·노선·손속이 갈린다.
export type NpcArchetype =
  | 'bandit' // 산적·녹림 — 도법, 거친 손속
  | 'soldier' // 관병·표사 — 도법·외공, 무난
  | 'orthodox' // 정파 무사 — 검법, 절제된 손속
  | 'rogue' // 사파 무사 — 검·암기, 사도
  | 'assassin' // 살수 — 암기·보법, 독한 손속
  | 'cultist' // 마교도 — 마공, 살기
  | 'beast'; // 맹수·요수 — 몸뚱이 하나(외공)

interface ArchetypeSpec {
  school: MartialArtSchool;
  path: MartialPath;
  mercy: number;
  prudence: number;
  sub?: MartialArtSchool; // 보조 갈래 (보법·암기 등)
}

const ARCHETYPES: Record<NpcArchetype, ArchetypeSpec> = {
  // 보조 무공(sub) — 같은 경지면 격이 동등하도록 모든 결에 보조 1종(강약은 경지·quality 로만 표현, archetype 은 갈래 차이일 뿐).
  bandit: { school: 'saber', path: 'jung', mercy: 30, prudence: 35, sub: 'external' },
  soldier: { school: 'saber', path: 'jeong', mercy: 55, prudence: 55, sub: 'external' },
  orthodox: { school: 'sword', path: 'jeong', mercy: 70, prudence: 60, sub: 'lightness' },
  rogue: { school: 'sword', path: 'sa', mercy: 35, prudence: 40, sub: 'hidden' },
  assassin: { school: 'hidden', path: 'sa', mercy: 15, prudence: 70, sub: 'lightness' },
  cultist: { school: 'darkArts', path: 'ma', mercy: 20, prudence: 30, sub: 'qigong' },
  beast: { school: 'external', path: 'jung', mercy: 0, prudence: 20 },
};

// 경지 → NPC 주력 비급 등급(강호 평균 — 제자처럼 절품을 들고 다니진 않는다).
const REALM_NPC_GRADE: Record<Realm, MartialArtGrade> = {
  none: 'novice',
  samryu: 'novice',
  iryu: 'apprentice',
  ilryu: 'apprentice',
  jeoljeong: 'master',
  chojeoljeong: 'grandmaster',
  hwagyeong: 'grandmaster',
};

export interface NpcSpec {
  id: string;
  name: string;
  realm: Realm;
  archetype: NpcArchetype;
  quality?: number; // 0~1 — 같은 경지 안에서 영근 정도 (기본 0.5)
  rng?: () => number;
}

export function makeNpcCombatant(spec: NpcSpec): Combatant {
  const rng = spec.rng ?? random;
  const q = Math.max(0, Math.min(1, spec.quality ?? 0.5));
  const a = ARCHETYPES[spec.archetype];

  // 주력 성 — 경지 상한 안에서 quality 만큼 영글었다.
  const cap = Math.max(1, REALM_SEONG_CAP[spec.realm]);
  const mainSeong = Math.max(1, Math.round(cap * (0.55 + 0.45 * q)));
  const mainGrade = REALM_NPC_GRADE[spec.realm];
  const arts: CombatArt[] = [
    {
      school: a.school,
      grade: mainGrade,
      path: a.path,
      seong: mainSeong,
      isMain: true,
      traits: defaultArtTraits({ school: a.school, grade: mainGrade, path: a.path }),
    },
  ];
  if (a.sub) {
    arts.push({
      school: a.sub,
      grade: 'novice',
      path: a.path,
      seong: Math.max(1, mainSeong - 1),
      traits: defaultArtTraits({ school: a.sub, grade: 'novice', path: a.path }),
    });
  }

  // 스탯·내공 — 그 경지에 들 만큼은 닦은 몸(요구치 부근 ± quality).
  const ext = REALM_EXTERNAL_REQ[spec.realm];
  const internal = REALM_INTERNAL_REQ[spec.realm] * (0.85 + 0.3 * q);
  const jitter = () => 0.9 + rng() * 0.2;

  return {
    id: spec.id,
    name: spec.name,
    realm: spec.realm,
    arts,
    internal: Math.round(internal),
    strength: Math.round(Math.min(100, (ext + 8) * (0.8 + 0.4 * q) * jitter())),
    agility: Math.round(Math.min(100, (ext + 4) * (0.75 + 0.5 * q) * jitter())),
    endurance: Math.round(Math.min(100, (ext + 6) * (0.8 + 0.4 * q) * jitter())),
    staminaFrac: 1,
    insight: Math.max(1, Math.min(5, Math.round(1 + q * 3))),
    prudence: a.prudence,
    mercy: a.mercy,
    simma: spec.archetype === 'cultist' ? 50 : 0,
  };
}
