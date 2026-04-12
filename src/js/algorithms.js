/**
 * algorithms.js — Anti-cheat seating algorithm & conflict detection
 * Pure functions, no DOM access.
 */

/** Count same-class neighbour conflicts in an 8-direction grid */
export function countConflicts(g) {
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const R = g.length, C = g[0].length;
  let c = 0;
  for (let r = 0; r < R; r++)
    for (let col = 0; col < C; col++) {
      if (g[r][col] === -1) continue;
      for (const [dr,dc] of dirs) {
        const nr = r+dr, nc = col+dc;
        if (nr>=0 && nr<R && nc>=0 && nc<C && g[nr][nc]===g[r][col]) { c++; break; }
      }
    }
  return Math.floor(c / 2);
}

/** Check if a single seat has a conflict */
export function hasConflict(g, r, c) {
  if (g[r][c] === -1) return false;
  const R = g.length, C = g[0].length;
  for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    const nr = r+dr, nc = c+dc;
    if (nr>=0 && nr<R && nc>=0 && nc<C && g[nr][nc]===g[r][c]) return true;
  }
  return false;
}

/**
 * generatePlan — 4-class checkerboard anti-cheat seating
 *
 * Pattern: seat(r,c) = slot[(r%2)*2 + (c%2)]  → slots 0,1,2,3
 * Even rows: A B A B…   Odd rows: C D C D…
 * Guarantees ZERO 8-neighbour conflicts.
 * Classes fill globally largest→smallest across all rooms.
 */
export function generatePlan(classes, roomGroups) {
  const totalStudents = classes.reduce((s, c) => s + c.count, 0);
  const totalSeats    = roomGroups.reduce((s, g) => s + g.rows * g.cols * g.rooms, 0);
  if (totalSeats < totalStudents) {
    throw new Error(`Not enough seats! ${totalSeats} seats for ${totalStudents} students.`);
  }

  // Sort DESC by strength
  const sortedIdx = [...Array(classes.length).keys()].sort((a,b) => classes[b].count - classes[a].count);
  const rem       = classes.map(c => c.count);

  // Assign one class per slot (4 slots)
  const SLOTS = 4;
  const slotClass = new Array(SLOTS).fill(-1);
  let slotPtr = 0;

  function fillSlot(s) {
    while (slotPtr < sortedIdx.length && rem[sortedIdx[slotPtr]] <= 0) slotPtr++;
    if (slotPtr < sortedIdx.length) { slotClass[s] = sortedIdx[slotPtr]; slotPtr++; }
    else slotClass[s] = -1;
  }
  slotPtr = 0;
  for (let s = 0; s < SLOTS; s++) fillSlot(s);

  const rollCtrs  = new Array(classes.length).fill(0);
  const resGroups = [];

  for (const grp of roomGroups) {
    const R = grp.rows, C = grp.cols;
    const roomGrids = [], roomRollGrids = [], roomAllocs = [];

    for (let ri = 0; ri < grp.rooms; ri++) {
      const grid     = Array.from({length:R}, () => new Array(C).fill(-1));
      const rollGrid = Array.from({length:R}, () => new Array(C).fill(null));
      const alloc    = new Array(classes.length).fill(0);

      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
          const si = (r % 2) * 2 + (c % 2);
          let ci = slotClass[si];

          // Refill exhausted slot
          if (ci === -1 || rem[ci] <= 0) {
            let np = slotPtr;
            while (np < sortedIdx.length && rem[sortedIdx[np]] <= 0) np++;
            if (np < sortedIdx.length) { slotClass[si] = sortedIdx[np]; slotPtr = np + 1; }
            else slotClass[si] = -1;
            ci = slotClass[si];
          }
          if (ci === -1 || rem[ci] <= 0) { grid[r][c] = -1; continue; }

          grid[r][c] = ci; alloc[ci]++; rem[ci]--;
          const rolls = classes[ci].rollNos;
          if (rolls && rolls.length) {
            const idx = rollCtrs[ci];
            rollGrid[r][c] = idx < rolls.length ? rolls[idx] : null;
            rollCtrs[ci]++;
          }
          // Advance slot if exhausted
          if (rem[ci] <= 0) {
            let np = slotPtr;
            while (np < sortedIdx.length && rem[sortedIdx[np]] <= 0) np++;
            if (np < sortedIdx.length) { slotClass[si] = sortedIdx[np]; slotPtr = np + 1; }
            else slotClass[si] = -1;
          }
        }
      }
      roomGrids.push(grid); roomRollGrids.push(rollGrid); roomAllocs.push(alloc);
    }
    resGroups.push({ ...grp, allocs: roomAllocs, grids: roomGrids, rollGrids: roomRollGrids });
  }

  const totalPlaced    = resGroups.reduce((s,g) => s + g.allocs.reduce((a,r) => a + r.reduce((b,v) => b+v, 0), 0), 0);
  const totalConflicts = resGroups.reduce((s,g) => s + g.grids.reduce((a,gr) => a + countConflicts(gr), 0), 0);

  return { groups: resGroups, totalPlaced, totalConflicts, totalStudents };
}
