// 한국어 조사 — 이름 치환 뒤 조사를 받침 유무로 자동 선택. 대사·소식·로그의 조사 오류 방지.
// 받침 있는 이름(장철→장철이/장철을)과 없는 이름(진소화→진소화가/진소화를)이 섞여, 하드코딩 단일형은
// 절반이 틀린다. 화면/문서엔 josa()(코드 치환부)·fillName()(템플릿 {키} 치환부)로 통일.

// 마지막 글자에 받침(종성)이 있나. 한글 음절: (code-0xAC00)%28 !== 0 이면 받침 있음.
// 한글이 아니면(숫자·영문 등) 받침 없음으로 본다(보수적).
export function hasBatchim(word: string): boolean {
  if (!word) return false;
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return false;
  return (c - 0xac00) % 28 !== 0;
}

// 받침 유무로 조사 선택. 예: josa('장철','이','가')='장철이', josa('진소화','이','가')='진소화가'.
export function josa(word: string, withBatchim: string, withoutBatchim: string): string {
  return word + (hasBatchim(word) ? withBatchim : withoutBatchim);
}

// 조사쌍 — 표기된 조사 한쪽을 보고 올바른 쌍을 고른다. (받침형, 비받침형)
const PARTICLE_PAIRS: Record<string, readonly [string, string]> = {
  은: ['은', '는'], 는: ['은', '는'],
  이: ['이', '가'], 가: ['이', '가'],
  을: ['을', '를'], 를: ['을', '를'],
  과: ['과', '와'], 와: ['과', '와'],
  으로: ['으로', '로'], 로: ['으로', '로'],
  아: ['아', '야'], 야: ['아', '야'],
};
// 길이 긴 것 우선(으로 before 로) — 정규식 교대 순서.
const PARTICLE_ALT = '으로|은|는|이|가|을|를|과|와|로|아|야';

// 템플릿의 `{키}`(+뒤따르는 조사)를 이름 + 올바른 조사로 치환. map = { name:'장철', rival:'진소화' }.
// 조사 없는 `{키}`(뒤 공백·`의` 등)는 이름만. `의`·`에게`·`에서` 등은 불변이라 그대로 둔다.
export function fillName(template: string, map: Record<string, string>): string {
  let out = template;
  for (const [key, name] of Object.entries(map)) {
    const re = new RegExp(`\\{${key}\\}(${PARTICLE_ALT})?`, 'g');
    out = out.replace(re, (_m, particle?: string) => {
      if (!particle) return name;
      const pair = PARTICLE_PAIRS[particle];
      return pair ? name + (hasBatchim(name) ? pair[0] : pair[1]) : name + particle;
    });
  }
  return out;
}
