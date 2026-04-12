/**
 * app.js — Router & navigation
 * Loads HTML partials via Electron IPC, dynamically imports page modules.
 */
import { showToast } from './utils.js';

const NAV_COLORS = {
  dash:'ap', import:'apk', classes:'apk', rooms:'apk',
  generate:'apk', roomview:'apk', directory:'apk',
  datesheet:'at', slips:'at'
};

const PAGES = Object.keys(NAV_COLORS);

// Lazy-load page modules — each page is its own JS file
const PAGE_MODULES = {
  dash:      () => import('../pages/dashboard.js'),
  import:    () => import('../pages/import.js'),
  classes:   () => import('../pages/classes.js'),
  rooms:     () => import('../pages/rooms.js'),
  generate:  () => import('../pages/generate.js'),
  roomview:  () => import('../pages/roomview.js'),
  directory: () => import('../pages/directory.js'),
  datesheet: () => import('../pages/datesheet.js'),
  slips:     () => import('../pages/slips.js'),
};

/** Navigate to a page by id */
export async function nav(pageId) {
  try {
    // Load HTML partial via IPC (safe file read through main process)
    const html = await window.electronAPI.readPartial(`pages/${pageId}.html`);
    document.getElementById('content').innerHTML = html;

    // Update sidebar active states
    PAGES.forEach(id => {
      const ni = document.getElementById('nav-' + id);
      if (ni) { ni.className = 'ni'; if (id === pageId) ni.classList.add(NAV_COLORS[id]); }
    });

    // Load and init the page module
    const mod = await PAGE_MODULES[pageId]();
    if (mod.init) mod.init();
  } catch (e) {
    console.error('Navigation error:', e);
    showToast('Page load error: ' + e.message, false);
  }
}

// Expose nav globally so onclick="nav('...')" works in sidebar & page HTML
window.nav = nav;

// Wire up menu shortcuts from Electron menu bar
window.electronAPI.onMenuOpenFile(()      => nav('import'));
window.electronAPI.onMenuExportAll(()     => { import('../pages/generate.js').then(m => m.exportAll()); });
window.electronAPI.onMenuExportSummary(() => { import('../pages/generate.js').then(m => m.exportSummary()); });

// Boot
nav('dash');
