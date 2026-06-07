// esbuild 번들 — RN/AsyncStorage 스텁 + runSync·supabase 스텁 + executorch external → Node 실행.
const esbuild = require('esbuild');
const path = require('path');
const root = path.resolve(__dirname, '../../..');
const stubPlugin = {
  name: 'stub',
  setup(build) {
    build.onResolve({ filter: /(^|\/)runSync$/ }, (a) => ({ path: a.path, namespace: 'stub-rs' }));
    build.onLoad({ filter: /.*/, namespace: 'stub-rs' }, () => ({
      contents: 'export function saveCurrentRunSilently(){}; export function saveCurrentRun(){return Promise.resolve()}; export default {};',
      loader: 'js',
    }));
    build.onResolve({ filter: /\/lib\/supabase$/ }, (a) => ({ path: a.path, namespace: 'stub-sb' }));
    build.onLoad({ filter: /.*/, namespace: 'stub-sb' }, () => ({
      contents: 'const noop=new Proxy(function(){},{get:()=>noop,apply:()=>Promise.resolve({data:null,error:null})}); export const supabase=noop; export default noop;',
      loader: 'js',
    }));
  },
};
esbuild.build({
  entryPoints: [path.join(__dirname, 'headless.ts')],
  bundle: true, platform: 'node', format: 'cjs',
  outfile: path.join(__dirname, '_headless.cjs'),
  alias: {
    'react-native': path.join(__dirname, '_stubs/empty.ts'),
    '@react-native-async-storage/async-storage': path.join(__dirname, '_stubs/async-storage.ts'),
    'expo-file-system': path.join(__dirname, '_stubs/expo-fs.ts'),
  },
  external: ['react-native-executorch', 'react-native-executorch-expo-resource-fetcher'],
  plugins: [stubPlugin],
  tsconfig: path.join(root, 'tsconfig.json'),
  define: { __DEV__: 'false' },
  logLevel: 'error',
}).then(() => { require('./_headless.cjs'); }).catch((e) => { console.error('build fail', e.message || e); process.exit(1); });
