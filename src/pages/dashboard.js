/**
 * dashboard.js — Dashboard page module
 */
import { state } from '../js/state.js';

export function init() {
  refresh();
}

function refresh() {
  const tot  = state.classes.reduce((s,c) => s+c.count, 0);
  const rms  = state.roomGroups.reduce((s,g) => s+g.rooms, 0);
  setText('d-students',  tot);
  setText('d-rooms',     rms);
  setText('d-slips',     state.slips.length);
  setText('d-conflicts', state.result ? state.result.totalConflicts : '—');

  const m1 = document.getElementById('d-m1-status');
  if (m1) {
    if (state.result) {
      m1.textContent = `✓ ${state.result.totalPlaced} placed across ${rms} rooms — ${state.result.totalConflicts} conflicts`;
      m1.style.color = 'var(--tl)';
    } else if (tot) {
      m1.textContent = `${tot} students loaded — click Generate Plan to proceed`;
      m1.style.color = 'var(--muted)';
    }
  }
  const m2 = document.getElementById('d-m2-status');
  if (m2 && state.slips.length) {
    m2.textContent = `${state.slips.length} slips ready for export`;
    m2.style.color = 'var(--tl)';
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
