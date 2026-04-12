/**
 * generate.js — Generate Plan page module
 */
import { state }                       from '../js/state.js';
import { PAL, showToast }              from '../js/utils.js';
import { generatePlan, countConflicts } from '../js/algorithms.js';

export function init() {
  window.genRun           = run;
  window.genExportAll     = exportAll;
  window.genExportSummary = exportSummary;
  updateChecklist();
  // If result already exists, show it
  if (state.result) showResult();
}

function updateChecklist() {
  const tot   = state.classes.reduce((s,c) => s+c.count, 0);
  const seats = state.roomGroups.reduce((s,g) => s+g.rows*g.cols*g.rooms, 0);
  const rms   = state.roomGroups.reduce((s,g) => s+g.rooms, 0);

  function ok(iId, dId, txt)   { setIcon(iId,'ci-ok','✓');  setHTML(dId,`<span style="color:var(--tl)">${txt}</span>`); }
  function fail(iId, dId, txt) { setIcon(iId,'ci-fail','✗'); setText(dId, txt); }

  state.classes.length
    ? ok('chk1-i','chk1-d',`${state.classes.length} classes · ${tot} students`)
    : fail('chk1-i','chk1-d','No classes loaded');

  rms
    ? ok('chk2-i','chk2-d',`${rms} rooms · ${seats} seats`)
    : fail('chk2-i','chk2-d','No rooms configured');

  if (seats && tot) {
    seats >= tot
      ? ok('chk3-i','chk3-d',`Sufficient (${seats} seats for ${tot} students)`)
      : fail('chk3-i','chk3-d',`Need ${tot-seats} more seats`);
  } else {
    setIcon('chk3-i','ci-pend','⋯'); setText('chk3-d','—');
  }
}

function run() {
  if (!state.classes.length) { showToast('Import student data first.',false); return; }
  try {
    state.result = generatePlan(state.classes, state.roomGroups);
    state.slips  = [];
    showResult();
    showToast(`✓ ${state.result.totalPlaced} placed, ${state.result.totalConflicts} conflicts`);
  } catch(e) {
    showToast(e.message, false);
  }
}

function showResult() {
  const { totalPlaced, totalConflicts, totalStudents, groups } = state.result;
  const unplaced   = totalStudents - totalPlaced;
  const totalRooms = groups.reduce((s,g) => s+g.rooms, 0);

  document.getElementById('gen-res').style.display = 'block';
  const banner = document.getElementById('gen-banner');
  banner.innerHTML = unplaced===0 && totalConflicts===0
    ? `✓ All ${totalStudents} students placed — Zero conflicts — ${totalRooms} rooms used`
    : `⚠ ${totalPlaced} placed · ${unplaced} unplaced · ${totalConflicts} conflicts`;
  banner.className = 'alert ' + (unplaced===0 && totalConflicts===0 ? 'a-ok' : 'a-warn');

  document.getElementById('gen-stats').innerHTML = `
    <div class="st"><div class="stn" style="color:#2980B9">${totalStudents}</div><div class="stl">Students</div></div>
    <div class="st"><div class="stn" style="color:var(--tl)">${totalPlaced}</div><div class="stl">Placed</div></div>
    <div class="st"><div class="stn" style="color:${unplaced>0?'#FFD580':'var(--tl)'}">${unplaced}</div><div class="stl">Unplaced</div></div>
    <div class="st"><div class="stn" style="color:var(--tl)">${totalRooms}</div><div class="stl">Rooms</div></div>
    <div class="st"><div class="stn" style="color:${totalConflicts>0?'#ef4444':'var(--tl)'}">${totalConflicts}</div><div class="stl">Conflicts</div></div>`;

  document.getElementById('gen-leg').innerHTML = state.classes.map((c,i) => {
    const p = PAL[i%PAL.length];
    return `<div class="legp" style="background:${p.bg}">
      <div class="legd" style="background:${p.fg}"></div>
      <span style="color:${p.fg}">${c.name} · ${c.count}</span>
    </div>`;
  }).join('');
}

export async function exportAll() {
  if (!state.result) { showToast('Generate a plan first.',false); return; }
  let csv = ''; let rn = 0;
  state.result.groups.forEach((grp,gi) => {
    grp.grids.forEach((g,ri) => {
      const rg = grp.rollGrids?.[ri];
      csv += `Group ${gi+1} - Room ${++rn} (${grp.rows}x${grp.cols})\n`;
      csv += ',' + Array.from({length:grp.cols},(_,c)=>'C'+(c+1)).join(',') + '\n';
      for (let r=0; r<grp.rows; r++)
        csv += `R${r+1},` + g[r].map((v,c) => {
          if (v===-1) return '';
          const nm   = state.classes[v]?.name || '?';
          const roll = rg?.[r]?.[c] || '';
          return roll ? `${nm}(${roll})` : nm;
        }).join(',') + '\n';
      csv += '\n';
    });
  });
  if (await window.electronAPI.saveCSV(csv,'seating_all_rooms.csv')) showToast('✓ Exported all rooms CSV');
}

export async function exportSummary() {
  if (!state.result) { showToast('Generate a plan first.',false); return; }
  let csv = `Room,Group,Size,Seated,Conflicts,${state.classes.map(c=>c.name).join(',')}\n`;
  let rn = 0;
  state.result.groups.forEach((grp,gi) => {
    grp.allocs.forEach((alloc,ri) => {
      const seated = alloc.reduce((s,v)=>s+v,0);
      const cf     = countConflicts(grp.grids[ri]);
      csv += `Room ${++rn},${grp.name||'G'+(gi+1)},${grp.rows}x${grp.cols},${seated},${cf},${alloc.join(',')}\n`;
    });
  });
  if (await window.electronAPI.saveCSV(csv,'seating_summary.csv')) showToast('✓ Exported summary CSV');
}

/* helpers */
function setIcon(id, cls, txt) {
  const el = document.getElementById(id);
  if (el) { el.className = 'cion ' + cls; el.textContent = txt; }
}
function setText(id, txt) { const el=document.getElementById(id); if(el) el.textContent=txt; }
function setHTML(id, html) { const el=document.getElementById(id); if(el) el.innerHTML=html; }
