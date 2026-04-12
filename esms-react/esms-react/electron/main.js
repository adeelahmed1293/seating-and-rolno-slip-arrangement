/**
 * main.js — Electron Main Process
 * Exam Seating Management System (React + Tailwind)
 */

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcryptjs')

// ─── Constants ────────────────────────────────────────────────────────────────
// ─── Constants ────────────────────────────────────────────────────────────────
const IS_DEV = process.argv.includes('--dev') || !app.isPackaged
const DATA_DIR = path.join(process.env.APPDATA || app.getPath('userData'), 'ExamSeating')
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json')
const SALT_ROUNDS = 12



// ← ADD THESE
console.log('=== ESMS DEBUG ===')
console.log('DATA_DIR:', DATA_DIR)
console.log('CONFIG_FILE:', CONFIG_FILE)
console.log('APPDATA env:', process.env.APPDATA)
console.log('==================')
// ─── Config helpers ───────────────────────────────────────────────────────────
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('[Config] Read error:', e.message)
  }
  return {}
}

function writeConfig(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (e) {
    console.error('[Config] Write error:', e.message)
    return false
  }
}

function isFirstRun() {
    console.log('[Config] Looking for config at:', CONFIG_FILE)  // ← add this
  console.log('[Config] File exists?', fs.existsSync(CONFIG_FILE))  
  return !readConfig().passwordHash
}

// ─── Window ───────────────────────────────────────────────────────────────────
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0e1929',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (IS_DEV) {
    // Load from Vite dev server
    mainWindow.loadURL('http://localhost:5173')
    // mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    // Load built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // Send initial route based on first-run status
    mainWindow.webContents.once('did-finish-load', () => {
      const route = isFirstRun() ? '/setup' : '/login'
      mainWindow.webContents.send('navigate', route)
    })
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('auth:setup', async (_event, { password }) => {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    const ok = writeConfig({ passwordHash: hash, createdAt: new Date().toISOString() })
    if (!ok) return { success: false, message: 'Could not save configuration.' }
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
})

ipcMain.handle('auth:login', async (_event, { username, password }) => {
  try {
    if (username.trim().toLowerCase() !== 'admin') {
      return { success: false, message: 'Invalid credentials.' }
    }
    const cfg = readConfig()
    if (!cfg.passwordHash) {
      return { success: false, message: 'System not configured. Please restart.' }
    }
    const match = await bcrypt.compare(password, cfg.passwordHash)
    if (!match) return { success: false, message: 'Invalid credentials.' }
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
})

ipcMain.handle('app:navigate', async (_event, { page }) => {
  const routes = { login: '/login', setup: '/setup', dashboard: '/dashboard' }
  const route = routes[page]
  if (!route) return { success: false }
  mainWindow?.webContents.send('navigate', route)
  return { success: true }
})

ipcMain.handle('app:isFirstRun', () => isFirstRun())

ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
