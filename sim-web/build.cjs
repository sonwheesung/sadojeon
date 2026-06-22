// 엔진 테스트 콘솔(PC 브라우저) 번들 — 순수 게임 엔진(전투 등)을 브라우저용으로 esbuild 번들.
// RN·네이티브 의존은 스텁(balance-sim 하니스와 동일 전략). 백엔드 불필요 — index.html 을 그냥 열면 됨.
// 실행: node sim-web/build.cjs        (1회 빌드 → dist/bundle.js)
//      node sim-web/build.cjs --watch (자동 재빌드)
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const root = path.resolve(__dirname, '..');
const stubs = path.join(root, '.claude/skills/balance-sim/_stubs');

// .env(.development) 의 공개 키(EXPO_PUBLIC_*)를 읽어 번들에 주입 — 의뢰 등 스토어 그래프가 supabase 를
// import 하는데 빈 URL 이면 createClient 가 throw 한다. anon 키는 공개 키(앱에도 박힘)라 콘솔 번들에 넣어도 안전.
// 콘솔은 로컬 스토어만 쓰고 자동저장 OFF — 실제 DB 에 쓰지 않는다.
function loadPublicEnv() {
  const out = {};
  for (const name of ['.env.development', '.env']) {
    const p = path.join(root, name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*(EXPO_PUBLIC_[A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && out[m[1]] === undefined) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return out;
}
const env = loadPublicEnv();
const envDefine = {};
for (const [k, v] of Object.entries(env)) envDefine[`process.env.${k}`] = JSON.stringify(v);

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
  define: { __DEV__: 'false', 'process.env.NODE_ENV': '"production"', ...envDefine },
  // 브라우저엔 process 가 없다 — realm.ts 등이 process.env.EXT_SCALE/DAEOH_SCALE 를 모듈 로드 때 읽어
  // ReferenceError 로 전 번들이 죽는다. 빈 env 셰임 주입(정의된 EXPO_PUBLIC_*·NODE_ENV 는 define 이 우선 치환).
  banner: { js: 'globalThis.process||(globalThis.process={env:{}});' },
  logLevel: 'info',
};

const port = Number((process.argv.find((a) => a.startsWith('--port=')) || '').split('=')[1]) || 5050;

if (process.argv.includes('--serve')) {
  // 빌드(+자동 재빌드) 후 **평범한 정적 HTTP 서버를 0.0.0.0 에 바인딩** — esbuild 내장 serve 는
  // 타임스케일/셀룰러에서 안 붙는 경우가 있어(ERR_NETWORK_CHANGED·무한 대기). Expo dev 서버처럼
  // 모든 인터페이스에 직접 listen 해서 폰(타임스케일/와이파이)에서도 접속되게.
  const http = require('http');
  const fs = require('fs');
  const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };
  esbuild.context(opts).then(async (ctx) => {
    await ctx.watch(); // 소스 변경 시 dist/bundle.js 재빌드
    http.createServer((req, res) => {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p === '/' || p === '') p = '/index.html';
      const file = path.join(__dirname, p);
      if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end('forbidden'); }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
        res.end(buf);
      });
    }).listen(port, '0.0.0.0', () => {
      console.log(`\n  엔진 테스트 콘솔 ▶  http://localhost:${port}/   (폰: http://<PC IP>:${port}/)\n  0.0.0.0:${port} 바인딩 — 타임스케일/와이파이 접속 가능 · Ctrl+C 종료\n`);
    });
  }).catch((e) => { console.error(e.message || e); process.exit(1); });
} else if (process.argv.includes('--watch')) {
  esbuild.context(opts).then((ctx) => ctx.watch().then(() => console.log('watching… (sim-web/index.html 열어 사용)')));
} else {
  esbuild.build(opts).then(() => console.log('빌드 완료 → sim-web/index.html 을 브라우저로 열어줘')).catch(() => process.exit(1));
}
