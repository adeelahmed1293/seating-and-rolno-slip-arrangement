/**
 * rooms.js — Room Groups page module
 */
import { state } from '../js/state.js';

export function init() {
  window.rgAdd    = addRG;
  window.rgRemove = removeRG;
  window.rgAdj    = adjRG;
  window.rgChange = changeRG;
  renderRG();
}

function renderRG() {
  const tot   = state.classes.reduce((s,c) => s+c.count, 0);
  const seats = state.roomGroups.reduce((s,g) => s+g.rows*g.cols*g.rooms, 0);

  document.getElementById('cap-seats').textContent = seats;
  document.getElementById('cap-stud').textContent  = tot;

  const capEl = document.getElementById('cap-status');
  if (!tot)
    capEl.innerHTML = `<span class="pill pt-grey">Load classes first</span>`;
  else if (seats >= tot)
    capEl.innerHTML = `<span class="pill pt-green">✓ Sufficient (${seats-tot} spare seats)</span>`;
  else
    capEl.innerHTML = `<span class="pill pt-red">✗ Need ${tot-seats} more seats</span>`;

  document.getElementById('rglist').innerHTML = state.roomGroups.map((g,i) => `
    <div class="rg-card">
      <div class="rg-head">
        <span class="rg-title">${g.name || 'Group '+(i+1)}</span>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="pill pt-teal">${g.rows*g.cols} seats/room · ${g.rows*g.cols*g.rooms} total</span>
          <button class="btn btn-d" style="padding:3px 9px;font-size:10px"
            onclick="rgRemove(${i})" ${state.roomGroups.length===1?'disabled style="opacity:.3"':''}>× Delete</button>
        </div>
      </div>
      <div class="cg">
        <div class="cgrp">
          <div class="clbl">Rows per room</div>
          <div class="crow">
            <button class="nb" onclick="rgAdj(${i},'rows',-1)">−</button>
            <input class="ni-input" type="number" value="${g.rows}" min="2" max="30"
              onchange="rgChange(${i},'rows',this.value)">
            <button class="nb" onclick="rgAdj(${i},'rows',1)">+</button>
          </div>
          <div class="cc">Rows: <span>${g.rows}</span></div>
        </div>
        <div class="cgrp">
          <div class="clbl">Seats per row (cols)</div>
          <div class="crow">
            <button class="nb" onclick="rgAdj(${i},'cols',-1)">−</button>
            <input class="ni-input" type="number" value="${g.cols}" min="2" max="30"
              onchange="rgChange(${i},'cols',this.value)">
            <button class="nb" onclick="rgAdj(${i},'cols',1)">+</button>
          </div>
          <div class="cc">Cols: <span>${g.cols}</span> → <span>${g.rows*g.cols}</span> seats/room</div>
        </div>
        <div class="cgrp">
          <div class="clbl">Number of rooms</div>
          <div class="crow">
            <button class="nb" onclick="rgAdj(${i},'rooms',-1)">−</button>
            <input class="ni-input" type="number" value="${g.rooms}" min="1" max="50"
              onchange="rgChange(${i},'rooms',this.value)">
            <button class="nb" onclick="rgAdj(${i},'rooms',1)">+</button>
          </div>
          <div class="cc">Total: <span>${g.rows*g.cols*g.rooms}</span> seats</div>
        </div>
      </div>
    </div>`).join('');
}

function adjRG(i, field, delta) {
  const lim = { rows:[2,30], cols:[2,30], rooms:[1,50] };
  state.roomGroups[i][field] = Math.max(lim[field][0], Math.min(lim[field][1], state.roomGroups[i][field] + delta));
  renderRG();
}
function changeRG(i, field, val) {
  const lim = { rows:[2,30], cols:[2,30], rooms:[1,50] };
  state.roomGroups[i][field] = Math.max(lim[field][0], Math.min(lim[field][1], +val));
  renderRG();
}
function addRG() {
  state.roomGroups.push({ rows:6, cols:8, rooms:3, name:'Group '+(state.roomGroups.length+1) });
  renderRG();
}
function removeRG(i) {
  if (state.roomGroups.length > 1) { state.roomGroups.splice(i,1); renderRG(); }
}
