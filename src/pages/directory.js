/**
 * directory.js — Roll Directory page module
 */
import { state } from '../js/state.js';
import { PAL }   from '../js/utils.js';

const CHUNK = 10;

export function init() {
  window.dirFilter = filterDir;

  if (!state.result) {
    document.getElementById('dir-ph').style.display  = 'flex';
    document.getElementById('dir-cnt').style.display = 'none';
    return;
  }
  document.getElementById('dir-ph').style.display  = 'none';
  document.getElementById('dir-cnt').style.display = 'block';
  renderDirectory();
}

function renderDirectory() {
  // Build rollMap: classIdx → [{ roll, roomNo, gi, ri }]
  const rollMap = state.classes.map(() => []);
  let roomNo = 0;

  state.result.groups.forEach((grp, gi) => {
    grp.allocs.forEach((alloc, ri) => {
      roomNo++;
      const rg = grp.rollGrids?.[ri];
      if (!rg) return;
      for (let r = 0; r < grp.rows; r++)
        for (let c = 0; c < grp.cols; c++) {
          const v = grp.grids[ri][r][c];
          if (v === -1) continue;
          const roll = rg[r][c];
          if (roll) rollMap[v].push({ roll, roomNo, gi, ri });
        }
    });
  });

  let html = '';
  state.classes.forEach((cls, ci) => {
    const p       = PAL[ci % PAL.length];
    const entries = rollMap[ci];
    if (!entries.length) return;

    const byRoom = {};
    entries.forEach(e => { (byRoom[e.roomNo] = byRoom[e.roomNo]||[]).push(e); });

    html += `<div class="dir-cls-block" data-class="${cls.name.toLowerCase()}">`;
    html += `<div class="dct" style="background:${p.bg};color:${p.fg};border:0.5px solid ${p.br}">
      <span style="width:8px;height:8px;border-radius:2px;background:${p.fg};display:inline-block;flex-shrink:0"></span>
      ${cls.name} — ${entries.length} students
    </div>`;
    html += `<table class="dtbl"><thead><tr><th>#</th><th>Roll Numbers</th><th>Room</th></tr></thead><tbody>`;

    let gIdx = 0;
    Object.keys(byRoom).sort((a,b)=>+a-+b).forEach(rNum => {
      const list = byRoom[rNum];
      for (let start = 0; start < list.length; start += CHUNK) {
        const chunk = list.slice(start, start+CHUNK);
        const from  = gIdx+1, to = gIdx+chunk.length;
        gIdx += chunk.length;
        const rolls = chunk.map(e => e.roll).join(', ');
        const { gi, ri } = chunk[0];
        html += `<tr class="dir-row"
          data-rolls="${rolls.toLowerCase()}"
          data-class="${cls.name.toLowerCase()}"
          onclick="nav('roomview');setTimeout(()=>rvSetView(${gi},${ri}),80)"
          title="Click to view Room ${rNum}">
          <td class="dr">${from}–${to}</td>
          <td style="color:${p.fg};word-break:break-all">${rolls}</td>
          <td><span class="pill pt-teal">Room ${rNum}</span></td>
        </tr>`;
      }
    });
    html += `</tbody></table></div>`;
  });

  document.getElementById('dir-body').innerHTML = html;
}

function filterDir(q) {
  q = q.trim().toLowerCase();
  document.querySelectorAll('.dir-row').forEach(tr => {
    const match = !q || tr.dataset.rolls.includes(q) || tr.dataset.class.includes(q);
    tr.style.display = match ? '' : 'none';
    tr.classList.toggle('shl', !!(q && match));
  });
  document.querySelectorAll('.dir-cls-block').forEach(block => {
    const visible = [...block.querySelectorAll('.dir-row')].some(r => r.style.display !== 'none');
    block.style.display = visible ? '' : 'none';
  });
}
