/**
 * attendance.js — Attendance Sheet
 * Three views:
 *   1. Room-wise (Column View)  — one box per column
 *   2. Room-wise (Class View)   — one box per class, ascending reg no
 *   3. Class-wise               — flat single table per class, import order
 */
import { state }     from '../js/state.js';
import { showToast } from '../js/utils.js';

const UNI_NAME = 'Dr. A. Q. Khan Institute of Computer Sciences & Information Technology';

// Which preview tab is active: 'col' | 'cls' | 'cw'
let activeView = 'col';

export function init() {
  window.attSetPreview      = setPreview;
  window.attSetView         = setView;
  window.attDownloadColView = downloadColView;
  window.attDownloadClsView = downloadClsView;
  window.attDownloadAllCW   = downloadAllClasswise;
  window.attDownloadByClass = downloadByClass;

  if (!state.result) {
    document.getElementById('att-ph').style.display  = 'flex';
    document.getElementById('att-cnt').style.display = 'none';
    return;
  }
  document.getElementById('att-ph').style.display  = 'none';
  document.getElementById('att-cnt').style.display = 'block';

  renderGroupTabs();
  renderRoomTabs();
  renderClassButtons();
  renderPreview();
}

/* ── Preview tab switch ─────────────────────────────────────── */

function setPreview(view) {
  activeView = view;
  // Update tab buttons
  ['col','cls','cw'].forEach(v => {
    const btn = document.getElementById('att-ptab-' + v);
    if (btn) btn.className = 'btn ' + (v === view ? 'btn-p' : 'btn-ot') + ' att-ptab';
  });
  // Show/hide room selector (not needed for class-wise)
  const roomSel = document.getElementById('att-room-sel');
  if (roomSel) roomSel.style.display = view === 'cw' ? 'none' : 'block';
  renderPreview();
}

function renderPreview() {
  const el = document.getElementById('att-preview');
  if (!el) return;
  if (activeView === 'col') {
    el.innerHTML = buildColViewRoomHTML(state.view.g, state.view.r);
  } else if (activeView === 'cls') {
    el.innerHTML = buildClsViewRoomHTML(state.view.g, state.view.r);
  } else {
    // class-wise: show all classes stacked
    el.innerHTML = state.classes.map((_, ci) => buildClassSingleSheetHTML(ci)).join('');
  }
}

/* ── Room tabs ──────────────────────────────────────────────── */

function renderGroupTabs() {
  document.getElementById('att-gtabs').innerHTML =
    state.result.groups.map((g, gi) =>
      `<button class="tab${gi === state.view.g ? ' at' : ''}" onclick="attSetView(${gi},0)">
        ${g.name || 'Group ' + (gi + 1)} · ${g.rows}×${g.cols}
      </button>`).join('');
}

function renderRoomTabs() {
  const grp    = state.result.groups[state.view.g];
  const offset = getRoomOffset(state.view.g);
  document.getElementById('att-rtabs').innerHTML =
    Array.from({ length: grp.rooms }, (_, ri) =>
      `<button class="tab${ri === state.view.r ? ' at' : ''}" onclick="attSetView(${state.view.g},${ri})">
        Room ${offset + ri + 1}
      </button>`).join('');
}

function setView(gi, ri) {
  state.view = { g: gi, r: Math.min(ri, (state.result.groups[gi]?.rooms || 1) - 1) };
  renderGroupTabs();
  renderRoomTabs();
  renderPreview();
}

/* ── Per-class download buttons ─────────────────────────────── */

function renderClassButtons() {
  const el = document.getElementById('att-class-btns');
  if (!el) return;
  el.innerHTML = state.classes.map((c, i) =>
    `<button class="btn btn-ot" style="font-size:10px;padding:4px 10px"
       onclick="attDownloadByClass(${i})">⬇ ${c.name}</button>`
  ).join('');
}

/* ── Helpers ────────────────────────────────────────────────── */

function getRoomOffset(upToGroup) {
  let n = 0;
  for (let i = 0; i < upToGroup; i++) n += state.result.groups[i].rooms;
  return n;
}

