import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { RouteId } from '@/data/careers';
import { slotAwareStorage } from './persistStorage';

// 졸업 제자 평생 궤적 레코드 — 회차(사문) 스코프. docs/28 §4 · docs/08.
// careerSystem 이 매년 갱신(직책 ↑↓·전직·사망). world 탭이 표시.

export type GraduateStatus =
  | 'active' //   강호 활동 중
  | 'injured' //  부상(회복 중)
  | 'retired' //  은거·무공 폐기
  | 'dead' //     사망
  | 'missing'; // 실종

export interface GraduateRecord {
  id: string; // 제자 id(졸업 시점)
  name: string;
  route: RouteId; // 노선(정체성)
  level: number; // 직책 레벨 0~3
  title: string; // 현재 직책명 (ROUTE_LADDER[route][level])
  power: number; // 무공·역량 종합 0~100 (졸업 스냅샷 + 완만 성장)
  fame: number; // 명성
  status: GraduateStatus;
  graduatedYear: number;
  slainBy?: string; // 다른 졸업 동문에게 살해당했으면 그 가해자 id — 복수(연쇄) 사건의 씨앗. docs/08
}

interface GraduateStore {
  records: GraduateRecord[];
  add: (rec: GraduateRecord) => void;
  update: (id: string, patch: Partial<GraduateRecord>) => void;
  reset: () => void;
}

export const useGraduateStore = create<GraduateStore>()(
  persist(
    (set) => ({
      records: [],
      add: (rec) =>
        set((s) => ({
          // 같은 id 재졸업 방지 — 덮어쓰기.
          records: [rec, ...s.records.filter((r) => r.id !== rec.id)],
        })),
      update: (id, patch) =>
        set((s) => ({
          records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      reset: () => set({ records: [] }),
    }),
    {
      name: 'graduates',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
