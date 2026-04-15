import React, { useState, useMemo } from 'react';
import useStore from '../utils/store';
import { buildSlips } from '../utils/exportUtils';
import { exportSlipsCSV } from '../utils/exportUtils';
import { Alert, SortBar } from '../components/ui';

/* ── Single slip card (print-quality) ── */
function SlipCard({ s }) {
  return (
    <div className="bg-white rounded-lg w-[420px] overflow-hidden shadow-xl">
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#2E3192' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
          style={{ background: 'rgba(255,255,255,0.2)' }}>
          {s.short || 'UNI'}
        </div>
        <div className="text-center flex-1">
          <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.8)' }}>{s.uni}</div>
          <div className="text-[12px] font-bold text-white tracking-wider">
            {(s.exam || 'EXAMINATION').toUpperCase()} ROLL SLIP
          </div>
        </div>
        <div className="w-8" />
      </div>
      <div className="px-4 py-3 bg-white">
        <div className="flex gap-3 mb-2.5">
          <div className="flex-1">
            <div className="text-[8px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Roll Number</div>
            <div className="text-[16px] font-bold text-[#2E3192] font-mono">{s.roll}</div>
          </div>
          <div className="flex-1">
            <div className="text-[8px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Class</div>
            <div className="text-[12px] font-medium text-gray-800">{s.className}</div>
          </div>
        </div>
        <div className="flex gap-3 mb-2">
          {[['Exam Date', s.date], ['Day', s.day], ['Time', s.time]].map(([l, v]) => (
            <div key={l} className="flex-1">
              <div className="text-[8px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">{l}</div>
              <div className="text-[11px] font-medium text-gray-800">{v}</div>
            </div>
          ))}
        </div>
        <div style={{ height: '0.5px', background: '#e8e8f0', margin: '8px 0' }} />
        <div className="flex gap-2.5 rounded-md p-2 mb-2.5" style={{ background: '#f5f5fc' }}>
          {[['Room', s.room], ['Seat', s.seat], ['Block', s.block]].map(([l, v]) => (
            <div key={l} className="flex-1 text-center">
              <div className="text-[8px] text-gray-500 uppercase tracking-wide">{l}</div>
              <div className="text-[13px] font-bold" style={{ color: '#2E3192' }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="text-[8px] text-gray-400 leading-relaxed mb-2.5">
          Bring this slip to the examination hall. Mobile phones are strictly prohibited.
          Arrive 15 minutes before the start time. No entry without this slip.
        </div>
        <div className="flex justify-between" style={{ paddingTop: '8px', borderTop: '0.5px solid #e8e8f0' }}>
          <div className="text-center">
            <div style={{ borderBottom: '0.5px solid #ccc', width: '110px', height: '18px', marginBottom: '3px' }} />
            <div className="text-[8px] text-gray-400">Student Signature</div>
          </div>
          <div className="text-center">
            <div style={{ borderBottom: '0.5px solid #ccc', width: '110px', height: '18px', marginBottom: '3px' }} />
            <div className="text-[8px] text-gray-400">Invigilator Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Print all slips ── */
function printSlips(list) {
  const css = `
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif}
    .sc{background:#fff;width:420px;margin:20px auto;page-break-inside:avoid;overflow:hidden;border-radius:8px;border:1px solid #ddd}
    .sh{background:#2E3192;padding:12px 18px;display:flex;align-items:center;justify-content:space-between}
    .sl{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700}
    .st{text-align:center;flex:1}.su{font-size:9px;color:rgba(255,255,255,.8)}
    .sd{font-size:12px;font-weight:700;color:#fff;letter-spacing:.5px}
    .sb{padding:12px 18px;background:#fff}
    .sr{display:flex;gap:12px;margin-bottom:10px}.sf{flex:1}
    .fl{font-size:8px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
    .fv{font-size:12px;color:#1a1a2e;font-weight:500}
    .fvr{font-size:16px;color:#2E3192;font-family:monospace;font-weight:700}
    .dv{height:.5px;background:#e8e8f0;margin:8px 0}
    .vr{display:flex;gap:10px;background:#f5f5fc;border-radius:6px;padding:8px 12px;margin-bottom:10px}
    .vf{flex:1;text-align:center}.vl{font-size:8px;color:#666;text-transform:uppercase;letter-spacing:.5px}
    .vv{font-size:13px;color:#2E3192;font-weight:700}
    .ins{font-size:8px;color:#888;line-height:1.5;margin-bottom:10px}
    .ft{display:flex;justify-content:space-between;padding-top:8px;border-top:.5px solid #e8e8f0}
    .sg{font-size:8px;color:#999;text-align:center}
    .sb2{border-bottom:.5px solid #ccc;width:110px;height:18px;margin-bottom:3px}
    @media print{body{margin:0}}`;
  const html = list.map((s, i) => `
    <div class="sc">
      <div class="sh">
        <div class="sl">${s.short || 'UNI'}</div>
        <div class="st"><div class="su">${s.uni}</div><div class="sd">${(s.exam || 'EXAMINATION').toUpperCase()} ROLL SLIP</div></div>
        <div style="width:32px"></div>
      </div>
      <div class="sb">
        <div class="sr">
          <div class="sf"><div class="fl">Roll Number</div><div class="fvr">${s.roll}</div></div>
          <div class="sf"><div class="fl">Class</div><div class="fv">${s.className}</div></div>
        </div>
        <div class="sr">
          <div class="sf"><div class="fl">Exam Date</div><div class="fv">${s.date}</div></div>
          <div class="sf"><div class="fl">Day</div><div class="fv">${s.day}</div></div>
          <div class="sf"><div class="fl">Time</div><div class="fv">${s.time}</div></div>
        </div>
        <div class="dv"></div>
        <div class="vr">
          <div class="vf"><div class="vl">Room</div><div class="vv">${s.room}</div></div>
          <div class="vf"><div class="vl">Seat</div><div class="vv">${s.seat}</div></div>
          <div class="vf"><div class="vl">Block</div><div class="vv">${s.block}</div></div>
        </div>
        <div class="ins">Bring this slip to the examination hall. Mobile phones strictly prohibited. Arrive 15 minutes early. No entry without this slip.</div>
        <div class="ft">
          <div class="sg"><div class="sb2"></div>Student Signature</div>
          <div class="sg"><div class="sb2"></div>Invigilator Signature</div>
        </div>
      </div>
    </div>
    ${i < list.length - 1 ? '<div style="page-break-after:always"></div>' : ''}
  `).join('');
  const w = window.open('', '_blank', 'width=640,height=840');
  w.document.write(`<html><head><title>Roll Slips</title><style>${css}</style></head><body>${html}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 600);
}

/* ── Sort helper ── */
function sortSlips(list, sort) {
  if (!sort.key) return list;
  return [...list].sort((a, b) => {
    const m = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'roll')  return a.roll.localeCompare(b.roll, undefined, { numeric: true }) * m;
    if (sort.key === 'class') return a.className.localeCompare(b.className) * m;
    if (sort.key === 'room')  return a.room.localeCompare(b.room, undefined, { numeric: true }) * m;
    if (sort.key === 'seat')  return a.seat.localeCompare(b.seat) * m;
    return 0;
  });
}

export default function SlipPreview() {
  const { classes, result, examInfo, slips, slipIdx, setSlips, setSlipIdx, setPage, showToast } = useStore();

  const [sort,      setSort]      = useState({ key: null, dir: 'asc' });
  const [search,    setSearch]    = useState('');
  const [expMode,   setExpMode]   = useState('all');
  const [tableView, setTableView] = useState(false);

  function toggleSort(key) {
    setSort(s => ({ key, dir: s.key === key ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc' }));
  }

  const sorted = useMemo(() => sortSlips(slips, sort), [slips, sort]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(s =>
      s.roll.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q) ||
      s.room.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const displaySlip = filtered[Math.min(slipIdx, filtered.length - 1)];

  function go(delta) {
    setSlipIdx(Math.max(0, Math.min(filtered.length - 1, slipIdx + delta)));
  }

  function rebuild() {
    if (!result) { showToast('No seating plan.', false); return; }
    const built = buildSlips(classes, result, examInfo);
    setSlips(built);
    showToast(`✓ ${built.length} slips rebuilt`);
  }

  if (!slips.length) return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-1">Slip Preview &amp; Export</h1>
      <Alert type="warn" className="mb-3">
        ⚠ Generate a seating plan and configure exam details first.
      </Alert>
      <button onClick={() => setPage('datesheet')}
        className="text-[11px] px-4 py-2 rounded-lg bg-gradient-to-r from-teal to-[#0F6E56] text-white font-medium cursor-pointer hover:opacity-90">
        Go to Exam Configuration →
      </button>
    </div>
  );

  const SORT_COLS = [['roll','Roll No'],['class','Class'],['room','Room'],['seat','Seat']];

  return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-0.5">Slip Preview &amp; Batch Export</h1>
      <p className="text-[11px] text-muted mb-3">
        M2 · P2 — {filtered.length} slips{search ? ` (filtered from ${slips.length})` : ''} · Sort &amp; search below
      </p>

      {/* Nav bar */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-surface border border-brd rounded-lg mb-3">
        <button onClick={() => go(-1)} className="text-[11px] px-3 py-1.5 rounded border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">← Prev</button>
        <span className="text-[12px] text-tx font-mono flex-1 text-center">
          Slip {filtered.length > 0 ? slipIdx + 1 : 0} of {filtered.length}
        </span>
        <button onClick={() => go(1)}  className="text-[11px] px-3 py-1.5 rounded border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">Next →</button>
        <input value={search} onChange={e => { setSearch(e.target.value); setSlipIdx(0); }}
          placeholder="Search roll, class, room…"
          className="w-44 bg-s2 border border-brd rounded px-2.5 py-1.5 text-[11px] text-tx font-mono placeholder-dim outline-none focus:border-purple" />
        <button onClick={() => setTableView(t => !t)}
          className={`text-[11px] px-3 py-1.5 rounded border cursor-pointer transition-colors
            ${tableView ? 'border-teal text-teal-light bg-teal/10' : 'border-brd text-muted hover:border-muted'}`}>
          {tableView ? 'Card View' : 'Table View'}
        </button>
      </div>

      {/* Sort bar */}
      <SortBar
        sorts={SORT_COLS}
        sort={sort}
        onSort={toggleSort}
        onClear={() => setSort({ key: null, dir: 'asc' })}
        right={
          <>
            <button onClick={rebuild} className="text-[11px] px-3 py-1.5 rounded border border-teal text-teal-light bg-transparent hover:bg-teal/15 cursor-pointer">↺ Rebuild</button>
            <button onClick={() => setPage('datesheet')} className="text-[11px] px-3 py-1.5 rounded border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">✏ Edit Template</button>
          </>
        }
      />

      {/* Card or Table view */}
      {tableView ? (
        <div className="border border-brd rounded-xl overflow-hidden mb-3" style={{ maxHeight: '360px', overflowY: 'auto' }}>
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {SORT_COLS.map(([k, l]) => (
                  <th key={k} onClick={() => toggleSort(k)}
                    className="bg-s2 text-muted px-2.5 py-2 text-left text-[10px] font-normal border-b border-brd sticky top-0 cursor-pointer whitespace-nowrap hover:text-tx">
                    {l} {sort.key === k ? (sort.dir === 'asc' ? '↑' : '↓') : '⇅'}
                  </th>
                ))}
                <th className="bg-s2 text-muted px-2.5 py-2 text-left text-[10px] font-normal border-b border-brd sticky top-0">Block</th>
                <th className="bg-s2 text-muted px-2.5 py-2 text-left text-[10px] font-normal border-b border-brd sticky top-0">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} onClick={() => setSlipIdx(i)}
                  className={`border-b border-[#1E1F28] cursor-pointer hover:bg-white/[0.025] transition-colors ${slipIdx === i ? 'bg-purple-DEFAULT/10' : ''}`}>
                  <td className="px-2.5 py-2 font-mono text-purple-light">{s.roll}</td>
                  <td className="px-2.5 py-2 text-tx">{s.className}</td>
                  <td className="px-2.5 py-2 text-teal-light">{s.room}</td>
                  <td className="px-2.5 py-2 font-mono text-muted">{s.seat}</td>
                  <td className="px-2.5 py-2 text-muted">{s.block}</td>
                  <td className="px-2.5 py-2 text-muted">{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center mb-3">
          {displaySlip
            ? <SlipCard s={displaySlip} />
            : <div className="text-muted text-[12px] py-10">No slips match the search.</div>
          }
        </div>
      )}

      {/* Export section */}
      <div className="border-t border-brd pt-4">
        <div className="text-[10px] font-semibold text-muted tracking-widest uppercase mb-3">Batch Export</div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { k: 'all',     t: 'All slips — one PDF',    d: 'exam_roll_slips_all.pdf' },
            { k: 'class',   t: 'One PDF per class',       d: 'BSCS1_slips.pdf…' },
            { k: 'day',     t: 'One PDF per exam day',    d: 'slips_day1.pdf…' },
            { k: 'student', t: 'Individual per student',  d: 'Roll-001.pdf…' },
          ].map(o => (
            <div key={o.k} onClick={() => setExpMode(o.k)} className={`cursor-pointer rounded-lg p-3 border transition-all
              ${expMode === o.k ? 'border-teal/50 bg-teal/6' : 'border-brd bg-surface hover:border-teal/30'}`}>
              <div className="text-[11px] text-tx font-medium mb-0.5">{o.t}</div>
              <div className="text-[10px] text-muted">{o.d}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (!filtered.length) { showToast('No slips.', false); return; } printSlips(filtered); }}
            className="text-[12px] px-5 py-2.5 rounded-lg bg-gradient-to-r from-teal to-[#0F6E56] text-white font-medium cursor-pointer hover:opacity-90">
            🖨 Print / Save PDF ({filtered.length})
          </button>
          <button onClick={async () => {
            const ok = await exportSlipsCSV(filtered);
            if (ok) showToast(`✓ Exported ${filtered.length} slips to CSV`);
          }}
            className="text-[12px] px-5 py-2.5 rounded-lg border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">
            ⬇ Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
}
