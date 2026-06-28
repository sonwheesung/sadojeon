import { useCallback, useEffect, useRef } from 'react';
import type { View } from 'react-native';

import { registerSpotlightTarget, unregisterSpotlightTarget, type Rect } from '@/systems/spotlightTargets';

// 스포트라이트가 가리킬 요소에 부착하는 ref. docs/44.
// 사용: const ref = useSpotlightTarget('progress');  <Pressable ref={ref} ... />
// 스포트라이트가 그 단계를 띄울 때 measureInWindow 로 현재 화면 좌표를 읽어 그 사각만 비춘다.
export function useSpotlightTarget(id: string) {
  const ref = useRef<View | null>(null);

  const measure = useCallback(
    (): Promise<Rect | null> =>
      new Promise((resolve) => {
        const node = ref.current;
        if (!node || typeof node.measureInWindow !== 'function') {
          resolve(null);
          return;
        }
        node.measureInWindow((x, y, width, height) => {
          if (!width && !height) resolve(null);
          else resolve({ x, y, width, height });
        });
      }),
    [],
  );

  useEffect(() => {
    registerSpotlightTarget(id, measure);
    return () => unregisterSpotlightTarget(id, measure);
  }, [id, measure]);

  return ref;
}
