// 전역 mock — 실제 스토어를 import 하는 테스트(블롭 슬라이스 등)가 AsyncStorage 네이티브를 안 타게.
// 라이브러리 공식 jest mock 재노출(인메모리 구현). zustand persist 가 이걸 StateStorage 로 사용.
module.exports = require('@react-native-async-storage/async-storage/jest/async-storage-mock');
