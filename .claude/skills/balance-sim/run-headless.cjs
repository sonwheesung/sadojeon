// esbuild 번들 — RN/AsyncStorage 스텁 + executorch external → Node 실행.
// supabase·runSync 는 **실제**로 번들(스텁 아님) → 실제 Supabase에 영속.
// .env(.development) 를 process.env 에 주입(supabase.ts 가 런타임에 읽음). url-polyfill 은
// Node 네이티브 URL 로 충분하므로 no-op alias.
const fs = require('fs');
const esbuild = require('esbuild');
const path = require('path');
const root = path.resolve(__dirname, '../../..');

// ── .env 로드 (development 우선, 없으면 .env) → process.env 주입 ──
function loadEnv() {
  for (const name of ['.env.development', '.env']) {
    const p = path.join(root, name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].replace(/^["']|["']$/g, '');
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}
loadEnv();
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.error('EXPO_PUBLIC_SUPABASE_URL 미설정 — .env.development 확인');
  process.exit(1);
}

esbuild.build({
  entryPoints: [path.join(__dirname, 'headless.ts')],
  bundle: true, platform: 'node', format: 'cjs',
  outfile: path.join(__dirname, '_headless.cjs'),
  alias: {
    'react-native': path.join(__dirname, '_stubs/empty.ts'),
    '@react-native-async-storage/async-storage': path.join(__dirname, '_stubs/async-storage.ts'),
    'expo-file-system': path.join(__dirname, '_stubs/expo-fs.ts'),
    // Node 네이티브 URL/URLSearchParams 로 충분 — RN 폴리필 제거(RN 내부 의존 회피).
    'react-native-url-polyfill/auto': path.join(__dirname, '_stubs/empty.ts'),
  },
  external: ['react-native-executorch', 'react-native-executorch-expo-resource-fetcher'],
  tsconfig: path.join(root, 'tsconfig.json'),
  define: { __DEV__: 'false' },
  logLevel: 'error',
}).then(() => { require('./_headless.cjs'); }).catch((e) => { console.error('build fail', e.message || e); process.exit(1); });
