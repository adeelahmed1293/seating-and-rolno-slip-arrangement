/**
 * exportUtils.js — CSV export and slip builder
 */
import { countConflicts } from './seating.js';

/** Build slip objects from a generated seating result + exam info */
export function buildSlips(classes, result, examInfo) {
  const slips = [];
  let roomNo  = 0;

  result.groups.forEach((grp, gi) => {
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
          slips.push({
            roll,
            className: classes[v]?.name || '?',
            room:  `Room ${roomNo}`,
            seat:  `R${r + 1} C${c + 1}`,
            gi, ri,
            ...examInfo,
          });
        }
      }
    });
  });

  return slips;
}

/** Export all rooms layout as CSV */
export async function exportAllRooms(classes, result) {
  let csv = '';
  let rn  = 0;

  result.groups.forEach((grp, gi) => {
    grp.grids.forEach((g, ri) => {
      const rg = grp.rollGrids?.[ri];
      csv += `Group ${gi + 1} - Room ${++rn} (${grp.rows}x${grp.cols})\n`;
      csv += ',' + Array.from({ length: grp.cols }, (_, c) => 'C' + (c + 1)).join(',') + '\n';
      for (let r = 0; r < grp.rows; r++) {
        csv += `R${r + 1},` + g[r].map((v, c) => {
          if (v === -1) return '';
          const nm   = classes[v]?.name || '?';
          const roll = rg?.[r]?.[c] || '';
          return roll ? `${nm}(${roll})` : nm;
        }).join(',') + '\n';
      }
      csv += '\n';
    });
  });

  return window.electronAPI.saveCSV(csv, 'seating_all_rooms.csv');
}

/** Export summary table as CSV */
export async function exportSummary(classes, result) {
  let csv = `Room,Group,Size,Seated,Conflicts,${classes.map(c => c.name).join(',')}\n`;
  let rn  = 0;

  result.groups.forEach((grp, gi) => {
    grp.allocs.forEach((alloc, ri) => {
      const seated = alloc.reduce((s, v) => s + v, 0);
      const cf     = countConflicts(grp.grids[ri]);
      csv += `Room ${++rn},${grp.name || 'G' + (gi + 1)},${grp.rows}x${grp.cols},${seated},${cf},${alloc.join(',')}\n`;
    });
  });

  return window.electronAPI.saveCSV(csv, 'seating_summary.csv');
}

/** Export slip list as CSV */
export async function exportSlipsCSV(slips) {
  let csv = `Roll Number,Class,Room,Seat,Block,Date,Day,Time\n`;
  slips.forEach(s => {
    csv += `${s.roll},${s.className},${s.room},"${s.seat}",${s.block},${s.date},${s.day},${s.time}\n`;
  });
  return window.electronAPI.saveCSV(csv, 'roll_slips.csv');
}
