/**
 * preload.js — Context Bridge
 * Exposes a safe API to the renderer process via window.esms
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('esms', {
  // Auth
  setup: (payload) => ipcRenderer.invoke('auth:setup', payload),
  login: (payload) => ipcRenderer.invoke('auth:login', payload),

  // Navigation
  navigate: (page) => ipcRenderer.invoke('app:navigate', { page }),
  isFirstRun: () => ipcRenderer.invoke('app:isFirstRun'),

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close:    () => ipcRenderer.send('window:close'),
});
