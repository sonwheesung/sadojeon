import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Href } from 'expo-router';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { GATHER_REGIONS, GATHER_TIER_LABEL, findGatherRegion } from '@/data/activities';
import { EXPEDITION_DESTS, findExpeditionDest } from '@/data/expeditions';
import { MATERIAL_LABEL } from '@/data/elixirs';
import {
  activeActivityLabels,
  canGather,
  dispatchGather,
  isAvailable,
  loreOf,
} from '@/systems/activitySystem';
import { canExpedition, dispatchExpedition } from '@/systems/expeditionSystem';
import { useActivityStore } from '@/stores/activityStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import type { Disciple } from '@/types';
import { colors, radius, spacing, typography } from '@/theme';

// 활동 허브(그레이박스) — 일과 외 임시 파견/제작. docs/38.
// Phase 1: 강호 출행(준비중) · 약초 채집(구현) · 영단 제작(연단실 링크) · 도구 제작(준비중).

type Mode = 'hub' | 'gather' | 'expedition';

const MODE_TITLE: Record<Mode, string> = {
  hub: '활동',
  gather: '약초 채집',
  expedition: '강호 출행',
};

export default function ActivityHubScreen() {
  const confirm = useConfirm();
  const order = useDiscipleStore((s) => s.order);
  const disciples = useDiscipleStore((s) => s.disciples);
  // 진행 중 활동 — 발행 시 갱신되도록 store 구독.
  useActivityStore((s) => s.active);

  const [mode, setMode] = useState<Mode>('hub');
  const [regionId, setRegionId] = useState<string | null>(null);
  const [destId, setDestId] = useState<string | null>(null);
  const [party, setParty] = useState<string[]>([]);

  const roster: Disciple[] = order.map((id) => disciples[id]).filter((d): d is Disciple => Boolean(d));
  const available = roster.filter(isAvailable);
  const region = regionId ? findGatherRegion(regionId) : undefined;
  const dest = destId ? findExpeditionDest(destId) : undefined;
  const partyDisciples = party.map((id) => disciples[id]).filter((d): d is Disciple => Boolean(d));
  const gatherGate = region ? canGather(region, partyDisciples) : { ok: false, reason: '지역을 고르세요.' };
  const expGate = dest ? canExpedition(dest, partyDisciples) : { ok: false, reason: '행선을 고르세요.' };
  const ongoing = activeActivityLabels();

  const toggle = (id: string) =>
    setParty((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const reset = () => {
    setRegionId(null);
    setDestId(null);
    setParty([]);
  };

  const onDispatchGather = async () => {
    if (!region || !gatherGate.ok) return;
    const ok = await confirm({
      title: '채집 파견',
      message: `${region.name}으로 ${partyDisciples.map((d) => d.name).join('·')}을(를) ${region.days}일간 보냅니다.`,
      confirmLabel: '보낸다',
    });
    if (ok && dispatchGather(region.id, party)) {
      reset();
      setMode('hub');
    }
  };

  const onDispatchExpedition = async () => {
    if (!dest || !expGate.ok) return;
    const ok = await confirm({
      title: '강호 출행',
      message: `${dest.name}으로 ${partyDisciples.map((d) => d.name).join('·')}을(를) ${dest.days}일간 내보냅니다. 무엇과 마주칠지는 강호의 뜻입니다.`,
      confirmLabel: '내보낸다',
    });
    if (ok && dispatchExpedition(dest.id, party)) {
      reset();
      setMode('hub');
    }
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <View style={styles.header}>
          <Pressable onPress={() => (mode === 'hub' ? router.back() : (reset(), setMode('hub')))} hitSlop={12}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{MODE_TITLE[mode]}</Text>
          <View style={styles.backSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* 진행 중 활동 */}
          {ongoing.length > 0 && (
            <View style={styles.section}>
              <SectionLabel>진행 중</SectionLabel>
              {ongoing.map((a) => (
                <View key={a.id} style={styles.ongoingRow}>
                  <Text style={styles.ongoingLabel}>{a.label}</Text>
                  <Text style={styles.ongoingDays}>남은 {a.remaining}일</Text>
                </View>
              ))}
            </View>
          )}

          {mode === 'hub' ? (
            <View style={styles.section}>
              <SectionLabel>제자에게 시킬 일</SectionLabel>
              <ActivityCard
                title="강호 출행"
                desc="경험을 쌓으러 잠시 강호로. 무엇과 마주칠지 모른다."
                onPress={() => setMode('expedition')}
              />
              <ActivityCard
                title="약초 채집"
                desc="지역에 따라 흔한 약초부터 신품 영초까지. 연단 재료 수급."
                onPress={() => setMode('gather')}
              />
              <ActivityCard
                title="영단 제작"
                desc="연단실에서 영약을 제조한다."
                onPress={() => router.push('/alchemy' as Href)}
              />
              <ActivityCard title="도구 제작" desc="무기·방어구를 벼린다." badge="준비 중" disabled />
            </View>
          ) : mode === 'gather' ? (
            <>
              {/* 지역 선택 */}
              <View style={styles.section}>
                <SectionLabel>채집 지역</SectionLabel>
                {GATHER_REGIONS.map((r) => {
                  const sel = r.id === regionId;
                  return (
                    <Pressable
                      key={r.id}
                      onPress={() => {
                        setRegionId(r.id);
                        setParty([]);
                      }}
                      style={[styles.regionRow, sel && styles.regionSel]}
                    >
                      <View style={styles.regionHead}>
                        <Text style={styles.regionName}>{r.name}</Text>
                        <Text style={styles.regionTier}>
                          {GATHER_TIER_LABEL[r.tier]} · {r.days}일
                        </Text>
                      </View>
                      <Text style={styles.regionPreview}>{r.preview}</Text>
                      <Text style={styles.regionMeta}>
                        재료: {r.drops.map((d) => MATERIAL_LABEL[d.id] ?? d.id).join(', ')}
                        {'  ·  '}
                        {r.needsCombatParty ? `전투원 필요 · 약지식 ${r.loreMin}+` : '혼자 가능'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* 파티 구성 */}
              {region && (
                <View style={styles.section}>
                  <SectionLabel>동행 (추천 {region.recommendedParty}명)</SectionLabel>
                  {available.length === 0 && <Text style={styles.empty}>보낼 수 있는 제자가 없습니다.</Text>}
                  {available.map((d) => {
                    const sel = party.includes(d.id);
                    return (
                      <Pressable key={d.id} onPress={() => toggle(d.id)} style={[styles.discRow, sel && styles.discSel]}>
                        <Text style={styles.discName}>
                          {sel ? '✓ ' : ''}
                          {d.name}
                        </Text>
                        <Text style={styles.discMeta}>약지식 {loreOf(d)}</Text>
                      </Pressable>
                    );
                  })}
                  {!gatherGate.ok && gatherGate.reason && <Text style={styles.reason}>{gatherGate.reason}</Text>}
                  <Pressable
                    onPress={onDispatchGather}
                    disabled={!gatherGate.ok}
                    style={[styles.dispatch, !gatherGate.ok && styles.dispatchOff]}
                  >
                    <Text style={styles.dispatchText}>채집 보내기</Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <>
              {/* 행선 선택 */}
              <View style={styles.section}>
                <SectionLabel>행선</SectionLabel>
                {EXPEDITION_DESTS.map((x) => {
                  const sel = x.id === destId;
                  return (
                    <Pressable
                      key={x.id}
                      onPress={() => {
                        setDestId(x.id);
                        setParty([]);
                      }}
                      style={[styles.regionRow, sel && styles.regionSel]}
                    >
                      <View style={styles.regionHead}>
                        <Text style={styles.regionName}>{x.name}</Text>
                        <Text style={styles.regionTier}>{x.days}일</Text>
                      </View>
                      <Text style={styles.regionPreview}>{x.preview}</Text>
                      <Text style={styles.regionMeta}>
                        {x.needsCombatParty ? '전투원 동행 권장' : '홀로도 무방'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* 동행 구성 */}
              {dest && (
                <View style={styles.section}>
                  <SectionLabel>동행 (추천 {dest.recommendedParty}명)</SectionLabel>
                  {available.length === 0 && <Text style={styles.empty}>보낼 수 있는 제자가 없습니다.</Text>}
                  {available.map((d) => {
                    const sel = party.includes(d.id);
                    return (
                      <Pressable key={d.id} onPress={() => toggle(d.id)} style={[styles.discRow, sel && styles.discSel]}>
                        <Text style={styles.discName}>
                          {sel ? '✓ ' : ''}
                          {d.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {!expGate.ok && expGate.reason && <Text style={styles.reason}>{expGate.reason}</Text>}
                  <Pressable
                    onPress={onDispatchExpedition}
                    disabled={!expGate.ok}
                    style={[styles.dispatch, !expGate.ok && styles.dispatchOff]}
                  >
                    <Text style={styles.dispatchText}>출행 보내기</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

function ActivityCard({
  title,
  desc,
  badge,
  disabled,
  onPress,
}: {
  title: string;
  desc: string;
  badge?: string;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.card, disabled && styles.cardOff, pressed && !disabled && styles.cardPressed]}
    >
      <View style={styles.cardHead}>
        <Text style={[styles.cardTitle, disabled && styles.cardTitleOff]}>{title}</Text>
        {badge ? <Text style={styles.badge}>{badge}</Text> : <Text style={styles.chevron}>›</Text>}
      </View>
      <Text style={styles.cardDesc}>{desc}</Text>
    </Pressable>
  );
}

const H2 = { fontFamily: typography.serifBold, fontSize: typography.sizes.lg } as const;
const H3 = { fontFamily: typography.serifBold, fontSize: typography.sizes.md } as const;
const BODY = { fontFamily: typography.serif, fontSize: typography.sizes.base } as const;
const CAPTION = { fontFamily: typography.serif, fontSize: typography.sizes.sm } as const;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  back: { fontFamily: typography.serifBold, fontSize: 28, color: colors.ink, width: 32 },
  backSpacer: { width: 32 },
  title: { ...H2, color: colors.ink },
  body: { padding: spacing.base, paddingBottom: spacing.xl, gap: spacing.lg },
  section: { gap: spacing.sm },

  ongoingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.paperDark,
  },
  ongoingLabel: { ...BODY, color: colors.ink },
  ongoingDays: { ...CAPTION, color: colors.inkSoft },

  // 그레이박스 — dashed 카드.
  card: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.xs,
  },
  cardOff: { opacity: 0.45 },
  cardPressed: { backgroundColor: colors.paperLight },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { ...H3, color: colors.ink },
  cardTitleOff: { color: colors.inkSoft },
  cardDesc: { ...CAPTION, color: colors.inkSoft },
  badge: { ...CAPTION, color: colors.inkSoft },
  chevron: { fontFamily: typography.serif, fontSize: 20, color: colors.inkSoft },

  regionRow: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.xs,
  },
  regionSel: { borderStyle: 'solid', borderColor: colors.ink, backgroundColor: colors.paperLight },
  regionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  regionName: { ...H3, color: colors.ink },
  regionTier: { ...CAPTION, color: colors.inkSoft },
  regionPreview: { ...CAPTION, color: colors.inkSoft },
  regionMeta: { ...CAPTION, color: colors.inkSoft },

  discRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.inkSoft,
  },
  discSel: { borderColor: colors.ink, backgroundColor: colors.paperLight },
  discName: { ...BODY, color: colors.ink },
  discMeta: { ...CAPTION, color: colors.inkSoft },
  empty: { ...CAPTION, color: colors.inkSoft },
  reason: { ...CAPTION, color: colors.red },

  dispatch: {
    marginTop: spacing.sm,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
  },
  dispatchOff: { opacity: 0.4 },
  dispatchText: { ...BODY, color: colors.paperLight },
});
