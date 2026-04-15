import React, { useState, useMemo } from 'react';
import useStore from '../utils/store';
import { PAL } from '../utils/palette';
import { Alert, SortBar } from '../components/ui';

const CHUNK = 10;

function buildRollMap(classes, result) {
  const map = classes.map(() => []);
  let room = 0;
  result.groups.forEach((grp, gi) => {
    grp.allocs.forEach((_, ri) => {
      room++;
      const rg = grp.rollGrids?.[ri];
      if (!rg) return;
      for (let r = 0; r < grp.rows; r++)
        for (let c = 0; c < grp.cols; c++) {
          const v = grp.grids[ri][r][c];
          if (v === -1) continue;
          const roll = rg[r][c];
          if (roll) map[v].push({ roll, room, gi, ri });
        }
    });
  });
  return map;
}

function sortEntries(arr, sort) {
  if (!sort.key) return arr;
  return [...arr].sort((a, b) => {
    const m = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'roll') return a.roll.localeCompare(b.roll, undefined, { numeric: true }) * m;
    if (sort.key === 'room') return (a.room - b.room) * m;
    return 0;
  });
}

export default function RollDirectory() {
  const { classes, result, setView, setPage } = useStore();
  const [query,    setQuery]    = useState('');
  const [clsSort,  setClsSort]  = useState({ key: null, dir: 'asc' });
  const [rollSort, setRollSort] = useState({ key: null, dir: 'asc' });

  if (!result) return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-1">Roll Directory</h1>
      <Alert type="warn">Generate a seating plan first to use the directory.</Alert>
    </div>
  );

  const rollMap = useMemo(() => buildRollMap(classes, result), [classes, result]);

  const sortedClasses = useMemo(() => {
    const arr = classes.map((c, i) => ({ ...c, _idx: i, total: rollMap[i].length }));
    if (!clsSort.key) return arr;
    return [...arr].sort((a, b) => {
      const m = clsSort.dir === 'asc' ? 1 : -1;
      if (clsSort.key === 'name')  return a.name.localeCompare(b.name) * m;
      if (clsSort.key === 'total') return (a.total - b.total) * m;
      return 0;
    });
  }, [classes, rollMap, clsSort]);

  function toggleCls(key)  { setClsSort(s  => ({ key, dir: s.key === key ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc' })); }
  function toggleRoll(key) { setRollSort(s => ({ key, dir: s.key === key ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc' })); }

  const q = query.trim().toLowerCase();

  return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-0.5">Roll Directory</h1>
      <p className="text-[11px] text-muted mb-3">M1 · P6 — Find any student's room instantly</p>

      {/* Search */}
      <div className="flex gap-2 mb-3 items-center">
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search roll number or class name…"
          className="flex-1 bg-s2 border border-brd rounded-lg px-3 py-2 text-[12px] text-tx font-mono placeholder-dim outline-none focus:border-purple" />
        <button onClick={() => setQuery('')}
          className="text-[11px] px-3 py-2 rounded border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">
          Clear
        </button>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap mb-3 text-[10px]">
        <span className="text-muted">Classes:</span>
        {[['name','Name'],['total','Count']].map(([k, l]) => (
          <button key={k} onClick={() => toggleCls(k)}
            className={`px-2 py-0.5 rounded border cursor-pointer ${clsSort.key === k ? 'border-teal text-teal-light bg-teal/10' : 'border-brd text-muted hover:border-muted'}`}>
            {l} {clsSort.key === k ? (clsSort.dir === 'asc' ? '↑' : '↓') : '⇅'}
          </button>
        ))}
        <span className="text-brd">|</span>
        <span className="text-muted">Rolls:</span>
        {[['roll','Roll No'],['room','Room']].map(([k, l]) => (
          <button key={k} onClick={() => toggleRoll(k)}
            className={`px-2 py-0.5 rounded border cursor-pointer ${rollSort.key === k ? 'border-teal text-teal-light bg-teal/10' : 'border-brd text-muted hover:border-muted'}`}>
            {l} {rollSort.key === k ? (rollSort.dir === 'asc' ? '↑' : '↓') : '⇅'}
          </button>
        ))}
        {(clsSort.key || rollSort.key) && (
          <button onClick={() => { setClsSort({ key: null, dir: 'asc' }); setRollSort({ key: null, dir: 'asc' }); }}
            className="px-2 py-0.5 rounded border border-brd text-dim hover:border-muted cursor-pointer">× Clear all</button>
        )}
      </div>

      {/* Class blocks */}
      {sortedClasses.map(cls => {
        const ci = cls._idx, p = PAL[ci % PAL.length];
        const entries = sortEntries(rollMap[ci], rollSort);

        const clsMatch = !q || cls.name.toLowerCase().includes(q);
        const filtered = clsMatch ? entries : entries.filter(e => e.roll.toLowerCase().includes(q));
        if (!filtered.length) return null;

        const byRoom = {};
        filtered.forEach(e => { (byRoom[e.room] = byRoom[e.room] || []).push(e); });

        const tableRows = [];
        let idx = 0;
        Object.keys(byRoom).sort((a, b) => +a - +b).forEach(rNum => {
          const list = byRoom[rNum];
          for (let start = 0; start < list.length; start += CHUNK) {
            const chunk = list.slice(start, start + CHUNK);
            const from = idx + 1, to = idx + chunk.length; idx += chunk.length;
            tableRows.push({ from, to, rolls: chunk.map(e => e.roll).join(', '), rNum, gi: chunk[0].gi, ri: chunk[0].ri });
          }
        });

        return (
          <div key={ci} className="mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg font-mono text-[11px] font-semibold"
              style={{ background: p.bg, color: p.fg, border: `0.5px solid ${p.br}` }}>
              <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: p.fg }} />
              {cls.name} — {filtered.length} students
            </div>
            <table className="w-full border-collapse text-[11px] font-mono">
              <thead>
                <tr>
                  <th className="text-left text-[10px] text-muted font-normal px-2 py-1.5 border-b border-brd w-16">#</th>
                  <th className="text-left text-[10px] text-muted font-normal px-2 py-1.5 border-b border-brd">Roll Numbers</th>
                  <th className="text-left text-[10px] text-muted font-normal px-2 py-1.5 border-b border-brd w-24">Room</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i} onClick={() => { setView(row.gi, row.ri); setPage('roomview'); }}
                    className="border-b border-[#1E1F28] cursor-pointer hover:bg-white/[0.025] transition-colors"
                    title={`Click to view Room ${row.rNum}`}>
                    <td className="px-2 py-1.5 opacity-60">{row.from}–{row.to}</td>
                    <td className="px-2 py-1.5" style={{ color: p.fg, wordBreak: 'break-all' }}>{row.rolls}</td>
                    <td className="px-2 py-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-teal/30 bg-teal/10 text-teal-light">
                        Room {row.rNum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