function getColumnData(gi, ri) {
  const grp  = state.result.groups[gi];
  const rg   = grp.rollGrids?.[ri];
  const cols = Array.from({ length: grp.cols }, () => []);
  for (let r = 0; r < grp.rows; r++) {
    for (let c = 0; c < grp.cols; c++) {
      const v = grp.grids[ri][r][c];
      if (v === -1) continue;
      const roll = rg?.[r]?.[c] || null;
      if (!roll) continue;
      cols[c].push({ roll, className: state.classes[v]?.name || '?', classIdx: v, row: r + 1 });
    }
  }
  return cols;
}

function getClassMapForRoom(gi, ri) {
  const grp      = state.result.groups[gi];
  const rg       = grp.rollGrids?.[ri];
  const classMap = new Map();
  for (let r = 0; r < grp.rows; r++) {
    for (let c = 0; c < grp.cols; c++) {
      const v = grp.grids[ri][r][c];
      if (v === -1) continue;
      const roll = rg?.[r]?.[c] || null;
      if (!roll) continue;
      if (!classMap.has(v)) classMap.set(v, []);
      classMap.get(v).push({ roll, className: state.classes[v]?.name || '?' });
    }
  }
  classMap.forEach(arr =>
    arr.sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true }))
  );
  return classMap;
}

/* ── Shared box/table builders ──────────────────────────────── */

function makeBox(headerLeft, headerRight, count, rowsHTML) {
  return `
    <div class="col-box">
      <div class="col-box-hdr">
        <span class="cb-lbl-col">${headerLeft}</span>
        <span class="cb-lbl-cls">${headerRight}</span>
        <span class="cb-lbl-cnt">${count} student${count !== 1 ? 's' : ''}</span>
      </div>
      <table class="cb-table">
        <thead><tr>
          <th class="cb-no">#</th>
          <th class="cb-roll">Registration No.</th>
          <th class="cb-name">Student Name</th>
          <th class="cb-class">Class</th>
          <th class="cb-subj">Subject</th>
          <th class="cb-sheet">Sheet No.</th>
          <th class="cb-sig">Signature</th>
        </tr></thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>`;
}

function makeRows(students) {
  return students.length
    ? students.map((s, i) => `
        <tr>
          <td class="cb-no">${i + 1}</td>
          <td class="cb-roll">${s.roll}</td>
          <td class="cb-name"></td>
          <td class="cb-class">${s.className}</td>
          <td class="cb-subj"></td>
          <td class="cb-sheet"></td>
          <td class="cb-sig"></td>
        </tr>`).join('')
    : `<tr><td colspan="7" style="text-align:center;color:#aaa;padding:8px;font-style:italic">No students</td></tr>`;
}

function roomHeader(roomNo, grp, totalStud, viewLabel) {
  return `
    <div class="att-hdr">
      <div class="att-uni-name">${UNI_NAME}</div>
      <div class="att-title">ATTENDANCE SHEET <span style="font-size:11px;font-weight:400;letter-spacing:0;color:#666">(${viewLabel})</span></div>
      <div class="att-meta">
        Room ${roomNo} &nbsp;·&nbsp; ${grp.name || 'Group'}
        &nbsp;·&nbsp; ${grp.rows} Rows × ${grp.cols} Columns
        &nbsp;·&nbsp; ${totalStud} Students
      </div>
    </div>`;
}

function roomFooter() {
  return `
    <div class="att-foot">
      <div class="att-sig-box"><div class="att-sig-line"></div><div class="att-sig-lbl">Invigilator Signature</div></div>
      <div class="att-sig-box"><div class="att-sig-line"></div><div class="att-sig-lbl">Controller of Examinations</div></div>
    </div>`;
}

/* ── VIEW 1: Room-wise Column View ──────────────────────────── */

