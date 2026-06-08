import { router } from 'expo-router';
import { useReducer } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import {
  ELIXIR_RECIPES,
  MATERIAL_LABEL,
  findElixirRecipe,
  type ElixirRecipe,
} from '@/data/elixirs';
import {
  ALCHEMY_LAB_BUILD_COST,
  buildAlchemyLab,
  canCraft,
  consumeInternalElixir,
  hasAlchemyLab,
  hasLearned,
  isLabOperational,
  learnRecipe,
  listActiveCrafts,
  listMaterials,
  sellElixir,
  startCraft,
} from '@/systems/alchemySystem';
import { healWound, listWounded, treatableElixirsFor, woundLabel } from '@/systems/woundSystem';
import { consumeAnsinElixir, hasAnsinElixir } from '@/systems/simmaSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useItemStore } from '@/stores/itemStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple } from '@/types';
import { colors, radius, spacing, typography } from '@/theme';

// 연단실 — 영약 제조 화면(그레이박스). 사문 탭 → 연단실 진입.
// 연단실 건설 → 비급 학습 → 재료로 제조(제자 점유) → 보유 영단 복용/판매. docs/04·28.
// 연단 상태는 모듈 상태라 행동 후 force() 로 새로고침(추후 store 영속).

const CATEGORY_LABEL: Record<ElixirRecipe['category'], string> = {
  heal: '치료',
  internal: '내공',
  mind: '심마',
  utility: '유틸',
};

function coin(copper: number): string {
  const g = Math.floor(copper / 1000);
  const s = Math.floor((copper - g * 1000) / 100);
  const c = copper - g * 1000 - s * 100;
  return [g ? `${g}금` : '', s ? `${s}은` : '', c || (!g && !s) ? `${c}동` : ''].filter(Boolean).join(' ');
}

