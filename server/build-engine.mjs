// 서버 엔진 번들 — RN 의존 엔진(src/engine/serverEngine.ts)을 RN 스텁으로 묶어
// Node/Vercel 에서 그대로 돌아가는 단일 ESM(dist/engine.mjs)으로 만든다.
// 헤드리스 시뮬과 동일한 스텁(_stubs) 재사용 — 같은 방식이 이미 실엔진을 Node 구동 중.
// 실행: node server/build-engine.mjs  (Vercel build 단계에서 호출)
import * as esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const stubs = path.join(root, '.claude/skills/balance-sim/_stubs');

await esbuild.build({
  entryPoints: [path.join(root, 'src/engine/serverEngine.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: path.join(here, 'dist/engine.mjs'),
  alias: {
    'react-native': path.join(stubs, 'empty.ts'),
    '@react-native-async-storage/async-storage': path.join(stubs, 'async-storage.ts'),
    'expo-file-system': path.join(stubs, 'expo-fs.ts'),
    'react-native-url-polyfill/auto': path.join(stubs, 'empty.ts'),
    // 엔진은 DB 비접근 — supabase 클라를 빈 스텁으로(로드 시 클라 생성 회피, 영속은 핸들러).
    '@/lib/supabase': path.join(here, '_stubs/supabase.ts'),
  },
  // 온디바이스 LLM·Supabase 클라는 번들 제외(서버 함수가 자체 보유). __DEV__ 상수화.
  external: [
    'react-native-executorch',
    'react-native-executorch-expo-resource-fetcher',
    '@supabase/supabase-js',
  ],
  tsconfig: path.join(root, 'tsconfig.json'),
  define: { __DEV__: 'false' },
  logLevel: 'info',
});
console.log('✓ server/dist/engine.mjs 생성 — RN-free 엔진 번들');
