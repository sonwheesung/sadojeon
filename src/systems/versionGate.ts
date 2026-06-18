// 버전 게이트 — 게임 진입 시 서버(app_settings)에서 최소 버전을 조회해 강제 업데이트 판정. docs/11.
// 앱 버전 < 최소 버전이면 차단(업데이트 유도). 조회 실패는 **fail-open**(서버 장애가 전원 잠금 되면 안 됨).
// 설정 출처: Supabase public.app_settings(key-value, 공개 읽기) — min_version_ios/aos·store_url_ios/aos.

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// 현재 앱 버전(app.json expo.version).
export function currentAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

// semver "a.b.c" 비교 — a<b:-1 / 같음:0 / a>b:1. 누락 자리는 0, 숫자 외는 0 취급.
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

export interface UpdateCheck {
  required: boolean; //     강제 업데이트 필요(현재 < 최소)
  storeUrl: string | null; // 플랫폼별 스토어 URL
  minVersion: string | null;
  current: string;
}

// 서버 조회 → 현재 버전과 비교. 플랫폼(iOS/Android)별 키. 실패 시 막지 않음(fail-open).
export async function checkForUpdate(): Promise<UpdateCheck> {
  const current = currentAppVersion();
  const ios = Platform.OS === 'ios';
  const minKey = ios ? 'min_version_ios' : 'min_version_aos';
  const urlKey = ios ? 'store_url_ios' : 'store_url_aos';
  const open: UpdateCheck = { required: false, storeUrl: null, minVersion: null, current };
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', [minKey, urlKey]);
    if (error || !data) return open;
    const map: Record<string, string> = {};
    for (const row of data as { key: string; value: string }[]) map[row.key] = row.value;
    const minVersion = map[minKey] ?? null;
    const storeUrl = map[urlKey] ?? null;
    const required = minVersion != null && compareVersions(current, minVersion) < 0;
    return { required, storeUrl, minVersion, current };
  } catch {
    return open; // 네트워크·서버 오류 → 막지 않음
  }
}
