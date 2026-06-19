import { StyleSheet, Text, View } from 'react-native';

import { QUEST_GRADE_RISK } from '@/data/quests';
import { colors, typography } from '@/theme';
import type { QuestGrade } from '@/types';

// 의뢰 위험 마크 — 숫자(정확 확률)·역량 노출 없이 색상+텍스트로 위험 종류만 표기.
// feedback_hidden_game_state: 사부가 관찰 가능한 "이 일이 얼마나 위험한가"만. 부상(주의)·치명상(위험)·사망(치명) 3단.
// 색은 양피지 팔레트 일관 톤 — gold(주의)→seal(위험)→sealDark(치명). docs/28 §4.
const MARKS: { key: 'injury' | 'critical' | 'death'; label: string; color: string }[] = [
  { key: 'injury', label: '부상', color: colors.gold },
  { key: 'critical', label: '치명상', color: colors.seal },
  { key: 'death', label: '사망', color: colors.sealDark },
];

export function QuestRiskMarks({ grade }: { grade: QuestGrade }) {
  const risk = QUEST_GRADE_RISK[grade];
  const active = MARKS.filter((m) => risk[m.key]);
  return (
    <View style={styles.row}>
      {active.length === 0 ? (
        <Text style={[styles.mark, { color: colors.green }]}>● 안전</Text>
      ) : (
        active.map((m) => (
          <Text key={m.key} style={[styles.mark, { color: m.color }]}>
            ● {m.label}
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  mark: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs },
});
