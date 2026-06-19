// react-native 스텁 — 폴리필이 가져가는 이름만 no-op 제공.
export const Platform = { OS: 'web', select: (o: any) => o.web ?? o.default };
export const NativeModules: Record<string, unknown> = {};
export const TurboModuleRegistry = { get: () => null, getEnforcing: () => null };
export class NativeEventEmitter { addListener() { return { remove() {} }; } removeAllListeners() {} }
export default {};