function buildColViewRoomHTML(gi, ri) {
  const grp    = state.result.groups[gi];
  const roomNo = getRoomOffset(gi) + ri + 1;
  const cols   = getColumnData(gi, ri);
  const total  = cols.reduce((s, c) => s + c.length, 0);

  const boxesHTML = cols.map((students, ci) => {
    const classes = [...new Set(students.map(s => s.className))].join(' · ') || '—';
    return makeBox(`Column ${ci + 1}`, classes, students.length, makeRows(students));
  }).join('');

  return `<div class="att-room-sheet">
    ${roomHeader(roomNo, grp, total, 'Room-wise · Column View')}
    <div class="col-boxes-wrap">${boxesHTML}</div>
    ${roomFooter()}
  </div>`;
}

/* ── VIEW 2: Room-wise Class View ───────────────────────────── */

function buildClsViewRoomHTML(gi, ri) {
  const grp      = state.result.groups[gi];
  const roomNo   = getRoomOffset(gi) + ri + 1;
  const classMap = getClassMapForRoom(gi, ri);
  const total    = [...classMap.values()].reduce((s, a) => s + a.length, 0);

  const boxesHTML = [...classMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, students]) => {
      const className = students[0]?.className || '?';
      return makeBox(className, '', students.length, makeRows(students));
    }).join('');

  return `<div class="att-room-sheet">
    ${roomHeader(roomNo, grp, total, 'Room-wise · Class View')}
    <div class="col-boxes-wrap">${boxesHTML}</div>
    ${roomFooter()}
  </div>`;
}

/* ── VIEW 3: Class-wise flat sheet ──────────────────────────── */

function buildClassSingleSheetHTML(classIdx) {
  const cls       = state.classes[classIdx];
  const className = cls?.name || '?';
  const rollNos   = cls?.rollNos || [];

  const rowsHTML = rollNos.map((roll, idx) => `
    <tr>
      <td class="cs-no">${idx + 1}</td>
      <td class="cs-roll">${roll}</td>
      <td class="cs-name"></td>
      <td class="cs-class">${className}</td>
      <td class="cs-subj"></td>
      <td class="cs-sheet"></td>
      <td class="cs-sig"></td>
    </tr>`).join('');

  return `
    <div class="att-room-sheet">
      <div class="att-hdr">
        <div class="att-uni-name">${UNI_NAME}</div>
        <div class="att-title">ATTENDANCE SHEET <span style="font-size:11px;font-weight:400;letter-spacing:0;color:#666">(Class-wise)</span></div>
        <div class="att-meta">Class: <strong>${className}</strong> &nbsp;·&nbsp; Total Students: <strong>${rollNos.length}</strong></div>
      </div>
      <table class="cs-table">
        <thead><tr>
          <th class="cs-no">#</th>
          <th class="cs-roll">Registration No.</th>
          <th class="cs-name">Student Name</th>
          <th class="cs-class">Class</th>
          <th class="cs-subj">Subject</th>
          <th class="cs-sheet">Sheet No.</th>
          <th class="cs-sig">Signature</th>
        </tr></thead>
        <tbody>${rowsHTML}</tbody>
      </table>
      ${roomFooter()}
    </div>`;
}

/* ── Downloads ──────────────────────────────────────────────── */

async function savePDF(html, name) {
  const res = await window.electronAPI.savePDF(html, sharedCSS(), name);
  if (res?.ok) showToast(`✓ PDF saved — ${name}`);
  else         showToast(res?.err || 'Download failed', false);
}

async function downloadColView() {
  if (!state.result) { showToast('No seating plan yet.', false); return; }
  let html = '';
  state.result.groups.forEach((grp, gi) => grp.grids.forEach((_, ri) => { html += buildColViewRoomHTML(gi, ri); }));
  await savePDF(html, 'attendance_column_view.pdf');
}

async function downloadClsView() {
  if (!state.result) { showToast('No seating plan yet.', false); return; }
  let html = '';
  state.result.groups.forEach((grp, gi) => grp.grids.forEach((_, ri) => { html += buildClsViewRoomHTML(gi, ri); }));
  await savePDF(html, 'attendance_class_view.pdf');
}

async function downloadAllClasswise() {
  if (!state.result) { showToast('No seating plan yet.', false); return; }
  const html = state.classes.map((_, ci) => buildClassSingleSheetHTML(ci)).join('');
  await savePDF(html, 'attendance_all_classes.pdf');
}

