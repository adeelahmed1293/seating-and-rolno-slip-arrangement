import React from 'react';
import useStore from '../utils/store';
import { NumCtrl } from '../components/ui';

export default function RoomGroups() {
  const { classes, roomGroups, addRoomGroup, removeRoomGroup, updateRoomGroup, setPage } = useStore();
  const total = classes.reduce((s, c) => s + c.count, 0);
  const seats = roomGroups.reduce((s, g) => s + g.rows * g.cols * g.rooms, 0);

  const CapPill = () => {
    if (!total) return <span className="text-[10px] font-mono px-3 py-1 rounded-full border border-brd text-muted bg-white/5">Load classes first</span>;
    if (seats >= total) return <span className="text-[10px] font-mono px-3 py-1.5 rounded-full border border-grn/30 bg-grn/15 text-teal-light">✓ Sufficient ({seats - total} spare seats)</span>;
    return <span className="text-[10px] font-mono px-3 py-1.5 rounded-full border border-dng-DEFAULT/30 bg-dng-DEFAULT/12 text-dng-light">✗ Need {total - seats} more seats</span>;
  };

  return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-0.5">Room Groups Configuration</h1>
      <p className="text-[11px] text-muted mb-4">M1 · P3 — Define room sizes and counts for the exam</p>

      {/* Capacity bar */}
      <div className="bg-surface border border-brd rounded-xl px-5 py-3.5 flex items-center gap-6 flex-wrap mb-4">
        <div className="text-center">
          <div className="text-[26px] font-medium font-mono text-tx">{seats}</div>
          <div className="text-[10px] text-muted mt-0.5">Total Seats Available</div>
        </div>
        <div className="w-px h-9 bg-brd" />
        <div className="text-center">
          <div className="text-[26px] font-medium font-mono text-tx">{total}</div>
          <div className="text-[10px] text-muted mt-0.5">Total Students</div>
        </div>
        <div className="w-px h-9 bg-brd" />
        <div>
          <CapPill />
          <div className="text-[10px] text-muted italic mt-1">4-class checkerboard · Anti-cheat · Zero 8-neighbour conflicts</div>
        </div>
      </div>

      {/* Group cards */}
      {roomGroups.map((g, i) => (
        <div key={i} className="bg-surface border border-brd rounded-xl p-4 mb-2.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-tx">{g.name || 'Group ' + (i + 1)}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-teal/25 bg-teal/10 text-teal-light">
                {g.rows * g.cols} seats/room · {g.rows * g.cols * g.rooms} total
              </span>
              <button onClick={() => removeRoomGroup(i)} disabled={roomGroups.length === 1}
                className="text-[10px] px-2.5 py-1 rounded border border-dng-DEFAULT/30 bg-dng-DEFAULT/8 text-dng-light cursor-pointer hover:bg-dng-DEFAULT/20 disabled:opacity-30">
                × Delete
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[
              { field: 'rows',  label: 'Rows per room',       note: `${g.rows} rows`,           min: 2, max: 30 },
              { field: 'cols',  label: 'Seats per row (cols)', note: `${g.cols} cols → ${g.rows * g.cols} seats/room`, min: 2, max: 30 },
              { field: 'rooms', label: 'Number of rooms',      note: `${g.rows * g.cols * g.rooms} total seats`, min: 1, max: 50 },
            ].map(({ field, label, note, min, max }) => (
              <div key={field} className="flex flex-col gap-1.5">
                <div className="text-[10px] text-muted">{label}</div>
                <NumCtrl value={g[field]} min={min} max={max} onChange={v => updateRoomGroup(i, { [field]: v })} />
                <div className="text-[10px] text-muted">{note}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={addRoomGroup}
        className="w-full py-2.5 rounded-lg border-2 border-dashed border-brd text-muted text-[12px] cursor-pointer hover:border-teal hover:text-teal-light transition-all bg-transparent mb-2">
        + Add Room Group
      </button>
      <p className="text-[10px] text-muted italic">Each group is a physical block with identical room sizes. Groups fill seamlessly in the checkerboard pattern.</p>

      <div className="flex gap-2 mt-4">
        <button onClick={() => setPage('classes')} className="text-[11px] px-3 py-1.5 rounded border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">← Back</button>
        <button onClick={() => setPage('generate')} className="text-[11px] px-4 py-1.5 rounded bg-gradient-to-r from-purple to-[#2E3192] text-white font-medium cursor-pointer hover:opacity-90">Next: Generate Plan →</button>
      </div>
    </div>
  );
}
