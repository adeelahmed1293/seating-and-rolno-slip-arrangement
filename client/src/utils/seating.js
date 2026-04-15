/**
 * seating.js — Anti-cheat 4-class checkerboard algorithm
 *
 * Pattern: seat(r,c) = slot[ (r%2)*2 + (c%2) ]
 *   Even rows: A B A B …   (slots 0 & 1)
 *   Odd  rows: C D C D …   (slots 2 & 3)
 *
 * Guarantees ZERO 8-neighbour same-class conflicts.
 * Students fill globally largest → smallest across all rooms.
 */



export function countConflicts(grid) {
  const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const R = grid.length, C = grid[0].length;
  let count = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === -1) continue;
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === grid[r][c]) {
          count++; break;
        }
      }
    }
  }
  return Math.floor(count / 2);
}

export function hasConflict(grid, r, c) {
  if (grid[r][c] === -1) return false;
  const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const R = grid.length, C = grid[0].length;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === grid[r][c]) return true;
  }
  return false;
}

export function generatePlan(classes, roomGroups) {
  const totalStudents = classes.reduce((s, c) => s + c.count, 0);
  const totalSeats    = roomGroups.reduce((s, g) => s + g.rows * g.cols * g.rooms, 0);

  if (totalSeats < totalStudents) {
    throw new Error(`Not enough seats! ${totalSeats} seats for ${totalStudents} students. Add more rooms.`);
  }

  // Sort class indices descending by student count
  const sortedIdx = [...Array(classes.length).keys()].sort((a, b) => classes[b].count - classes[a].count);
  const rem = classes.map(c => c.count);

  // Assign 4 slots, one class each, starting with the 4 largest classes
  const SLOTS = 4;
  const slotClass = new Array(SLOTS).fill(-1);
  let slotPtr = 0;

  function assignNextToSlot(s) {
    while (slotPtr < sortedIdx.length && rem[sortedIdx[slotPtr]] <= 0) slotPtr++;
    slotClass[s] = slotPtr < sortedIdx.length ? sortedIdx[slotPtr++] : -1;
  }
  for (let s = 0; s < SLOTS; s++) assignNextToSlot(s);

  const rollCounters = new Array(classes.length).fill(0);
  const resGroups = [];

  for (const grp of roomGroups) {
    const R = grp.rows, C = grp.cols;
    const roomGrids = [], roomRollGrids = [], roomAllocs = [];

    for (let ri = 0; ri < grp.rooms; ri++) {
      const grid     = Array.from({ length: R }, () => new Array(C).fill(-1));
      const rollGrid = Array.from({ length: R }, () => new Array(C).fill(null));
      const alloc    = new Array(classes.length).fill(0);

      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
          const slotIdx = (r % 2) * 2 + (c % 2);
          let ci = slotClass[slotIdx];

          // Refill exhausted slot
          if (ci === -1 || rem[ci] <= 0) {
            let np = slotPtr;
            while (np < sortedIdx.length && rem[sortedIdx[np]] <= 0) np++;
            if (np < sortedIdx.length) { slotClass[slotIdx] = sortedIdx[np]; slotPtr = np + 1; }
            else slotClass[slotIdx] = -1;
            ci = slotClass[slotIdx];
          }

          if (ci === -1 || rem[ci] <= 0) { grid[r][c] = -1; continue; }

          grid[r][c] = ci;
          alloc[ci]++;
          rem[ci]--;

          // Assign roll number
          const rolls = classes[ci].rollNos;
          if (rolls?.length) {
            const idx = rollCounters[ci];
            rollGrid[r][c] = idx < rolls.length ? rolls[idx] : null;
            rollCounters[ci]++;
          }

          // Advance slot if this class just exhausted
          if (rem[ci] <= 0) {
            let np = slotPtr;
            while (np < sortedIdx.length && rem[sortedIdx[np]] <= 0) np++;
            if (np < sortedIdx.length) { slotClass[slotIdx] = sortedIdx[np]; slotPtr = np + 1; }
            else slotClass[slotIdx] = -1;
          }
        }
      }

      roomGrids.push(grid);
      roomRollGrids.push(rollGrid);
      roomAllocs.push(alloc);
    }

    resGroups.push({ ...grp, allocs: roomAllocs, grids: roomGrids, rollGrids: roomRollGrids });
  }

  const totalPlaced    = resGroups.reduce((s, g) => s + g.allocs.reduce((a, r) => a + r.reduce((b, v) => b + v, 0), 0), 0);
  const totalConflicts = resGroups.reduce((s, g) => s + g.grids.reduce((a, gr) => a + countConflicts(gr), 0), 0);

  return { groups: resGroups, totalPlaced, totalConflicts, totalStudents };
}
