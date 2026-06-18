// OTA 업데이트 — EAS Update(expo-updates)로 스토어 심사 없이 JS/에셋 번들 무선 갱신. docs/11·31.
// 진입 시 새 업데이트가 있으면 받아서 즉시 리로드(앱 재시작). 네이티브 변경은 OTA 불가 →
// 그건 강제 업데이트 게이트(versionGate)가 스토어로 보낸다. 둘이 분담:
//   · OTA(expo-updates)   = 같은 앱 버전 내 JS 수정(버그픽스·콘텐츠) 즉시 배포(runtimeVersion=appVersion).
//   · 강제 업데이트(스토어) = 네이티브/최소버전 상향 — 새 빌드 필요.
// **release 빌드에서만 동작** — 개발/Expo Go 에선 Updates.isEnabled=false → 무동작(가드).

import * as Updates from 'expo-updates';

// 새 OTA 업데이트가 있으면 받아서 리로드. 있으면 true(리로드되어 이후 코드 미도달).
// 실패·미지원·없음 → false(조용히 통과). 진입 부트에서 await.
export async function applyOtaIfAvailable(): Promise<boolean> {
  if (!Updates.isEnabled) return false; // 개발/Expo Go — OTA 비활성
  try {
    const res = await Updates.checkForUpdateAsync();
    if (!res.isAvailable) return false;
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync(); // 새 번들로 재시작 — 여기서 멈춤
    return true;
  } catch {
    return false; // 네트워크·서버 오류 → 현재 번들로 계속(fail-open)
  }
}
