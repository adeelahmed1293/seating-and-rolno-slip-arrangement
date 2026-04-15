import React from 'react';
import useStore from '../utils/store';

export default function Dashboard() {
  const { classes, roomGroups, result, slips, setPage } = useStore();
  const total = classes.reduce((s, c) => s + c.count, 0);
  const rooms = roomGroups.reduce((s, g) => s + g.rooms, 0);

  const stats = [
    { label: 'Total Students',   value: total,          color: 'text-purple-light', bar: 'bg-purple' },
    { label: 'Rooms Configured', value: rooms,          color: 'text-teal-light',   bar: 'bg-teal'   },
    { label: 'Slips Ready',      value: slips.length,   color: 'text-yellow-300',   bar: 'bg-amb'    },
    {
      label: 'Conflicts',
      value: result ? result.totalConflicts : '—',
      color: result?.totalConflicts > 0 ? 'text-red-400' : 'text-teal-light',
      bar: 'bg-grn',
    },
  ];

  return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-0.5">Dashboard</h1>
      <p className="text-[11px] text-muted mb-4">Overview of both modules · FALL-2025 date sheet pre-loaded</p>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {stats.map(s => (
          <div key={s.label} className="bg-surface border border-brd rounded-xl p-4 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${s.bar}`} />
            <div className={`text-[28px] font-medium font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-surface border border-brd rounded-xl overflow-hidden">
          <div className="px-4 py-3 text-[11px] font-medium text-purple-light"
            style={{ background: 'linear-gradient(90deg,#2D1A5E,#1A1030)', borderBottom: '0.5px solid rgba(91,79,214,0.3)' }}>
            MODULE 01 — Anti-Cheat Seating Planner
          </div>
          <div className="p-4">
            <div className="grid grid-cols-8 gap-0.5 mb-3">
              {['#2D2040','#1A2D20','#2D2040','#1A2D20','#2D2040','#1A2D20','#2D2040','#1A2D20',
                '#2A1010','#102A18','#2A1010','#102A18','#2A1010','#102A18','#2A1010','#102A18',
                '#2D2040','#1A2D20','#2D2040','#1A2D20','#2D2040','#1A2D20','#2D2040','#1A2D20',
              ].map((bg, i) => <div key={i} className="h-3.5 rounded-sm" style={{ background: bg }} />)}
            </div>
            <p className={`text-[12px] mb-3 leading-relaxed ${result ? 'text-teal-light' : 'text-muted'}`}>
              {result
                ? `✓ ${result.totalPlaced} students placed across ${rooms} rooms — ${result.totalConflicts} conflicts`
                : total
                  ? `${total} students loaded — generate plan to proceed`
                  : 'No plan generated yet — import data to begin'}
            </p>
            <button onClick={() => setPage('import')}
              className="text-[11px] px-3.5 py-1.5 rounded-md border border-pink text-pink-light bg-transparent hover:bg-pink-DEFAULT/15 transition-colors cursor-pointer">
              Go to Seating Module →
            </button>
          </div>
        </div>

        <div className="bg-surface border border-brd rounded-xl overflow-hidden">
          <div className="px-4 py-3 text-[11px] font-medium text-teal-light"
            style={{ background: 'linear-gradient(90deg,#0A2A26,#082028)', borderBottom: '0.5px solid rgba(0,168,150,0.3)' }}>
            MODULE 02 — Student Roll Slip Generator
          </div>
          <div className="p-4">
            <div className="space-y-1.5 mb-3">
              {[90, 70, 80, 60].map((w, i) => <div key={i} className="h-2.5 rounded bg-white/[0.06]" style={{ width: w + '%' }} />)}
              <div className="flex gap-1.5 mt-1.5">
                <div className="h-2.5 rounded bg-white/[0.06] w-2/5" />
                <div className="h-2.5 rounded bg-white/[0.06] w-[30%]" />
              </div>
            </div>
            <p className={`text-[12px] mb-3 ${slips.length ? 'text-teal-light' : 'text-muted'}`}>
              {slips.length ? `${slips.length} slips ready for export` : 'Generate a seating plan first, then configure exam details'}
            </p>
            <button onClick={() => setPage('datesheet')}
              className="text-[11px] px-3.5 py-1.5 rounded-md border border-teal text-teal-light bg-transparent hover:bg-teal-DEFAULT/15 transition-colors cursor-pointer">
              Go to Slip Generator →
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] px-3 py-2.5 rounded-lg border border-blue-400/25 bg-blue-600/10 text-blue-300">
        ℹ Import student roll data from Excel or CSV to begin. FALL-2025 exam defaults pre-configured.
      </div>
    </div>
  );
}
