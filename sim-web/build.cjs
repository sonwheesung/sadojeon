// 엔진 테스트 콘솔(PC 브라우저) 번들 — 순수 게임 엔진(전투 등)을 브라우저용으로 esbuild 번들.
// RN·네이티브 의존은 스텁(balance-sim 하니스와 동일 전략). 백엔드 불필요 — index.html 을 그냥 열면 됨.
// 실행: node sim-web/build.cjs        (1회 빌드 → dist/bundle.js)
//      node sim-web/build.cjs --watch (자동 재빌드)
const esbuild = require('esbuild');
const path = require('path');
const root = path.resolve(__dirname, '..');
const stubs = path.join(root, '.claude/skills/balance-sim/_stubs');

const opts = {
  entryPoints: [path.join(__dirname, 'main.ts')],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  outfile: path.join(__dirname, 'dist/bundle.js'),
  // 브라우저엔 RN·네이티브가 없다 — 전부 no-op 스텁으로(엔진은 순수 TS라 실제로 안 씀).
  alias: {
    'react-native': path.join(stubs, 'empty.ts'),
    '@react-native-async-storage/async-storage': path.join(stubs, 'async-storage.ts'),
    'expo-file-system': path.join(stubs, 'expo-fs.ts'),
    'react-native-url-polyfill/auto': path.join(stubs, 'empty.ts'),
    'react-native-executorch': path.join(stubs, 'empty.ts'),
    'react-native-executorch-expo-resource-fetcher': path.join(stubs, 'empty.ts'),
  },
  tsconfig: path.join(root, 'tsconfig.json'), // @ 경로 별칭 해석
  define: { __DEV__: 'false' },
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  esbuild.context(opts).then((ctx) => ctx.watch().then(() => console.log('watching… (sim-web/index.html 열어 사용)')));
} else {
  esbuild.build(opts).then(() => console.log('빌드 완료 → sim-web/index.html 을 브라우저로 열어줘')).catch(() => process.exit(1));
}
