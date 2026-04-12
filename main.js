const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs   = require('fs');

let win;

// ─── Window ──────────────────────────────────────────────────────
function createWindow() {
  win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 640,
    title: 'Exam Management System',
    backgroundColor: '#0B0C10',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
    icon:  path.join(__dirname, 'assets', 'icon.png'),
    show:  false,
  });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.once('ready-to-show', () => win.show());
  if (process.env.NODE_ENV === 'development') win.webContents.openDevTools();
}

app.whenReady().then(() => { createWindow(); buildMenu(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ─── IPC: open file dialog ────────────────────────────────────────
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title:   'Import Student Roll Numbers',
    filters: [{ name:'Spreadsheet / CSV', extensions:['xlsx','xls','csv','txt'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths.length) return null;
  const fp  = filePaths[0];
  const buf = fs.readFileSync(fp);
  return { name: path.basename(fp), ext: path.extname(fp).toLowerCase().slice(1), data: buf.toString('base64') };
});

// ─── IPC: save CSV ────────────────────────────────────────────────
ipcMain.handle('dialog:saveCSV', async (_e, { content, defaultName }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save CSV Export', defaultPath: defaultName || 'export.csv',
    filters: [{ name:'CSV', extensions:['csv'] }],
  });
  if (canceled || !filePath) return false;
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
});

// ─── IPC: read local HTML partial (modular page loading) ──────────
ipcMain.handle('fs:readPartial', async (_e, relPath) => {
  // Security: only allow reads from within src/
  const safe = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const full  = path.join(__dirname, 'src', safe);
  if (!full.startsWith(path.join(__dirname, 'src'))) throw new Error('Access denied');
  return fs.readFileSync(full, 'utf8');
});

// ─── Application menu ─────────────────────────────────────────────
function buildMenu() {
  const tpl = [
    ...(process.platform === 'darwin' ? [{ label: app.name, submenu:[{role:'about'},{type:'separator'},{role:'quit'}] }] : []),
    { label: 'File', submenu: [
      { label:'Import CSV / Excel…',  accelerator:'CmdOrCtrl+O',       click: () => win.webContents.send('menu:openFile') },
      { type:'separator' },
      { label:'Export All Rooms CSV', accelerator:'CmdOrCtrl+E',       click: () => win.webContents.send('menu:exportAll') },
      { label:'Export Summary CSV',   accelerator:'CmdOrCtrl+Shift+E', click: () => win.webContents.send('menu:exportSummary') },
      { type:'separator' },
      process.platform === 'darwin' ? { role:'close' } : { role:'quit' },
    ]},
    { label:'Edit',   submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'}] },
    { label:'View',   submenu:[{role:'reload'},{role:'forceReload'},{type:'separator'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{type:'separator'},{role:'togglefullscreen'}] },
    { label:'Help',   submenu:[{ label:'About', click: () => dialog.showMessageBox(win, { type:'info', title:'Exam Management System', message:'Exam Management System v1.0.0', detail:'Anti-cheat seating planner\nRoll slip generator\nBuilt with Electron' }) }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}
