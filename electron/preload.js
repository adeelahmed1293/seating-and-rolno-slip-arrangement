const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectExcel: () => ipcRenderer.invoke("select-excel"),
});