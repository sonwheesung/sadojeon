// Metro 설정 — Expo 기본 + 테스트 파일 번들 제외(R41, docs/37).
// expo-router 의 require.context 가 app/ 전체를 라우트로 글롭하는데 .test/.spec 를 제외하지 않아,
// app/ 에 동거하는 테스트 파일(node 전용 deps: @testing-library/react-native 등)이 앱 번들에 끌려
// 들어가 번들을 깬다. blockList 로 번들에서만 제외한다(jest 는 metro 를 안 써 테스트 발견에 무영향).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const existingBlock = config.resolver.blockList;
const testBlocks = [/\.(test|spec)\.[jt]sx?$/, /[/\\]__tests__[/\\]/];
config.resolver.blockList = Array.isArray(existingBlock)
  ? [...existingBlock, ...testBlocks]
  : existingBlock
    ? [existingBlock, ...testBlocks]
    : testBlocks;

module.exports = config;
