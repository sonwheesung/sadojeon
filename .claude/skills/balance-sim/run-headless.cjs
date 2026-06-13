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

// 번들 출력은 **프로세스별 고유 경로**(_headless.<pid>.cjs) — 같은 폴더에 여러 sweep 를
// 동시에 돌려도 번들 파일을 놓고 경쟁(race → "Unexpected end of input")하지 않게. 2026-06-13.
// (external 모듈 resolution 이 프로젝트 node_modules 를 타도록 위치는 __dirname 유지, tmpdir X.)
const outfile = path.join(__dirname, `_headless.${process.pid}.cjs`);
const cleanup = () => { try { fs.unlinkSync(outfile); } catch {} };
process.on('exit', cleanup);

esbuild.build({
  entryPoints: [path.join(__dirname, 'headless.ts')],
  bundle: true, platform: 'node', format: 'cjs',
  outfile,
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
}).then(() => { require(outfile); }).catch((e) => { console.error('build fail', e.message || e); process.exit(1); });
