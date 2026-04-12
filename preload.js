const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile:    ()                           => ipcRenderer.invoke('dialog:openFile'),
  saveCSV:     (content, defaultName)       => ipcRenderer.invoke('dialog:saveCSV', { content, defaultName }),
  // savePDF returns { ok: bool, err?: string }
  savePDF:     (html, css, defaultName)     => ipcRenderer.invoke('dialog:savePDF', { html, css, defaultName }),
  // printHTML returns { ok: bool, err?: string }
  printHTML:   (html, css)                  => ipcRenderer.invoke('dialog:printHTML', { html, css }),
  readPartial: (relPath)                    => ipcRenderer.invoke('fs:readPartial', relPath),
  onMenuOpenFile:      cb => ipcRenderer.on('menu:openFile',      cb),
  onMenuExportAll:     cb => ipcRenderer.on('menu:exportAll',     cb),
  onMenuExportSummary: cb => ipcRenderer.on('menu:exportSummary', cb),
  removeAllListeners:  ch => ipcRenderer.removeAllListeners(ch),
});
