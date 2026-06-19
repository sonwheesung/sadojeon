// react-native 스텁(헤드리스 sim) — 폴리필·스토어가 가져가는 이름만 no-op 제공.
export const Platform = { OS: 'web', select: (o: any) => o.web ?? o.default };
export const NativeModules: Record<string, unknown> = {};
export const TurboModuleRegistry = { get: () => null, getEnforcing: () => null };
export class NativeEventEmitter { addListener() { return { remove() {} }; } removeAllListeners() {} }
export const Dimensions = { get: () => ({ width: 390, height: 844 }) };
export const StyleSheet = { create: (s: any) => s, flatten: (s: any) => s };
export const BackHandler = { addEventListener: () => ({ remove() {} }), removeEventListener: () => {} };
export default {};
