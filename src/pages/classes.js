/**
 * classes.js — Class Manager page module
 */
import { state } from '../js/state.js';
import { PAL }   from '../js/utils.js';

export function init() {
  window.clsAdd       = addCls;
  window.clsRemoveSel = removeSelCls;
  window.clsReset     = resetAll;
  window.clsRemove    = removeCls;
  window.clsSel       = selectCls;
  renderTable();
}

function renderTable() {
  const placed = new Array(state.classes.length).fill(0);
  if (state.result)
    state.result.groups.forEach(g => g.allocs.forEach(a => a.forEach((v,i) => placed[i] += v)));

  const warn = document.getElementById('cls-warn');

  if (!state.classes.length) {
    document.getElementById('ctbody').innerHTML =
      `<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--muted)">No classes loaded — import a CSV or Excel file first</td></tr>`;
    document.getElementById('cls-stat').textContent = 'No classes loaded';
    return;
  }

  document.getElementById('ctbody').innerHTML = state.classes.map((c,i) => {
    const p   = PAL[i % PAL.length];
    const pl  = placed[i] || 0;
    const lft = Math.max(0, c.count - pl);
    return `<tr onclick="clsSel(${i})" ${i === state.selClsRow ? 'class="sel"' : ''}>
      <td style="color:var(--muted)">${i+1}</td>
      <td><span style="display:inline-block;width:13px;height:13px;border-radius:3px;background:${p.fg}"></span></td>
      <td><input value="${c.name}" onclick="event.stopPropagation()"
          onchange="state_updateName(${i},this.value)"
          style="background:transparent;border:none;color:var(--text);font-size:12px;font-family:var(--sans);width:110px;outline:none"
          onfocus="this.style.background='var(--s2)'"
          onblur="this.style.background='transparent'"></td>
      <td style="font-family:var(--mono);color:var(--pl)">${c.count}</td>
      <td style="font-family:var(--mono);color:var(--muted)">${pl || '—'}</td>
      <td style="font-family:var(--mono);color:${lft>0?'#FFD580':'var(--tl)'}">${lft===0?'✓':lft}</td>
      <td><button class="btn btn-d" style="padding:2px 8px;font-size:10px" onclick="event.stopPropagation();clsRemove(${i})">×</button></td>
    </tr>`;
  }).join('');

  // Expose state_updateName for inline input onchange
  window.state_updateName = (i, val) => {
    state.classes[i].name = val;
    if (warn) warn.style.display = 'flex';
  };

  const tot = state.classes.reduce((s,c) => s+c.count, 0);
  document.getElementById('cls-stat').innerHTML =
    `Total: <strong style="color:var(--pl)">${tot}</strong> students · <strong style="color:var(--pl)">${state.classes.length}</strong> classes`;
}

function selectCls(i) {
  state.selClsRow = state.selClsRow === i ? -1 : i;
  renderTable();
}
function addCls() {
  state.classes.push({ name:'NEW-'+state.classes.length, count:30, rollNos:[] });
  const w = document.getElementById('cls-warn'); if (w) w.style.display='flex';
  renderTable();
}
function removeCls(i) {
  if (state.classes.length > 1) {
    state.classes.splice(i, 1); state.selClsRow = -1;
    const w = document.getElementById('cls-warn'); if (w) w.style.display='flex';
    renderTable();
  }
}
function removeSelCls() { if (state.selClsRow >= 0) removeCls(state.selClsRow); }
function resetAll() {
  state.classes = []; state.result = null; state.slips = []; state.selClsRow = -1;
  const w = document.getElementById('cls-warn'); if (w) w.style.display='none';
  renderTable();
}
