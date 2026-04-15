import React, { useState, useMemo } from 'react';
import useStore from '../utils/store';
import { PAL } from '../utils/palette';
import { Alert, SortBtn } from '../components/ui';

function sortRows(rows, sort) {
  if (!sort.key) return rows;
  return [...rows].sort((a, b) => {
    const m = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'name')   return a.name.localeCompare(b.name) * m;
    if (sort.key === 'count')  return (a.count  - b.count)  * m;
    if (sort.key === 'placed') return ((a._placed || 0) - (b._placed || 0)) * m;
    if (sort.key === 'left')   return ((a.count - (a._placed || 0)) - (b.count - (b._placed || 0))) * m;
    return 0;
  });
}

export default function ClassManager() {
  const { classes, result, selRow, setSelRow, addClass, removeClass, updateClass, resetClasses, setPage } = useStore();
  const [changed, setChanged] = useState(false);
  const [sort, setSort]       = useState({ key: null, dir: 'asc' });

  const placed = useMemo(() => {
    const p = new Array(classes.length).fill(0);
    if (result) result.groups.forEach(g => g.allocs.forEach(a => a.forEach((v, i) => { p[i] += v; })));
    return p;
  }, [classes, result]);

  const rows = useMemo(() =>
    sortRows(classes.map((c, i) => ({ ...c, _idx: i, _placed: placed[i] })), sort),
    [classes, placed, sort]);

  const total = classes.reduce((s, c) => s + c.count, 0);

  function toggleSort(key) {
    setSort(s => ({ key, dir: s.key === key ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc' }));
  }

  const TH = ({ col, children, w }) => (
    <th className={`bg-s2 text-muted px-3 py-2 text-left text-[10px] font-normal border-b border-brd sticky top-0 whitespace-nowrap ${w || ''}`}>
      {children}
      <SortBtn col={col} sort={sort} onSort={toggleSort} />
    </th>
  );

  return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-0.5">Class Manager</h1>
      <p className="text-[11px] text-muted mb-3">M1 · P2 — Review and edit loaded classes before generation</p>

      {changed && (
        <Alert type="warn" className="mb-3">
          ⚠ Class data changed — please regenerate the seating plan.
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-brd rounded-t-xl border-b-0">
        <button onClick={() => { addClass(); setChanged(true); }}
          className="text-[11px] px-3 py-1.5 rounded border border-grn/40 bg-grn/12 text-teal-light cursor-pointer hover:bg-grn/20">
          + Add Class
        </button>
        <button onClick={() => { if (selRow >= 0) { removeClass(selRow); setChanged(true); } }} disabled={selRow < 0}
          className="text-[11px] px-3 py-1.5 rounded border border-dng-DEFAULT/40 bg-dng-DEFAULT/10 text-dng-light cursor-pointer hover:bg-dng-DEFAULT/20 disabled:opacity-40">
          − Remove Selected
        </button>
        <button onClick={() => { resetClasses(); setChanged(false); }}
          className="text-[11px] px-3 py-1.5 rounded border border-brd text-muted bg-transparent cursor-pointer hover:border-muted">
          ↺ Reset All
        </button>
        <span className="ml-auto text-[10px] text-muted">Click row to select · Click header to sort ↑↓</span>
      </div>

      <div className="border border-brd rounded-b-xl overflow-hidden" style={{ maxHeight: '340px', overflowY: 'auto' }}>
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="bg-s2 text-muted px-3 py-2 text-left text-[10px] font-normal border-b border-brd sticky top-0 w-8">#</th>
              <th className="bg-s2 text-muted px-3 py-2 text-left text-[10px] font-normal border-b border-brd sticky top-0 w-5">Color</th>
              <TH col="name">Class Name</TH>
              <TH col="count" w="w-20">Students</TH>
              <TH col="placed" w="w-16">Placed</TH>
              <TH col="left"   w="w-16">Left</TH>
              <th className="bg-s2 border-b border-brd sticky top-0 w-9" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-5 text-muted text-[12px]">No classes loaded — import a file first</td></tr>
            ) : rows.map(c => {
              const i = c._idx, p = PAL[i % PAL.length];
              const pl  = c._placed || 0;
              const lft = Math.max(0, c.count - pl);
              return (
                <tr key={i} onClick={() => setSelRow(i)}
                  className={`border-b border-[#1E1F28] cursor-pointer transition-colors hover:bg-white/[0.025] ${selRow === i ? 'bg-purple-DEFAULT/10' : ''}`}>
                  <td className="px-3 py-2 text-muted">{i + 1}</td>
                  <td className="px-3 py-2">
                    <span className="inline-block w-3.5 h-3.5 rounded-sm" style={{ background: p.fg }} />
                  </td>
                  <td className="px-3 py-2">
                    <input value={c.name} onClick={e => e.stopPropagation()}
                      onChange={e => { updateClass(i, { name: e.target.value }); setChanged(true); }}
                      className="bg-transparent border-none text-tx text-[12px] w-28 outline-none focus:bg-s2 focus:rounded px-1" />
                  </td>
                  <td className="px-3 py-2 font-mono text-purple-light">{c.count}</td>
                  <td className="px-3 py-2 font-mono text-muted">{pl || '—'}</td>
                  <td className={`px-3 py-2 font-mono ${lft > 0 ? 'text-yellow-300' : 'text-teal-light'}`}>
                    {lft === 0 ? '✓' : lft}
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={e => { e.stopPropagation(); removeClass(i); setChanged(true); }}
                      className="w-5 h-5 rounded border border-dng-DEFAULT/30 bg-dng-DEFAULT/8 text-dng-light text-[11px] flex items-center justify-center cursor-pointer hover:bg-dng-DEFAULT/20">
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-3 py-2 bg-surface border border-brd border-t-0 rounded-b-xl text-[10px] text-muted mb-3">
        <span>Total: <strong className="text-purple-light">{total}</strong> students · <strong className="text-purple-light">{classes.length}</strong> classes</span>
        <span>Next: Room Groups →</span>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setPage('import')} className="text-[11px] px-3 py-1.5 rounded border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">← Back</button>
        <button onClick={() => setPage('rooms')}  className="text-[11px] px-4 py-1.5 rounded bg-gradient-to-r from-purple to-[#2E3192] text-white font-medium cursor-pointer hover:opacity-90">Next: Room Groups →</button>
      </div>
    </div>
  );
}
