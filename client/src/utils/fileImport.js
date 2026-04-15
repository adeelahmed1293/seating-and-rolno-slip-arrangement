/**
 * fileImport.js — XLSX / CSV import via Electron native file dialog
 * Requires xlsx library loaded globally (window.XLSX)
 */

export async function openAndImport() {
  const file = await window.electronAPI.openFile();
  if (!file) return null;

  if (file.ext === 'xlsx' || file.ext === 'xls') {
    return parseXLSX(file.data, file.name);
  }
  return parseCSVBase64(file.data, file.name);
}

function parseXLSX(base64, name) {
  const binary = atob(base64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const wb       = window.XLSX.read(bytes.buffer, { type: 'array' });
  const sheet    = wb.SheetNames.find(n => n.trim() === 'Registration No') || wb.SheetNames[0];
  const rows     = window.XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, defval: null, raw: true });

  return buildClasses(rows, `Excel "${sheet}" from ${name}`);
}

function parseCSVBase64(base64, name) {
  const text = atob(base64);
  const rows = text.split(/\r?\n/).map(line => {
    const cells = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"')           { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cells.push(cur.trim() || null); cur = ''; }
      else                     { cur += ch; }
    }
    cells.push(cur.trim() || null);
    return cells;
  }).filter(r => r.some(v => v));

  return buildClasses(rows, `CSV "${name}"`);
}

function buildClasses(rows, source) {
  if (rows.length < 2) {
    throw new Error(`${source}: needs at least a header row + data rows.`);
  }

  // Detect class names in row 0 — every 2nd column, skip numbers
  const detected = [];
  for (let col = 0; col < rows[0].length; col += 2) {
    const h = String(rows[0][col] || '').trim();
    if (!h || !isNaN(Number(h))) continue;
    detected.push({ name: h, col, rollNos: [] });
  }
  if (!detected.length) {
    throw new Error(`${source}: no class names found in header row.`);
  }

  // Collect roll numbers from rows 1+
  for (let row = 1; row < rows.length; row++) {
    for (const cls of detected) {
      const raw = rows[row][cls.col];
      if (raw != null && String(raw).trim()) {
        cls.rollNos.push(String(raw).trim());
      }
    }
  }

  const valid = detected.filter(c => c.rollNos.length > 0);
  if (!valid.length) {
    throw new Error(`${source}: no roll numbers found. Check that data is below the header row.`);
  }

  return {
    source,
    classes: valid.map(c => ({ name: c.name, count: c.rollNos.length, rollNos: c.rollNos })),
  };
}
