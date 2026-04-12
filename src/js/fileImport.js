/**
 * fileImport.js — Excel/CSV import via Electron native dialog
 * Updates state.classes in place, dispatches 'import-success' event.
 */
import { state } from './state.js';

export async function openAndImport() {
  const file = await window.electronAPI.openFile();
  if (!file) return null;
  if (file.ext === 'xlsx' || file.ext === 'xls') return processXLSX(file.data, file.name);
  return processCSV(file.data, file.name);
}

function processXLSX(b64, name) {
  const binary = atob(b64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const wb   = XLSX.read(bytes.buffer, { type: 'array' });
  const sn   = wb.SheetNames.find(n => n.trim() === 'Registration No') || wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header:1, defval:null, raw:true });
  return applyRows(rows, `Excel "${sn}" — ${name}`);
}

function processCSV(b64, name) {
  const rows = parseCSV(atob(b64));
  return applyRows(rows, `CSV "${name}"`);
}

export function parseCSV(text) {
  return text.split(/\r?\n/).map(line => {
    const cells = []; let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cells.push(cur.trim() || null); cur = ''; }
      else cur += ch;
    }
    cells.push(cur.trim() || null);
    return cells;
  }).filter(r => r.some(v => v));
}

function applyRows(rows, src) {
  if (rows.length < 2) throw new Error(`${src}: need header row + data.`);
  const detected = [];
  for (let col = 0; col < rows[0].length; col += 2) {
    const h = String(rows[0][col] || '').trim();
    if (!h || !isNaN(Number(h))) continue;
    detected.push({ name: h, col, rollNos: [] });
  }
  if (!detected.length) throw new Error('No class names found in header row.');
  for (let row = 1; row < rows.length; row++) {
    const cells = rows[row];
    for (const cls of detected) {
      const raw = cells[cls.col];
      if (raw != null && String(raw).trim()) cls.rollNos.push(String(raw).trim());
    }
  }
  const valid = detected.filter(c => c.rollNos.length > 0);
  if (!valid.length) throw new Error('No roll numbers found. Check file format.');

  // Update shared state
  state.classes   = valid.map(c => ({ name: c.name, count: c.rollNos.length, rollNos: c.rollNos }));
  state.result    = null;
  state.slips     = [];
  state.selClsRow = -1;

  return { src, classes: state.classes };
}
