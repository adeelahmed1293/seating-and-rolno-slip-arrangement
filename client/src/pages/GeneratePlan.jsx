import React, { useState } from 'react';
import useStore from '../utils/store';
import { PAL } from '../utils/palette';
import { generatePlan } from '../utils/seating';
import { exportAllRooms, exportSummary } from '../utils/exportUtils';

export default function GeneratePlan() {
  const { classes, roomGroups, result, setResult, setPage, showToast } = useStore();
  const [running, setRunning] = useState(false);

  const total = classes.reduce((s, c) => s + c.count, 0);
  const seats = roomGroups.reduce((s, g) => s + g.rows * g.cols * g.rooms, 0);
  const rms   = roomGroups.reduce((s, g) => s + g.rooms, 0);

  const checks = [
    { ok: classes.length > 0, title: 'Classes Loaded',         ok_text: `${classes.length} classes · ${total} students`, fail_text: 'No classes loaded' },
    { ok: rms > 0,            title: 'Room Groups Configured',  ok_text: `${rms} rooms · ${seats} seats`,                 fail_text: 'No rooms configured' },
    { ok: seats >= total && total > 0, pend: !(seats > 0 && total > 0), title: 'Seat Capacity',
      ok_text: `Sufficient (${seats} seats for ${total} students)`,
      fail_text: seats < total && total > 0 ? `Need ${total - seats} more seats` : '—' },
  ];

  async function run() {
    if (!classes.length) { showToast('Import student data first.', false); return; }
    setRunning(true);
    try {
      const res = generatePlan(classes, roomGroups);
      setResult(res);
      showToast(`✓ ${res.totalPlaced} placed, ${res.totalConflicts} conflicts`);
    } catch (e) { showToast(e.message, false); }
    setRunning(false);
  }

  const unplaced    = result ? result.totalStudents - result.totalPlaced : 0;
  const totalRooms  = result ? result.groups.reduce((s, g) => s + g.rooms, 0) : 0;
  const allGood     = result && unplaced === 0 && result.totalConflicts === 0;

  return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-0.5">Generate Seating Plan</h1>
      <p className="text-[11px] text-muted mb-4">M1 · P4 — Review checklist then fire the anti-cheat algorithm</p>

      {/* Checklist */}
      <div className="bg-surface border border-brd rounded-xl p-4 mb-4">
        <div className="text-[11px] font-medium text-muted mb-2">Pre-generation checklist</div>
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#1E1F28] last:border-none last:pb-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] flex-shrink-0
              ${c.pend ? 'bg-white/7 text-muted' : c.ok ? 'bg-grn/20 text-teal-light' : 'bg-dng-DEFAULT/20 text-dng-light'}`}>
              {c.pend ? '⋯' : c.ok ? '✓' : '✗'}
            </div>
            <div>
              <div className="text-[12px] text-tx font-medium">{c.title}</div>
              <div className={`text-[11px] mt-0.5 ${c.pend ? 'text-muted' : c.ok ? 'text-teal-light' : 'text-yellow-300'}`}>
                {c.pend ? '—' : c.ok ? c.ok_text : c.fail_text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={run} disabled={running}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple to-[#2E3192] text-white text-[13px] font-medium cursor-pointer hover:opacity-90 disabled:opacity-60 mb-4">
        {running ? '⚙ Generating…' : '▶ Generate Seating Plan'}
      </button>

      {result && (
        <>
          <div className={`flex items-center gap-2 text-[12px] font-medium px-4 py-3 rounded-lg border mb-3
            ${allGood ? 'bg-grn/10 border-grn/30 text-teal-light' : 'bg-amb/10 border-amb/30 text-yellow-300'}`}>
            {allGood
              ? `✓ All ${result.totalStudents} students placed — Zero conflicts — ${totalRooms} rooms`
              : `⚠ ${result.totalPlaced} placed · ${unplaced} unplaced · ${result.totalConflicts} conflicts`}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[
              { v: result.totalStudents,  l: 'Students',  c: 'text-blue-400' },
              { v: result.totalPlaced,    l: 'Placed',    c: 'text-teal-light' },
              { v: unplaced,              l: 'Unplaced',  c: unplaced > 0 ? 'text-yellow-300' : 'text-teal-light' },
              { v: totalRooms,            l: 'Rooms',     c: 'text-teal-light' },
              { v: result.totalConflicts, l: 'Conflicts', c: result.totalConflicts > 0 ? 'text-red-400' : 'text-teal-light' },
            ].map(s => (
              <div key={s.l} className="bg-surface border border-brd rounded-lg py-2.5 px-2 text-center">
                <div className={`text-[20px] font-medium font-mono ${s.c}`}>{s.v}</div>
                <div className="text-[9px] text-muted mt-0.5 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {classes.map((c, i) => {
              const p = PAL[i % PAL.length];
              return (
                <div key={i} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full" style={{ background: p.bg }}>
                  <div className="w-2 h-2 rounded-sm" style={{ background: p.fg }} />
                  <span style={{ color: p.fg }}>{c.name} · {c.count}</span>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '→ View Room Layouts',  fn: () => setPage('roomview') },
              { label: '→ View Roll Directory', fn: () => setPage('directory') },
              { label: '→ Export Rooms CSV',    fn: async () => { const ok = await exportAllRooms(classes, result); if (ok) showToast('✓ Exported all rooms CSV'); } },
              { label: '→ Export Summary CSV',  fn: async () => { const ok = await exportSummary(classes, result);  if (ok) showToast('✓ Exported summary CSV'); } },
            ].map(b => (
              <button key={b.label} onClick={b.fn}
                className="text-left text-[11px] px-3.5 py-2.5 rounded-lg border border-brd text-muted hover:border-purple hover:text-purple-light cursor-pointer transition-all bg-transparent">
                {b.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-2 mt-3">
        <button onClick={() => setPage('rooms')} className="text-[11px] px-3 py-1.5 rounded border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">← Back</button>
      </div>
    </div>
  );
}
