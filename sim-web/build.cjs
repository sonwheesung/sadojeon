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
