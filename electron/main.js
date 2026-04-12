// const path = require("path");

// function createWindow() {
//   console.log("APP STARTING...");

//   const win = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });

//   const isDev = !app.isPackaged;
//  win.loadURL("http://localhost:5173");
//   // if (isDev) {
//   //  win.loadURL("http://localhost:5173"); 
//   // } else {
//   //   const indexPath = path.join(app.getAppPath(), "client/dist/index.html");
//   //   win.loadFile(indexPath);
//   // }
// }
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const XLSX = require("xlsx");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });


     const isDev = !app.isPackaged;
//  win.loadURL("http://localhost:5173");
  if (isDev) {
   win.loadURL("http://localhost:5173"); 
  } else {
    const indexPath = path.join(app.getAppPath(), "client/dist/index.html");
    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();
});

// 📥 Handle file open
ipcMain.handle("select-excel", async () => {
     console.log("IPC CALLED 🔥"); // 👈 add this
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
  });

  if (result.canceled) return null;

  const filePath = result.filePaths[0];

  // 📊 Read Excel
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  return data;
});