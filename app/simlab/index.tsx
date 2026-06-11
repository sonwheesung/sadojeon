// [DEV] 시뮬레이션 실험실 허브 — 개발 계정 전용. docs/36.
// 사문 선택 대신 여기로 착지 — 도메인별 시뮬(전투·관계·직업)을 골라
// 상세 설정 → 실행 → 과정·결과를 본다. 그레이박스.

import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CutsceneOverlay } from '@/components/cutscene/CutsceneOverlay';
import { SafetyZone } from '@/components/common/SafetyZone';
import { CUTSCENES } from '@/data/cutscenes';
import { playCutscene } from '@/systems/cutsceneSystem';
import { useDevAccess } from '@/systems/dev/devAccess';
import { colors, spacing, typography } from '@/theme';

const SIMS = [
  {
    href: '/simlab/combat' as Href,
    title: '전투 시뮬레이션',
    desc: '대련·실전 N판 — 양측 구성(경지·결·인원)을 정해 승률·합·사망을 본다',
  },
  {
    href: '/simlab/relations' as Href,
    title: '관계 시뮬레이션',
    desc: 'N년 자동 진행 — 대련·비무·중재로 관계(원수~의형제)가 어떻게 흐르나',
  },
  {
    href: '/simlab/career' as Href,
    title: '미래 직업 시뮬레이션',
    desc: '졸업 스냅샷(노선·역량·명성) → 평생 궤적 N회 — 정점 직책·생존 분포',
  },
] as const;

export default function SimLabHub() {
  const dev = useDevAccess();
  if (!dev) {
    return (
      <SafetyZone background={colors.paper}>
        <Text style={styles.blocked}>개발 계정 전용 화면입니다.</Text>
      </SafetyZone>
    );
  }

  return (
    <SafetyZone background={colors.paper}>
      <View style={styles.header}>
        <Text style={styles.title}>시뮬레이션 실험실</Text>
        <Text style={styles.sub}>개발 계정 전용 — 수정·업데이트 후 여기서 바로 확인</Text>
      </View>

      {SIMS.map((s) => (
        <Pressable key={s.title} style={styles.card} onPress={() => router.push(s.href)}>
          <Text style={styles.cardTitle}>{s.title}</Text>
          <Text style={styles.cardDesc}>{s.desc}</Text>
        </Pressable>
      ))}

      <Pressable style={styles.card} onPress={() => router.push('/dev/autoplay')}>
        <Text style={styles.cardTitle}>자동 플레이 QA</Text>
        <Text style={styles.cardDesc}>랜덤 N년 자동 진행 — 이벤트·면담·LLM 발화 로그 (기존)</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => {
          // 등록된 컷씬 전부 큐에 — 탭으로 한 장씩 넘기며 연출·미디어 확인. docs/20.
          for (const c of CUTSCENES) playCutscene(c.eventId, { id: 'jang-cheol', name: '장철' });
        }}
      >
        <Text style={styles.cardTitle}>컷씬 미리보기</Text>
        <Text style={styles.cardDesc}>등록된 컷씬 전부 재생(장철 기준) — 모션 WebP·전용 대사·폴백 확인</Text>
      </Pressable>

      <CutsceneOverlay />

      <Pressable style={[styles.card, styles.normal]} onPress={() => router.push('/slot-select?game=1' as Href)}>
        <Text style={styles.cardTitle}>일반 게임으로</Text>
        <Text style={styles.cardDesc}>사문 선택 화면으로 이동 (시뮬이 이 계정의 세이브를 덮을 수 있음)</Text>
      </Pressable>
    </SafetyZone>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.base, gap: 2 },
  title: { fontFamily: typography.serifBold, fontSize: typography.sizes.lg, color: colors.ink },
  sub: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  card: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 6,
    padding: spacing.base,
    gap: 4,
  },
  normal: { marginTop: spacing.base, opacity: 0.75 },
  cardTitle: { fontFamily: typography.serifMedium, fontSize: typography.sizes.base, color: colors.ink },
  cardDesc: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  blocked: {
    margin: spacing.lg,
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
});