export default function AlchemyScreen() {
  const confirm = useConfirm();
  const [, force] = useReducer((x: number) => x + 1, 0);

  const resources = useSectStore((s) => s.sect?.resources ?? 0);
  const items = useItemStore((s) => s.items);
  const order = useDiscipleStore((s) => s.order);
  const disciples = useDiscipleStore((s) => s.disciples);
  const today = useTimeStore((s) => s.totalDay);

  const built = hasAlchemyLab();
  const operational = isLabOperational();
  const crafts = listActiveCrafts();
  const mats = listMaterials();
  const roster: Disciple[] = order.map((id) => disciples[id]).filter((d): d is Disciple => Boolean(d));
  const idleAlchemists = roster
    .filter((d) => d.status === 'training')
    .sort((a, b) => (b.stats?.alchemy?.level ?? 0) - (a.stats?.alchemy?.level ?? 0));
  const elixirs = items.filter((i) => i.category === 'elixir');
  const wounded = listWounded();

  const onBuild = async () => {
    if (resources < ALCHEMY_LAB_BUILD_COST) return;
    const ok = await confirm({
      title: '연단실 건설',
      message: `자금 ${coin(ALCHEMY_LAB_BUILD_COST)}을 들여 연단실을 엽니다. 매월 유지비가 듭니다.`,
      confirmLabel: '건설',
    });
    if (ok && buildAlchemyLab()) force();
  };

  const onLearn = (recipe: ElixirRecipe) => async () => {
    const ok = await confirm({
      title: '연단 비급 학습',
      message: `${recipe.name} 제조법을 익힙니다. (요구 약초학 Lv ${recipe.alchemyReq})`,
      confirmLabel: '학습',
    });
    if (ok) {
      learnRecipe(recipe.id);
      force();
    }
  };

  const onCraft = (recipe: ElixirRecipe) => async () => {
    const crafter = idleAlchemists.find((d) => canCraft(d.id, recipe.id));
    if (!crafter) return;
    const ok = await confirm({
      title: '연단 시작',
      message: `${crafter.name}이(가) ${recipe.name}을(를) ${recipe.craftDays}일간 연단합니다. 그동안 다른 일은 못 합니다.`,
      confirmLabel: '연단',
    });
    if (ok && startCraft(crafter.id, recipe.id)) force();
  };

  const onSell = (recipeId: string, name: string) => async () => {
    const ok = await confirm({ title: '영단 판매', message: `${name} 1과를 마을에 팝니다.`, confirmLabel: '판매' });
    if (ok) {
      sellElixir(recipeId, 1);
      force();
    }
  };

  const onTreat = (discipleId: string, name: string, recipeId: string, elixirName: string) => async () => {
    const ok = await confirm({
      title: '상처 치료',
      message: `${name}의 상처에 ${elixirName}을(를) 씁니다.`,
      confirmLabel: '치료',
    });
    if (ok && healWound(discipleId, recipeId)) force();
  };

  const onCalm = (discipleId: string, name: string) => async () => {
    const ok = await confirm({
      title: '심신 안정',
      message: `${name}에게 안신단을 써 심마를 가라앉히고 내상을 다스립니다.`,
      confirmLabel: '복용',
    });
    if (ok && consumeAnsinElixir(discipleId)) force();
  };

  const onConsume = (recipeId: string, name: string) => async () => {
    // 내공단 — 흡수 중 아닌 제자 중 경지 낮은 순(가장 도움 필요)으로 복용.
    const target = roster
      .filter((d) => d.status === 'training' && !d.elixirAbsorb)
      .sort((a, b) => (a.realmProgress?.internal ?? 0) - (b.realmProgress?.internal ?? 0))[0];
    if (!target) return;
    const ok = await confirm({
      title: '내공단 복용',
      message: `${target.name}이(가) ${name}을(를) 복용해 흡수에 들어갑니다(흡수 중 다른 영단 복용 불가).`,
      confirmLabel: '복용',
    });
    if (ok && consumeInternalElixir(target.id, recipeId)) force();
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header />
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {/* 연단실 상태 */}
          <SectionLabel>연단실</SectionLabel>
          <View style={styles.panel}>
            {!built ? (
              <View style={styles.row}>
                <Text style={styles.dim}>아직 연단실이 없습니다.</Text>
                <Pressable
                  onPress={onBuild}
                  disabled={resources < ALCHEMY_LAB_BUILD_COST}
                  style={({ pressed }) => [styles.btn, resources < ALCHEMY_LAB_BUILD_COST && styles.btnOff, pressed && styles.pressed]}
                >
                  <Text style={styles.btnLabel}>건설 ({coin(ALCHEMY_LAB_BUILD_COST)})</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.dim}>
                연단실 가동 {operational ? '○ (유지비 납부중)' : '✕ (유지비 미납 — 자금 부족, 제조 정지)'} · 자금 {coin(resources)}
              </Text>
            )}
          </View>

          {/* 진행 중 연단 */}
          {crafts.length > 0 && (
            <>
              <SectionLabel>연단 중</SectionLabel>
              <View style={styles.panel}>
                {crafts.map((c) => {
                  const r = findElixirRecipe(c.recipeId);
                  const left = Math.max(0, c.until - today);
                  return (
                    <Text key={c.discipleId} style={styles.line}>
                      {disciples[c.discipleId]?.name ?? '?'} — {r?.name ?? c.recipeId} (남은 {left}일)
                    </Text>
                  );
                })}
              </View>
            </>
          )}

          {/* 상처 치료 — 다친 제자 + 매칭 영약(속성·등급)으로 치료 */}
          {wounded.length > 0 && (
            <>
              <SectionLabel>상처 치료</SectionLabel>
              <View style={styles.panel}>
                {wounded.map((d) => {
                  const wound = d.wound!;
                  // 내상(주화입마 후유)은 안신단(심신 안정)으로만 다스린다. 그 외 속성 상처는 매칭 치료약.
                  const isInner = wound.type === 'inner';
                  const salves = isInner ? [] : treatableElixirsFor(wound);
                  const ansin = isInner && hasAnsinElixir();
                  const noCure = salves.length === 0 && !ansin;
                  return (
                    <View key={d.id} style={styles.woundRow}>
                      <View style={styles.woundInfo}>
                        <Text style={styles.line}>
                          {d.name} — <Text style={styles.woundTag}>{woundLabel(wound)}</Text>
                        </Text>
                        <Text style={styles.recipeMeta}>
                          자연 치유 {wound.daysRemaining}일 남음
                          {noCure ? ' · 맞는 영약 없음(자연 치유 대기)' : ''}
                        </Text>
                      </View>
                      <View style={styles.elixirBtns}>
                        {salves.map((r) => (
                          <Pressable
                            key={r.id}
                            onPress={onTreat(d.id, d.name, r.id, r.name)}
                            style={({ pressed }) => [styles.btnSm, styles.btnCraft, pressed && styles.pressed]}
                          >
                            <Text style={[styles.btnSmLabel, styles.btnCraftLabel]}>{r.name}</Text>
                          </Pressable>
                        ))}
                        {ansin && (
                          <Pressable
                            onPress={onCalm(d.id, d.name)}
                            style={({ pressed }) => [styles.btnSm, styles.btnCraft, pressed && styles.pressed]}
                          >
                            <Text style={[styles.btnSmLabel, styles.btnCraftLabel]}>안신단</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* 보유 재료 */}
          <SectionLabel>재료(약초)</SectionLabel>
          <View style={styles.panel}>
            {mats.length === 0 ? (
              <Text style={styles.dim}>모은 약초가 없습니다. 의뢰(약초채집·의술) 중 채집하거나 마을에서 삽니다.</Text>
            ) : (
              <Text style={styles.line}>{mats.map((m) => `${MATERIAL_LABEL[m.id] ?? m.id} ×${m.qty}`).join('  ·  ')}</Text>
            )}
          </View>

          {/* 연단 비급 */}
          <SectionLabel>연단 비급 (배운 것만 제조)</SectionLabel>
          {ELIXIR_RECIPES.map((r) => {
            const learned = hasLearned(r.id);
            const craftable = built && idleAlchemists.some((d) => canCraft(d.id, r.id));
            const matsText = r.materials.map((m) => `${MATERIAL_LABEL[m.id] ?? m.id}×${m.qty}`).join(', ');
            return (
              <View key={r.id} style={styles.recipe}>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>
                    {r.name} <Text style={styles.tag}>[{CATEGORY_LABEL[r.category]}{r.grade ? ` ${r.grade}등급` : ''}]</Text>
                  </Text>
                  <Text style={styles.recipeMeta}>
                    약초학 Lv{r.alchemyReq} · {r.craftDays}일 · {matsText}
                  </Text>
                  <Text style={styles.recipeEffect}>{r.effect}</Text>
                </View>
                {!learned ? (
                  <Pressable onPress={onLearn(r)} style={({ pressed }) => [styles.btnSm, pressed && styles.pressed]}>
                    <Text style={styles.btnSmLabel}>학습</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={onCraft(r)}
                    disabled={!craftable}
                    style={({ pressed }) => [styles.btnSm, styles.btnCraft, !craftable && styles.btnOff, pressed && styles.pressed]}
                  >
                    <Text style={[styles.btnSmLabel, styles.btnCraftLabel]}>연단</Text>
                  </Pressable>
                )}
              </View>
            );
          })}

          {/* 보유 영단 */}
          <SectionLabel>보유 영단</SectionLabel>
          <View style={styles.panel}>
            {elixirs.length === 0 ? (
              <Text style={styles.dim}>만든 영단이 없습니다.</Text>
            ) : (
              elixirs.map((it) => {
                const r = findElixirRecipe(it.id);
                const isInternal = r?.category === 'internal';
                return (
                  <View key={it.id} style={styles.elixirRow}>
                    <Text style={styles.line}>
                      {it.name} ×{it.count}
                    </Text>
                    <View style={styles.elixirBtns}>
                      {isInternal && (
                        <Pressable onPress={onConsume(it.id, it.name)} style={({ pressed }) => [styles.btnSm, styles.btnCraft, pressed && styles.pressed]}>
                          <Text style={[styles.btnSmLabel, styles.btnCraftLabel]}>복용</Text>
                        </Pressable>
                      )}
                      <Pressable onPress={onSell(it.id, it.name)} style={({ pressed }) => [styles.btnSm, pressed && styles.pressed]}>
                        <Text style={styles.btnSmLabel}>판매</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable style={styles.back} hitSlop={8} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="뒤로">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>연단실</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontFamily: typography.serifBold, fontSize: typography.sizes.lg, color: colors.ink },
  title: { flex: 1, textAlign: 'center', fontFamily: typography.serifBold, fontSize: typography.sizes.md, color: colors.ink, letterSpacing: typography.letterSpacing.wide },
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.xs },
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 4,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  dim: { flex: 1, fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  line: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.ink },
  recipe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  recipeInfo: { flex: 1, gap: 2 },
  recipeName: { fontFamily: typography.serifBold, fontSize: typography.sizes.sm, color: colors.ink },
  tag: { fontFamily: typography.serif, fontSize: 10, color: colors.seal },
  recipeMeta: { fontFamily: typography.serif, fontSize: 10, color: colors.inkSoft },
  recipeEffect: { fontFamily: typography.serif, fontSize: 10, color: colors.inkLight },
  elixirRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  elixirBtns: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
  woundRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  woundInfo: { flex: 1, gap: 2 },
  woundTag: { fontFamily: typography.serifBold, color: colors.seal },
  btn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.sm,
    backgroundColor: colors.paperBright,
  },
  btnLabel: { fontFamily: typography.serifBold, fontSize: typography.sizes.xs, color: colors.seal },
  btnSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
    minWidth: 48,
    alignItems: 'center',
  },
  btnSmLabel: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.ink },
  btnCraft: { borderStyle: 'solid', borderColor: colors.seal, backgroundColor: colors.paperBright },
  btnCraftLabel: { fontFamily: typography.serifBold, color: colors.seal },
  btnOff: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});
