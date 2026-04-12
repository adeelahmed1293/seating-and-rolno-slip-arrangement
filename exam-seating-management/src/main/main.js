/**
 * main.js — Electron Main Process
 * Exam Seating Management System
 *
 * Responsibilities:
 *  - Create BrowserWindow
 *  - Handle IPC for authentication (setup + login)
 *  - Persist hashed password via electron-store / plain JSON fallback
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// ─── Constants ───────────────────────────────────────────────────────────────
const IS_DEV = process.argv.includes('--dev');
const DATA_DIR = app.getPath('userData');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');
const SALT_ROUNDS = 12;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Read admin config from disk (returns {} if not found) */
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('[Config] Read error:', e.message);
  }
  return {};
}

/** Write admin config to disk */
function writeConfig(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('[Config] Write error:', e.message);
    return false;
  }
}

/** Returns true if first-run setup is required */
function isFirstRun() {
  const cfg = readConfig();
  return !cfg.passwordHash;
}

// ─── Window ──────────────────────────────────────────────────────────────────

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    frame: false,           // custom title bar
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f1a',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Decide which page to load
  const page = isFirstRun() ? 'setup' : 'login';
  mainWindow.loadFile(path.join(__dirname, `../renderer/pages/${page}/${page}.html`));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // if (IS_DEV) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── IPC Handlers ────────────────────────────────────────────────────────────

/** SETUP: save hashed password on first run */
ipcMain.handle('auth:setup', async (_event, { password }) => {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const ok = writeConfig({ passwordHash: hash, createdAt: new Date().toISOString() });
    if (!ok) return { success: false, message: 'Could not save configuration.' };
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
});

/** LOGIN: verify password against stored hash */
ipcMain.handle('auth:login', async (_event, { username, password }) => {
  try {
    // Username is fixed to "admin"
    if (username.trim().toLowerCase() !== 'admin') {
      return { success: false, message: 'Invalid credentials.' };
    }
    const cfg = readConfig();
    if (!cfg.passwordHash) {
      return { success: false, message: 'System not configured. Please restart.' };
    }
    const match = await bcrypt.compare(password, cfg.passwordHash);
    if (!match) return { success: false, message: 'Invalid credentials.' };
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
});

/** NAVIGATE: load a new page inside the same window */
ipcMain.handle('app:navigate', async (_event, { page }) => {
  const allowed = ['login', 'setup', 'dashboard'];
  if (!allowed.includes(page)) return { success: false };
  mainWindow.loadFile(
    path.join(__dirname, `../renderer/pages/${page}/${page}.html`)
  );
  return { success: true };
});

/** WINDOW CONTROLS */
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());

/** CHECK first-run status */
ipcMain.handle('app:isFirstRun', () => isFirstRun());

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
