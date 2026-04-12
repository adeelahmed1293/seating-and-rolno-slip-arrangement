/**
 * import.js — Import Data page module
 */
import { state } from '../js/state.js';
import { showToast } from '../js/utils.js';
import { openAndImport } from '../js/fileImport.js';
import { PAL } from '../js/utils.js';

export function init() {
  // Expose onclick handlers globally
  window.importTrigger = triggerOpen;
  window.importClear   = clearImport;
  // Restore previous import status if classes are already loaded
  if (state.classes.length) showLoaded();
}

async function triggerOpen() {
  try {
    const res = await openAndImport();
    if (!res) return;
    showLoaded(res.src);
    showToast(`✓ Loaded ${state.classes.length} classes, ${state.classes.reduce((s,c)=>s+c.count,0)} students`);
  } catch (e) {
    showError(e.message);
    showToast(e.message, false);
  }
}

function showLoaded(src) {
  const dz = document.getElementById('importDz');
  if (dz) dz.classList.add('loaded');
  const dzTxt = document.getElementById('dz-txt');
  if (dzTxt) dzTxt.innerHTML = src
    ? `<span style="color:var(--tl)">${src}</span><br><span style="font-size:10px;color:var(--muted)">Loaded successfully</span>`
    : `<span style="color:var(--tl)">File loaded</span><br><span style="font-size:10px;color:var(--muted)">${state.classes.length} classes · ${state.classes.reduce((s,c)=>s+c.count,0)} students</span>`;

  const chips = state.classes.map((c,i) =>
    `<span class="chip" style="background:${PAL[i%PAL.length].bg};color:${PAL[i%PAL.length].fg}">${c.name}·${c.rollNos.length}</span>`
  ).join('');

  const total = state.classes.reduce((s,c) => s+c.rollNos.length, 0);
  const st = document.getElementById('csvStatus');
  if (st) st.innerHTML = `
    <div class="alert a-ok">✓ <strong>${state.classes.length} classes</strong> · ${total} students loaded</div>
    <div class="chips">${chips}</div>`;
}

function showError(msg) {
  const st = document.getElementById('csvStatus');
  if (st) st.innerHTML = `<div class="alert a-err">⚠ ${msg}</div>`;
}

function clearImport() {
  state.classes   = [];
  state.result    = null;
  state.slips     = [];
  const dz = document.getElementById('importDz');
  if (dz) dz.classList.remove('loaded');
  const dzTxt = document.getElementById('dz-txt');
  if (dzTxt) dzTxt.innerHTML = 'Drop Excel (.xlsx) or CSV here<br><span style="font-size:10px;color:var(--dim)">or click to browse</span>';
  const st = document.getElementById('csvStatus');
  if (st) st.innerHTML = '';
}
