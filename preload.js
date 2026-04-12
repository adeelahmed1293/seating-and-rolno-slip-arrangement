const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Native file open dialog → { name, ext, data:base64 } | null
  openFile:    ()                          => ipcRenderer.invoke('dialog:openFile'),
  // Native save dialog for CSV
  saveCSV:     (content, defaultName)      => ipcRenderer.invoke('dialog:saveCSV', { content, defaultName }),
  // Read a local src/ partial file (for modular page loading)
  readPartial: (relPath)                   => ipcRenderer.invoke('fs:readPartial', relPath),
  // Menu bar shortcuts
  onMenuOpenFile:      cb => ipcRenderer.on('menu:openFile',      cb),
  onMenuExportAll:     cb => ipcRenderer.on('menu:exportAll',     cb),
  onMenuExportSummary: cb => ipcRenderer.on('menu:exportSummary', cb),
  removeAllListeners:  ch => ipcRenderer.removeAllListeners(ch),
});
