/**
 * slips.js — Slip Preview & Batch Export page module
 */
import { state }     from '../js/state.js';
import { showToast } from '../js/utils.js';
import { buildSlips, getExamInfo } from './datesheet.js';

let slipsPerPage = 1;

export function init() {
  window.slipGo       = go;
  window.slipSearch   = search;
  window.slipRebuild  = rebuild;
  window.slipSelExp   = selExport;
  window.slipPrint    = printSlips;
  window.slipExportCSV = exportCSV;
  window.slipsPerPage  = 1;

  // If slips already exist, show them
  if (!state.result) {
    show(false); return;
  }
  if (!state.slips.length && state.result) {
    // Auto-build with last exam info if available
    try { buildSlips(getExamInfo()); } catch {}
  }
  show(state.slips.length > 0);
  if (state.slips.length) renderSlip();
}

function show(hasSlips) {
  document.getElementById('slips-ph').style.display  = hasSlips ? 'none' : 'flex';
  document.getElementById('slips-cnt').style.display = hasSlips ? 'block' : 'none';
}

function renderSlip() {
  if (!state.slips.length) return;
  const s = state.slips[Math.min(state.slipIdx, state.slips.length-1)];
  document.getElementById('sli-ctr').textContent = `Slip ${state.slipIdx+1} of ${state.slips.length}`;
  document.getElementById('sli-area').innerHTML  = buildSlipHTML(s);
}

export function buildSlipHTML(s) {
  return `<div class="sli-canvas">
    <div class="sli-hdr">
      <div class="sli-logo">${s.short||'UNI'}</div>
      <div class="sli-tb">
        <div class="sli-uni">${s.uni}</div>
        <div class="sli-hding">${(s.exam||'EXAMINATION').toUpperCase()} ROLL SLIP</div>
      </div>
      <div style="width:32px"></div>
    </div>
    <div class="sli-body">
      <div class="sli-row">
        <div class="sli-f"><div class="sfl">Roll Number</div><div class="sfv roll">${s.roll}</div></div>
        <div class="sli-f"><div class="sfl">Class</div><div class="sfv">${s.className}</div></div>
      </div>
      <div class="sli-row">
        <div class="sli-f"><div class="sfl">Exam Date</div><div class="sfv">${s.date}</div></div>
        <div class="sli-f"><div class="sfl">Day</div><div class="sfv">${s.day}</div></div>
        <div class="sli-f"><div class="sfl">Time</div><div class="sfv">${s.time}</div></div>
      </div>
      <div class="sli-div"></div>
      <div class="venue-row">
        <div class="vf"><div class="vl">Room</div><div class="vv">${s.room}</div></div>
        <div class="vf"><div class="vl">Seat</div><div class="vv">${s.seat}</div></div>
        <div class="vf"><div class="vl">Block</div><div class="vv">${s.block}</div></div>
      </div>
      <div class="sli-inst">
        Bring this slip to the examination hall. Mobile phones are strictly prohibited.
        Arrive 15 minutes before the start time. No entry without this slip.
      </div>
      <div class="sli-foot">
        <div class="sig"><div class="sig-blank"></div>Student Signature</div>
        <div class="sig"><div class="sig-blank"></div>Invigilator Signature</div>
      </div>
    </div>
  </div>`;
}

function go(delta) {
  state.slipIdx = Math.max(0, Math.min(state.slips.length-1, state.slipIdx + delta));
  renderSlip();
}
function search(q) {
  if (!q.trim()) { state.slipIdx=0; renderSlip(); return; }
  const idx = state.slips.findIndex(s => s.roll.toLowerCase().includes(q.toLowerCase()));
  if (idx >= 0) { state.slipIdx=idx; renderSlip(); }
}
function rebuild() {
  if (!state.result) { showToast('No seating plan yet.',false); return; }
  buildSlips(getExamInfo());
  state.slipIdx=0;
  show(state.slips.length>0);
  renderSlip();
}
function selExport(el, mode) {
  state.exportMode = mode;
  document.querySelectorAll('.exp-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
}

function printSlips() {
  if (!state.slips.length) { showToast('Build slips first.',false); return; }
  const printCSS = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif}
    .sli-canvas{background:#fff;width:420px;margin:20px auto;page-break-inside:avoid;overflow:hidden;border-radius:8px;border:1px solid #ddd}
    .sli-hdr{background:#2E3192;padding:12px 18px;display:flex;align-items:center;justify-content:space-between}
    .sli-logo{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:600}
    .sli-tb{text-align:center;flex:1}
    .sli-uni{font-size:9px;color:rgba(255,255,255,0.85)}
    .sli-hding{font-size:12px;font-weight:700;color:#fff;letter-spacing:.5px}
    .sli-body{padding:14px 18px;background:#fff}
    .sli-row{display:flex;gap:12px;margin-bottom:10px}
    .sli-f{flex:1}
    .sfl{font-size:8px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
    .sfv{font-size:12px;color:#1a1a2e;font-weight:500}
    .sfv.roll{font-size:16px;color:#2E3192;font-family:monospace;font-weight:700}
    .sli-div{height:0.5px;background:#e8e8f0;margin:8px 0}
    .venue-row{display:flex;gap:10px;background:#f5f5fc;border-radius:6px;padding:8px 12px;margin-bottom:10px}
    .vf{flex:1;text-align:center}
    .vl{font-size:8px;color:#666;text-transform:uppercase;letter-spacing:.5px}
    .vv{font-size:13px;color:#2E3192;font-weight:700}
    .sli-inst{font-size:8px;color:#888;line-height:1.5;margin-bottom:10px}
    .sli-foot{display:flex;justify-content:space-between;padding-top:8px;border-top:0.5px solid #e8e8f0}
    .sig{font-size:8px;color:#999;text-align:center}
    .sig-blank{border-bottom:0.5px solid #ccc;height:18px;margin-bottom:3px;width:110px}
    @media print{body{margin:0}}`;

  const allHTML = state.slips.map((s,i) =>
    buildSlipHTML(s) + (i < state.slips.length-1 ? '<div style="page-break-after:always"></div>' : '')
  ).join('');

  const w = window.open('', '_blank', 'width=620,height=820');
  w.document.write(`<html><head><title>Roll Slips</title><style>${printCSS}</style></head><body>${allHTML}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 600);
}

async function exportCSV() {
  if (!state.slips.length) { showToast('Build slips first.',false); return; }
  let csv = `Roll Number,Class,Room,Seat,Block,Date,Day,Time\n`;
  state.slips.forEach(s => {
    csv += `${s.roll},${s.className},${s.room},"${s.seat}",${s.block},${s.date},${s.day},${s.time}\n`;
  });
  if (await window.electronAPI.saveCSV(csv, 'roll_slips.csv'))
    showToast(`✓ Exported ${state.slips.length} slips to CSV`);
}
