import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { triggerTutorial } from '@/systems/tutorialSystem';

// 화면을 처음 펼쳤을 때 그 주제의 맥락형 안내를 띄운다(계정 1회). docs/44.
// 포커스 시점이라 탭이 미리 마운트돼도 실제로 그 화면을 볼 때만 발화. triggerTutorial 이
// 멱등(본 주제·다른 안내 표시중이면 무시)이라 재포커스에 안전.
export function useTutorialOnFocus(key: string): void {
  useFocusEffect(
    useCallback(() => {
      triggerTutorial(key);
    }, [key]),
  );
}
