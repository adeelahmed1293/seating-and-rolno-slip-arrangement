/**
 * state.js — Shared application state
 * Single source of truth. Import in every page module.
 */
export const state = {
  classes:   [],
  roomGroups:[
    { rows:7, cols:6,  rooms:8, name:'Group 1 — Block A' },
    { rows:4, cols:10, rooms:4, name:'Group 2 — Block B' }
  ],
  result:    null,
  slips:     [],
  view:      { g:0, r:0 },
  selClsRow: -1,
  slipIdx:   0,
  exportMode:'all'
};
