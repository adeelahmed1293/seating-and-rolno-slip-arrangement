/**
 * datesheet.js — Exam Configuration page module
 * Reads exam info fields → builds slips → navigates to preview.
 */
import { state }     from '../js/state.js';
import { showToast } from '../js/utils.js';

export function init() {
  window.dsSaveAndPreview = saveAndPreview;

  const warn = document.getElementById('ds-no-plan');
  if (warn) warn.style.display = state.result ? 'none' : 'flex';
}

export function getExamInfo() {
  return {
    uni:   document.getElementById('ei-uni')?.value   || '',
    exam:  document.getElementById('ei-exam')?.value  || 'Final Examination',
    date:  document.getElementById('ei-date')?.value  || '',
    day:   document.getElementById('ei-day')?.value   || '',
    time:  document.getElementById('ei-time')?.value  || '',
    block: document.getElementById('ei-block')?.value || '',
    short: document.getElementById('ei-short')?.value || 'UNI',
  };
}

function saveAndPreview() {
  if (!state.result) { showToast('Generate a seating plan first.', false); return; }
  buildSlips(getExamInfo());
  nav('slips');
}

export function buildSlips(ei) {
  state.slips = [];
  let roomNo  = 0;

  state.result.groups.forEach((grp, gi) => {
    grp.allocs.forEach((alloc, ri) => {
      roomNo++;
      const rg = grp.rollGrids?.[ri];
      if (!rg) return;
      for (let r = 0; r < grp.rows; r++) {
        for (let c = 0; c < grp.cols; c++) {
          const v    = grp.grids[ri][r][c];
          if (v === -1) continue;
          const roll = rg[r][c];
          if (!roll) continue;
          state.slips.push({
            roll,
            className: state.classes[v]?.name || '?',
            room:  `Room ${roomNo}`,
            seat:  `R${r+1} C${c+1}`,
            gi, ri,
            ...ei
          });
        }
      }
    });
  });
  showToast(`✓ ${state.slips.length} slips built`);
}
