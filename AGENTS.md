# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# 테스트

로직·수치·화면을 만진 턴은 **영향 계층 테스트를 돌린다**. 전 테스트의 인덱스(4계층·종류·세부문서·한 방 실행) = `docs/40_테스트_전략.md`. 거기서 시작한다.

- **밴드 비교**: 수치가 기대 범위를 벗어나면 `npx tsx scripts/sim/statcheck.ts <id> <측정값>`으로 편차를 정량화 → 의도면 `docs/36` + `scripts/sim/statbaseline.json` 갱신, 아니면 회귀(`docs/42`).
- **새 시스템·콘텐츠**: `docs/43` 사냥 5렌즈(시간차·자원경합·생애경계·의미정합·id충돌) 루틴 통과.
- **버그**: `docs/37` Part A에 증상/원인/수정/재검증 + "왜 기존 테스트가 못 잡았나"(Part D 사각 번호)를 함께 등재. 사각 닫는 케이스 추가해야 수정 완료.
- 전 계층 한 번에: `test` 스킬 또는 `docs/40` §2.
