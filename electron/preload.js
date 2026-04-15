const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () =>
    ipcRenderer.invoke('dialog:openFile'),

  saveCSV: (content, defaultName) =>
    ipcRenderer.invoke('dialog:saveCSV', { content, defaultName }),

  onMenuOpenFile:      (cb) => ipcRenderer.on('menu:openFile',      () => cb()),
  onMenuExportAll:     (cb) => ipcRenderer.on('menu:exportAll',     () => cb()),
  onMenuExportSummary: (cb) => ipcRenderer.on('menu:exportSummary', () => cb()),

  offMenuListeners: () => {
    ipcRenderer.removeAllListeners('menu:openFile');
    ipcRenderer.removeAllListeners('menu:exportAll');
    ipcRenderer.removeAllListeners('menu:exportSummary');
  },
});
