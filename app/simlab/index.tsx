// [DEV] 시뮬레이션 실험실 허브 — 개발 계정 전용. docs/36.
// 사문 선택 대신 여기로 착지 — 도메인별 시뮬(전투·관계·직업)을 골라
// 상세 설정 → 실행 → 과정·결과를 본다. 그레이박스.

import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CutsceneOverlay } from '@/components/cutscene/CutsceneOverlay';
import { SafetyZone } from '@/components/common/SafetyZone';
import { CUTSCENES } from '@/data/cutscenes';
import { CUTSCENE_MEDIA_ALT } from '@/data/cutscenes/media';
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

// 기기 비율 시뮬레이터 — 9:16 쇼츠 컷이 기기마다 어떻게 잘리나 검증(피드백 대응). docs/20.
// 각 기기의 실제 논리 크기(dp)로 그린 뒤 통째로 축소 — 글자·띠 비율이 실물과 동일.
// undefined = 이 기기 화면 그대로.
const PREVIEW_DEVICES = [
  { key: 'device', label: '이 기기', size: undefined as { width: number; height: number } | undefined },
  { key: 'tall', label: '폰 20:9', size: { width: 360, height: 800 } },
  { key: 'classic', label: '폰 16:9', size: { width: 360, height: 640 } },
  { key: 'tablet', label: '태블릿 4:3', size: { width: 768, height: 1024 } },
] as const;

export default function SimLabHub() {
  const dev = useDevAccess();
  const [ratioKey, setRatioKey] = useState<(typeof PREVIEW_DEVICES)[number]['key']>('device');
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
          // 보조판(가로 레거시 등)이 있는 컷은 두 버전 다 올린다(✅ 두 버전 보존).
          const device = PREVIEW_DEVICES.find((r) => r.key === ratioKey);
          const frame = device?.size ? { ...device.size, label: device.label } : undefined;
          for (const c of CUTSCENES) {
            playCutscene(c.eventId, { id: 'jang-cheol', name: '장철' }, { frame });
            if (CUTSCENE_MEDIA_ALT[c.eventId]?.['jang-cheol']) {
              playCutscene(c.eventId, { id: 'jang-cheol', name: '장철' }, { mediaVariant: 'alt', frame });
            }
          }
        }}
      >
        <Text style={styles.cardTitle}>컷씬 미리보기</Text>
        <Text style={styles.cardDesc}>등록된 컷씬 전부 재생(장철 기준) — 쇼츠판+가로판 비교·전용 대사·폴백 확인</Text>
        <View style={styles.ratioRow}>
          {PREVIEW_DEVICES.map((r) => (
            <Pressable
              key={r.key}
              style={[styles.ratioChip, ratioKey === r.key && styles.ratioChipOn]}
              onPress={() => setRatioKey(r.key)}
            >
              <Text style={[styles.ratioChipText, ratioKey === r.key && styles.ratioChipTextOn]}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.cardDesc}>비율 틀 — 다른 폰·태블릿에서 쇼츠 컷이 어디까지 잘리나 이 기기에서 확인</Text>
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
  ratioRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
  ratioChip: {
    borderWidth: 1,
    borderColor: colors.inkSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    opacity: 0.7,
  },
  ratioChipOn: { borderColor: colors.ink, backgroundColor: colors.paperBright, opacity: 1 },
  ratioChipText: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  ratioChipTextOn: { color: colors.ink },
  blocked: {
    margin: spacing.lg,
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
});
