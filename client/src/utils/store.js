import { create } from 'zustand';

const useStore = create((set, get) => ({

  /* ─── Navigation ─────────────────────────────── */
  page: 'dashboard',
  setPage: (page) => set({ page }),

  /* ─── Classes ────────────────────────────────── */
  classes: [],
  setClasses:   (classes) => set({ classes, result: null, slips: [] }),
  addClass:     ()        => set((s) => ({ classes: [...s.classes, { name: 'NEW-' + s.classes.length, count: 30, rollNos: [] }] })),
  removeClass:  (i)       => set((s) => { const c = [...s.classes]; c.splice(i, 1); return { classes: c, selRow: -1, result: null }; }),
  updateClass:  (i, patch)=> set((s) => { const c = [...s.classes]; c[i] = { ...c[i], ...patch }; return { classes: c }; }),
  resetClasses: ()        => set({ classes: [], result: null, slips: [], selRow: -1 }),
  selRow: -1,
  setSelRow: (i) => set((s) => ({ selRow: s.selRow === i ? -1 : i })),

  /* ─── Room Groups ────────────────────────────── */
  roomGroups: [
    { rows: 7, cols: 6,  rooms: 12, name: 'Group 1 — Block A & B' },
    { rows: 10, cols: 4, rooms: 2, name: 'Group 2 — Computer Labs' },
  ],
  addRoomGroup:    ()         => set((s) => ({ roomGroups: [...s.roomGroups, { rows: 6, cols: 8, rooms: 3, name: 'Group ' + (s.roomGroups.length + 1) }] })),
  removeRoomGroup: (i)        => set((s) => { const r = [...s.roomGroups]; r.splice(i, 1); return { roomGroups: r }; }),
  updateRoomGroup: (i, patch) => set((s) => { const r = [...s.roomGroups]; r[i] = { ...r[i], ...patch }; return { roomGroups: r }; }),

  /* ─── Seating Result ─────────────────────────── */
  result: null,
  view:   { g: 0, r: 0 },
  setResult: (result) => set({ result, slips: [], view: { g: 0, r: 0 } }),
  setView:   (g, r)   => set({ view: { g, r } }),
  cycleCell: (gi, ri, row, col) => set((s) => {
    if (!s.result) return {};
    const groups = JSON.parse(JSON.stringify(s.result.groups));
    const grp    = groups[gi];
    const active = grp.allocs[ri].map((v, i) => v > 0 ? i : -1).filter(i => i >= 0);
    if (!active.length) return {};
    const cur = grp.grids[ri][row][col];
    const pos = active.indexOf(cur);
    grp.grids[ri][row][col] = active[(pos + (cur === -1 ? 0 : 1)) % active.length];
    return { result: { ...s.result, groups } };
  }),

  /* ─── Slips ──────────────────────────────────── */
  slips:    [],
  slipIdx:  0,
  setSlips: (slips) => set({ slips, slipIdx: 0 }),
  setSlipIdx: (i)   => set({ slipIdx: i }),

  /* ─── Exam Info ──────────────────────────────── */
  examInfo: {
    uni:   'FAST – National University of Computer & Emerging Sciences',
    exam:  'Final Examination',
    date:  '12-Dec-2025',
    day:   'Thursday',
    time:  '10:30 AM',
    block: 'Block A',
    short: 'FAST',
  },
  setExamInfo: (patch) => set((s) => ({ examInfo: { ...s.examInfo, ...patch } })),

  /* ─── Toast ──────────────────────────────────── */
  toast: { msg: '', ok: true, visible: false },
  showToast: (msg, ok = true) => {
    set({ toast: { msg, ok, visible: true } });
    setTimeout(() => set((s) => ({ toast: { ...s.toast, visible: false } })), 2800);
  },
}));

export default useStore;
