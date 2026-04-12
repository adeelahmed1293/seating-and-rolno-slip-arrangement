/**
 * preload.js — Context Bridge
 * Exposes safe API to renderer via window.esms
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('esms', {
  // Auth
  setup:      (payload) => ipcRenderer.invoke('auth:setup', payload),
  login:      (payload) => ipcRenderer.invoke('auth:login', payload),

  // Navigation
  navigate:   (page) => ipcRenderer.invoke('app:navigate', { page }),
  isFirstRun: () => ipcRenderer.invoke('app:isFirstRun'),

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close:    () => ipcRenderer.send('window:close'),

  // Listen for navigation events from main process
  onNavigate: (callback) => ipcRenderer.on('navigate', (_event, route) => callback(route)),
})