async function downloadByClass(classIdx) {
  const className = state.classes[classIdx]?.name || 'class';
  const html      = buildClassSingleSheetHTML(classIdx);
  const safeName  = className.replace(/[^a-zA-Z0-9_\-]/g, '_');
  await savePDF(html, `attendance_${safeName}.pdf`);
}

/* ── CSS ────────────────────────────────────────────────────── */

function sharedCSS() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; color: #111; font-size: 11px; }

    .att-room-sheet { padding: 16px 20px; max-width: 900px; margin: 0 auto; page-break-after: always; break-after: page; }
    .att-room-sheet:last-child { page-break-after: avoid; break-after: avoid; }

    .att-hdr { text-align: center; border: 1.5px solid #ccc; border-radius: 4px; padding: 8px 14px; margin-bottom: 12px; }
    .att-uni-name { font-size: 12px; font-weight: 700; color: #111; margin-bottom: 2px; }
    .att-title { font-size: 16px; font-weight: 700; color: #333; letter-spacing: 2px; margin-bottom: 3px; }
    .att-meta { font-size: 10px; color: #555; }

    .col-boxes-wrap { display: flex; flex-direction: column; gap: 10px; }

    .col-box { border: 1.5px solid #ccc; border-radius: 4px; overflow: hidden; page-break-inside: avoid; break-inside: avoid; }
    .col-box-hdr { background: #fce8e8; border-bottom: 1px solid #ddb; padding: 5px 10px; display: flex; align-items: center; gap: 12px; }
    .cb-lbl-col { font-size: 11px; font-weight: 700; color: #333; white-space: nowrap; }
    .cb-lbl-cls { font-size: 10px; color: #555; flex: 1; }
    .cb-lbl-cnt { font-size: 10px; color: #777; white-space: nowrap; }

    .cb-table { width: 100%; border-collapse: collapse; }
    .cb-table th { background: #fce8e8; color: #333; padding: 5px 7px; font-size: 9.5px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: .3px; border-bottom: 1px solid #ddb; border-right: 1px solid #ddb; }
    .cb-table th:last-child { border-right: none; }
    .cb-table td { padding: 5px 7px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-size: 10px; color: #111; }
    .cb-table td:last-child { border-right: none; }
    .cb-table tr:last-child td { border-bottom: none; }
    .cb-table tr:nth-child(even) td { background: #fffafa; }
    .cb-no { width:26px; text-align:center; color:#888; }
    .cb-roll { width:140px; font-family:monospace; font-weight:700; }
    .cb-name { width:130px; }
    .cb-class { width:80px; }
    .cb-subj { width:95px; }
    .cb-sheet { width:64px; text-align:center; }

    .cs-table { width:100%; border-collapse:collapse; border:1.5px solid #ccc; margin-top:6px; }
    .cs-table th { background:#fce8e8; color:#333; padding:6px 8px; font-size:9.5px; font-weight:700; text-align:left; text-transform:uppercase; letter-spacing:.3px; border-bottom:1.5px solid #ddb; border-right:1px solid #ddb; }
    .cs-table th:last-child { border-right:none; }
    .cs-table td { padding:6px 8px; border-bottom:1px solid #eee; border-right:1px solid #eee; font-size:10px; color:#111; }
    .cs-table td:last-child { border-right:none; }
    .cs-table tr:last-child td { border-bottom:none; }
    .cs-table tr:nth-child(even) td { background:#fffafa; }
    .cs-no { width:26px; text-align:center; color:#888; }
    .cs-roll { width:145px; font-family:monospace; font-weight:700; }
    .cs-name { width:140px; }
    .cs-class { width:80px; }
    .cs-subj { width:100px; }
    .cs-sheet { width:68px; text-align:center; }

    .att-foot { display:flex; justify-content:space-between; margin-top:18px; padding-top:10px; border-top:1px solid #ccc; }
    .att-sig-box { text-align:center; }
    .att-sig-line { border-bottom:1px solid #555; width:200px; height:26px; margin-bottom:4px; }
    .att-sig-lbl { font-size:9px; color:#666; }

    @media print { body { margin:0; } @page { margin:10mm; size:A4 portrait; } }
  `;
}
