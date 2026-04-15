import React from 'react';
import useStore from '../utils/store';
import { PAL } from '../utils/palette';
import { countConflicts, hasConflict } from '../utils/seating';
import { Alert } from '../components/ui';

export default function RoomView() {
  const { classes, result, view, setView, cycleCell } = useStore();

  if (!result) return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-1">Room View</h1>
      <Alert type="warn">Generate a seating plan first to view room layouts.</Alert>
    </div>
  );

  const { groups } = result;
  const grp     = groups[view.g];
  const ri      = view.r;
  const grid    = grp.grids[ri];
  const rg      = grp.rollGrids?.[ri];
  const alloc   = grp.allocs[ri];
  const R = grp.rows, C = grp.cols;
  const seated    = alloc.reduce((s, v) => s + v, 0);
  const cf        = countConflicts(grid);
  const activeCls = alloc.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0);

  return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-0.5">Room View</h1>
      <p className="text-[11px] text-muted mb-3">M1 · P5 — Visual seat grid · Click a seat to cycle its class assignment</p>

      {/* Group tabs */}
      <div className="mb-2">
        <div className="text-[10px] text-muted mb-1.5">Group</div>
        <div className="flex flex-wrap gap-1">
          {groups.map((g, gi) => (
            <button key={gi} onClick={() => setView(gi, 0)}
              className={`text-[11px] px-3 py-1 rounded border cursor-pointer transition-all
                ${gi === view.g ? 'bg-teal-DEFAULT/15 border-teal/40 text-teal-light' : 'bg-transparent border-brd text-muted hover:text-tx'}`}>
              {g.name || 'Group ' + (gi + 1)} · {g.rows}×{g.cols}
            </button>
          ))}
        </div>
      </div>

      {/* Room tabs */}
      <div className="mb-3">
        <div className="text-[10px] text-muted mb-1.5">Room</div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: grp.rooms }, (_, ri_) => {
            const cf_ = countConflicts(grp.grids[ri_]);
            return (
              <button key={ri_} onClick={() => setView(view.g, ri_)}
                className={`text-[11px] px-2.5 py-1 rounded border cursor-pointer transition-all
                  ${ri_ === ri ? 'bg-teal-DEFAULT/15 border-teal/40 text-teal-light' : 'bg-transparent border-brd text-muted hover:text-tx'}`}>
                R{ri_ + 1}{cf_ > 0 ? ' ⚠' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room info bar */}
      <div className="bg-surface border border-brd rounded-lg px-3.5 py-2.5 flex items-center gap-2.5 flex-wrap mb-2.5">
        <span className="text-[15px] font-medium text-tx">Room {ri + 1}</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-teal/30 bg-teal/10 text-teal-light">{grp.name || 'Group ' + (view.g + 1)} · {R}×{C}</span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${cf === 0 ? 'border-grn/30 bg-grn/10 text-teal-light' : 'border-dng-DEFAULT/30 bg-dng-DEFAULT/10 text-dng-light'}`}>
          {cf === 0 ? '✓ Zero Conflicts' : `⚠ ${cf} conflicts`}
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-brd bg-white/5 text-muted">{seated}/{R * C} seated · {activeCls.length} classes</span>
      </div>

      {/* Class chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {activeCls.map(i => {
          const p = PAL[i % PAL.length];
          return <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: p.bg, color: p.fg }}>
            {classes[i].name}: {alloc[i]}
          </span>;
        })}
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto">
        <div className="grid gap-[3px] mb-0.5" style={{ gridTemplateColumns: `20px repeat(${C}, 1fr)` }}>
          <div />
          {Array.from({ length: C }, (_, c) => <div key={c} className="text-[9px] text-dim text-center font-mono">{c + 1}</div>)}
        </div>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `20px repeat(${C}, 1fr)` }}>
          {Array.from({ length: R }, (_, r) => [
            <div key={`rl-${r}`} className="text-[9px] text-dim flex items-center justify-center font-mono w-5">{r + 1}</div>,
            ...Array.from({ length: C }, (_, c) => {
              const v = grid[r][c];
              if (v === -1) return (
                <div key={`${r}-${c}`} className="rounded min-h-[50px] flex items-center justify-center bg-s3 border border-brd">
                  <span className="text-[7px] text-dim">---</span>
                </div>
              );
              const p = PAL[v % PAL.length], nm = classes[v]?.name || '?';
              const rollNo  = rg?.[r]?.[c] || null;
              const conflict = hasConflict(grid, r, c);
              const pos = `R${r + 1}C${c + 1}`;
              return (
                <div key={`${r}-${c}`} onClick={() => cycleCell(view.g, ri, r, c)}
                  className={`seat relative rounded min-h-[50px] flex flex-col items-center justify-center cursor-pointer ${conflict ? 'ring-2 ring-red-500' : ''}`}
                  style={{ background: p.bg, border: `0.5px solid ${p.bg}` }}>
                  <div className="text-[8px] font-bold font-mono truncate w-full text-center px-0.5" style={{ color: p.fg }}>{nm}</div>
                  <div className="text-[7px] font-mono truncate w-full text-center opacity-85 px-0.5" style={{ color: p.fg }}>{rollNo || '—'}</div>
                  <div className="text-[6px] font-mono text-center opacity-50" style={{ color: p.fg }}>{pos}</div>
                  <div className="tooltip absolute bottom-full left-1/2 -translate-x-1/2 bg-s2 border border-brd rounded px-2 py-1 text-[10px] whitespace-nowrap z-20 text-tx pointer-events-none mb-1">
                    {pos} · {nm}{rollNo ? ` · ${rollNo}` : ''}
                  </div>
                </div>
              );
            }),
          ])}
        </div>
      </div>
      <p className="text-[10px] text-muted mt-2">Click any seat to manually cycle its class assignment.</p>
    </div>
  );
}
