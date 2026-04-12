const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

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

// ─── IPC: save PDF ────────────────────────────────────────────────
ipcMain.handle('dialog:savePDF', async (_e, { html, css, defaultName }) => {
  // 1. Show save dialog first
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save Attendance PDF',
    defaultPath: defaultName || 'attendance.pdf',
    filters: [{ name: 'PDF File', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) return { ok: false, err: 'cancelled' };

  // 2. Write full HTML to temp file
  const tmpFile = path.join(os.tmpdir(), `ems_att_${Date.now()}.html`);
  const fullHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${css}</style>
</head>
<body>${html}</body>
</html>`;
  fs.writeFileSync(tmpFile, fullHTML, 'utf8');

  // 3. Create hidden window, load temp file, generate PDF
  const pdfWin = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      offscreen: false,
    },
  });

  try {
    await pdfWin.loadFile(tmpFile);

    // Small delay to ensure full render
    await new Promise(r => setTimeout(r, 500));

    const pdfData = await pdfWin.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      landscape: false,
      margins: {
        marginType: 'custom',
        top:    0.4,
        bottom: 0.4,
        left:   0.4,
        right:  0.4,
      },
    });

    fs.writeFileSync(filePath, pdfData);
    return { ok: true };

  } catch (err) {
    console.error('PDF generation error:', err);
    return { ok: false, err: err.message };
  } finally {
    pdfWin.destroy();
    try { fs.unlinkSync(tmpFile); } catch {}
  }
});

// ─── IPC: print ──────────────────────────────────────────────────
ipcMain.handle('dialog:printHTML', async (_e, { html, css }) => {
  const tmpFile = path.join(os.tmpdir(), `ems_print_${Date.now()}.html`);
  const fullHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${css}</style>
</head>
<body>${html}</body>
</html>`;
  fs.writeFileSync(tmpFile, fullHTML, 'utf8');

  const printWin = new BrowserWindow({
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  try {
    await printWin.loadFile(tmpFile);
    await new Promise(r => setTimeout(r, 300));
    await new Promise((resolve, reject) => {
      printWin.webContents.print(
        {
          silent: false,
          printBackground: true,
          margins: { marginType: 'custom', top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
        },
        (success, errType) => {
          if (errType && errType !== 'cancelled') reject(new Error(errType));
          else resolve();
        }
      );
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, err: err.message };
  } finally {
    printWin.destroy();
    try { fs.unlinkSync(tmpFile); } catch {}
  }
});

// ─── IPC: read partial HTML ──────────────────────────────────────
ipcMain.handle('fs:readPartial', async (_e, relPath) => {
  const safe = path.normalize(relPath).replace(/^(\.\.([\/\\]|$))+/, '');
  const full  = path.join(__dirname, 'src', safe);
  if (!full.startsWith(path.join(__dirname, 'src'))) throw new Error('Access denied');
  return fs.readFileSync(full, 'utf8');
});

// ─── Application menu ────────────────────────────────────────────
function buildMenu() {
  const tpl = [
    ...(process.platform === 'darwin' ? [{ label: app.name, submenu:[{role:'about'},{type:'separator'},{role:'quit'}] }] : []),
    { label: 'File', submenu: [
      { label:'Import CSV / Excel…',  accelerator:'CmdOrCtrl+O', click: () => win.webContents.send('menu:openFile') },
      { type:'separator' },
      { label:'Export All Rooms CSV', accelerator:'CmdOrCtrl+E', click: () => win.webContents.send('menu:exportAll') },
      { label:'Export Summary CSV',   accelerator:'CmdOrCtrl+Shift+E', click: () => win.webContents.send('menu:exportSummary') },
      { type:'separator' },
      process.platform === 'darwin' ? { role:'close' } : { role:'quit' },
    ]},
    { label:'Edit',   submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'}] },
    { label:'View',   submenu:[{role:'reload'},{role:'forceReload'},{type:'separator'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{type:'separator'},{role:'togglefullscreen'}] },
    { label:'Help',   submenu:[{ label:'About', click: () => dialog.showMessageBox(win, { type:'info', title:'Exam Management System', message:'Exam Management System v1.0.0' }) }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}
