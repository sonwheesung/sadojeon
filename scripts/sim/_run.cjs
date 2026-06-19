// 헤드리스 sim 러너 — RN/AsyncStorage/expo 스텁 alias 로 esbuild 번들 후 Node 실행.
// questSystem 처럼 (전이 의존으로) react-native 를 끌어오는 시스템을 헤드리스에서 돌릴 때 쓴다.
// 순수 게임 로직만 — Supabase 미번들(스텁), 결정적 시드(seedAmbient)로 자가완결 회귀.
// 사용: node scripts/sim/_run.cjs scripts/sim/<name>.ts
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '../..');

const entry = process.argv[2];
if (!entry) { console.error('usage: node scripts/sim/_run.cjs <sim.ts>'); process.exit(1); }

const stubs = path.join(__dirname, '_stubs');
const outfile = path.join(__dirname, `_run.${process.pid}.cjs`);
process.on('exit', () => { try { fs.unlinkSync(outfile); } catch {} });

esbuild.build({
  entryPoints: [path.resolve(root, entry)],
  bundle: true, platform: 'node', format: 'cjs', outfile,
  alias: {
    'react-native': path.join(stubs, 'rn.ts'),
    '@react-native-async-storage/async-storage': path.join(stubs, 'async-storage.ts'),
    'expo-file-system': path.join(stubs, 'expo-fs.ts'),
    'react-native-url-polyfill/auto': path.join(stubs, 'empty.ts'),
    '@/lib/supabase': path.join(stubs, 'supabase.ts'),
  },
  external: ['react-native-executorch', 'react-native-executorch-expo-resource-fetcher'],
  tsconfig: path.join(root, 'tsconfig.json'),
  define: { __DEV__: 'false' },
  logLevel: 'error',
}).then(() => { require(outfile); }).catch((e) => { console.error('build fail', e.message || e); process.exit(1); });
