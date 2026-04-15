const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs   = require('fs');

const isDev = process.env.NODE_ENV === 'development';
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 980,
    minHeight: 660,
    title: 'Exam Management System',
    backgroundColor: '#0B0C10',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false,
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../client/dist/index.html'));
  }

  win.once('ready-to-show', () => win.show());
}

app.whenReady().then(() => {
  createWindow();
  buildMenu();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── IPC: open file dialog ────────────────────────────────────────
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Import Student Roll Numbers',
    filters: [
      { name: 'Spreadsheet / CSV', extensions: ['xlsx', 'xls', 'csv', 'txt'] },
    ],
    properties: ['openFile'],
  });
  if (canceled || !filePaths.length) return null;
  const fp  = filePaths[0];
  const buf = fs.readFileSync(fp);
  return {
    name: path.basename(fp),
    ext:  path.extname(fp).toLowerCase().slice(1),
    data: buf.toString('base64'),
  };
});

// ── IPC: save CSV ────────────────────────────────────────────────
ipcMain.handle('dialog:saveCSV', async (_, { content, defaultName }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title:       'Save CSV',
    defaultPath: defaultName || 'export.csv',
    filters:     [{ name: 'CSV', extensions: ['csv'] }],
  });
  if (canceled || !filePath) return false;
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
});

// ── Application menu ─────────────────────────────────────────────
function buildMenu() {
  const tpl = [
    ...(process.platform === 'darwin'
      ? [{ label: app.name, submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] }]
      : []),
    {
      label: 'File',
      submenu: [
        { label: 'Import CSV / Excel…',  accelerator: 'CmdOrCtrl+O',       click: () => win.webContents.send('menu:openFile') },
        { type: 'separator' },
        { label: 'Export All Rooms CSV', accelerator: 'CmdOrCtrl+E',       click: () => win.webContents.send('menu:exportAll') },
        { label: 'Export Summary CSV',   accelerator: 'CmdOrCtrl+Shift+E', click: () => win.webContents.send('menu:exportSummary') },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [{
        label: 'About',
        click: () => dialog.showMessageBox(win, {
          type: 'info',
          title: 'Exam Management System',
          message: 'Exam Management System v1.0.0',
          detail: 'React 18 + Tailwind 3 + Electron 30\nAnti-cheat seating · Roll slip generator',
        }),
      }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}
