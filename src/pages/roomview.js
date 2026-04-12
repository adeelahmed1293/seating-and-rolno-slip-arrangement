/**
 * roomview.js — Room View page module
 */
import { state }                        from '../js/state.js';
import { PAL }                          from '../js/utils.js';
import { countConflicts, hasConflict }  from '../js/algorithms.js';

export function init() {
  window.rvSetView   = setView;
  window.rvCycleCell = cycleCell;

  if (!state.result) {
    document.getElementById('rv-ph').style.display  = 'flex';
    document.getElementById('rv-cnt').style.display = 'none';
    return;
  }
  document.getElementById('rv-ph').style.display  = 'none';
  document.getElementById('rv-cnt').style.display = 'block';
  renderGroupTabs();
  renderRoomTabs();
  renderGrid();
}

function renderGroupTabs() {
  document.getElementById('rv-gtabs').innerHTML = state.result.groups.map((g,gi) =>
    `<button class="tab${gi===state.view.g?' at':''}" onclick="rvSetView(${gi},0)">
      ${g.name||'Group '+(gi+1)} · ${g.rows}×${g.cols}
    </button>`
  ).join('');
}

function renderRoomTabs() {
  const grp = state.result.groups[state.view.g];
  document.getElementById('rv-rtabs').innerHTML = Array.from({length:grp.rooms}, (_,ri) => {
    const cf = countConflicts(grp.grids[ri]);
    return `<button class="tab${ri===state.view.r?' at':''}${cf>0?' wt':''}" onclick="rvSetView(${state.view.g},${ri})">R${ri+1}</button>`;
  }).join('');
}

function renderGrid() {
  const gi  = state.view.g, ri = state.view.r;
  const grp = state.result.groups[gi];
  const g   = grp.grids[ri];
  const rg  = grp.rollGrids?.[ri];
  const alloc = grp.allocs[ri];
  const R = grp.rows, C = grp.cols;
  const seated    = alloc.reduce((s,v)=>s+v,0);
  const cf        = countConflicts(g);
  const activeCls = alloc.map((v,i)=>v>0?i:-1).filter(i=>i>=0);

  // Room header
  document.getElementById('rv-rhead').innerHTML = `
    <span class="rnum">Room ${ri+1}</span>
    <span class="pill pt-teal">${grp.name||'Group '+(gi+1)} · ${R}×${C}</span>
    <span class="pill ${cf===0?'pt-green':'pt-red'}">${cf===0?'✓ Zero Conflicts':'⚠ '+cf+' conflicts'}</span>
    <span class="pill pt-grey">${seated}/${R*C} seated · ${activeCls.length} classes</span>`;

  // Class chips
  document.getElementById('rv-chips').innerHTML = activeCls.map(i => {
    const p = PAL[i%PAL.length];
    return `<span class="chip" style="background:${p.bg};color:${p.fg}">${state.classes[i].name}: ${alloc[i]}</span>`;
  }).join('');

  // Build grid DOM
  const wrap = document.getElementById('rv-grid');

  const colRow = document.createElement('div');
  colRow.className = 'clbls';
  colRow.style.cssText = `display:grid;grid-template-columns:20px repeat(${C},1fr);gap:3px`;
  colRow.innerHTML = '<div></div>' + Array.from({length:C},(_,c)=>`<div class="clbl-c">${c+1}</div>`).join('');

  const gridEl = document.createElement('div');
  gridEl.style.cssText = `display:grid;grid-template-columns:20px repeat(${C},1fr);gap:3px`;

  for (let r = 0; r < R; r++) {
    const rl = document.createElement('div');
    rl.className = 'srl'; rl.textContent = r+1;
    gridEl.appendChild(rl);

    for (let c = 0; c < C; c++) {
      const v = g[r][c];
      const d = document.createElement('div');
      if (v === -1) {
        d.className = 'seat empty';
        d.innerHTML = `<div class="s-roll" style="color:var(--dim)">---</div>`;
        gridEl.appendChild(d); continue;
      }
      const p       = PAL[v%PAL.length];
      const nm      = state.classes[v]?.name || '?';
      const rollNo  = rg?.[r]?.[c] || null;
      const conflict = hasConflict(g,r,c);
      d.className   = 'seat' + (conflict?' conflict':'');
      d.style.background  = p.bg;
      d.style.borderColor = p.bg;
      if (conflict) d.style.border = '1.5px solid var(--danger)';
      const pos = `R${r+1}C${c+1}`;
      d.innerHTML = `
        <div class="s-cls"  style="color:${p.fg}">${nm}</div>
        <div class="s-roll" style="color:${p.fg}">${rollNo||'—'}</div>
        <div class="s-pos"  style="color:${p.fg}">${pos}</div>
        <span class="tt">${pos} · ${nm}${rollNo?' · '+rollNo:''}</span>`;
      d.onclick = () => cycleCell(gi, ri, r, c);
      gridEl.appendChild(d);
    }
  }

  wrap.innerHTML = '';
  wrap.appendChild(colRow);
  wrap.appendChild(gridEl);
}

function setView(g, r) {
  state.view = { g, r: Math.min(r, (state.result.groups[g]?.rooms||1)-1) };
  renderGroupTabs();
  renderRoomTabs();
  renderGrid();
}

function cycleCell(gi, ri, r, c) {
  const grp    = state.result.groups[gi];
  const active = grp.allocs[ri].map((v,i)=>v>0?i:-1).filter(i=>i>=0);
  if (!active.length) return;
  const cur = grp.grids[ri][r][c];
  const pos = active.indexOf(cur);
  grp.grids[ri][r][c] = active[(pos + (cur===-1?0:1)) % active.length];
  renderGrid();
}
